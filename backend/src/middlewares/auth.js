const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/user");
const Tenant = require("../models/tenant");
const KioskDevice = require("../models/kioskDevice");
const { isStaffRole, isPlatformRole } = require("../config/roles");
const { unauthorized, forbidden, toObjectId, asyncHandler } = require("../lib/http");

const COOKIES = {
  student: "userSessionToken",
  staff: "adminSessionToken",
  kiosk: "kioskDeviceToken",
};

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: "strict",
  path: "/",
  ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
});

const signToken = (payload, expiresIn) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn, algorithm: "HS256" });

const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
  } catch (_) {
    return null;
  }
};

// Small cache so deactivating a college takes effect within a minute without a
// DB hit on every request.
const tenantStatusCache = new Map();
const TENANT_CACHE_MS = 60 * 1000;
const isTenantActive = async (tenantId) => {
  if (!tenantId) return false;
  const key = String(tenantId);
  const hit = tenantStatusCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.active;
  const t = await Tenant.findById(tenantId).select("status").lean();
  const active = !!t && t.status !== 0;
  tenantStatusCache.set(key, { active, expires: Date.now() + TENANT_CACHE_MS });
  return active;
};
const invalidateTenantCache = (tenantId) => tenantStatusCache.delete(String(tenantId));

const USER_FIELDS = "first_name roll_no role tenant_id status college branch gender email";

async function resolveStudent(req) {
  const token = req.cookies?.[COOKIES.student];
  if (!token) return null;
  const p = verifyToken(token);
  if (!p || p.typ !== "user" || !p.sub || !p.sid) return null;
  const user = await User.findById(p.sub).select(`${USER_FIELDS} +session_sid`).lean();
  if (!user || user.session_sid !== p.sid || user.status === 0) return null;
  if (isStaffRole(user.role)) return null;
  if (!(await isTenantActive(user.tenant_id))) return null;
  return user;
}

async function resolveStaff(req) {
  const token = req.cookies?.[COOKIES.staff];
  if (!token) return null;
  const p = verifyToken(token);
  if (!p || p.typ !== "admin" || !p.sub || !p.sid) return null;
  const user = await User.findById(p.sub).select(`${USER_FIELDS} +admin_session_sid`).lean();
  if (!user || user.admin_session_sid !== p.sid || user.status === 0) return null;
  if (!isStaffRole(user.role)) return null;
  if (!isPlatformRole(user.role) && !(await isTenantActive(user.tenant_id))) return null;
  return user;
}

async function resolveKiosk(req) {
  const token = req.cookies?.[COOKIES.kiosk];
  if (!token) return null;
  const p = verifyToken(token);
  if (!p || p.typ !== "kiosk" || !p.did) return null;
  const device = await KioskDevice.findById(p.did).lean();
  if (!device || device.status !== "active" || String(device.tenant_id) !== String(p.tid)) return null;
  if (!(await isTenantActive(device.tenant_id))) return null;
  if (!device.last_seen_at || Date.now() - new Date(device.last_seen_at).getTime() > 5 * 60 * 1000) {
    KioskDevice.updateOne({ _id: device._id }, { $set: { last_seen_at: new Date() } }).catch(() => {});
  }
  return device;
}

const buildAuth = (kind, subject) => {
  if (kind === "kiosk") {
    return { kind, device: subject, user: null, role: "kiosk", tenantId: subject.tenant_id, isPlatform: false };
  }
  return {
    kind,
    user: subject,
    role: subject.role,
    tenantId: subject.tenant_id || null,
    isPlatform: kind === "staff" && isPlatformRole(subject.role),
  };
};

/**
 * authenticate({ allow: ["student", "staff", "kiosk"], roles: [...staff roles] })
 * Tries each allowed principal (staff first, then student, then kiosk) and sets req.auth.
 * `roles` restricts which staff roles are accepted.
 */
