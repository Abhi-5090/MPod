// Tracks whether each AI provider is usable, so the product can fail over to the
// fallback provider, degrade gracefully (question bank instead of generated questions,
// provisional scores) and tell admins exactly what is wrong and how to fix it.
const env = require("../config/env");
const { AiError } = require("./ai/errors");
const { toAiError } = require("./ai/providers/openai");

// After an outage, skip the provider for this long before trying it again on a real request.
const COOL_DOWN_MS = 60 * 1000;
// While any provider is down, health-check it this often so it is used again quickly.
const DOWN_CHECK_MS = 60 * 1000;

const LABELS = { openai: "OpenAI", ollama: "Ollama" };

const blank = () => ({
  ok: null, // null = not checked yet
  reason: null, // no_key | auth | quota | rate_limit | network | timeout | overloaded | provider | model_missing
  message: null,
  hint: null,
  checked_at: null,
  last_success_at: null,
  retry_at: null, // provider-wide outage: skip the provider until then
  missing: new Map(), // model -> skip until (a missing model affects only the tasks using it)
});
const states = {};
const stateOf = (name) => {
  if (!states[name]) states[name] = blank();
  return states[name];
};
const chain = () => [env.ai.provider, ...(env.ai.fallback !== "none" ? [env.ai.fallback] : [])];

// Any error -> AiError. Errors that did not come from an adapter are classified as OpenAI
// errors, the historical behaviour.
const normalise = (err) => (err instanceof AiError ? err : toAiError(err));

function classify(err) {
  const e = normalise(err);
  return { reason: e.reason, message: e.message, hint: e.hint || null, provider: e.provider || null };
}

// Errors that mean "the AI is unavailable right now" (not a problem with this request).
const isOutage = (err) => normalise(err).outage;

// Status text for a provider with missing models (the provider itself works).
function describeMissing(name, s, e) {
  const list = [...s.missing.keys()];
  const label = LABELS[name] || name;
  Object.assign(s, {
    ok: false,
    reason: "model_missing",
    message: `${label} model${list.length > 1 ? "s" : ""} not available: ${list.join(", ")}.`,
    hint: name === "ollama" ? `On the AI server run: ${list.map((m) => `ollama pull ${m}`).join(" && ")}` : (e && e.hint) || s.hint,
    retry_at: null,
    checked_at: new Date(),
  });
}

function recordSuccess(provider = env.ai.provider, model) {
  const s = stateOf(provider);
  if (model) s.missing.delete(model);
  if (s.missing.size) {
    // The provider works, but other models are still missing.
    s.last_success_at = new Date();
    describeMissing(provider, s);
    return;
  }
  const wasDown = s.ok === false;
  Object.assign(s, { ok: true, reason: null, message: null, hint: null, retry_at: null, checked_at: new Date() });
  s.last_success_at = s.checked_at;
  if (wasDown && !env.isTest) console.log(`[ai] ${LABELS[provider] || provider} is available again.`);
}

function recordFailure(err, provider, model) {
  const e = normalise(err);
  if (!e.outage) return; // a bad response for one request says nothing about the provider
  const name = provider || e.provider || env.ai.provider;
  const s = stateOf(name);
  if (e.reason === "model_missing") {
    const until = Date.now() + COOL_DOWN_MS;
    for (const m of e.models || (model ? [model] : [])) s.missing.set(m, until);
    if (s.missing.size) {
      describeMissing(name, s, e);
      scheduleSoon();
      return;
    }
  }
  Object.assign(s, {
    ok: false,
    reason: e.reason,
    message: e.message,
    hint: e.hint || null,
    checked_at: new Date(),
    retry_at: new Date(Date.now() + COOL_DOWN_MS),
  });
  scheduleSoon();
}

/** True while a provider (or the given model on it) that just failed should be skipped. */
const isCoolingDown = (name, model) => {
  const s = stateOf(name);
  const now = Date.now();
  if (s.ok === false && s.retry_at && s.retry_at.getTime() > now) return true;
  return Boolean(model && s.missing.has(model) && s.missing.get(model) > now);
};

let timer = null;
let nextCheckAt = 0;
let started = false;

