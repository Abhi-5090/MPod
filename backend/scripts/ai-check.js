#!/usr/bin/env node
/**
 * Verifies the AI setup end to end, without touching the database.
 *
 *   npm run ai:check                     # every configured provider, every task
 *   npm run ai:check -- --provider=ollama
 *   npm run ai:check -- --health-only
 *
 * For each provider: health check (reachable, key accepted, models installed), then one
 * real request per task (question generation, answer scoring, summary, idea check,
 * code evaluation) with timing and a check that the answer has the expected shape.
 * Exits with code 1 if anything fails.
 */
const env = require("../src/config/env");
const ai = require("../src/services/ai");
const evaluation = require("../src/services/evaluation");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v === undefined ? true : v];
  })
);
const names = args.provider ? [String(args.provider)] : ai.chain();

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
    if (h.models && h.models[0] && h.models[0].capabilities) {
      for (const m of h.models) console.log(`    ${m.name}: ${m.capabilities.join(", ") || "?"}${(h.loaded || []).includes(m.name) ? " (loaded)" : ""}`);
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
        console.log(bad(`${t.name.padEnd(20)} ${secs(ms).padStart(7)}  unexpected answer: ${JSON.stringify(r).slice(0, 200)}`));
      }
    } catch (err) {
      pass = false;
      console.log(bad(`${t.name.padEnd(20)} ${secs(Date.now() - started).padStart(7)}  ${err.message}`));
      if (err.hint) console.log(`    Fix: ${err.hint}`);
    }
  }
  return pass;
}

(async () => {
  console.log(`AI_PROVIDER=${env.ai.provider}  AI_FALLBACK_PROVIDER=${env.ai.fallback}`);
  let all = true;
  for (const n of names) {
    // eslint-disable-next-line no-await-in-loop
    all = (await checkProvider(n)) && all;
  }
  console.log(all ? `\n${ok("AI setup OK")}` : `\n${bad("AI setup has problems (see above)")}`);
  process.exit(all ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
