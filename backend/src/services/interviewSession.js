const crypto = require("crypto");
const mongoose = require("mongoose");
const env = require("../config/env");
const Tenant = require("../models/tenant");
const User = require("../models/user");
const Module = require("../models/module");
const Technology = require("../models/technology");
const Company = require("../models/companies");
const CompanyQuestion = require("../models/companyQuestion");
const CodingQuestion = require("../models/codingQuestion");
const evaluation = require("./evaluation");
const { normaliseType, modelFor, tenantOfInterview } = require("./interviewModels");
const { HttpError, badRequest, forbidden, notFound, conflict, isObjectId, escapeRegex } = require("../lib/http");

const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
const newToken = () => crypto.randomBytes(32).toString("base64url");
const MAX_IDEA_CHECKS = 5;
const ANSWER_LIMITS = { verbal: 10000, code: 30000 };

const isSubmitted = (doc) => doc.status === 0 || Boolean(doc.evaluation_status) || Boolean(doc.submitted_at);

// Time allowed for an attempt: the tenant's interview duration or the time the
// questions need, whichever is longer.
function attemptMinutes(type, questions, tenant) {
  const tenantMinutes = tenant?.interview_duration_minutes || 30;
  let needed;
  if (type === "coding") {
    needed = questions.reduce((sum, q) => sum + (Number(q.time) > 0 ? Number(q.time) : 15), 0) + 5;
  } else {
    needed = Math.ceil((questions.length * 90) / 60) + 5; // ~60s answer + reading + buffer
  }
  return Math.max(tenantMinutes, needed);
}

// ------------------------------------------------------------ question issuing

async function buildQuestions(type, doc) {
  const count = Math.max(1, parseInt(doc.questions_count, 10) || 1);

  if (type === "ai generated") {
    const tech = await Technology.findById(doc.technology).select("technology_name").lean();
    if (!tech) throw conflict("The technology for this interview no longer exists.");
    const topicIds = (doc.topic || []).map(String);
    const modules = await Module.aggregate([
      { $match: { _id: { $in: (doc.module || []).map((m) => new mongoose.Types.ObjectId(String(m))) } } },
      { $lookup: { from: "topics", localField: "_id", foreignField: "module", as: "topics" } },
      { $project: { module_name: 1, topics: { _id: 1, topic_name: 1 } } },
    ]);
    const moduleTopics = modules
      .map((m) => {
        const t = m.topics.filter((x) => !topicIds.length || topicIds.includes(String(x._id))).map((x) => x.topic_name);
        return `${m.module_name}: ${t.join(", ")}`;
      })
      .sort(() => Math.random() - 0.5);
    const list = await evaluation.generateTechnologyQuestions({
      technologyName: tech.technology_name,
      level: doc.level,
      count,
      moduleTopics,
    });
    return list.map((q, i) => ({ qid: `q${i + 1}`, question: q }));
  }

  if (type === "company") {
    const match = {
      company: { $in: (doc.company || []).map((c) => new mongoose.Types.ObjectId(String(c))) },
      status: { $ne: 0 },
    };
    if (doc.round && doc.round.length) match.round = { $in: doc.round };
    if (doc.type && doc.type.length) match.type = { $in: doc.type };
    if (doc.tag) match.tag = new mongoose.Types.ObjectId(String(doc.tag));
    const rows = await CompanyQuestion.aggregate([{ $match: match }, { $sample: { size: count } }]);
    if (!rows.length) throw conflict("No questions are available for this company interview. Please contact your administrator.");
    return rows.map((r, i) => ({ qid: `q${i + 1}`, question: r.question, source_id: r._id }));
  }

  // coding
  const rows = await CodingQuestion.aggregate([
    { $match: { complexity: new RegExp(`^${escapeRegex(String(doc.level || ""))}$`, "i"), status: { $ne: 0 } } },
    { $sample: { size: Math.min(count, 10) } },
  ]);
  if (!rows.length) throw conflict("No coding problems are available for this level. Please contact your administrator.");
  return rows.map((r, i) => ({
    qid: `q${i + 1}`,
    source_id: r._id,
    question: r.problem_name,
    problem_name: r.problem_name,
    description: r.description,
    input: r.input,
    output: r.output,
    constraints: r.constraints,
    time: r.time,
    complexity: r.complexity,
  }));
}

