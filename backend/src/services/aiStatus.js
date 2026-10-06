// Tracks whether the AI provider is usable, so the product can degrade gracefully
// (question bank instead of generated questions, delayed scoring) and tell admins why.
const env = require("../config/env");

const CHECK_EVERY_MS = 10 * 60 * 1000;

const state = {
  ok: null, // null = not checked yet
  reason: null, // short machine reason: no_key | auth | quota | network | error
  message: null, // human readable
  checked_at: null,
  last_success_at: null,
};

// Classifies an error thrown by the OpenAI SDK.
function classify(err) {
  const status = err && (err.status || (err.response && err.response.status));
  const msg = String((err && err.message) || "");
  if (/not configured/i.test(msg)) return { reason: "no_key", message: "OPENAI_API_KEY is not set in backend/.env." };
  if (status === 401 || status === 403) {
    const scope = /model\.request/i.test(msg) ? " The key lacks the model.request permission." : "";
    return { reason: "auth", message: `OpenAI rejected the API key (${status}).${scope}` };
  }
  if (status === 429 && /quota|billing/i.test(msg)) return { reason: "quota", message: "OpenAI quota or billing limit reached." };
  if (status === 429) return { reason: "rate_limit", message: "OpenAI rate limit hit; retrying later." };
  if (!status && /ECONN|ENOTFOUND|ETIMEDOUT|timeout|network|fetch failed/i.test(msg)) {
    return { reason: "network", message: "Cannot reach OpenAI (network/timeout)." };
  }
  if (status >= 500) return { reason: "provider", message: `OpenAI server error (${status}).` };
  return { reason: "error", message: msg.slice(0, 200) || "AI request failed." };
}

// Errors that mean "the AI is unavailable right now" (not a problem with this request).
const isOutage = (err) => ["no_key", "auth", "quota", "rate_limit", "network", "provider"].includes(classify(err).reason);

function recordSuccess() {
  state.ok = true;
  state.reason = null;
  state.message = null;
  state.checked_at = new Date();
  state.last_success_at = state.checked_at;
}

function recordFailure(err) {
  if (!isOutage(err)) return; // a bad response for one request says nothing about the provider
  const c = classify(err);
  state.ok = false;
  state.reason = c.reason;
  state.message = c.message;
  state.checked_at = new Date();
}

let timer = null;
// Cheapest possible request (1 output token) to verify the key and model access.
async function check() {
  const evaluation = require("./evaluation"); // lazy: avoids a require cycle
  try {
    await evaluation.ping();
    recordSuccess();
  } catch (err) {
    recordFailure(err);
    if (state.ok === null) {
      const c = classify(err);
      Object.assign(state, { ok: false, reason: c.reason, message: c.message, checked_at: new Date() });
    }
  }
  if (state.ok === false && !env.isTest) console.warn(`[ai] AI unavailable: ${state.message}`);
  return getStatus();
}

function start() {
  if (timer) return;
  check();
  timer = setInterval(check, CHECK_EVERY_MS);
  timer.unref();
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

const getStatus = () => ({ ...state, available: state.ok !== false });

module.exports = { getStatus, recordSuccess, recordFailure, isOutage, classify, check, start, stop };
