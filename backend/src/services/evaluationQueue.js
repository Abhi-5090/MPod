const crypto = require("crypto");
const env = require("../config/env");
const evaluation = require("./evaluation");
const aiStatus = require("./aiStatus");
const { modelFor, normaliseType } = require("./interviewModels");

const LEASE_MS = 5 * 60 * 1000;
const HEARTBEAT_MS = 60 * 1000; // lease is renewed while the job is running
const MAX_ATTEMPTS = 3; // for errors caused by this interview's data
// While the AI provider is down, keep the answers and retry with backoff instead of failing.
const OUTAGE_MAX_WAIT_MS = 72 * 3600 * 1000;
const OUTAGE_BACKOFF_MS = [2, 5, 10, 20, 30].map((m) => m * 60 * 1000);
const SWEEP_MS = 60 * 1000;

const queue = [];
let running = 0;
let sweepTimer = null;

// Claims an interview for evaluation. The lease makes this safe across several
// server processes: only one can hold a valid lease at a time.
async function claim(Model, id, leaseId) {
  const now = new Date();
  return Model.findOneAndUpdate(
    {
      _id: id,
      $or: [
        { evaluation_status: "pending", $or: [{ evaluation_lease_until: null }, { evaluation_lease_until: { $lte: now } }] },
        { evaluation_status: "processing", evaluation_lease_until: { $lte: now } },
      ],
    },
    {
      $set: {
        evaluation_status: "processing",
        evaluation_lease_until: new Date(now.getTime() + LEASE_MS),
        evaluation_lease_id: leaseId,
      },
      $inc: { evaluation_attempts: 1 },
    },
    { new: true }
  );
}

async function evaluateDoc(type, doc) {
  const questions = doc.issued_questions || [];
  const byQid = {};
  for (const a of doc.answers || []) byQid[a.qid] = a;

  if (type === "coding") {
    for (const c of doc.idea_checks || []) {
      if (byQid[c.qid]) {
        byQid[c.qid].idea_check = c.attempts;
        byQid[c.qid].matched_accuracy = c.best;
      }
    }
    const { results } = await evaluation.evaluateCodingInterview(questions, byQid);
    return { question_details: results, overall_analysis: [] };
  }
  const items = questions.map((q) => ({
    question: q.question,
    answer: byQid[q.qid]?.answer || "",
    time: byQid[q.qid]?.time ?? null,
  }));
  const { results, overall } = await evaluation.evaluateVerbalInterview(items);
  return { question_details: results, overall_analysis: [overall] };
}

async function runJob(type, id) {
  const Model = modelFor(type);
  const leaseId = crypto.randomBytes(12).toString("hex");
  const doc = await claim(Model, id, leaseId);
  if (!doc) return; // already done or held by someone else
  // Only the current lease holder may renew or finish the job.
  const mine = { _id: doc._id, evaluation_status: "processing", evaluation_lease_id: leaseId };
  const heartbeat = setInterval(() => {
    Model.updateOne(mine, { $set: { evaluation_lease_until: new Date(Date.now() + LEASE_MS) } }).catch(() => {});
  }, HEARTBEAT_MS);
  heartbeat.unref();
  try {
    const out = await evaluateDoc(type, doc);
    await Model.updateOne(
      mine,
      {
        $set: {
          question_details: out.question_details,
          overall_analysis: out.overall_analysis,
          status: 0,
          evaluation_status: "completed",
          evaluated_at: new Date(),
          evaluation_error: null,
          evaluation_lease_until: null,
          evaluation_lease_id: null,
          evaluation_waiting_for_ai: false,
          evaluation_outage_retries: 0,
        },
      }
    );
  } catch (err) {
    if (aiStatus.isOutage(err)) {
      const submitted = doc.submitted_at ? new Date(doc.submitted_at).getTime() : Date.now();
      const giveUp = Date.now() - submitted > OUTAGE_MAX_WAIT_MS;
      const k = doc.evaluation_outage_retries || 0;
      const wait = OUTAGE_BACKOFF_MS[Math.min(k, OUTAGE_BACKOFF_MS.length - 1)];
      console.warn(`[evaluation] ${type} ${doc._id} waiting for AI (${aiStatus.classify(err).message}); retry in ${Math.round(wait / 60000)} min.`);
      await Model.updateOne(mine, {
        $set: {
          evaluation_lease_id: null,
          evaluation_status: giveUp ? "failed" : "pending",
          evaluation_error: `AI unavailable: ${aiStatus.classify(err).message}`.slice(0, 500),
          evaluation_waiting_for_ai: !giveUp,
          evaluation_lease_until: giveUp ? null : new Date(Date.now() + wait),
        },
        // an outage is not this interview's fault: don't use up its attempts
        $inc: { evaluation_attempts: -1, evaluation_outage_retries: 1 },
      });
      return;
    }
    console.error(`[evaluation] ${type} ${doc._id} attempt ${doc.evaluation_attempts} failed:`, err.message);
    const failed = doc.evaluation_attempts >= MAX_ATTEMPTS;
    await Model.updateOne(
      mine,
      {
        $set: {
          evaluation_lease_id: null,
          evaluation_status: failed ? "failed" : "pending",
          evaluation_error: String(err.message || err).slice(0, 500),
          // back off before the next try
          evaluation_lease_until: failed ? null : new Date(Date.now() + doc.evaluation_attempts * 60 * 1000),
        },
      }
    );
  } finally {
    clearInterval(heartbeat);
  }
}

