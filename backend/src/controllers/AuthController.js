const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const env = require("../config/env");
const User = require("../models/user");
const Tenant = require("../models/tenant");
const { isStaffRole } = require("../config/roles");
const mailer = require("../services/mailer");
const { COOKIES, cookieOptions, signToken, verifyToken, isTenantActive } = require("../middlewares/auth");
const { asyncHandler, badRequest, HttpError } = require("../lib/http");

const MAX_LOGIN_FAILURES = 10;
const LOCK_MINUTES = 15;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_SECONDS = 60;
const MIN_PASSWORD = 8;

// A real hash to compare against when the user does not exist, so response time
// does not reveal which roll numbers are registered.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10);

const normRoll = (r) => String(r || "").trim();
const rollQuery = (r) => {
  const s = normRoll(r);
  return { roll_no: { $in: [...new Set([s, s.toUpperCase()])] } };
};
const hashOtp = (userId, otp) =>
  crypto.createHmac("sha256", env.jwtSecret).update(`${userId}:${otp}`).digest("hex");
const newSid = () => crypto.randomBytes(24).toString("hex");

const invalidCredentials = () => new HttpError(400, "Invalid credentials");

/** Verifies roll number + password with lockout. Returns the user (with secrets selected). */
async function verifyCredentials(rollNo, password) {
  if (!normRoll(rollNo) || typeof password !== "string" || !password) throw invalidCredentials();
  if (password.length > 200) throw invalidCredentials();
  const user = await User.findOne(rollQuery(rollNo)).select(
    "+password +login_failures +lock_until +session_sid +session_expires_at +admin_session_sid"
  );
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw invalidCredentials();
  }
  if (user.lock_until && user.lock_until > new Date()) {
    throw new HttpError(429, "Too many failed attempts. Please try again later or reset your password.");
  }
  const ok = typeof user.password === "string" && user.password.startsWith("$2")
    ? await bcrypt.compare(password, user.password)
    : false;
  if (!ok) {
    const failures = (user.login_failures || 0) + 1;
    const update = { $set: { login_failures: failures } };
    if (failures >= MAX_LOGIN_FAILURES) {
      update.$set.lock_until = new Date(Date.now() + LOCK_MINUTES * 60000);
      update.$set.login_failures = 0;
    }
    await User.updateOne({ _id: user._id }, update);
    throw invalidCredentials();
  }
  if (user.status === 0) throw new HttpError(403, "Your account is deactivated. Please contact your college.");
  return user;
}

// ------------------------------------------------------------ student

const login = asyncHandler(async (req, res) => {
  const { roll_no, password, confirmLogout } = req.body || {};
  const user = await verifyCredentials(roll_no, password);
  if (isStaffRole(user.role)) {
    throw new HttpError(403, "Staff accounts must sign in through the admin portal.");
  }
  if (!(await isTenantActive(user.tenant_id))) {
    throw new HttpError(403, "Your college account is inactive. Please contact your college.");
  }

  // One active session per student: ask before ending the other one.
  const hasLiveSession = user.session_sid && user.session_expires_at && user.session_expires_at > new Date();
  if (hasLiveSession && !confirmLogout) {
    return res.status(403).json({
      code: "SESSION_ACTIVE",
      message: "User already logged in. Do you want to logout from the previous session and continue?",
    });
  }

  const sid = newSid();
  const maxAge = env.sessionHours * 3600 * 1000;
  await User.updateOne(
    { _id: user._id },
    {
      $set: { session_sid: sid, session_expires_at: new Date(Date.now() + maxAge), login_failures: 0 },
      $unset: { lock_until: "", sessionToken: "" },
    }
  );
  const token = signToken({ sub: String(user._id), sid, typ: "user" }, `${env.sessionHours}h`);
  res.cookie(COOKIES.student, token, cookieOptions(maxAge));
  return res.status(200).json({ message: "Login successful" });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const u = req.auth.user;
  return res.status(200).json({
    roll_no: u.roll_no,
    first_name: u.first_name,
    college: u.college,
    branch: u.branch,
    role: u.role,
    gender: u.gender,
    t_id: u.tenant_id,
  });
});

// ------------------------------------------------------------ staff

const adminLogin = asyncHandler(async (req, res) => {
  const { roll_no, password } = req.body || {};
  const user = await verifyCredentials(roll_no, password);
  if (!isStaffRole(user.role)) {
    throw new HttpError(403, "This account does not have access to the admin portal.");
  }
  const sid = newSid();
  await User.updateOne(
    { _id: user._id },
    { $set: { admin_session_sid: sid, login_failures: 0 }, $unset: { lock_until: "", sessionToken: "" } }
  );
  const token = signToken({ sub: String(user._id), sid, typ: "admin" }, `${env.sessionHours}h`);
  res.cookie(COOKIES.staff, token, cookieOptions(env.sessionHours * 3600 * 1000));
  const tenant = user.tenant_id ? await Tenant.findById(user.tenant_id).select("organization_name").lean() : null;
  return res.status(200).json({
    message: "Login successful",
    user: {
      roll_no: user.roll_no,
      first_name: user.first_name,
      role: user.role,
      t_id: user.tenant_id,
      organization: tenant?.organization_name,
    },
  });
});