// ------------------------------------------------------------ views

async function interviewSummary(type, doc) {
  const user = await User.findOne({ roll_no: doc.roll_no, ...(doc.tenant_id ? { tenant_id: doc.tenant_id } : {}) })
    .select("first_name gender")
    .lean();
  const out = {
    _id: doc._id,
    interview_type: type,
    platform: doc.platform,
    roll_no: doc.roll_no,
    first_name: user?.first_name || "",
    gender: user?.gender || "",
    start_date_time: doc.start_date_time,
    level: doc.level,
    questions_count: doc.questions_count,
  };
  if (type === "ai generated") {
    const [tech, modules] = await Promise.all([
      Technology.findById(doc.technology).select("technology_name").lean(),
      Module.aggregate([
        { $match: { _id: { $in: (doc.module || []).map((m) => new mongoose.Types.ObjectId(String(m))) } } },
        { $lookup: { from: "topics", localField: "_id", foreignField: "module", as: "topics" } },
      ]),
    ]);
    const topicIds = (doc.topic || []).map(String);
    out.technology_name = tech?.technology_name || "";
    out.module_details = modules.map((m) => ({
      _id: m._id,
      module_name: m.module_name,
      topic_names: m.topics.filter((t) => topicIds.includes(String(t._id))).map((t) => t.topic_name),
    }));
  }
  if (type === "company") {
    const companies = await Company.find({ _id: { $in: doc.company || [] } }).select("company_name").lean();
    out.company_details = companies.map((c) => ({ _id: c._id, company_name: c.company_name }));
    out.type = doc.type;
    out.round = doc.round;
  }
  return out;
}

const publicQuestion = (q) => {
  const { source_id, ...rest } = q; // eslint-disable-line no-unused-vars
  return { id: q.qid, ...rest };
};

const publicAnswers = (doc) =>
  (doc.answers || []).map((a) => {
    const check = (doc.idea_checks || []).find((c) => c.qid === a.qid);
    return {
      question_id: a.qid,
      answer: a.answer,
      time: a.time,
      idea: a.idea,
      optimized_answer: a.optimized_answer,
      idea_check: check ? check.attempts : 0,
      matched_accuracy: check ? check.best : null,
    };
  });

// ------------------------------------------------------------ start / resume

/**
 * Starts or resumes an attempt. Returns the attempt token (shown once), issued
 * questions and any answers already saved.
 *  - principal: { kind: "student", user } or { kind: "kiosk", device }
 */
