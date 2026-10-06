const Company = require("../models/companies");
const { asyncHandler, badRequest, notFound, conflict, toObjectId, escapeRegex } = require("../lib/http");

const cleanName = (v) => {
  const name = String(v ?? "").trim();
  if (name.length < 2 || name.length > 50) throw badRequest("Company name must be 2 to 50 characters.");
  return name;
};
const actorName = (req) => String(req.auth.user.roll_no || "admin").slice(0, 20);

const AddCompany = asyncHandler(async (req, res) => {
  const company_name = cleanName(req.body?.company_name);
  if (await Company.exists({ company_name: new RegExp(`^${escapeRegex(company_name)}$`, "i") })) {
    throw conflict("A company with this name already exists.");
  }
  const company = await Company.create({
    company_name,
    added_date: new Date().toISOString(),
    added_by: actorName(req),
    status: Number(req.body?.status) === 0 ? 0 : 1,
  });
  return res.status(201).json(company);
});

const getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({}).select("_id company_name status").sort({ company_name: 1 }).lean();
  return res.status(200).json(companies);
});

const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(toObjectId(req.params.id, "company id")).lean();
  if (!company) throw notFound("Company not found.");
  return res.status(200).json(company);
});

const updateCompany = asyncHandler(async (req, res) => {
  const id = toObjectId(req.params.id, "company id");
  const set = { update_date: new Date().toISOString() };
  if (req.body?.company_name !== undefined) set.company_name = cleanName(req.body.company_name);
  if (req.body?.status !== undefined && req.body.status !== "") set.status = Number(req.body.status) === 0 ? 0 : 1;
  const company = await Company.findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true });
  if (!company) throw notFound("Company not found.");
  return res.status(200).json({ message: "Company updated successfully" });
});

const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(toObjectId(req.params.id, "company id"));
  if (!company) throw notFound("Company not found.");
  return res.status(200).json(company);
});

const getCompaniesNames = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body?.companies) ? req.body.companies : [];
  const companies = await Company.find({ _id: { $in: ids.map((id) => toObjectId(id, "company id")) } })
    .select("_id company_name")
    .lean();
  return res.status(200).json(companies);
});

module.exports = { AddCompany, getCompanies, getCompanyById, updateCompany, deleteCompany, getCompaniesNames };
