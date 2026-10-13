// AI gateway: DGX Spark provider (Ollama and OpenAI-compatible endpoints), failover,
// status, limiter, usage tracking, camera (vision) service.
const env = require("../src/config/env");
const ai = require("../src/services/ai");
const aiStatus = require("../src/services/aiStatus");
const ollama = require("../src/services/ai/providers/ollama");
const dgx = require("../src/services/ai/providers/dgx");
const { AiError } = require("../src/services/ai/errors");
const { createLimiter } = require("../src/services/ai/limiter");

const CAPS = {
  "gpt-oss:20b": ["completion", "tools", "thinking"],
  "gpt-oss:120b": ["completion", "tools", "thinking"],
  "qwen3:32b": ["completion", "tools", "thinking"],
  "qwen3-coder:30b": ["completion", "tools"],
};

const jsonRes = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
});

// Minimal fake Ollama server. `reply` decides the chat answer.
function fakeOllama({ installed = Object.keys(CAPS), reply = () => ({ accuracy: 80 }), down = false } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ path, body });
    if (down) throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNREFUSED" } });
    if (path === "/api/version") return jsonRes(200, { version: "0.12.0" });
    if (path === "/api/ps") return jsonRes(200, { models: [] });
    if (path === "/api/show") {
      if (!installed.includes(body.model)) return jsonRes(404, { error: `model '${body.model}' not found` });
      return jsonRes(200, { capabilities: CAPS[body.model] || ["completion"] });
    }
    if (path === "/api/chat") {
      if (!installed.includes(body.model)) return jsonRes(404, { error: `model "${body.model}" not found, try pulling it first` });
      const out = reply(body);
      return jsonRes(200, {
        message: { role: "assistant", content: typeof out === "string" ? out : JSON.stringify(out) },
        done: true,
        done_reason: "stop",
        prompt_eval_count: 100,
        eval_count: 20,
      });
    }
    return jsonRes(404, { error: "unknown" });
  };
  return { fetchImpl, calls };
}

const cfg = (over = {}) => ({ ...env.ai.dgx, preload: false, ...over });
const chatCalls = (calls) => calls.filter((c) => c.path === "/api/chat");

