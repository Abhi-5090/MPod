/**
 * OpenAI chat-completions adapter.
 *
 * Used for OpenAI itself and, through `baseURL`, for any OpenAI-compatible server
 * (vLLM, TensorRT-LLM / NIM, SGLang, Ollama's /v1) running on the DGX Spark.
 */
const OpenAI = require("openai");
const { AiError } = require("../errors");

/**
 * Builds an error mapper with provider-specific wording.
 * @param {{name: string, label: string, keyVar: string, urlVar?: string, modelHint?: (m: string) => string}} who
 */
function makeToAiError(who) {
  return function toAiError(err, { model } = {}) {
    if (err instanceof AiError) return err;
    const status = err && (err.status || (err.response && err.response.status));
    const msg = String((err && err.message) || "");
    const make = (reason, message, hint, extra = {}) =>
      new AiError(message, { provider: who.name, reason, status, hint, cause: err, ...extra });
    if (/not configured/i.test(msg) && !status) {
      return make("no_key", `${who.keyVar} is not set in backend/.env.`, `Set ${who.keyVar} in backend/.env and restart the backend.`);
    }
    if (status === 401 || status === 403) {
      const scope = /model\.request/i.test(msg) ? " The key lacks the model.request permission." : "";
      return make(
        "auth",
        `${who.label} rejected the API key (${status}).${scope}`,
        who.name === "openai"
          ? "Give the OpenAI API key the model.request permission (or set a working key) in backend/.env and restart the backend."
          : `Check ${who.keyVar} in backend/.env: it must be one of the keys configured on the ${who.label} gateway.`
      );
    }
    if (status === 404 && (/model/i.test(msg) || model)) {
      return make(
        "model_missing",
        `${who.label} model ${model ? `"${model}" ` : ""}is not available.`,
        who.modelHint && model ? who.modelHint(model) : `Check the model settings in backend/.env.`,
        model ? { models: [model] } : {}
      );
    }
    if (status === 429 && /quota|billing/i.test(msg)) {
      return make("quota", `${who.label} quota or billing limit reached.`, "Add credits or raise the limit in the OpenAI dashboard.");
    }
    if (status === 429) return make("rate_limit", `${who.label} rate limit hit; retrying later.`);
    if (status === 503) return make("overloaded", `${who.label} is busy (503).`);
    if (!status && /timed? ?out/i.test(msg)) return make("timeout", `${who.label} did not answer in time.`);
    if (!status && /ECONN|ENOTFOUND|EAI_AGAIN|EHOSTUNREACH|network|fetch failed|Connection error|certificate|self.signed/i.test(msg)) {
      const tls = /certificate|self.signed/i.test(msg);
      return make(
        "network",
        `Cannot reach ${who.label}${tls ? " (TLS certificate not trusted)" : ""}.`,
        tls
          ? "Use a certificate from a public CA on the gateway, or set NODE_EXTRA_CA_CERTS to the gateway's CA file."
          : who.urlVar
            ? `Check ${who.urlVar} in backend/.env and that the ${who.label} and its gateway are running.`
            : "Check the server's internet connection."
      );
    }
    if (status >= 500) return make("provider", `${who.label} server error (${status}).`);
    return make("error", msg.slice(0, 200) || "AI request failed.");
  };
}

const OPENAI = { name: "openai", label: "OpenAI", keyVar: "OPENAI_API_KEY" };
const toAiError = makeToAiError(OPENAI);

/**
 * @param cfg {apiKey, baseURL, timeoutMs, interactiveTimeoutMs, maxConcurrent, models}
 * @param opts
 *   who           provider identity for messages (default OpenAI)
 *   keyOptional   self-hosted servers may run without a key
 *   checkModels   health check lists the server's models instead of a 1-token request
 *   requestExtras (model) => ({ body, extraTokens }) per-model request fields (e.g. reasoning effort)
 *   clientFactory (options) => client  (tests)
 */
function create(cfg, opts = {}) {
  const who = opts.who || OPENAI;
  const mapError = opts.who ? makeToAiError(who) : toAiError;
  let client = null;
  const getClient = () => {
    if (client) return client;
    if (!cfg.apiKey && !opts.keyOptional) throw mapError(new Error("API key is not configured."));
    const options = { apiKey: cfg.apiKey || "not-needed", baseURL: cfg.baseURL, timeout: cfg.timeoutMs, maxRetries: 2 };
    client = opts.clientFactory ? opts.clientFactory(options) : new OpenAI(options);
    return client;
  };

  async function chat({ model, system, user, maxTokens, temperature, interactive, json = true }) {
    const extras = opts.requestExtras ? opts.requestExtras(model) : { body: {}, extraTokens: 0 };
    const started = Date.now();
    let res;
    try {
      res = await getClient().chat.completions.create(
        {
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature,
          max_tokens: maxTokens + (extras.extraTokens || 0),
          ...(json ? { response_format: { type: "json_object" } } : {}),
          ...(extras.body || {}),
        },
        interactive ? { timeout: cfg.interactiveTimeoutMs, maxRetries: 1 } : undefined
      );
    } catch (err) {
      throw mapError(err, { model });
    }
    return {
      content: res.choices?.[0]?.message?.content,
      truncated: res.choices?.[0]?.finish_reason === "length",
      usage: {
        prompt_tokens: res.usage?.prompt_tokens || 0,
        completion_tokens: res.usage?.completion_tokens || 0,
        ms: Date.now() - started,
      },
    };
  }

  async function health() {
    const wanted = [...new Set(Object.values(cfg.models))];
    if (!opts.checkModels) {
      // OpenAI: the cheapest real request (1 output token) verifies the key and model access.
      try {
        await getClient().chat.completions.create(
          { model: cfg.models.generation || wanted[0], messages: [{ role: "user", content: "ping" }], max_tokens: 1 },
          { timeout: 15000, maxRetries: 0 }
        );
      } catch (err) {
        throw mapError(err);
      }
      return { models: wanted.map((name) => ({ name })) };
    }
    // Self-hosted server: confirm the key and that every model is being served.
    let served;
    try {
      const page = await getClient().models.list({ timeout: 15000, maxRetries: 0 });
      served = (page.data || []).map((m) => m.id);
    } catch (err) {
      throw mapError(err);
    }
    const missing = wanted.filter((m) => !served.includes(m));
    if (missing.length) {
      throw new AiError(`${who.label} is not serving: ${missing.join(", ")}.`, {
        provider: who.name,
        reason: "model_missing",
        hint: who.modelHint ? missing.map(who.modelHint).join(" ") : null,
        models: missing,
      });
    }
    return { models: wanted.map((name) => ({ name })), served };
  }

  return {
    name: who.name,
    label: who.label,
    protocol: "openai",
    models: cfg.models,
    maxConcurrent: cfg.maxConcurrent,
    chat,
    health,
    preload: async () => {},
    describe: () => ({ name: who.name, protocol: "openai", endpoint: cfg.baseURL || "api.openai.com", models: cfg.models }),
    toAiError: mapError,
    _setClient: (c) => {
      client = c;
    },
  };
}

module.exports = { create, toAiError, makeToAiError };
