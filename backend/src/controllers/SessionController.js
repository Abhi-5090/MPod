const session = require("../services/interviewSession");
const queue = require("../services/evaluationQueue");
const { loadInterviewForAccess, normaliseType } = require("../services/interviewModels");
const { asyncHandler, badRequest } = require("../lib/http");

const tokenOf = (req) => req.get("X-Attempt-Token") || "";

/** POST /interview-session/start { interview_id, interview_type } — student on the website. */
const start = asyncHandler(async (req, res) => {
  const { interview_id, interview_type } = req.body || {};
  const result = await session.startAttempt({
    type: interview_type,
    interviewId: interview_id,
    principal: { kind: "student", user: req.auth.user },
  });
  return res.status(200).json(result);
});

/** POST /interview-session/answer  (header X-Attempt-Token) */
const answer = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const result = await session.saveAnswer({ type: b.interview_type, interviewId: b.interview_id, token: tokenOf(req), body: b });
  return res.status(200).json(result);
});

/** POST /interview-session/analyze-idea  (coding only) */
const analyzeIdea = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const result = await session.checkIdea({ type: b.interview_type, interviewId: b.interview_id, token: tokenOf(req), body: b });
  return res.status(200).json(result);
});

/** POST /interview-session/submit — idempotent; evaluation runs in the background. */
const submit = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const result = await session.submitAttempt({
    type: b.interview_type,
    interviewId: b.interview_id,
    token: tokenOf(req),
    body: b,
    enqueue: queue.enqueue,
  });
  return res.status(202).json(result);
});

/** GET /interview-session/status?interview_id=&interview_type= */
const status = asyncHandler(async (req, res) => {
  const result = await session.attemptStatus({
    type: req.query.interview_type,
    interviewId: req.query.interview_id,
    token: tokenOf(req),
  });
  return res.status(200).json(result);
});

/** POST /interview-session/retry-evaluation { interview_id, interview_type } — staff. */
const retryEvaluation = asyncHandler(async (req, res) => {
  const { interview_id, interview_type } = req.body || {};
  const type = normaliseType(interview_type);
  await loadInterviewForAccess(req, type, interview_id);
  const ok = await queue.retry(type, interview_id);
  if (!ok) throw badRequest("Only failed evaluations can be retried.");
  return res.status(200).json({ message: "Evaluation queued again" });
});

module.exports = { start, answer, analyzeIdea, submit, status, retryEvaluation };