describe("Ollama adapter", () => {
  test("sends a native JSON chat request with context size, output budget and keep-alive", async () => {
    const { fetchImpl, calls } = fakeOllama();
    const p = ollama.create(cfg({ models: { ...env.ai.dgx.models, coding: "qwen3-coder:30b" } }), { fetchImpl });
    const out = await p.chat({ model: "qwen3-coder:30b", system: "s", user: "u", maxTokens: 300, temperature: 0.2 });
    expect(JSON.parse(out.content)).toEqual({ accuracy: 80 });
    expect(out.usage).toMatchObject({ prompt_tokens: 100, completion_tokens: 20 });
    const req = chatCalls(calls)[0].body;
    expect(req).toMatchObject({ model: "qwen3-coder:30b", stream: false, format: "json", keep_alive: -1 });
    expect(req.options).toEqual({ temperature: 0.2, num_ctx: 8192, num_predict: 300 });
    expect(req).not.toHaveProperty("think"); // not a thinking model
    expect(req.messages).toEqual([
      { role: "system", content: "s" },
      { role: "user", content: "u" },
    ]);
  });

  test("auto thinking: gpt-oss thinks at low effort with extra tokens; other thinking models have it off", async () => {
    const { fetchImpl, calls } = fakeOllama();
    const p = ollama.create(cfg(), { fetchImpl });
    await p.chat({ model: "gpt-oss:20b", system: "s", user: "u", maxTokens: 100, temperature: 0 });
    await p.chat({ model: "qwen3:32b", system: "s", user: "u", maxTokens: 100, temperature: 0 });
    const [oss, qwen] = chatCalls(calls).map((c) => c.body);
    expect(oss.think).toBe("low");
    expect(oss.options.num_predict).toBe(100 + env.ai.dgx.reasoningTokens);
    expect(qwen.think).toBe(false);
    expect(qwen.options.num_predict).toBe(100);
  });

  test("an explicit OLLAMA_THINK level is passed to gpt-oss", async () => {
    const { fetchImpl } = fakeOllama();
    const p = ollama.create(cfg({ think: "high" }), { fetchImpl });
    expect(await p._thinkFor("gpt-oss:120b")).toBe("high");
    expect(await p._thinkFor("qwen3:32b")).toBe(true);
    expect(await p._thinkFor("qwen3-coder:30b")).toBeUndefined();
  });

  test("a missing model is an outage with the exact pull command", async () => {
    const { fetchImpl } = fakeOllama({ installed: [] });
    const p = ollama.create(cfg(), { fetchImpl });
    const err = await p.chat({ model: "gpt-oss:20b", system: "s", user: "u", maxTokens: 10 }).catch((e) => e);
    expect(err).toBeInstanceOf(AiError);
    expect(err.reason).toBe("model_missing");
    expect(err.outage).toBe(true);
    expect(err.hint).toMatch(/ollama pull gpt-oss:20b/);
  });

  test("an unreachable server is a network outage", async () => {
    const { fetchImpl } = fakeOllama({ down: true });
    const p = ollama.create(cfg(), { fetchImpl });
    const err = await p.chat({ model: "gpt-oss:20b", system: "s", user: "u", maxTokens: 10, interactive: true }).catch((e) => e);
    expect(err.reason).toBe("network");
    expect(err.outage).toBe(true);
    expect(err.hint).toMatch(/systemctl status ollama/);
  });

  test("a request that takes too long is a timeout outage", async () => {
    const p = ollama.create(cfg(), {
      fetchImpl: async () => {
        throw Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" });
      },
    });
    const err = await p.chat({ model: "x", system: "s", user: "u", maxTokens: 10, interactive: true }).catch((e) => e);
    expect(err.reason).toBe("timeout");
    expect(err.outage).toBe(true);
  });

  test("transient server errors are retried for background work", async () => {
    let n = 0;
    const base = fakeOllama();
    const p = ollama.create(cfg(), {
      fetchImpl: async (url, init) => {
        if (url.endsWith("/api/chat") && n++ === 0) return jsonRes(500, { error: "boom" });
        return base.fetchImpl(url, init);
      },
    });
    const out = await p.chat({ model: "qwen3-coder:30b", system: "s", user: "u", maxTokens: 10 });
    expect(JSON.parse(out.content).accuracy).toBe(80);
    expect(n).toBe(2);
  }, 10000);

  test("health check lists every missing model", async () => {
    const { fetchImpl } = fakeOllama({ installed: ["gpt-oss:20b"] });
    const p = ollama.create(cfg(), { fetchImpl });
    const err = await p.health().catch((e) => e);
    expect(err.reason).toBe("model_missing");
    expect(err.message).toMatch(/gpt-oss:120b/);
    expect(err.message).toMatch(/qwen3-coder:30b/);
    expect(err.hint).toMatch(/ollama pull gpt-oss:120b && ollama pull qwen3-coder:30b/);
  });

  test("health check passes when Ollama is up and the models are installed", async () => {
    const { fetchImpl } = fakeOllama();
    const p = ollama.create(cfg(), { fetchImpl });
    const h = await p.health();
    expect(h.version).toBe("0.12.0");
    expect(h.models.map((m) => m.name).sort()).toEqual(["gpt-oss:120b", "gpt-oss:20b", "qwen3-coder:30b"]);
  });
});

