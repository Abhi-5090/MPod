const mongoose = require("mongoose");
const Interview = require("../models/interview");
const CompanyInterview = require("../models/companyInterview");
const CodingInterview = require("../models/codingInterview");
const User = require("../models/user");
const { badRequest, forbidden, notFound } = require("../lib/http");

// interview_type values used by the API and stored in reports.
const TYPES = {
  "ai generated": { Model: Interview, label: "Technology interview" },
  technology: { Model: Interview, label: "Technology interview" },
  company: { Model: CompanyInterview, label: "Company interview" },
  coding: { Model: CodingInterview, label: "Coding interview" },
};

const normaliseType = (t) => {
  const v = String(t || "").trim().toLowerCase();
  if (v === "technology" || v === "ai generated" || v === "ai") return "ai generated";
  if (v === "company") return "company";
  if (v === "coding") return "coding";
  throw badRequest("Invalid interview type.");
};

const modelFor = (type) => TYPES[normaliseType(type)].Model;
const labelFor = (type) => TYPES[normaliseType(type)].label;
const ALL_MODELS = [Interview, CompanyInterview, CodingInterview];

/**
 * Returns the tenant an interview belongs to. New interviews store tenant_id;
 * older ones are resolved through the student's roll number.
 */
async function tenantOfInterview(doc) {
  if (doc.tenant_id) return doc.tenant_id;
  const u = await User.findOne({ roll_no: doc.roll_no }).select("tenant_id").lean();
  return u ? u.tenant_id : null;
}

/**
 * Throws unless the current principal may access this interview:
 * the student who owns it, staff of the same college, or platform staff.
 */
async function assertInterviewAccess(req, doc) {
  const a = req.auth;
  if (!doc) throw notFound("Interview not found.");
  // Read access granted by the attempt token of this very interview (kiosk report screen).
  if (req.attemptAccessId && req.attemptAccessId === String(doc._id)) return;
  if (!a) throw forbidden();
  if (a.kind === "staff" && a.isPlatform) return;
  if (a.kind === "student") {
    if (doc.roll_no !== a.user.roll_no) throw notFound("Interview not found.");
    if (doc.tenant_id && String(doc.tenant_id) !== String(a.tenantId)) throw notFound("Interview not found.");
    return;
  }
  if (a.kind === "staff") {
    if (doc.tenant_id) {
      if (String(doc.tenant_id) !== String(a.tenantId)) throw notFound("Interview not found.");
      return;
    }
    // Legacy interview without tenant_id: the student must belong to this college.
    const ok = await User.exists({ roll_no: doc.roll_no, tenant_id: a.tenantId });
    if (!ok) throw notFound("Interview not found.");
    return;
  }
  throw forbidden();
}

async function loadInterviewForAccess(req, type, id, projection) {
  if (!mongoose.Types.ObjectId.isValid(String(id))) throw badRequest("Invalid interview ID.");
  const Model = modelFor(type);
  const q = Model.findById(id);
  if (projection) q.select(projection);
  const doc = await q;
  await assertInterviewAccess(req, doc);
  return doc;
}

module.exports = {
  normaliseType,
  modelFor,
  labelFor,
  ALL_MODELS,
  tenantOfInterview,
  assertInterviewAccess,
  loadInterviewForAccess,
};
