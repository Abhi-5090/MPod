/**
 * Provisional (non-AI) scoring for technology and company interviews.
 *
 * Used only when the AI provider is unavailable, so students get timely feedback.
 * It is deterministic and explainable, and every result is labelled "provisional".
 * Once the AI is back the interview is re-scored by the AI and these results are
 * replaced. Signals:
 *  - similarity to the model answer, when the question came from the bank
 *  - coverage of the question's key terms
 *  - completeness (answer length, presence of an example)
 */

const STOP = new Set(
  (
    "a an the and or but if then else of to in on at by for with about against between into through during before after above below from up down out over under again further once here there when where why how all any both each few more most other some such no nor not only own same so than too very can will just don should now is are was were be been being have has had having do does did doing i me my we our you your he him his she her it its they them their what which who whom this that these those am as until while would could shall may might must also use used using get got make made like one two etc e g ie eg"
  ).split(/\s+/)
);

// Words that describe the task rather than the subject.
const TASK_WORDS = new Set(
  "explain describe define definition what why how when where mention give example examples compare difference differences between important importance common mistake mistakes developers scenario real world situation apply applied work works working related concept concepts briefly detail details tell discuss write list name".split(
    " "
  )
);

const stem = (w) =>
  w
    .replace(/(ization|isation)$/, "ize")
    .replace(/(ing|ings)$/, "")
    .replace(/(ed|ly|es|s)$/, "")
    .replace(/(.)\1$/, "$1");

function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^\.+|\.+$/g, ""))
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem)
    .filter((w) => w.length > 1);
}

const words = (text) => String(text || "").trim().split(/\s+/).filter(Boolean).length;

function cosine(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const tf = (arr) => arr.reduce((m, t) => m.set(t, (m.get(t) || 0) + 1), new Map());
  const a = tf(aTokens);
  const b = tf(bTokens);
  let dot = 0;
  a.forEach((v, k) => {
    if (b.has(k)) dot += v * b.get(k);
  });
  const norm = (m) => Math.sqrt([...m.values()].reduce((s, v) => s + v * v, 0));
  return dot / (norm(a) * norm(b) || 1);
}

const confidenceLevel = (accuracy) => (accuracy === 0 ? "low" : accuracy <= 50 ? "medium" : "high");

/** Scores one answer. Returns the same shape as the AI scorer, plus provisional: true. */
function scoreAnswer({ question, answer, time, reference }) {
  const base = {
    given_question: question,
    given_answer: answer || "",
    accuracy: 0,
    analysis: "",
    improvements: "",
    confidence_level: "none",
    time: time ?? null,
    provisional: true,
  };
  const n = words(answer);
  if (!n) {
    return { ...base, analysis: "No answer was given.", improvements: "Attempt every question, even briefly." };
  }

  const ans = tokens(answer);
  const ansSet = new Set(ans);
  const keyTerms = [...new Set(tokens(question).filter((t) => !TASK_WORDS.has(t)))];
  const refTerms = reference ? [...new Set(tokens(reference))] : [];
  const covered = keyTerms.filter((t) => ansSet.has(t));
  const coverage = keyTerms.length ? covered.length / keyTerms.length : 0.5;
  const lengthScore = Math.min(n / 60, 1);
  const hasExample = /\b(for example|for instance|e\.g\.?|such as|example)\b/i.test(answer);

  let raw;
  let refNote = "";
  if (refTerms.length) {
    const sim = Math.min(cosine(ans, tokens(reference)) / 0.45, 1);
    const refCovered = refTerms.filter((t) => ansSet.has(t)).length / refTerms.length;
    raw = 0.45 * sim + 0.2 * Math.min(refCovered / 0.5, 1) + 0.2 * coverage + 0.15 * lengthScore;
    refNote = ` It matches about ${Math.round(Math.min(sim, 1) * 100)}% of the model answer's content.`;
  } else {
    raw = 0.55 * coverage + 0.35 * lengthScore + (hasExample ? 0.1 : 0);
  }
  let accuracy = Math.round(Math.max(0, Math.min(1, raw)) * 100);
  if (n < 5) accuracy = Math.min(accuracy, 10);
  if (n < 12) accuracy = Math.min(accuracy, 35);

  const missing = keyTerms.filter((t) => !ansSet.has(t)).slice(0, 4);
  const tips = [];
  if (missing.length) tips.push(`Address the key ideas in the question (e.g. ${missing.join(", ")}).`);
  if (n < 40) tips.push("Give a fuller explanation (aim for 40-80 words).");
  if (!hasExample) tips.push("Support your answer with a concrete example.");
  if (!tips.length) tips.push("Good coverage. Make it precise and well structured.");

  return {
    ...base,
    accuracy,
    confidence_level: confidenceLevel(accuracy),
    analysis:
      `Provisional score (AI review pending). Your answer has ${n} words and covers ${covered.length} of ` +
      `${keyTerms.length || "the"} key terms in the question${covered.length ? ` (${covered.slice(0, 5).join(", ")})` : ""}.` +
      refNote,
    improvements: tips.join(" "),
  };
}

const avg = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

/** Scores a whole technology/company interview. items: [{question, answer, time, reference}] */
function scoreInterview(items) {
  const results = items.map(scoreAnswer);
  const answered = results.filter((r) => r.given_answer.trim());
  const acc = avg(results.map((r) => r.accuracy));
  const len = avg(answered.map((r) => Math.min(words(r.given_answer) / 60, 1) * 100));
  const timeUsed = answered.filter((r) => Number.isFinite(Number(r.time)) && Number(r.time) > 0).length;
  const strengths = results.filter((r) => r.accuracy >= 65).map((r) => `Covered the key points of: "${r.given_question}"`).slice(0, 4);
  const areas = results.filter((r) => r.accuracy < 40).map((r) => `Revise: "${r.given_question}"`).slice(0, 4);
  if (!strengths.length && answered.length) strengths.push("Attempted the interview questions.");
  if (answered.length < results.length) areas.push(`${results.length - answered.length} question(s) were not answered.`);
  const pct = (v) => Math.round(Math.max(0, Math.min(100, v)));
  return {
    results,
    overall: {
      provisional: true,
      strengths,
      areas_of_improvement: areas,
      interview_parameters: {
        communication_skills: pct(len),
        understandability: pct((len + acc) / 2),
        analytical_skills: pct(acc),
        time_management: pct(results.length ? (timeUsed / results.length) * 100 : 0),
        domain_skills: pct(acc),
        logical_thinking: pct(acc * 0.9 + len * 0.1),
        attention_to_detail: pct(acc),
      },
    },
  };
}

module.exports = { scoreInterview, scoreAnswer, tokens, cosine };
