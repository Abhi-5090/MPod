const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const make = (windowMinutes, limit, message, keyFn) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: () => env.isTest && !process.env.TEST_RATE_LIMITS,
    message: { message },
    ...(keyFn ? { keyGenerator: keyFn } : {}),
  });

const ipAndRoll = (req) => `${req.ip}|${String(req.body?.roll_no || "").trim().toUpperCase()}`;
// Per person rather than per IP: a whole college lab often shares one public IP.
const perPrincipal = (req) => {
  if (req.auth?.user?._id) return `u:${req.auth.user._id}`;
  if (req.auth?.device?._id) return `k:${req.auth.device._id}`;
  const t = req.get("X-Attempt-Token");
  if (t) return `t:${require("crypto").createHash("sha256").update(t).digest("hex")}`;
  return `ip:${req.ip}`;
};

module.exports = {
  // Login attempts per IP + roll number (account lockout in the DB is the second layer).
  login: make(15, 20, "Too many login attempts. Please try again later.", ipAndRoll),
  loginPerIp: make(15, 100, "Too many login attempts from this network. Please try again later."),
  otpSend: make(15, 5, "Too many OTP requests. Please try again later.", ipAndRoll),
  otpVerify: make(15, 20, "Too many OTP attempts. Please try again later.", ipAndRoll),
  kioskRegister: make(15, 10, "Too many registration attempts. Please try again later."),
  // Endpoints that call the LLM.
  llm: make(1, 20, "Too many requests. Please slow down.", perPrincipal),
  // Coarse per-IP flood protection; generous because a lab shares one IP.
  api: make(1, 3000, "Too many requests. Please slow down."),
};
