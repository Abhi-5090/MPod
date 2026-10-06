const xlsx = require("xlsx");
const CompanyQuestion = require("../models/companyQuestion");
const Company = require("../models/companies");
const Tag = require("../models/tags");
const { asyncHandler, badRequest, notFound, toObjectId } = require("../lib/http");

const str = (v, field, max = 100) => {
  const s = String(v ?? "").trim();
  if (!s) throw badRequest(`${field} is required.`);
  if (s.length > max) throw badRequest(`${field} is too long.`);
  return s;
};

/** POST /add-company-question (multipart: file + company, type, round, year, tag). One question per row, first column. */
const addCompanyQuestion = asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!req.file) throw badRequest("Upload an Excel file with one question per row.");
  const company = toObjectId(b.company, "company");
  if (!(await Company.exists({ _id: company }))) throw badRequest("Company not found.");
  const tag = b.tag ? toObjectId(b.tag, "tag") : undefined;
  if (tag && !(await Tag.exists({ _id: tag }))) throw badRequest("Tag not found.");
  const base = {
    company,
    type: str(b.type, "type"),
    round: str(b.round, "round"),
    year: b.year ? str(b.year, "year", 10) : undefined,
    tag,
    added_by: req.auth.user.roll_no,
    status: 1,
  };
  let wb;
  try {
    wb = xlsx.readFile(req.file.path);
  } catch (_) {
    throw badRequest("Could not read the file.");
  }
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: "A" });
  const questions = rows.map((row) => String(Object.values(row)[0] ?? "").trim().slice(0, 2000)).filter(Boolean);
  if (!questions.length) throw badRequest("No questions found in the file.");
  if (questions.length > 5000) throw badRequest("A file can have at most 5000 questions.");
  const saved = await CompanyQuestion.insertMany(questions.map((question) => ({ ...base, question })));
  return res.status(200).json(saved);
});

const listPipeline = (match) => [
  ...(match ? [{ $match: match }] : []),
  { $lookup: { from: "companies", localField: "company", foreignField: "_id", as: "companyInfo" } },
  { $lookup: { from: "tags", localField: "tag", foreignField: "_id", as: "tagInfo" } },
  {
    $addFields: {
      company_name: { $arrayElemAt: ["$companyInfo.company_name", 0] },
      tag_name: { $arrayElemAt: ["$tagInfo.tag_name", 0] },
    },
  },
  { $project: { companyInfo: 0, tagInfo: 0 } },
  { $sort: { createdAt: -1 } },
];

const getCompanyQuestions = asyncHandler(async (req, res) => {
  const questions = await CompanyQuestion.aggregate(listPipeline());
  if (!questions.length) return res.status(404).json({ message: "Questions not found" });
  return res.status(200).json(questions);
});

const getCompanyQuestionsByTag = asyncHandler(async (req, res) => {
  const tag = toObjectId(req.params.tag_id, "tag id");
  const questions = await CompanyQuestion.aggregate(listPipeline({ tag }));
  if (!questions.length) return res.status(404).json({ message: "Questions not found" });
  return res.status(200).json(questions);
});

const getCompanyQuestionById = asyncHandler(async (req, res) => {
  const q = await CompanyQuestion.findById(toObjectId(req.params.id, "question id")).lean();
  if (!q) throw notFound("Question not found");
  return res.status(200).json(q);
});

const updateCompanyQuestion = asyncHandler(async (req, res) => {
  const id = toObjectId(req.params.id, "question id");
  const b = req.body || {};
  const given = (v) => v !== undefined && v !== "undefined" && v !== null;
  const set = {};
  if (given(b.company)) {
    set.company = toObjectId(b.company, "company");
    if (!(await Company.exists({ _id: set.company }))) throw badRequest("Company not found.");
  }
  if (given(b.type)) set.type = str(b.type, "type");
  if (given(b.round)) set.round = str(b.round, "round");
  if (given(b.year)) set.year = String(b.year).trim().slice(0, 10);
  if (given(b.tag) && b.tag !== "") set.tag = toObjectId(b.tag, "tag");
  if (given(b.question)) set.question = str(b.question, "question", 2000);
  if (given(b.status) && b.status !== "") set.status = Number(b.status) === 0 ? 0 : 1;
  const q = await CompanyQuestion.findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true });
  if (!q) throw notFound("Question not found");
  return res.status(200).json({ message: "Question updated successfully", comapnyQuestion: q });
});

const deleteCompanyQuestion = asyncHandler(async (req, res) => {
  const q = await CompanyQuestion.findByIdAndDelete(toObjectId(req.params.id, "question id"));
  if (!q) throw notFound("Question not found");
  return res.status(200).json({ message: "Question deleted successfully" });
});

module.exports = {
  addCompanyQuestion,
  getCompanyQuestions,
  getCompanyQuestionById,
  updateCompanyQuestion,
  deleteCompanyQuestion,
  getCompanyQuestionsByTag,
};
