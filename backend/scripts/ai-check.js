#!/usr/bin/env node
/**
 * Verifies the AI setup end to end, without touching the database.
 *
 *   npm run ai:check                     # every configured provider, every task
 *   npm run ai:check -- --provider=dgx
 *   npm run ai:check -- --health-only
 *
 * For each provider: health check (reachable, key accepted, models installed), then one
 * real request per task (question generation, answer scoring, summary, idea check,
 * code evaluation) with timing and a check that the answer has the expected shape.
 * When DGX_VISION_URL is set, the camera model service is checked too (health and one
 * test frame, validated against the contract in docs/DGX_MODEL_CONTRACT.md).
 * Exits with code 1 if anything fails.
 */
const env = require("../src/config/env");
const ai = require("../src/services/ai");
const evaluation = require("../src/services/evaluation");
const vision = require("../src/services/ai/vision");

// 16x12 plain JPEG: checks the request/response contract (no face is expected in it).
const SAMPLE_JPEG = "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAADAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgADAAQAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAf/aAAwDAQACEQMRAD8A+4KKKK+LPsD/2Q==";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v === undefined ? true : v];
  })
);
const names = args.provider ? (args.provider === "vision" ? [] : [String(args.provider)]) : ai.chain();

const ok = (s) => `\x1b[32m✔\x1b[0m ${s}`;
const bad = (s) => `\x1b[31m✘\x1b[0m ${s}`;
const secs = (ms) => `${(ms / 1000).toFixed(1)} s`;

const TASKS = [
  {
    name: "Question generation",
    run: () => evaluation.generateTechnologyQuestions({ technologyName: "Java", level: "easy", count: 3, moduleTopics: ["OOP: Inheritance, Polymorphism"] }),
    check: (r) => Array.isArray(r) && r.length === 3,
    show: (r) => r[0],
  },
  {
    name: "Answer scoring",
    run: () =>
      evaluation.scoreVerbalAnswer(
        "What is inheritance in Java?",
        "Inheritance lets a subclass reuse the fields and methods of a parent class using the extends keyword, for example Dog extends Animal.",
        40
      ),
    check: (r) => Number.isFinite(r.accuracy) && r.accuracy >= 50 && r.analysis.length > 0,
    show: (r) => `accuracy ${r.accuracy}`,
  },
  {
    name: "Interview summary",
    run: () => evaluation.overallAnalysis([{ given_question: "What is a class?", given_answer: "A blueprint for creating objects.", accuracy: 80, analysis: "Correct." }]),
    check: (r) => Array.isArray(r.strengths) && r.interview_parameters,
    show: (r) => `${r.strengths.length} strengths, domain_skills ${r.interview_parameters.domain_skills}`,
  },
  {
    name: "Coding idea check",
    run: () => evaluation.scoreIdea("Given an array and a target, return the indices of two numbers that add up to the target.", "Use a hash map from value to index; for each number check if target minus it is already in the map."),
    check: (r) => Number.isFinite(r) && r >= 50,
    show: (r) => `accuracy ${r}`,
  },
  {
    name: "Code evaluation",
    run: () =>
      evaluation.evaluateCodingInterview(
        [{ qid: "q1", problem_name: "Two Sum", description: "Return indices of two numbers that add up to target.", input: "nums, target", output: "two indices", constraints: "" }],
        { q1: { answer: "def two_sum(nums, t):\n    seen = {}\n    for i, n in enumerate(nums):\n        if t - n in seen:\n            return [seen[t - n], i]\n        seen[n] = i" } }
      ),
    check: (r) => r.results[0].is_code === true && Number(r.results[0].accuracy) >= 50,
    show: (r) => `accuracy ${r.results[0].accuracy}, time ${r.results[0].efficiency.time_complexity}`,
  },
];