async function startAttempt({ type: rawType, interviewId, principal }) {
  const type = normaliseType(rawType);
  if (!isObjectId(String(interviewId))) throw badRequest("Invalid interview ID.");
  const Model = modelFor(type);
  let doc = await Model.findById(interviewId);
  if (!doc) throw notFound("Interview not found.");

  // Ownership and channel checks.
  if (principal.kind === "student") {
    if (doc.roll_no !== principal.user.roll_no) throw notFound("Interview not found.");
    if (doc.tenant_id && String(doc.tenant_id) !== String(principal.user.tenant_id)) throw notFound("Interview not found.");
    if (doc.platform !== "web") throw forbidden("This interview must be taken at the mPod kiosk.");
  } else if (principal.kind === "kiosk") {
    const tenantId = await tenantOfInterview(doc);
    if (!tenantId || String(tenantId) !== String(principal.device.tenant_id)) throw notFound("Interview not found.");
    if (doc.platform !== "mpod") throw forbidden("This interview must be taken on the mPod website.");
  } else {
    throw forbidden();
  }

  if (isSubmitted(doc)) throw conflict("This interview has already been submitted.", { code: "ALREADY_SUBMITTED" });

  const now = new Date();
  const tenantId = doc.tenant_id || (await tenantOfInterview(doc));
  const tenant = tenantId ? await Tenant.findById(tenantId).select("interview_duration_minutes").lean() : null;

  let claimedNow = false;
  if (!doc.attempt || !doc.attempt.started_at) {
    const start = new Date(doc.start_date_time).getTime();
    if (now.getTime() < start - env.earlyStartMinutes * 60000) {
      throw conflict("This interview has not started yet.", { code: "NOT_STARTED", start_date_time: doc.start_date_time });
    }
    if (now.getTime() > start + env.startGraceMinutes * 60000) {
      throw conflict("The time to start this interview has passed.", { code: "EXPIRED" });
    }
    // Claim the attempt atomically so two devices cannot start it at once.
    const set = { "attempt.started_at": now, "attempt.platform": doc.platform, "attempt.resumes": 0 };
    if (principal.kind === "kiosk") set["attempt.device_id"] = principal.device._id;
    if (!doc.tenant_id && tenantId) set.tenant_id = tenantId;
    const claimed = await Model.findOneAndUpdate(
      { _id: doc._id, status: 1, evaluation_status: null, "attempt.started_at": { $exists: false } },
      { $set: set },
      { new: true }
    );
    if (claimed) {
      doc = claimed;
      claimedNow = true;
    } else {
      doc = await Model.findById(doc._id); // started elsewhere a moment ago; treat as resume
      if (!doc || isSubmitted(doc)) throw conflict("This interview has already been submitted.", { code: "ALREADY_SUBMITTED" });
    }
  }

  // Issue questions once. If generation fails the claim is released so the student can retry.
  if (!doc.issued_questions || !doc.issued_questions.length) {
    const startedMs = new Date(doc.attempt.started_at).getTime();
    // Another request is generating the questions right now.
    if (!claimedNow && Date.now() - startedMs < 90 * 1000) {
      throw conflict("Your interview is being prepared. Please try again in a few seconds.", { code: "PREPARING" });
    }
    let questions;
    try {
      questions = await buildQuestions(type, doc);
    } catch (err) {
      await Model.updateOne(
        { _id: doc._id, issued_questions: { $exists: false }, "attempt.started_at": doc.attempt.started_at },
        { $unset: { "attempt.started_at": "", "attempt.platform": "", "attempt.device_id": "" } }
      );
      if (err instanceof HttpError) throw err;
      console.error("[interview] question generation failed", err);
      throw new HttpError(502, "Could not prepare your questions right now. Please try again in a moment.");
    }
    const deadline = new Date(startedMs + attemptMinutes(type, questions, tenant) * 60000);
    const updated = await Model.findOneAndUpdate(
      { _id: doc._id, issued_questions: { $exists: false } },
      { $set: { issued_questions: questions, answers: [], "attempt.deadline_at": deadline } },
      { new: true }
    );
    doc = updated || (await Model.findById(doc._id));
  }

  if (doc.attempt.deadline_at && now > doc.attempt.deadline_at) {
    throw conflict("The time for this interview is over.", { code: "TIME_OVER" });
  }

  // A fresh token on every start/resume; the previous one stops working.
  const token = newToken();
  await Model.updateOne(
    { _id: doc._id },
    {
      $set: { "attempt.token_hash": sha256(token) },
      ...(claimedNow ? {} : { $inc: { "attempt.resumes": 1 } }),
    }
  );

  return {
    attempt_token: token,
    deadline_at: doc.attempt.deadline_at,
    server_time: new Date(),
    interview: await interviewSummary(type, doc),
    questions: doc.issued_questions.map(publicQuestion),
    answers: publicAnswers(doc),
  };
}

// ------------------------------------------------------------ token-authorised actions

async function loadByToken({ type: rawType, interviewId, token }) {
  const type = normaliseType(rawType);
  if (!token || typeof token !== "string" || token.length > 200) throw new HttpError(401, "Missing interview session token.");
  if (!isObjectId(String(interviewId))) throw badRequest("Invalid interview ID.");
  const Model = modelFor(type);
  const doc = await Model.findById(interviewId).select("+attempt.token_hash");
  const expected = doc?.attempt?.token_hash;
  const given = sha256(token);
  if (!expected || expected.length !== given.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given))) {
    throw new HttpError(401, "Your interview session is no longer valid. Please restart the interview.");
  }
  return { type, Model, doc };
}

