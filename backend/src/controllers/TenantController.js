const Tenant = require("../models/tenant");
const User = require("../models/user");
const credits = require("../services/credits");
const { withTransaction } = require("../lib/db");
const { resolveTenantScope, invalidateTenantCache } = require("../middlewares/auth");
const { asyncHandler, badRequest, notFound, conflict, toObjectId, toInt } = require("../lib/http");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanString = (v, field, max = 200) => {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (s.length > max) throw badRequest(`${field} is too long.`);
  return s;
};

// Accepts the old comma-separated "assigned_credits" format as well as a single number.
const parseInitialCredits = (v) => {
  if (v == null || v === "") return 0;
  const parts = Array.isArray(v) ? v : String(v).split(",");
  const total = parts.reduce((sum, p) => sum + toInt(String(p).trim() || 0, { min: 0, field: "assigned_credits" }), 0);
  if (total > 1000000) throw badRequest("assigned_credits is too large.");
  return total;
};

const addTenant = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const organization_name = cleanString(b.organization_name, "organization_name");
  const email = cleanString(b.email, "email")?.toLowerCase();
  if (!organization_name) throw badRequest("Organization name is required.");
  if (!email || !EMAIL_RE.test(email)) throw badRequest("A valid email is required.");
  const initial = parseInitialCredits(b.assigned_credits);
  const duration = b.interview_duration_minutes ? toInt(b.interview_duration_minutes, { min: 5, max: 300, field: "interview_duration_minutes" }) : 30;
  // organization_code has a unique index, so it is required (a missing value would collide as null).
  const organization_code = cleanString(b.organization_code, "organization_code", 50);
  if (!organization_code) throw badRequest("Organization code is required.");

  if (await Tenant.exists({ email })) throw conflict("Tenant with this email already exists");
  if (await Tenant.exists({ organization_code })) throw conflict("This organization code is already used.");

  const tenant = await withTransaction(async (session) => {
    const [t] = await Tenant.create(
      [{
        organization_name,
        contact_person: cleanString(b.contact_person, "contact_person"),
        email,
        assigned_credits: initial ? [initial] : [],
        active_credits: initial,
        status: b.status === 0 || b.status === "0" ? 0 : 1,
        interview_duration_minutes: duration,
        organization_code,
      }],
      session ? { session } : {}
    );
    await credits.recordInitialCredits({ tenantId: t._id, amount: initial, actorId: req.auth.user._id }, session);
    return t;
  });
  return res.status(201).json({ message: "Tenant created successfully", data: tenant });
});

const getTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find().sort({ organization_name: 1 }).lean();
  return res.status(200).json(tenants);
});

const getTenantById = asyncHandler(async (req, res) => {
  const id = resolveTenantScope(req, req.params.id);
  const tenant = await Tenant.findById(id).lean();
  if (!tenant) throw notFound("Tenant not found");
  return res.status(200).json(tenant);
});

/** Updates profile fields only. Credits change exclusively through POST /tenants/:id/credits. */
const updateTenant = asyncHandler(async (req, res) => {
  const id = toObjectId(req.params.id, "tenant id");
  const b = req.body || {};
  const tenant = await Tenant.findById(id);
  if (!tenant) throw notFound("Tenant not found");

  if (b.organization_name !== undefined) {
    const v = cleanString(b.organization_name, "organization_name");
    if (!v) throw badRequest("Organization name cannot be empty.");
    tenant.organization_name = v;
  }
  if (b.contact_person !== undefined) tenant.contact_person = cleanString(b.contact_person, "contact_person");
  if (b.email !== undefined) {
    const email = cleanString(b.email, "email").toLowerCase();
    if (!EMAIL_RE.test(email)) throw badRequest("A valid email is required.");
    if (email !== tenant.email && (await Tenant.exists({ email, _id: { $ne: id } }))) throw conflict("Tenant with this email already exists");
    tenant.email = email;
  }
  if (b.status !== undefined && b.status !== "") {
    const s = Number(b.status);
    if (![0, 1].includes(s)) throw badRequest("status must be 0 or 1.");
    tenant.status = s;
  }
  if (b.interview_duration_minutes !== undefined && b.interview_duration_minutes !== "") {
    tenant.interview_duration_minutes = toInt(b.interview_duration_minutes, { min: 5, max: 300, field: "interview_duration_minutes" });
  }
  if (b.organization_code !== undefined && b.organization_code !== "") {
    const code = cleanString(b.organization_code, "organization_code", 50);
    if (code !== tenant.organization_code && (await Tenant.exists({ organization_code: code, _id: { $ne: id } }))) {
      throw conflict("This organization code is already used.");
    }
    tenant.organization_code = code;
  }
  const saved = await tenant.save();
  invalidateTenantCache(id);
  return res.status(200).json({ message: "Tenant updated successfully", data: saved });
});

/** Deleting a college that still has users would orphan them, so it is refused. */
const deleteTenant = asyncHandler(async (req, res) => {
  const id = toObjectId(req.params.id, "tenant id");
  const tenant = await Tenant.findById(id);
  if (!tenant) throw notFound("Tenant not found");
  const users = await User.countDocuments({ tenant_id: id });
  if (users > 0) {
    throw conflict(`This college still has ${users} user(s). Deactivate it instead (set status to inactive).`);
  }
  await Tenant.deleteOne({ _id: id });
  invalidateTenantCache(id);
  return res.status(200).json({ message: "Tenant deleted successfully" });
});

module.exports = { addTenant, getTenants, getTenantById, updateTenant, deleteTenant };