describe("AI gateway", () => {
  const original = { provider: env.ai.provider, fallback: env.ai.fallback, dgx: ai.providers.dgx };
  const openaiCalls = [];
  const useOpenAiFake = (content = { accuracy: 55 }) =>
    ai.providers.openai._setClient({
      chat: {
        completions: {
          create: async (req) => {
            openaiCalls.push(req);
            return { choices: [{ message: { content: JSON.stringify(content) }, finish_reason: "stop" }], usage: { prompt_tokens: 7, completion_tokens: 3 } };
          },
        },
      },
    });
  const setup = (provider, fallback, fake) => {
    env.ai.provider = provider;
    env.ai.fallback = fallback;
    ai.providers.dgx = dgx.create(cfg(), { fetchImpl: fake.fetchImpl });
    aiStatus._reset();
  };

  beforeEach(() => {
    openaiCalls.length = 0;
    useOpenAiFake();
  });
  afterAll(() => {
    Object.assign(env.ai, { provider: original.provider, fallback: original.fallback });
    ai.providers.dgx = original.dgx;
    aiStatus._reset();
  });

  test("uses the DGX Spark with the task's model when it is the primary provider", async () => {
    const fake = fakeOllama();
    setup("dgx", "none", fake);
    const data = await ai.chatJson("scoring", { system: "s", user: "u", maxTokens: 50 });
    expect(data.accuracy).toBe(80);
    expect(chatCalls(fake.calls)[0].body.model).toBe(env.ai.dgx.models.scoring);
    expect(openaiCalls).toHaveLength(0);
  });

  test("fails over to OpenAI while the DGX Spark is down, then skips it during the cool-down", async () => {
    const fake = fakeOllama({ down: true });
    setup("dgx", "openai", fake);
    const first = await ai.chatJson("summary", { system: "s", user: "u" });
    expect(first.accuracy).toBe(55);
    expect(openaiCalls[0].model).toBe(env.ai.openai.models.summary);

    const st = aiStatus.getStatus();
    expect(st).toMatchObject({ available: true, degraded: true, provider: "dgx", serving: "openai", fallback: "openai" });
    expect(st.message).toMatch(/DGX Spark: Cannot reach DGX Spark/);

    const before = fake.calls.length;
    await ai.chatJson("summary", { system: "s", user: "u" });
    expect(fake.calls.length).toBe(before); // Ollama not retried within the cool-down
    expect(openaiCalls).toHaveLength(2);
  });

  test("when every provider is down the outage error is thrown", async () => {
    setup("dgx", "none", fakeOllama({ down: true }));
    const err = await ai.chatJson("scoring", { system: "s", user: "u" }).catch((e) => e);
    expect(err.reason).toBe("network");
    expect(aiStatus.isOutage(err)).toBe(true);
    const st = aiStatus.getStatus();
    expect(st.available).toBe(false);
    expect(st.hint).toMatch(/systemctl status ollama/);
  });

  test("a bad answer from one request does not fail over or mark the provider down", async () => {
    const fake = fakeOllama({ reply: () => "this is not json" });
    setup("dgx", "openai", fake);
    const err = await ai.chatJson("scoring", { system: "s", user: "u" }).catch((e) => e);
    expect(err.reason).toBe("bad_response");
    expect(aiStatus.isOutage(err)).toBe(false);
    expect(chatCalls(fake.calls)).toHaveLength(2); // retried once
    expect(openaiCalls).toHaveLength(0);
    expect(aiStatus.getStatus().degraded).toBe(false);
  });

  test("reasoning text and prose around the JSON are tolerated", async () => {
    setup("dgx", "none", fakeOllama({ reply: () => '<think>let me see</think>\nHere you go: {"accuracy": 91}\nDone.' }));
    expect((await ai.chatJson("scoring", { system: "s", user: "u" })).accuracy).toBe(91);
    expect(ai.parseJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(() => ai.parseJson("[1,2]")).toThrow();
  });

  test("track() records which provider and model produced the work", async () => {
    setup("dgx", "none", fakeOllama());
    const { value, usage } = await ai.track(async () => {
      await ai.chatJson("scoring", { system: "s", user: "u" });
      await ai.chatJson("coding", { system: "s", user: "u" });
      return "done";
    });
    expect(value).toBe("done");
    const summary = ai.usageSummary(usage);
    expect(summary.providers).toEqual(["dgx"]);
    expect(summary.models.sort()).toEqual([`dgx:${env.ai.dgx.models.coding}`, `dgx:${env.ai.dgx.models.scoring}`].sort());
    expect(summary).toMatchObject({ calls: 2, prompt_tokens: 200, completion_tokens: 40 });
  });

  test("withProvider() forces one provider", async () => {
    setup("dgx", "openai", fakeOllama());
    const data = await ai.withProvider("openai", () => ai.chatJson("scoring", { system: "s", user: "u" }));
    expect(data.accuracy).toBe(55);
  });

  test("questions returned as objects are accepted", async () => {
    setup("dgx", "none", fakeOllama({ reply: () => ({ questions: [{ question: "What is a class?" }, { text: "What is an object?" }, "3. What is a method?"] }) }));
    const evaluation = require("../src/services/evaluation");
    const qs = await evaluation.generateTechnologyQuestions({ technologyName: "Java", level: "easy", count: 3, moduleTopics: ["OOP: Classes"] });
    expect(qs).toEqual(["What is a class?", "What is an object?", "What is a method?"]);
  });

  test("the scoring functions work unchanged on the DGX Spark", async () => {
    setup("dgx", "none", fakeOllama({ reply: () => ({ accuracy: 77, analysis: "good", improvements: "more" }) }));
    const evaluation = require("../src/services/evaluation");
    const r = await evaluation.scoreVerbalAnswer("What is a class?", "A blueprint for objects", 30);
    expect(r).toMatchObject({ accuracy: 77, analysis: "good", confidence_level: "high" });
  });

  test("a missing model affects only the tasks that use it", async () => {
    // only the scoring model is missing
    const installed = Object.keys(CAPS).filter((m) => m !== env.ai.dgx.models.scoring);
    const fake = fakeOllama({ installed });
    setup("dgx", "openai", fake);
    expect((await ai.chatJson("scoring", { system: "s", user: "u" })).accuracy).toBe(55); // OpenAI
    expect((await ai.chatJson("summary", { system: "s", user: "u" })).accuracy).toBe(80); // still Ollama
    const before = chatCalls(fake.calls).length;
    await ai.chatJson("scoring", { system: "s", user: "u" });
    expect(chatCalls(fake.calls).length).toBe(before); // missing model skipped during the cool-down
    const st = aiStatus.getStatus();
    expect(st).toMatchObject({ available: true, degraded: true, partial: true, serving: "dgx", reason: "model_missing" });
    expect(st.hint).toBe(`On the DGX Spark run: ollama pull ${env.ai.dgx.models.scoring}`);
    expect(st.providers[0].missing_models).toEqual([env.ai.dgx.models.scoring]);
  });

  test("a missing model with no fallback leaves the other tasks working", async () => {
    setup("dgx", "none", fakeOllama({ installed: [env.ai.dgx.models.generation] }));
    const st = await aiStatus.check();
    aiStatus.stop();
    expect(st).toMatchObject({ available: true, degraded: true, partial: true });
    expect(st.message).toMatch(new RegExp(env.ai.dgx.models.scoring));
    expect((await ai.chatJson("generation", { system: "s", user: "u" })).accuracy).toBe(80);
    const err = await ai.chatJson("scoring", { system: "s", user: "u" }).catch((e) => e);
    expect(err.reason).toBe("model_missing");
  });

  test("the health check reports each provider separately", async () => {
    setup("dgx", "openai", fakeOllama({ installed: ["gpt-oss:20b"] }));
    const st = await aiStatus.check();
    aiStatus.stop();
    const byName = Object.fromEntries(st.providers.map((p) => [p.name, p]));
    expect(byName.dgx).toMatchObject({ available: true, partial: true, reason: "model_missing" });
    expect(byName.openai).toMatchObject({ available: true });
    expect(st.degraded).toBe(true);
  });
});

describe("limiter", () => {
  test("never exceeds the limit and serves interactive work first", async () => {
    const lim = createLimiter(1);
    const order = [];
    let release;
    const gate = new Promise((r) => {
      release = r;
    });
    const first = lim.run(() => gate.then(() => order.push("first")));
    const batch = lim.run(async () => order.push("batch"));
    const interactive = lim.run(async () => order.push("interactive"), { interactive: true });
    expect(lim.stats()).toMatchObject({ active: 1, waiting: 2 });
    release();
    await Promise.all([first, batch, interactive]);
    expect(order).toEqual(["first", "interactive", "batch"]);
  });
});