const assertOpenForAnswers = (doc) => {
  if (isSubmitted(doc)) throw conflict("This interview has already been submitted.", { code: "ALREADY_SUBMITTED" });
  // 30 seconds of tolerance for network latency.
  if (doc.attempt?.deadline_at && Date.now() > new Date(doc.attempt.deadline_at).getTime() + 30000) {
    throw conflict("The time for this interview is over.", { code: "TIME_OVER" });
  }
};

const cleanText = (v, max) => {
  if (v == null) return "";
  const s = String(v);
  if (s.length > max) throw badRequest(`Answer is too long (max ${max} characters).`);
  return s;
};

async function saveAnswer({ type, interviewId, token, body }) {
  const ctx = await loadByToken({ type, interviewId, token });
  const { doc, Model } = ctx;
  assertOpenForAnswers(doc);
  const qid = String(body.question_id || "");
  if (!doc.issued_questions.some((q) => q.qid === qid)) throw badRequest("Unknown question.");

  const isCoding = ctx.type === "coding";
  const max = isCoding ? ANSWER_LIMITS.code : ANSWER_LIMITS.verbal;
  const entry = {
    qid,
    answer: cleanText(body.answer, max),
    time: Number.isFinite(Number(body.time)) ? Math.max(0, Math.min(36000, Number(body.time))) : null,
    saved_at: new Date(),
  };
  if (isCoding) {
    entry.idea = cleanText(body.idea, ANSWER_LIMITS.verbal);
    entry.optimized_answer = cleanText(body.optimized_answer, max);
  }

  const open = { status: 1, evaluation_status: null };
  const r = await Model.updateOne({ _id: doc._id, ...open, "answers.qid": qid }, { $set: { "answers.$": entry } });
  if (!r.matchedCount) {
    const p = await Model.updateOne({ _id: doc._id, ...open, "answers.qid": { $ne: qid } }, { $push: { answers: entry } });
    if (!p.matchedCount) {
      // Either submitted in the meantime or another request inserted it first; retry the $set once.
      const again = await Model.updateOne({ _id: doc._id, ...open, "answers.qid": qid }, { $set: { "answers.$": entry } });
      if (!again.matchedCount) throw conflict("This interview has already been submitted.", { code: "ALREADY_SUBMITTED" });
    }
  }
  return { saved: true, question_id: qid };
}

async function checkIdea({ type, interviewId, token, body }) {
  const ctx = await loadByToken({ type, interviewId, token });
  if (ctx.type !== "coding") throw badRequest("Idea checks are only for coding interviews.");
  const { doc, Model } = ctx;
  assertOpenForAnswers(doc);
  const qid = String(body.question_id || "");
  const q = doc.issued_questions.find((x) => x.qid === qid);
  if (!q) throw badRequest("Unknown question.");
  const idea = cleanText(body.idea, ANSWER_LIMITS.verbal);
  if (!idea.trim()) throw badRequest("Describe your idea first.");

  const existing = (doc.idea_checks || []).find((c) => c.qid === qid);
  if (existing && existing.attempts >= MAX_IDEA_CHECKS) {
    throw new HttpError(429, "You have used all idea checks for this problem.");
  }
  const accuracy = await evaluation.scoreIdea(q.description, idea);

  const attempts = (existing?.attempts || 0) + 1;
  const best = Math.max(existing?.best || 0, accuracy);
  const record = { qid, attempts, last: accuracy, best, updated_at: new Date() };
  const r = await Model.updateOne({ _id: doc._id, "idea_checks.qid": qid }, { $set: { "idea_checks.$": record } });
  if (!r.matchedCount) await Model.updateOne({ _id: doc._id }, { $push: { idea_checks: record } });
  return { accuracy, attempts, attempts_left: Math.max(0, MAX_IDEA_CHECKS - attempts) };
}