async function checkProvider(name) {
  const p = ai.providers[name];
  if (!p) {
    console.log(bad(`Unknown provider "${name}"`));
    return false;
  }
  const d = p.describe();
  console.log(`\n=== ${p.label} (${d.endpoint}) ===`);
  for (const [task, model] of Object.entries(d.models)) console.log(`  ${task.padEnd(10)} ${model}`);

  let pass = true;
  try {
    const h = await p.health();
    console.log(ok(`Health check passed${h.version ? ` (Ollama ${h.version})` : ""}`));
    for (const e of h.endpoints || []) console.log(`    endpoint ${e.endpoint} (${e.protocol}): ${e.tasks.join(", ")}`);
    if (h.models && h.models.length) {
      for (const m of h.models) {
        const caps = m.capabilities ? m.capabilities.join(", ") : "served";
        console.log(`    ${m.name}: ${caps}${(h.loaded || []).includes(m.name) ? " (loaded)" : ""}`);
      }
    }
  } catch (err) {
    console.log(bad(`Health check failed: ${err.message}`));
    if (err.hint) console.log(`    Fix: ${err.hint}`);
    return false;
  }
  if (args["health-only"]) return true;

  for (const t of TASKS) {
    const started = Date.now();
    try {
      // eslint-disable-next-line no-await-in-loop
      const r = await ai.withProvider(name, t.run);
      const ms = Date.now() - started;
      if (t.check(r)) console.log(ok(`${t.name.padEnd(20)} ${secs(ms).padStart(7)}  ${String(t.show(r)).slice(0, 90)}`));
      else {
        pass = false;
        let shown;
        try {
          shown = t.show(r);
        } catch {
          shown = JSON.stringify(r).slice(0, 160);
        }
        console.log(bad(`${t.name.padEnd(20)} ${secs(ms).padStart(7)}  unexpected answer (${shown}); the model may be too small or need tuning`));
      }
    } catch (err) {
      pass = false;
      console.log(bad(`${t.name.padEnd(20)} ${secs(Date.now() - started).padStart(7)}  ${err.message}`));
      if (err.hint) console.log(`    Fix: ${err.hint}`);
    }
  }
  return pass;
}

async function checkVision() {
  console.log(`\n=== Camera model (${vision.enabled() ? env.ai.vision.url : "runs in the browser: DGX_VISION_URL not set"}) ===`);
  if (!vision.enabled()) return true;
  const st = await vision.check();
  if (!st.available) {
    console.log(bad(`Health check failed: ${st.message}`));
    if (st.hint) console.log(`    Fix: ${st.hint}`);
    return false;
  }
  console.log(ok(`Health check passed${st.model ? ` (model ${st.model})` : ""}`));
  const started = Date.now();
  try {
    const out = await vision.analyzeFrame(SAMPLE_JPEG);
    const f = out.faces[0];
    const detail = f ? `${out.faces.length} face(s), landmarks ${f.landmarks ? 68 : "missing"}, expressions ${Object.keys(f.expressions).join("/") || "missing"}` : "0 faces (expected for the test image)";
    console.log(ok(`${"Frame analysis".padEnd(20)} ${secs(Date.now() - started).padStart(7)}  ${detail}`));
    if (f && (!f.landmarks || !Object.keys(f.expressions).length)) {
      console.log(bad("Faces must include 68 landmarks and expression scores (see docs/DGX_MODEL_CONTRACT.md)."));
      return false;
    }
    return true;
  } catch (err) {
    console.log(bad(`${"Frame analysis".padEnd(20)} ${err.message}`));
    if (err.hint) console.log(`    Fix: ${err.hint}`);
    return false;
  }
}

(async () => {
  console.log(`AI_PROVIDER=${env.ai.provider}  AI_FALLBACK_PROVIDER=${env.ai.fallback}`);
  let all = true;
  for (const n of names) {
    // eslint-disable-next-line no-await-in-loop
    all = (await checkProvider(n)) && all;
  }
  if (!args.provider || args.provider === "vision") all = (await checkVision()) && all;
  console.log(all ? `\n${ok("AI setup OK")}` : `\n${bad("AI setup has problems (see above)")}`);
  process.exit(all ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