const authenticate = ({ allow = ["staff"], roles } = {}) =>
  asyncHandler(async (req, res, next) => {
    let sawStaffWithWrongRole = false;

    if (allow.includes("staff")) {
      const staff = await resolveStaff(req);
      if (staff) {
        if (!roles || roles.includes(staff.role)) {
          req.auth = buildAuth("staff", staff);
          return next();
        }
        sawStaffWithWrongRole = true;
      }
    }
    if (allow.includes("student")) {
      const student = await resolveStudent(req);
      if (student) {
        req.auth = buildAuth("student", student);
        return next();
      }
    }
    if (allow.includes("kiosk")) {
      const device = await resolveKiosk(req);
      if (device) {
        req.auth = buildAuth("kiosk", device);
        return next();
      }
    }
    if (sawStaffWithWrongRole) throw forbidden();
    throw unauthorized();
  });

const requireStaff = (roles) => authenticate({ allow: ["staff"], roles });

const REPORT_TOKEN_HOURS = 2;
/**
 * Report endpoints: the student, college staff, or (for the kiosk screen right after
 * the interview) the holder of that interview's attempt token, for a short time.
 * Expects :id and :interview_type route params.
 */
const reportAccess = () => {
  const cookieAuth = authenticate({ allow: ["staff", "student"] });
  return asyncHandler(async (req, res, next) => {
    const token = req.get("X-Attempt-Token");
    if (token && typeof token === "string" && token.length <= 200) {
      // Lazy require to avoid a circular import.
      const { modelFor } = require("../services/interviewModels");
      const crypto = require("crypto");
      let Model;
      try {
        Model = modelFor(req.params.interview_type);
      } catch (_) {
        Model = null;
      }
      const id = req.params.id;
      if (Model && /^[a-f0-9]{24}$/i.test(String(id))) {
        const doc = await Model.findById(id).select("+attempt.token_hash submitted_at").lean();
        const expected = doc?.attempt?.token_hash;
        const given = crypto.createHash("sha256").update(token).digest("hex");
        const fresh = doc?.submitted_at && Date.now() - new Date(doc.submitted_at).getTime() < REPORT_TOKEN_HOURS * 3600 * 1000;
        if (expected && fresh && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given))) {
          req.attemptAccessId = String(doc._id);
          return next();
        }
      }
    }
    return cookieAuth(req, res, next);
  });
};
const requireStudent = () => authenticate({ allow: ["student"] });
const requireKiosk = () => authenticate({ allow: ["kiosk"] });

/**
 * Resolves which tenant a request may act on.
 * - Platform staff: the requested tenant (or null meaning "all" when allowAll).
 * - Everyone else: always their own tenant; asking for another tenant is forbidden.
 */
const resolveTenantScope = (req, requested, { allowAll = false } = {}) => {
  const a = req.auth;
  if (!a) throw unauthorized();
  const hasRequest = requested != null && requested !== "" && requested !== "undefined" && requested !== "null";
  if (a.isPlatform) {
    if (hasRequest) return toObjectId(requested, "tenant id");
    if (allowAll) return null;
    if (a.tenantId) return a.tenantId;
    throw forbidden("Select a college (tenant) first.");
  }
  if (!a.tenantId) throw forbidden("Your account is not linked to a college.");
  if (hasRequest && String(requested) !== String(a.tenantId)) throw forbidden();
  return a.tenantId;
};

// Route middleware: enforce tenant scope on a URL param (e.g. :tid) and normalise it.
const scopeTenantParam = (param, opts) => (req, res, next) => {
  try {
    const t = resolveTenantScope(req, req.params[param], opts);
    req.params[param] = t ? String(t) : "";
    req.tenantScope = t;
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  COOKIES,
  cookieOptions,
  signToken,
  verifyToken,
  authenticate,
  requireStaff,
  requireStudent,
  requireKiosk,
  reportAccess,
  resolveTenantScope,
  scopeTenantParam,
  invalidateTenantCache,
  isTenantActive,
};
