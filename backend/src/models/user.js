const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  first_name: {
    type: String,
  },
  roll_no: {
    type: String,
    index: true,
  },
  mobile: {
    type: Number,
  },
  password: {
    type: String,
    select: false,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  gender: {
    type: String,
  },
  loginStatus: {
    type: String,
  },
  college: {
    type: String,
    index: true,
  },
  branch: {
    type: String,
    index: true,
  },
  passout_year: {
    type: Number,
    index: true,
  },
  role: {
    type: String
  },
  profile_pic: {
    type: String
  },
  status: {
    type: Number,
    default: 1,
  },
  tenant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tenant',
    index: true,
  },

  // Session ids embedded in the JWTs. Rotated on login, cleared on logout.
  session_sid: { type: String, select: false },
  session_expires_at: { type: Date, select: false },
  admin_session_sid: { type: String, select: false },

  // Legacy field from the old token-in-DB scheme; cleared on next login.
  sessionToken: { type: String, select: false },

  // Password reset OTP (stored hashed, short-lived, attempt-limited).
  otp: { type: Number, select: false }, // legacy plaintext OTP, always cleared
  otp_hash: { type: String, select: false },
  otp_expires_at: { type: Date, select: false },
  otp_attempts: { type: Number, default: 0, select: false },
  otp_last_sent_at: { type: Date, select: false },
  otp_window_start: { type: Date, select: false },
  otp_window_count: { type: Number, select: false },

  // Login brute-force protection.
  login_failures: { type: Number, default: 0, select: false },
  lock_until: { type: Date, select: false },

  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
}, {
  collection: 'users'
});

// Fields that must never be sent to a client.
UserSchema.statics.SECRET_FIELDS = [
  "password", "session_sid", "session_expires_at", "admin_session_sid", "sessionToken",
  "otp", "otp_hash", "otp_expires_at", "otp_attempts", "otp_last_sent_at", "otp_window_start", "otp_window_count",
  "login_failures", "lock_until",
];

module.exports = mongoose.model("user", UserSchema);