// Only known numeric/short fields from the browser's face tracking are stored.
function sanitiseEmotions(e) {
  if (!e || typeof e !== "object") return undefined;
  const src = Array.isArray(e) ? e[0] : e;
  if (!src || typeof src !== "object") return undefined;
  const str = (v) => (v == null ? undefined : String(v).slice(0, 50));
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : undefined);
  const em = src.emotions || {};
  return {
    seen_left: str(src.seen_left),
    seen_right: str(src.seen_right),
    seen_center: str(src.seen_center),
    blinks: str(src.blinks),
    time_straight: str(src.time_straight),
    time_left: str(src.time_left),
    time_right: str(src.time_right),
    emotions: {
      angry: num(em.angry),
      disgust: num(em.disgust),
      fear: num(em.fear),
      happy: num(em.happy),
      sad: num(em.sad),
      surprise: num(em.surprise),
      neutral: num(em.neutral),
    },
  };
}

async function submitAttempt({ type, interviewId, token, body, enqueue }) {
  const ctx = await loadByToken({ type, interviewId, token });
  const { doc, Model } = ctx;
  if (isSubmitted(doc)) {
    return { evaluation_status: doc.evaluation_status || (doc.status === 0 ? "completed" : "pending"), already_submitted: true };
  }
  const emotions = sanitiseEmotions(body.emotions);
  const r = await Model.updateOne(
    { _id: doc._id, status: 1, evaluation_status: null },
    {
      $set: {
        submitted_at: new Date(),
        evaluation_status: "pending",
        evaluation_lease_until: null,
        ...(emotions ? { emotions } : {}),
      },
    }
  );
  if (r.modifiedCount && enqueue) enqueue(ctx.type, doc._id);
  return { evaluation_status: "pending", already_submitted: !r.modifiedCount };
}

async function attemptStatus({ type, interviewId, token }) {
  const { doc } = await loadByToken({ type, interviewId, token });
  return {
    status: doc.status,
    evaluation_status: doc.evaluation_status || (doc.status === 0 ? "completed" : null),
    report_ready: doc.status === 0,
  };
}

// ------------------------------------------------------------ kiosk lookup

/** Finds the kiosk interview a student can start or resume right now on this device's college. */
async function findKioskInterview({ rollNo, device }) {
  const roll = String(rollNo || "").trim();
  if (!roll) throw badRequest("Enter your roll number.");
  const user = await User.findOne({ roll_no: { $in: [roll, roll.toUpperCase()] }, tenant_id: device.tenant_id })
    .select("roll_no status")
    .lean();
  if (!user || user.status === 0) throw notFound("No interview is scheduled for this roll number right now.");

  const now = Date.now();
  const types = ["ai generated", "company", "coding"];
  for (const type of types) {
    const Model = modelFor(type);
    // eslint-disable-next-line no-await-in-loop
    const docs = await Model.find({
      roll_no: user.roll_no,
      platform: "mpod",
      status: 1,
      evaluation_status: null,
      start_date_time: {
        $gte: new Date(now - 6 * 3600 * 1000),
        $lte: new Date(now + env.earlyStartMinutes * 60000),
      },
    })
      .sort({ start_date_time: -1 })
      .limit(5);
    for (const doc of docs) {
      // eslint-disable-next-line no-await-in-loop
      const tenantId = await tenantOfInterview(doc);
      if (String(tenantId) !== String(device.tenant_id)) continue;
      const startMs = new Date(doc.start_date_time).getTime();
      const startable = !doc.attempt?.started_at && now <= startMs + env.startGraceMinutes * 60000;
      const resumable =
        doc.attempt?.started_at && (!doc.attempt.deadline_at || now <= new Date(doc.attempt.deadline_at).getTime());
      if (startable || resumable) {
        // eslint-disable-next-line no-await-in-loop
        return { ...(await interviewSummary(type, doc)), resumable: Boolean(resumable) };
      }
    }
  }
  throw notFound("No interview is scheduled for this roll number right now.");
}

module.exports = {
  startAttempt,
  saveAnswer,
  checkIdea,
  submitAttempt,
  attemptStatus,
  findKioskInterview,
  sanitiseEmotions,
  attemptMinutes,
  isSubmitted,
  _internals: { sha256, buildQuestions },
};