function pump() {
  while (running < env.evalConcurrency && queue.length) {
    const job = queue.shift();
    running++;
    runJob(job.type, job.id)
      .catch((e) => console.error("[evaluation] unexpected", e))
      .finally(() => {
        running--;
        pump();
      });
  }
}

/** Adds an interview to the in-process evaluation queue. */
function enqueue(type, id) {
  const t = normaliseType(type);
  if (queue.some((j) => j.type === t && String(j.id) === String(id))) return;
  queue.push({ type: t, id });
  pump();
}

/**
 * Picks up work that was interrupted (server restart, failures awaiting retry) and
 * auto-submits attempts whose time ran out without a submit, so saved answers are
 * still evaluated.
 */
async function sweep() {
  const now = new Date();
  const types = ["ai generated", "company", "coding"];
  for (const type of types) {
    const Model = modelFor(type);
    // eslint-disable-next-line no-await-in-loop
    await Model.updateMany(
      {
        status: 1,
        evaluation_status: null,
        "attempt.deadline_at": { $lt: new Date(now.getTime() - env.submitGraceMinutes * 60000) },
        issued_questions: { $exists: true },
      },
      { $set: { evaluation_status: "pending", submitted_at: now, evaluation_lease_until: null } }
    );
    // eslint-disable-next-line no-await-in-loop
    const due = await Model.find({
      $or: [
        { evaluation_status: "pending", $or: [{ evaluation_lease_until: null }, { evaluation_lease_until: { $lte: now } }] },
        { evaluation_status: "processing", evaluation_lease_until: { $lte: now } },
      ],
    })
      .select("_id")
      .limit(200)
      .lean();
    due.forEach((d) => enqueue(type, d._id));
  }
}

function start() {
  if (sweepTimer) return;
  const run = () => sweep().catch((e) => console.error("[evaluation] sweep failed", e.message));
  run();
  sweepTimer = setInterval(run, SWEEP_MS);
  sweepTimer.unref();
}

function stop() {
  if (sweepTimer) clearInterval(sweepTimer);
  sweepTimer = null;
}

/** Staff action: retry an evaluation that ended in "failed". */
async function retry(type, id) {
  const Model = modelFor(type);
  const r = await Model.updateOne(
    { _id: id, $or: [{ evaluation_status: "failed" }, { evaluation_status: "pending", evaluation_waiting_for_ai: true }] },
    { $set: { evaluation_status: "pending", evaluation_attempts: 0, evaluation_outage_retries: 0, evaluation_lease_until: null } }
  );
  if (r.modifiedCount) enqueue(type, id);
  return r.modifiedCount > 0;
}

const idle = () => running === 0 && queue.length === 0;

module.exports = { enqueue, start, stop, sweep, retry, idle, runJob };
