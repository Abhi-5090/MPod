// DGX Spark provider: API keys, OpenAI-compatible servers (vLLM etc.), per-task endpoints,
// transport security.
const env = require("../src/config/env");
const dgx = require("../src/services/ai/providers/dgx");

const jsonRes = (status, body) => ({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) });
const cfg = (over = {}) => ({
  ...env.ai.dgx,
  baseURL: "https://ai.example.edu",
  apiKey: "key-123",
  protocol: "ollama",
  preload: false,
  isProd: true,
  endpoints: {},
  ...over,
});

function fakeOpenAiServer({ served = ["gpt-oss-120b", "gpt-oss-20b", "qwen3-coder-30b"], content = { accuracy: 70 } } = {}) {
  const clients = [];
  const factory = (options) => {
    const c = {
      options,
      requests: [],
      chat: {
        completions: {
          create: async (req) => {
            c.requests.push(req);
            return { choices: [{ message: { content: JSON.stringify(content) }, finish_reason: "stop" }], usage: { prompt_tokens: 5, completion_tokens: 2 } };
          },
        },
      },
      models: { list: async () => ({ data: served.map((id) => ({ id })) }) },
    };
    clients.push(c);
    return c;
  };
  return { factory, clients };
}

describe("DGX Spark: Ollama protocol through the API-key gateway", () => {
  test("every request carries the API key as a Bearer token", async () => {
    const seen = [];
    const fetchImpl = async (url, init) => {
      seen.push({ url, auth: init.headers.Authorization });
      if (url.endsWith("/api/show")) return jsonRes(200, { capabilities: ["completion"] });
      return jsonRes(200, { message: { content: '{"accuracy": 60}' }, done_reason: "stop" });
    };
    const p = dgx.create(cfg(), { fetchImpl });
    await p.chat({ task: "scoring", model: p.models.scoring, system: "s", user: "u", maxTokens: 10 });
    expect(seen.map((s) => s.url)).toEqual(["https://ai.example.edu/api/show", "https://ai.example.edu/api/chat"]);
    expect(seen.every((s) => s.auth === "Bearer key-123")).toBe(true);
  });

  test("a rejected key is an outage that names the setting to fix", async () => {
    const p = dgx.create(cfg(), { fetchImpl: async () => jsonRes(401, { error: "unauthorized" }) });
    const err = await p.chat({ task: "scoring", model: p.models.scoring, system: "s", user: "u", maxTokens: 10, interactive: true }).catch((e) => e);
    expect(err).toMatchObject({ provider: "dgx", reason: "auth", outage: true });
    expect(err.message).toMatch(/DGX Spark rejected the API key/);
    expect(err.hint).toMatch(/DGX_API_KEY/);
  });
});

describe("DGX Spark: OpenAI-compatible protocol (vLLM, TensorRT-LLM, SGLang)", () => {
  const models = { scoring: "gpt-oss-120b", generation: "gpt-oss-20b", summary: "qwen3:32b", coding: "qwen3-coder-30b" };

  test("uses <base>/v1 with the key, and asks reasoning models for short reasoning", async () => {
    const server = fakeOpenAiServer();
    const p = dgx.create(cfg({ protocol: "openai", models }), { openaiClientFactory: server.factory });
    for (const task of ["scoring", "summary", "coding"]) {
      // eslint-disable-next-line no-await-in-loop
      const out = await p.chat({ task, model: models[task], system: "s", user: "u", maxTokens: 100, temperature: 0.2 });
      expect(JSON.parse(out.content).accuracy).toBe(70);
    }
    const c = server.clients[0];
    expect(c.options).toMatchObject({ baseURL: "https://ai.example.edu/v1", apiKey: "key-123" });
    const [oss, qwen, coder] = c.requests;
    expect(oss).toMatchObject({ model: "gpt-oss-120b", reasoning_effort: "low", max_tokens: 100 + env.ai.dgx.reasoningTokens, response_format: { type: "json_object" } });
    expect(qwen).toMatchObject({ chat_template_kwargs: { enable_thinking: false }, max_tokens: 100 });
    expect(coder).not.toHaveProperty("reasoning_effort");
    expect(coder).not.toHaveProperty("chat_template_kwargs");
  });

  test("the health check lists the server's models and reports any that are not served", async () => {
    const server = fakeOpenAiServer({ served: ["gpt-oss-20b"] });
    const p = dgx.create(cfg({ protocol: "openai", models }), { openaiClientFactory: server.factory });
    const err = await p.health().catch((e) => e);
    expect(err.reason).toBe("model_missing");
    expect(err.models.sort()).toEqual(["gpt-oss-120b", "qwen3-coder-30b", "qwen3:32b"]);
    expect(err.hint).toMatch(/--served-model-name gpt-oss-120b/);
  });

  test("a base URL that already ends in /v1 is used as is", () => {
    expect(dgx.withV1("https://ai.example.edu/v1")).toBe("https://ai.example.edu/v1");
    expect(dgx.withV1("https://ai.example.edu/")).toBe("https://ai.example.edu/v1");
  });
});