const getAdminCurrentUser = asyncHandler(async (req, res) => {
  const u = req.auth.user;
  const tenant = u.tenant_id ? await Tenant.findById(u.tenant_id).select("organization_name").lean() : null;
  return res.status(200).json({
    roll_no: u.roll_no,
    first_name: u.first_name,
    college: u.college,
    branch: u.branch,
    role: u.role,
    t_id: u.tenant_id,
    organization: tenant?.organization_name,
  });
});

// ------------------------------------------------------------ logout (both portals)

/**
 * POST /logout { slug: "admin" | "user" }  (legacy: GET /logout/:roll_no/:slug)
 * Ends the session identified by the caller's own cookie. The roll number in the
 * legacy URL is ignored, so nobody can log out another user.
 */
const logout = asyncHandler(async (req, res) => {
  const slug = (req.body && req.body.slug) || req.params.slug || "user";
  const isAdmin = slug === "admin";
  const cookieName = isAdmin ? COOKIES.staff : COOKIES.student;
  const token = req.cookies?.[cookieName];
  const p = token ? verifyToken(token) : null;
  if (p && p.sub && p.sid) {
    const field = isAdmin ? "admin_session_sid" : "session_sid";
    await User.updateOne(
      { _id: p.sub, [field]: p.sid },
      { $unset: isAdmin ? { admin_session_sid: "" } : { session_sid: "", session_expires_at: "" } }
    );
  }
  res.clearCookie(cookieName, cookieOptions());
  return res.status(200).json({ message: "Logout successful" });
});

// ------------------------------------------------------------ password reset

const GENERIC_OTP_MESSAGE = "If this roll number is registered, an OTP has been sent to its email address.";

const sendOtp = asyncHandler(async (req, res) => {
  const roll = normRoll(req.body?.roll_no);
  if (!roll) throw badRequest("roll_no is required.");
  const user = await User.findOne(rollQuery(roll)).select("+otp_last_sent_at email first_name status");
  if (user && user.status !== 0 && user.email) {
    const last = user.otp_last_sent_at ? user.otp_last_sent_at.getTime() : 0;
    if (Date.now() - last < OTP_RESEND_SECONDS * 1000) {
      throw new HttpError(429, `Please wait ${OTP_RESEND_SECONDS} seconds before requesting another OTP.`);
    }
    const otp = String(crypto.randomInt(100000, 1000000));
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          otp_hash: hashOtp(user._id, otp),
          otp_expires_at: new Date(Date.now() + OTP_TTL_MINUTES * 60000),
          otp_attempts: 0,
          otp_last_sent_at: new Date(),
        },
        $unset: { otp: "" },
      }
    );
    await mailer.sendMail({
      to: user.email,
      subject: "Your mPOD password reset code",
      text: `Hello ${user.first_name || ""},\n\nYour OTP to reset your mPOD password is: ${otp}\n\nIt expires in ${OTP_TTL_MINUTES} minutes. If you did not request this, you can ignore this email.\n\nThank you!`,
    });
  }
  return res.status(200).json({ message: GENERIC_OTP_MESSAGE });
});

/** Checks an OTP, counting the attempt. Returns the user when it matches. */
async function consumeOtpAttempt(rollNo, otp) {
  const invalid = new HttpError(400, "Invalid or expired OTP");
  const roll = normRoll(rollNo);
  const code = String(otp || "").trim();
  if (!roll || !/^\d{6}$/.test(code)) throw invalid;
  const user = await User.findOne(rollQuery(roll)).select("+otp_hash +otp_expires_at +otp_attempts");
  if (!user || !user.otp_hash || !user.otp_expires_at || user.otp_expires_at < new Date()) throw invalid;
  if ((user.otp_attempts || 0) >= OTP_MAX_ATTEMPTS) {
    throw new HttpError(429, "Too many incorrect attempts. Please request a new OTP.");
  }
  const expected = Buffer.from(user.otp_hash);
  const given = Buffer.from(hashOtp(user._id, code));
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    await User.updateOne({ _id: user._id }, { $inc: { otp_attempts: 1 } });
    throw invalid;
  }
  return user;
}

const checkOtp = asyncHandler(async (req, res) => {
  await consumeOtpAttempt(req.body?.roll_no, req.body?.otp);
  return res.status(200).json({ message: "OTP matched" });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { roll_no, otp, new_password } = req.body || {};
  if (typeof new_password !== "string" || new_password.length < MIN_PASSWORD || new_password.length > 128) {
    throw badRequest(`Password must be ${MIN_PASSWORD} to 128 characters long.`);
  }
  const user = await consumeOtpAttempt(roll_no, otp);
  const hash = await bcrypt.hash(new_password, 10);
  // Resetting the password also ends every existing session.
  await User.updateOne(
    { _id: user._id },
    {
      $set: { password: hash, login_failures: 0, updated_at: new Date() },
      $unset: {
        otp_hash: "", otp_expires_at: "", otp_attempts: "", otp: "",
        lock_until: "", session_sid: "", session_expires_at: "", admin_session_sid: "", sessionToken: "",
      },
    }
  );
  return res.status(200).json({ success: true, message: "Password reset successfully" });
});

module.exports = {
  login,
  adminLogin,
  logout,
  getCurrentUser,
  getAdminCurrentUser,
  sendOtp,
  checkOtp,
  resetPassword,
  verifyCredentials,
  MIN_PASSWORD,
};
