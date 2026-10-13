/**
 * DGX Spark provider: the self-hosted models, reached at DGX_BASE_URL with DGX_API_KEY.
 *
 * Each AI task (scoring, generation, summary, coding) has its own model and can, if
 * needed, have its own endpoint, key and protocol (DGX_<TASK>_URL / _API_KEY / _PROTOCOL),
 * e.g. when each model is served by a separate vLLM process. Two wire protocols:
 *  - "ollama": Ollama's native API (default),
 *  - "openai": OpenAI-compatible API (vLLM, TensorRT-LLM / NIM, SGLang, Ollama's /v1).
 * Tasks that share an endpoint share one connection.
 */
const { AiError } = require("../errors");
const ollama = require("./ollama");
const openai = require("./openai");

const TASKS = ["scoring", "generation", "summary", "coding"];
const PROTOCOLS = ["ollama", "openai"];

/** True for addresses that never leave the machine or the private network. */
function isPrivateHost(hostname) {
  const h = String(hostname || "").replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "localhost" || h === "::1" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return /^(fc|fd)[0-9a-f]{2}:/.test(h); // IPv6 unique-local
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 100 && b >= 64 && b <= 127);
}

/**
 * Refuses to send API keys and student answers over plain HTTP across the internet.
 * Returns a warning string (development) or throws (production).
 */
function checkTransport(url, { isProd, allowInsecure }) {
  let u;
  try {
    u = new URL(url);
  } catch {
    throw new Error(`DGX endpoint "${url}" is not a valid URL (expected e.g. https://ai.example.edu).`);
  }
  if (u.protocol === "https:" || isPrivateHost(u.hostname) || allowInsecure) return null;
  const msg = `DGX endpoint ${u.origin} uses plain HTTP over a public network: API keys and student answers would travel unencrypted. Use https:// (see deploy/dgx-spark/gateway) or set DGX_ALLOW_INSECURE=true to accept the risk.`;
  if (isProd) throw new Error(msg);
  return msg;
}

// OpenAI-compatible servers expose the API under /v1.
const withV1 = (url) => (/\/v1\/?$/.test(url) ? url.replace(/\/$/, "") : `${url.replace(/\/+$/, "")}/v1`);

/**
 * Extra request fields for reasoning models on OpenAI-compatible servers (vLLM etc.):
 *  - gpt-oss: reasoning_effort (it always reasons) and extra output tokens,
 *  - qwen3 thinking models: thinking switched off unless DGX_THINK asks for it.
 */
function reasoningExtras(cfg) {
  return (model) => {
    const t = cfg.think;
    if (ollama.isGptOss(model)) {
      const effort = ollama.LEVELS.includes(t) ? t : t === "true" ? "medium" : "low";
      return { body: { reasoning_effort: effort }, extraTokens: cfg.reasoningTokens };
    }
    if (/^qwen3(?!-coder)/i.test(String(model).split("/").pop())) {
      const on = t === "true" || ollama.LEVELS.includes(t);
      return on ? { body: {}, extraTokens: cfg.reasoningTokens } : { body: { chat_template_kwargs: { enable_thinking: false } }, extraTokens: 0 };
    }
    return { body: {}, extraTokens: 0 };
  };
}

