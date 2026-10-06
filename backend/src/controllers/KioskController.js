const env = require("../config/env");
const KioskDevice = require("../models/kioskDevice");
const Tenant = require("../models/tenant");
const { CAN, isPlatformRole } = require("../config/roles");
const { verifyCredentials } = require("./AuthController");
const session = require("../services/interviewSession");
const { COOKIES, cookieOptions, signToken, resolveTenantScope, isTenantActive } = require("../middlewares/auth");
const { asyncHandler, badRequest, forbidden, notFound, HttpError, toObjectId } = require("../lib/http");

/**
 * POST /kiosk/register { roll_no, password, device_name, tenant_id? }
 * Run once on the kiosk itself by a college admin (or platform admin). Sets a
 * long-lived httpOnly device cookie bound to that college.
 */
const register = asyncHandler(async (req, res) => {
  const { roll_no, password, device_name, tenant_id } = req.body || {};
  const name = String(device_name || "").trim();
  if (!name || name.length > 100) throw badRequest("Enter a device name (max 100 characters).");

  const user = await verifyCredentials(roll_no, password);
  if (!CAN.manageKiosks.includes(user.role)) {
    throw new HttpError(403, "Only a college admin can register a kiosk.");
  }
  let tenantId;
  if (isPlatformRole(user.role)) {
    tenantId = tenant_id ? toObjectId(tenant_id, "tenant id") : user.tenant_id;
  } else {
    if (tenant_id && String(tenant_id) !== String(user.tenant_id)) throw forbidden();
    tenantId = user.tenant_id;
  }
  if (!tenantId) throw badRequest("Select the college this kiosk belongs to.");
  const tenant = await Tenant.findById(tenantId).select("organization_name status").lean();
  if (!tenant) throw notFound("College not found.");
  if (!(await isTenantActive(tenantId))) throw badRequest("This college account is inactive.");

  const device = await KioskDevice.create({ tenant_id: tenantId, name, registered_by: user._id, last_seen_at: new Date() });
  const maxAge = env.kioskSessionDays * 24 * 3600 * 1000;
  const token = signToken({ did: String(device._id), tid: String(tenantId), typ: "kiosk" }, `${env.kioskSessionDays}d`);
  res.cookie(COOKIES.kiosk, token, cookieOptions(maxAge));
  return res.status(201).json({
    message: "Kiosk registered",
    device: { _id: device._id, name: device.name, organization_name: tenant.organization_name },
  });
});

/** GET /kiosk/me — lets the kiosk screen know whether it is registered. */
const me = asyncHandler(async (req, res) => {
  const d = req.auth.device;
  const tenant = await Tenant.findById(d.tenant_id).select("organization_name").lean();
  return res.status(200).json({
    _id: d._id,
    name: d.name,
    tenant_id: d.tenant_id,
    organization_name: tenant?.organization_name || "",
  });
});

/** POST /kiosk/unregister — removes the device cookie (and revokes the device). */
const unregister = asyncHandler(async (req, res) => {
  await KioskDevice.updateOne({ _id: req.auth.device._id }, { $set: { status: "revoked", revoked_at: new Date() } });
  res.clearCookie(COOKIES.kiosk, cookieOptions());
  return res.status(200).json({ message: "Kiosk unregistered" });
});

/** POST /kiosk/interview { roll_no } — the interview this student can take now. */
const lookup = asyncHandler(async (req, res) => {
  const result = await session.findKioskInterview({ rollNo: req.body?.roll_no, device: req.auth.device });
  return res.status(200).json(result);
});

/** POST /kiosk/start { interview_id, interview_type } */
const start = asyncHandler(async (req, res) => {
  const { interview_id, interview_type } = req.body || {};
  const result = await session.startAttempt({
    type: interview_type,
    interviewId: interview_id,
    principal: { kind: "kiosk", device: req.auth.device },
  });
  return res.status(200).json(result);
});

// ------------------------------------------------------------ admin management

/** GET /kiosk/devices[?tenant_id=] */
const listDevices = asyncHandler(async (req, res) => {
  const tenantId = resolveTenantScope(req, req.query.tenant_id, { allowAll: true });
  const filter = tenantId ? { tenant_id: tenantId } : {};
  const devices = await KioskDevice.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: "registered_by", select: "roll_no first_name", model: "user" })
    .populate({ path: "tenant_id", select: "organization_name", model: "tenant" })
    .lean();
  return res.status(200).json(
    devices.map((d) => ({
      _id: d._id,
      name: d.name,
      tenant_id: d.tenant_id?._id || d.tenant_id,
      organization_name: d.tenant_id?.organization_name || "",
      status: d.status,
      registered_by: d.registered_by ? { roll_no: d.registered_by.roll_no, first_name: d.registered_by.first_name } : null,
      last_seen_at: d.last_seen_at,
      createdAt: d.createdAt,
      revoked_at: d.revoked_at,
    }))
  );
});

/** PUT /kiosk/devices/:id/revoke */
const revokeDevice = asyncHandler(async (req, res) => {
  const id = toObjectId(req.params.id, "device id");
  const device = await KioskDevice.findById(id);
  if (!device) throw notFound("Device not found.");
  resolveTenantScope(req, String(device.tenant_id)); // throws if outside caller's college
  if (device.status !== "revoked") {
    device.status = "revoked";
    device.revoked_at = new Date();
    device.revoked_by = req.auth.user._id;
    await device.save();
  }
  return res.status(200).json({ message: "Kiosk revoked" });
});

module.exports = { register, me, unregister, lookup, start, listDevices, revokeDevice };
