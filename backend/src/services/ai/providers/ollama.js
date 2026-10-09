/**
 * Ollama adapter (self-hosted models, e.g. on an NVIDIA DGX Spark).
 *
 * Uses Ollama's native API rather than its OpenAI-compatible endpoint, because only the
 * native API lets us set the context window (num_ctx), the output budget (num_predict),
 * how long models stay in GPU memory (keep_alive) and reasoning ("think") per request.
 *
 * Reasoning ("thinking") models such as gpt-oss and qwen3 spend output tokens on
 * thinking before they answer. With OLLAMA_THINK=auto (default):
 *  - gpt-oss models think at "low" effort (they can't switch thinking off),
 *  - other thinking-capable models have thinking switched off (the tasks are short JSON),
 *  - models without thinking get no "think" field.
 * Thinking models also get OLLAMA_REASONING_TOKENS extra output tokens so the JSON
 * answer isn't cut off.
 */
const { AiError } = require("../errors");

const NAME = "ollama";
const LABEL = "Ollama";
const CAPS_TTL_MS = 10 * 60 * 1000;
const RETRY_DELAYS_MS = [1000, 3000];
const LEVELS = ["low", "medium", "high"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isGptOss = (model) => /^gpt-oss/i.test(String(model));

function create(cfg, { fetchImpl } = {}) {
  const doFetch = fetchImpl || ((...a) => fetch(...a));
  const caps = new Map(); // model -> { list, at }

  const keepAlive = /^-?\d+$/.test(String(cfg.keepAlive)) ? Number(cfg.keepAlive) : cfg.keepAlive;
  const pullHint = (model) => `On the AI server run: ollama pull ${model}`;

  function toAiError(err, { model, timeoutMs } = {}) {
    if (err instanceof AiError) return err;
    const msg = String((err && err.message) || "");
    const cause = err && err.cause;
    if (err && (err.name === "TimeoutError" || err.name === "AbortError")) {
      return new AiError(`Ollama did not answer within ${Math.round((timeoutMs || cfg.timeoutMs) / 1000)} s (server busy or model loading).`, {
        provider: NAME,
        reason: "timeout",
        hint: "The GPU server is overloaded: lower EVALUATION_CONCURRENCY, or raise OLLAMA_NUM_PARALLEL on the AI server.",
        cause: err,
      });
    }
    const code = cause && cause.code;
    if (/fetch failed|ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|ECONNRESET|EAI_AGAIN|socket/i.test(`${msg} ${code || ""}`)) {
      return new AiError(`Cannot reach Ollama at ${cfg.baseURL}.`, {
        provider: NAME,
        reason: "network",
        hint: "Start Ollama on the AI server (sudo systemctl start ollama) and check OLLAMA_BASE_URL in backend/.env.",
        cause: err,
      });
    }
    return new AiError(msg.slice(0, 200) || "Ollama request failed.", { provider: NAME, reason: "error", cause: err, model });
  }

  /** Maps a non-2xx Ollama response to an AiError. */
  function httpError(status, body, model) {
    const text = String((body && body.error) || body || "").slice(0, 300);
    const make = (reason, message, hint) => new AiError(message, { provider: NAME, reason, status, hint });
    if (status === 404 || /not found|try pulling/i.test(text)) {
      const e = make("model_missing", `Ollama model "${model}" is not installed.`, pullHint(model));
      e.models = [model];
      return e;
    }
    if (status === 401 || status === 403) {
      return make("auth", `Ollama rejected the request (${status}).`, "Check OLLAMA_API_KEY in backend/.env.");
    }
    if (status === 429 || status === 503) {
      return make("overloaded", `Ollama is busy (${status}).`, "Raise OLLAMA_NUM_PARALLEL on the AI server or lower EVALUATION_CONCURRENCY.");
    }
    if (/memory|out of memory|insufficient/i.test(text)) {
      return make("provider", `Ollama could not load "${model}": ${text}`, "Use smaller models or lower OLLAMA_MAX_LOADED_MODELS on the AI server.");
    }
    if (/does not support thinking/i.test(text)) {
      return make("error", `Ollama model "${model}" does not support thinking.`, "Set OLLAMA_THINK=auto in backend/.env.");
    }
    if (status >= 500) return make("provider", `Ollama server error (${status}): ${text}`);
    return make("error", `Ollama rejected the request (${status}): ${text}`);
  }

  async function request(method, path, body, { timeoutMs = cfg.timeoutMs, model } = {}) {
    let res;
    try {
      res = await doFetch(`${cfg.baseURL}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      throw toAiError(err, { model, timeoutMs });
    }
    let data = null;
    const raw = await res.text().catch(() => "");
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }
    if (!res.ok) throw httpError(res.status, data, model);
    return data;
  }

  /** Model capabilities ("completion", "thinking", ...), cached; [] if unknown. */
  async function capabilities(model) {
    const hit = caps.get(model);
    if (hit && Date.now() - hit.at < CAPS_TTL_MS) return hit.list;
    const data = await request("POST", "/api/show", { model }, { timeoutMs: 15000, model });
    const list = Array.isArray(data && data.capabilities) ? data.capabilities : [];
    caps.set(model, { list, at: Date.now() });
    return list;
  }

  /** The "think" value to send for a model, or undefined to omit it. */
  async function thinkFor(model) {
    let list = [];
    try {
      list = await capabilities(model);
    } catch (err) {
      if (err.reason === "model_missing") throw err;
      return undefined; // unknown: let the model use its default
    }
    if (!list.includes("thinking")) return undefined;
    const t = cfg.think;
    if (t === "auto") return isGptOss(model) ? "low" : false;
    if (LEVELS.includes(t)) return isGptOss(model) ? t : true;
    if (t === "true") return isGptOss(model) ? "medium" : true;
    if (t === "false") return isGptOss(model) ? "low" : false;
    return undefined;
  }

  async function chat({ model, system, user, maxTokens, temperature, interactive, json = true }) {
    const think = await thinkFor(model);
    const thinking = think !== undefined && think !== false;
    const timeoutMs = interactive ? cfg.interactiveTimeoutMs : cfg.timeoutMs;
    const body = {
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      stream: false,
      ...(json ? { format: "json" } : {}),
      ...(think !== undefined ? { think } : {}),
      keep_alive: keepAlive,
      options: {
        temperature,
        num_ctx: cfg.numCtx,
        num_predict: maxTokens + (thinking ? cfg.reasoningTokens : 0),
      },
    };
    const started = Date.now();
    const retries = interactive ? 0 : RETRY_DELAYS_MS.length; // the student is waiting on interactive calls
    for (let i = 0; ; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const data = await request("POST", "/api/chat", body, { timeoutMs, model });
        return {
          content: data && data.message ? data.message.content : "",
          truncated: data && data.done_reason === "length",
          usage: {
            prompt_tokens: (data && data.prompt_eval_count) || 0,
            completion_tokens: (data && data.eval_count) || 0,
            ms: Date.now() - started,
          },
        };
      } catch (err) {
        // Retry only transient server-side failures; never a timeout (it would double the wait).
        const transient = err.reason === "provider" || err.reason === "overloaded" || (err.reason === "network" && i === 0);
        if (!transient || i >= retries) throw err;
        // eslint-disable-next-line no-await-in-loop
        await sleep(RETRY_DELAYS_MS[Math.min(i, RETRY_DELAYS_MS.length - 1)]);
      }
    }
  }

  /** Verifies Ollama is reachable and every configured model is installed. */
  async function health() {
    const version = await request("GET", "/api/version", undefined, { timeoutMs: 10000 });
    const wanted = [...new Set(Object.values(cfg.models))];
    const missing = [];
    const models = [];
    for (const m of wanted) {
      try {
        caps.delete(m); // always re-check during a health check
        // eslint-disable-next-line no-await-in-loop
        models.push({ name: m, capabilities: await capabilities(m) });
      } catch (err) {
        if (err.reason !== "model_missing") throw err;
        missing.push(m);
      }
    }
    if (missing.length) {
      throw new AiError(`Ollama model${missing.length > 1 ? "s" : ""} not installed: ${missing.join(", ")}.`, {
        provider: NAME,
        reason: "model_missing",
        hint: `On the AI server run: ${missing.map((m) => `ollama pull ${m}`).join(" && ")}`,
        models: missing,
      });
    }
    let loaded = [];
    try {
      const ps = await request("GET", "/api/ps", undefined, { timeoutMs: 10000 });
      loaded = ((ps && ps.models) || []).map((m) => m.name || m.model);
    } catch {
      // informational only
    }
    return { version: version && version.version, models, loaded };
  }

  /** Loads every configured model into GPU memory so the first interview isn't slow. */
  async function preload(log = () => {}) {
    for (const m of [...new Set(Object.values(cfg.models))]) {
      const started = Date.now();
      try {
        // An empty message list loads the model without generating anything.
        // eslint-disable-next-line no-await-in-loop
        await request("POST", "/api/chat", { model: m, messages: [], keep_alive: keepAlive }, { timeoutMs: 10 * 60 * 1000, model: m });
        log(`loaded ${m} in ${Math.round((Date.now() - started) / 1000)} s`);
      } catch (err) {
        log(`could not load ${m}: ${err.message}${err.hint ? ` (${err.hint})` : ""}`);
      }
    }
  }

  return {
    name: NAME,
    label: LABEL,
    models: cfg.models,
    maxConcurrent: cfg.maxConcurrent,
    chat,
    health,
    preload,
    describe: () => ({ name: NAME, endpoint: cfg.baseURL, models: cfg.models, num_ctx: cfg.numCtx, think: cfg.think }),
    _thinkFor: thinkFor,
  };
}

module.exports = { create, NAME, LABEL };
