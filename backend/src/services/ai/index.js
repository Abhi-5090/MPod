/**
 * AI gateway: the only place the app talks to a language model.
 *
 * - Providers: OpenAI (hosted) and Ollama (self-hosted, e.g. NVIDIA DGX Spark),
 *   selected with AI_PROVIDER, with an optional AI_FALLBACK_PROVIDER.
 * - Tasks, not models: callers ask for a task ("scoring", "generation", "summary",
 *   "coding") and each provider maps it to its own model.
 * - Failover: when a provider has an outage (unreachable, key rejected, model missing,
 *   overloaded...) the request goes to the fallback provider, and the failed provider
 *   is skipped for a short while instead of being retried on every request.
 * - Back-pressure: each provider has a concurrency limit; interactive calls go first.
 * - Accounting: track() records which provider/model served each call and the token
 *   usage, so every evaluation can store how it was produced.
 */
const { AsyncLocalStorage } = require("async_hooks");
const env = require("../../config/env");
const { AiError } = require("./errors");
const { createLimiter } = require("./limiter");
const openai = require("./providers/openai");
const ollama = require("./providers/ollama");

const TASKS = ["scoring", "generation", "summary", "coding"];

const providers = {
  openai: openai.create(env.ai.openai),
  ollama: ollama.create(env.ai.ollama),
};
const limiters = Object.fromEntries(Object.values(providers).map((p) => [p.name, createLimiter(p.maxConcurrent)]));
const context = new AsyncLocalStorage();

/** Provider names in the order they are tried. */
const chain = () => [env.ai.provider, ...(env.ai.fallback !== "none" ? [env.ai.fallback] : [])];

/**
 * Parses a model's JSON answer. Tolerates code fences, reasoning blocks (<think>...</think>)
 * and text around the JSON object, which some self-hosted models produce.
 */
function parseJson(raw) {
  const cleaned = String(raw || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  let data;
  try {
    data = JSON.parse(cleaned);
  } catch (err) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) throw err;
    data = JSON.parse(cleaned.slice(start, end + 1));
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new SyntaxError("Expected a JSON object.");
  return data;
}

function recordUsage(name, model, usage) {
  const store = context.getStore();
  if (!store || !store.usage) return;
  const u = store.usage;
  const key = `${name}:${model}`;
  u.calls += 1;
  u.models[key] = (u.models[key] || 0) + 1;
  u.prompt_tokens += usage.prompt_tokens || 0;
  u.completion_tokens += usage.completion_tokens || 0;
  u.ms += usage.ms || 0;
}

// One provider call, with a single retry when the model returns unusable JSON
// (self-hosted models occasionally do).
async function callJson(p, model, opts) {
  for (let attempt = 0; ; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    const out = await limiters[p.name].run(() => p.chat({ model, ...opts }), { interactive: opts.interactive });
    recordUsage(p.name, model, out.usage);
    try {
      return parseJson(out.content);
    } catch (err) {
      if (attempt === 0 && !opts.interactive) continue;
      throw new AiError(
        out.truncated
          ? `${p.label} model "${model}" ran out of output tokens before finishing its answer.`
          : `${p.label} model "${model}" returned an answer that is not valid JSON.`,
        {
          provider: p.name,
          reason: "bad_response",
          hint: out.truncated && p.name === "ollama" ? "Raise OLLAMA_REASONING_TOKENS or set OLLAMA_THINK=low in backend/.env." : null,
        }
      );
    }
  }
}

/**
 * Runs one AI task and returns the parsed JSON object.
 * @param {"scoring"|"generation"|"summary"|"coding"} task
 * @param {{system: string, user: string, maxTokens?: number, temperature?: number, interactive?: boolean}} opts
 *   interactive: a person is waiting (shorter timeout, no retries, served first).
 */
async function chatJson(task, { system, user, maxTokens = 1024, temperature = 0.3, interactive = false }) {
  if (!TASKS.includes(task)) throw new Error(`Unknown AI task "${task}".`);
  const aiStatus = require("../aiStatus"); // lazy: aiStatus also requires this module
  const store = context.getStore();
  const order = store && store.only ? [store.only] : chain();
  // Skip providers that failed moments ago, unless every provider did.
  const open = order.filter((n) => !aiStatus.isCoolingDown(n, providers[n].models[task]));
  const tryList = open.length ? open : order;

  let lastErr;
  for (let i = 0; i < tryList.length; i++) {
    const p = providers[tryList[i]];
    const model = p.models[task];
    try {
      // eslint-disable-next-line no-await-in-loop
      const data = await callJson(p, model, { system, user, maxTokens, temperature, interactive });
      aiStatus.recordSuccess(p.name, model);
      return data;
    } catch (err) {
      const e = err instanceof AiError ? err : p.toAiError ? p.toAiError(err) : new AiError(err.message, { provider: p.name, cause: err });
      if (!e.outage) throw e;
      aiStatus.recordFailure(e, p.name, model);
      lastErr = e;
      const next = providers[tryList[i + 1]];
      if (next && !env.isTest) console.warn(`[ai] ${p.label} unavailable (${e.message}); using ${next.label} for this request.`);
    }
  }
  throw lastErr;
}

/** Runs fn and returns { value, usage } describing every AI call made inside it. */
async function track(fn) {
  const usage = { calls: 0, models: {}, prompt_tokens: 0, completion_tokens: 0, ms: 0 };
  const value = await context.run({ ...(context.getStore() || {}), usage }, fn);
  return { value, usage };
}

/** Runs fn with every AI call forced to one provider (used by the calibration script). */
function withProvider(name, fn) {
  if (!providers[name]) throw new Error(`Unknown AI provider "${name}".`);
  return context.run({ ...(context.getStore() || {}), only: name }, fn);
}

/** Summary of how a tracked piece of work was produced, for storing with the result. */
function usageSummary(usage, startedAt) {
  return {
    providers: [...new Set(Object.keys(usage.models).map((k) => k.split(":")[0]))],
    models: Object.keys(usage.models),
    calls: usage.calls,
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    duration_ms: startedAt ? Date.now() - startedAt : usage.ms,
  };
}

const describe = () => ({
  provider: env.ai.provider,
  fallback: env.ai.fallback,
  providers: chain().map((n) => ({ ...providers[n].describe(), limiter: limiters[n].stats() })),
});

module.exports = {
  TASKS,
  providers,
  chain,
  chatJson,
  track,
  withProvider,
  usageSummary,
  parseJson,
  describe,
};