function schedule(ms) {
  if (!started) return;
  if (timer) clearTimeout(timer);
  nextCheckAt = Date.now() + ms;
  timer = setTimeout(() => check().catch(() => {}), ms);
  timer.unref();
}
// A provider just failed: make sure the next health check comes soon.
function scheduleSoon() {
  if (started && nextCheckAt - Date.now() > DOWN_CHECK_MS) schedule(DOWN_CHECK_MS);
}

/** Health-checks every configured provider. */
async function check() {
  const ai = require("./ai"); // lazy: avoids a require cycle
  for (const name of chain()) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await ai.providers[name].health();
      stateOf(name).missing.clear();
      recordSuccess(name);
    } catch (err) {
      const e = normalise(err);
      const s = stateOf(name);
      if (e.reason === "model_missing" && e.models) {
        // The provider is up; only these models are missing.
        s.missing = new Map(e.models.map((m) => [m, Date.now() + COOL_DOWN_MS]));
        describeMissing(name, s, e);
      } else if (e.outage || s.ok === null) {
        Object.assign(s, {
          ok: false,
          reason: e.reason,
          message: e.message,
          hint: e.hint || null,
          checked_at: new Date(),
          retry_at: new Date(Date.now() + COOL_DOWN_MS),
        });
      }
      if (!env.isTest) console.warn(`[ai] ${LABELS[name] || name} unavailable: ${e.message}${e.hint ? ` Fix: ${e.hint}` : ""}`);
    }
  }
  const anyDown = chain().some((n) => stateOf(n).ok === false);
  schedule(anyDown ? DOWN_CHECK_MS : env.ai.healthCheckMinutes * 60 * 1000);
  return getStatus();
}

function start() {
  if (started) return;
  started = true;
  const ai = require("./ai");
  const desc = chain()
    .map((n) => {
      const d = ai.providers[n].describe();
      return `${LABELS[n]} (${d.endpoint}; ${Object.entries(d.models).map(([t, m]) => `${t}=${m}`).join(", ")})`;
    })
    .join(" -> fallback ");
  console.log(`[ai] provider: ${desc}`);
  if (chain().includes("ollama") && env.ai.ollama.preload) {
    // Load the models into GPU memory first so the first interviews are fast.
    ai.providers.ollama
      .preload((m) => console.log(`[ai] Ollama ${m}`))
      .finally(() => check().catch(() => {}));
  } else {
    check().catch(() => {});
  }
}

function stop() {
  started = false;
  if (timer) clearTimeout(timer);
  timer = null;
}

const publicState = (name) => {
  const s = { ...stateOf(name), missing_models: [...stateOf(name).missing.keys()] };
  delete s.retry_at;
  delete s.missing;
  // A provider with only some models missing still serves the other tasks.
  const partial = s.ok === false && s.reason === "model_missing";
  return { name, label: LABELS[name] || name, ...s, available: s.ok !== false || partial, partial };
};

/**
 * Overall status. `available` is true while at least one configured provider works;
 * `degraded` means the primary is down (the fallback is serving) or is missing some
 * models (`partial`: those tasks use the fallback, or the non-AI fallbacks).
 */
function getStatus() {
  const names = chain();
  const list = names.map(publicState);
  const primary = list[0];
  const serving = list.find((p) => p.available) || null;
  const available = Boolean(serving);
  const down = list.filter((p) => p.ok === false); // down, or missing some models
  const message = down.length
    ? down.length === 1 && names.length === 1
      ? primary.message
      : down.map((p) => `${p.label}: ${p.message}`).join(" ")
    : null;
  return {
    ok: primary.ok,
    available,
    // primary down (fallback serving) or primary missing some models
    degraded: available && primary.ok === false,
    partial: primary.partial,
    provider: primary.name,
    serving: serving ? serving.name : null,
    fallback: names[1] || null,
    reason: down.length ? down[0].reason : null,
    message,
    hint: down.length ? down.map((p) => p.hint).filter(Boolean).join(" ") || null : null,
    checked_at: primary.checked_at,
    last_success_at: primary.last_success_at,
    providers: list,
  };
}

/** Test helper: forget all recorded state. */
function _reset() {
  for (const k of Object.keys(states)) delete states[k];
}

module.exports = { getStatus, recordSuccess, recordFailure, isOutage, isCoolingDown, classify, check, start, stop, _reset };
