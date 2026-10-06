const CodingQuestion = require("../models/codingQuestion");
const { asyncHandler, badRequest, notFound, toObjectId } = require("../lib/http");

const COMPLEXITIES = ["easy", "medium", "hard"];
const TEXT_LIMIT = 2 * 1024 * 1024; // descriptions may contain inline images

// Builds the editable fields from a request body; `partial` allows omitting fields.
function readFields(b, partial) {
  const out = {};
  const has = (k) => b[k] !== undefined;
  if (!partial || has("problem_name")) {
    const v = String(b.problem_name ?? "").trim();
    if (!v || v.length > 300) throw badRequest("Problem name is required (max 300 characters).");
    out.problem_name = v;
  }
  if (!partial || has("complexity")) {
    const v = String(b.complexity ?? "").trim();
    if (!COMPLEXITIES.includes(v.toLowerCase())) throw badRequest("Complexity must be easy, medium or hard.");
    out.complexity = v;
  }
  if (!partial || has("time")) {
    const t = Number(b.time);
    if (!Number.isFinite(t) || t <= 0 || t > 180) throw badRequest("Time must be between 1 and 180 minutes.");
    out.time = t;
  }
  for (const k of ["description", "input", "output", "constraints"]) {
    if (has(k)) {
      const v = String(b[k] ?? "");
      if (v.length > TEXT_LIMIT) throw badRequest(`${k} is too long.`);
      out[k] = v;
    }
  }
  if (!partial && !String(out.description || "").trim()) throw badRequest("Description is required.");
  if (has("company")) {
    out.company = b.company ? toObjectId(b.company, "company") : undefined;
  }
  return out;
}

const addCodingQuestion = asyncHandler(async (req, res) => {
  const fields = readFields(req.body || {}, false);
  const saved = await CodingQuestion.create({ ...fields, added_by: req.auth.user.roll_no, status: 1 });
  return res.status(200).json(saved);
});

const getCodingQuestions = asyncHandler(async (req, res) => {
  const questions = await CodingQuestion.aggregate([
    { $lookup: { from: "companies", localField: "company", foreignField: "_id", as: "companyInfo" } },
    { $addFields: { company_name: { $arrayElemAt: ["$companyInfo.company_name", 0] } } },
    { $project: { companyInfo: 0 } },
    { $sort: { createdAt: -1 } },
  ]);
  if (!questions.length) return res.status(404).json({ message: "Questions not found" });
  return res.status(200).json(questions);
});

const getCodingQuestionById = asyncHandler(async (req, res) => {
  const q = await CodingQuestion.findById(toObjectId(req.params.id, "question id")).lean();
  if (!q) throw notFound("Question not found");
  return res.status(200).json(q);
});

const updateCodingQuestion = asyncHandler(async (req, res) => {
  const id = toObjectId(req.params.id, "question id");
  const fields = readFields(req.body || {}, true);
  const update = { $set: {} };
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) {
      update.$unset = update.$unset || {};
      update.$unset[k] = "";
    } else update.$set[k] = v;
  }
  const q = await CodingQuestion.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!q) throw notFound("Question not found");
  return res.status(200).json({ message: "Question updated successfully", companyQuestion: q });
});

const deleteCodingQuestion = asyncHandler(async (req, res) => {
  const q = await CodingQuestion.findByIdAndDelete(toObjectId(req.params.id, "question id"));
  if (!q) throw notFound("Question not found");
  return res.status(200).json({ message: "Question deleted successfully" });
});

const codingQuestionsCount = asyncHandler(async (req, res) => {
  const result = await CodingQuestion.aggregate([
    { $match: { status: 1 } },
    { $group: { _id: { $toLower: "$complexity" }, count: { $sum: 1 } } },
  ]);
  const counts = { easy: 0, medium: 0, hard: 0 };
  result.forEach((r) => {
    if (Object.prototype.hasOwnProperty.call(counts, r._id)) counts[r._id] = r.count;
  });
  return res.status(200).json(counts);
});

module.exports = {
  addCodingQuestion,
  getCodingQuestions,
  getCodingQuestionById,
  updateCodingQuestion,
  deleteCodingQuestion,
  codingQuestionsCount,
};