function create(cfg, deps = {}) {
  const who = { name: "dgx", label: cfg.label || "DGX Spark", keyVar: "DGX_API_KEY", urlVar: "DGX_BASE_URL" };
  const warnings = [];

  // Group tasks by endpoint (protocol + URL + key).
  const groups = new Map();
  for (const task of TASKS) {
    const ep = (cfg.endpoints && cfg.endpoints[task]) || {};
    const protocol = ep.protocol || cfg.protocol;
    if (!PROTOCOLS.includes(protocol)) throw new Error(`DGX protocol must be one of: ${PROTOCOLS.join(", ")} (got "${protocol}").`);
    const url = String(ep.url || cfg.baseURL).trim().replace(/\/+$/, "");
    const apiKey = ep.apiKey || cfg.apiKey || "";
    const warning = checkTransport(url, { isProd: cfg.isProd, allowInsecure: cfg.allowInsecure });
    if (warning && !warnings.includes(warning)) warnings.push(warning);
    const key = `${protocol}|${url}|${apiKey}`;
    if (!groups.has(key)) groups.set(key, { protocol, url, apiKey, tasks: [], models: {} });
    const g = groups.get(key);
    g.tasks.push(task);
    g.models[task] = cfg.models[task];
  }

  const byTask = {};
  const endpoints = [...groups.values()].map((g) => {
    const modelHint =
      g.protocol === "ollama"
        ? (m) => `On the ${who.label} run: ollama pull ${m}`
        : (m) => `Serve "${m}" on the ${who.label} (for vLLM: --served-model-name ${m}).`;
    const adapter =
      g.protocol === "ollama"
        ? ollama.create({ ...cfg, baseURL: g.url, apiKey: g.apiKey, models: g.models }, { fetchImpl: deps.fetchImpl, who })
        : openai.create(
            {
              apiKey: g.apiKey,
              baseURL: withV1(g.url),
              timeoutMs: cfg.timeoutMs,
              interactiveTimeoutMs: cfg.interactiveTimeoutMs,
              maxConcurrent: cfg.maxConcurrent,
              models: g.models,
            },
            {
              who: { ...who, modelHint },
              keyOptional: true,
              checkModels: true,
              requestExtras: reasoningExtras(cfg),
              clientFactory: deps.openaiClientFactory,
            }
          );
    const ep = { ...g, adapter, modelHint };
    g.tasks.forEach((t) => {
      byTask[t] = ep;
    });
    return ep;
  });

  function endpointFor(task) {
    const ep = byTask[task];
    if (!ep) throw new Error(`Unknown AI task "${task}".`);
    return ep;
  }

  async function chat(opts) {
    // The gateway passes the task; fall back to finding the task by model for direct calls.
    const task = opts.task || TASKS.find((t) => cfg.models[t] === opts.model);
    return endpointFor(task).adapter.chat(opts);
  }

  /**
   * Checks every endpoint. A missing model is reported together for all endpoints;
   * any other failure (unreachable, key rejected) is thrown as is.
   */
  async function health() {
    const missing = [];
    const hints = [];
    const results = [];
    for (const ep of endpoints) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const h = await ep.adapter.health();
        results.push({ endpoint: ep.url, protocol: ep.protocol, tasks: ep.tasks, ...h });
      } catch (err) {
        if (err.reason !== "model_missing" || !err.models) throw err;
        missing.push(...err.models);
        hints.push(...err.models.map(ep.modelHint));
      }
    }
    if (missing.length) {
      throw new AiError(`${who.label} model${missing.length > 1 ? "s" : ""} not available: ${missing.join(", ")}.`, {
        provider: who.name,
        reason: "model_missing",
        hint: hints.join(" "),
        models: missing,
      });
    }
    const first = results[0] || {};
    return { version: first.version, models: results.flatMap((r) => r.models || []), loaded: results.flatMap((r) => r.loaded || []), endpoints: results };
  }

  /** Loads the models into GPU memory (Ollama endpoints only). */
  async function preload(log) {
    for (const ep of endpoints) {
      // eslint-disable-next-line no-await-in-loop
      await ep.adapter.preload(log);
    }
  }

  /** Fix for missing models, worded for the endpoint each model is served from. */
  function missingHint(models) {
    return models
      .map((m) => {
        const task = TASKS.find((t) => cfg.models[t] === m);
        return task ? byTask[task].modelHint(m) : null;
      })
      .filter(Boolean)
      .join(" ");
  }

  return {
    name: who.name,
    label: who.label,
    models: cfg.models,
    maxConcurrent: cfg.maxConcurrent,
    warnings,
    chat,
    health,
    preload,
    missingHint,
    toAiError: (err) => (err instanceof AiError ? err : endpoints[0].adapter.toAiError(err)),
    // Endpoints and models only: API keys are never exposed.
    describe: () => ({
      name: who.name,
      endpoint: endpoints.length === 1 ? `${endpoints[0].url} (${endpoints[0].protocol})` : `${endpoints.length} endpoints`,
      models: cfg.models,
      endpoints: endpoints.map((e) => ({ url: e.url, protocol: e.protocol, tasks: e.tasks, api_key: e.apiKey ? "set" : "none" })),
      num_ctx: cfg.numCtx,
      think: cfg.think,
    }),
    _endpointFor: endpointFor,
  };
}

module.exports = { create, isPrivateHost, checkTransport, withV1, reasoningExtras, TASKS };