describe("DGX Spark: per-task endpoints", () => {
  test("each task goes to its own endpoint, key and protocol; keys are never described", async () => {
    const server = fakeOpenAiServer({ content: { accuracy: 91 } });
    const ollamaCalls = [];
    const fetchImpl = async (url, init) => {
      ollamaCalls.push({ url, auth: init.headers.Authorization });
      if (url.endsWith("/api/show")) return jsonRes(200, { capabilities: ["completion"] });
      return jsonRes(200, { message: { content: '{"accuracy": 40}' }, done_reason: "stop" });
    };
    const p = dgx.create(
      cfg({
        endpoints: { scoring: { url: "https://scoring.example.edu", apiKey: "score-key", protocol: "openai" } },
        models: { scoring: "gpt-oss-120b", generation: "gpt-oss:20b", summary: "gpt-oss:20b", coding: "qwen3-coder:30b" },
      }),
      { fetchImpl, openaiClientFactory: server.factory }
    );
    const scoring = await p.chat({ task: "scoring", model: "gpt-oss-120b", system: "s", user: "u", maxTokens: 10 });
    const coding = await p.chat({ task: "coding", model: "qwen3-coder:30b", system: "s", user: "u", maxTokens: 10 });
    expect(JSON.parse(scoring.content).accuracy).toBe(91);
    expect(server.clients[0].options).toMatchObject({ baseURL: "https://scoring.example.edu/v1", apiKey: "score-key" });
    expect(JSON.parse(coding.content).accuracy).toBe(40);
    expect(ollamaCalls.every((c) => c.url.startsWith("https://ai.example.edu/") && c.auth === "Bearer key-123")).toBe(true);

    const d = JSON.stringify(p.describe());
    expect(d).not.toMatch(/score-key|key-123/);
    expect(p.describe().endpoints).toHaveLength(2);
  });
});

describe("DGX Spark: transport security", () => {
  test("plain HTTP to a public address is refused in production", () => {
    expect(() => dgx.create(cfg({ baseURL: "http://203.0.113.10:11434" }))).toThrow(/plain HTTP over a public network/);
  });

  test("HTTPS, private addresses and an explicit opt-in are accepted", () => {
    expect(dgx.create(cfg({ baseURL: "https://203.0.113.10" })).warnings).toEqual([]);
    for (const url of ["http://127.0.0.1:11434", "http://10.0.0.5:11434", "http://192.168.1.20", "http://172.20.0.2", "http://100.100.1.1", "http://dgx.local"]) {
      expect(dgx.create(cfg({ baseURL: url })).warnings).toEqual([]);
    }
    expect(dgx.create(cfg({ baseURL: "http://203.0.113.10", allowInsecure: true })).warnings).toEqual([]);
  });

  test("outside production a warning is returned instead", () => {
    const p = dgx.create(cfg({ baseURL: "http://203.0.113.10", isProd: false }));
    expect(p.warnings[0]).toMatch(/plain HTTP/);
  });

  test("an invalid URL is a clear configuration error", () => {
    expect(() => dgx.create(cfg({ baseURL: "not a url" }))).toThrow(/not a valid URL/);
  });
});
