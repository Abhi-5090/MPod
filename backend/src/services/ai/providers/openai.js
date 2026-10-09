/**
 * OpenAI (or any OpenAI-compatible endpoint via OPENAI_BASE_URL) chat-completions adapter.
 */
const OpenAI = require("openai");
const { AiError } = require("../errors");

const NAME = "openai";
const LABEL = "OpenAI";

/** Maps an OpenAI SDK error (or a plain error carrying a status) to an AiError. */
function toAiError(err) {
  if (err instanceof AiError) return err;
  const status = err && (err.status || (err.response && err.response.status));
  const msg = String((err && err.message) || "");
  const make = (reason, message, hint) => new AiError(message, { provider: NAME, reason, status, hint, cause: err });
  if (/not configured|OPENAI_API_KEY/i.test(msg) && !status) {
    return make("no_key", "OPENAI_API_KEY is not set in backend/.env.", "Set OPENAI_API_KEY in backend/.env and restart the backend.");
  }
  if (status === 401 || status === 403) {
    const scope = /model\.request/i.test(msg) ? " The key lacks the model.request permission." : "";
    return make(
      "auth",
      `OpenAI rejected the API key (${status}).${scope}`,
      "Give the OpenAI API key the model.request permission (or set a working key) in backend/.env and restart the backend."
    );
  }
  if (status === 404 && /model/i.test(msg)) {
    return make("model_missing", `OpenAI model not available: ${msg.slice(0, 160)}`, "Check the OPENAI_*_MODEL settings in backend/.env.");
  }
  if (status === 429 && /quota|billing/i.test(msg)) {
    return make("quota", "OpenAI quota or billing limit reached.", "Add credits or raise the limit in the OpenAI dashboard.");
  }
  if (status === 429) return make("rate_limit", "OpenAI rate limit hit; retrying later.");
  if (!status && /timed? ?out/i.test(msg)) return make("timeout", "OpenAI did not answer in time.");
  if (!status && /ECONN|ENOTFOUND|EAI_AGAIN|network|fetch failed|Connection error/i.test(msg)) {
    return make("network", "Cannot reach OpenAI (network/timeout).", "Check the server's internet connection.");
  }
  if (status >= 500) return make("provider", `OpenAI server error (${status}).`);
  return make("error", msg.slice(0, 200) || "AI request failed.");
}

function create(cfg) {
  let client = null;
  const getClient = () => {
    if (client) return client;
    if (!cfg.apiKey) throw toAiError(new Error("OPENAI_API_KEY is not configured."));
    client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL, timeout: cfg.timeoutMs, maxRetries: 2 });
    return client;
  };

  async function chat({ model, system, user, maxTokens, temperature, interactive, json = true }) {
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
          max_tokens: maxTokens,
          ...(json ? { response_format: { type: "json_object" } } : {}),
        },
        interactive ? { timeout: cfg.interactiveTimeoutMs, maxRetries: 1 } : undefined
      );
    } catch (err) {
      throw toAiError(err);
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

  /** Cheapest possible request (1 output token) to verify the key and model access. */
  async function health() {
    try {
      await getClient().chat.completions.create(
        { model: cfg.models.generation, messages: [{ role: "user", content: "ping" }], max_tokens: 1 },
        { timeout: 15000, maxRetries: 0 }
      );
    } catch (err) {
      throw toAiError(err);
    }
    return { models: Object.values(cfg.models) };
  }

  return {
    name: NAME,
    label: LABEL,
    models: cfg.models,
    maxConcurrent: cfg.maxConcurrent,
    chat,
    health,
    preload: async () => {},
    describe: () => ({ name: NAME, endpoint: cfg.baseURL || "api.openai.com", models: cfg.models }),
    toAiError,
    _setClient: (c) => {
      client = c;
    },
  };
}

module.exports = { create, toAiError, NAME };
