const mongoose = require("mongoose");

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

const badRequest = (msg, extra) => new HttpError(400, msg, extra);
const unauthorized = (msg = "Please login to continue.") => new HttpError(401, msg);
const forbidden = (msg = "You do not have permission to perform this action.") => new HttpError(403, msg);
const notFound = (msg = "Not found.") => new HttpError(404, msg);
const conflict = (msg, extra) => new HttpError(409, msg, extra);

// Wraps an async route handler so rejections reach the central error handler.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const isObjectId = (v) => typeof v === "string" && mongoose.Types.ObjectId.isValid(v) && /^[a-f0-9]{24}$/i.test(v);
const toObjectId = (v, field = "id") => {
  const s = v == null ? "" : String(v);
  if (!isObjectId(s)) throw badRequest(`Invalid ${field}.`);
  return new mongoose.Types.ObjectId(s);
};

// Parses arrays that may arrive as real arrays, JSON strings or comma-separated strings (multipart forms).
const parseList = (val) => {
  if (val == null || val === "") return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const s = val.trim();
    if (s.startsWith("[")) {
      try {
        const parsed = JSON.parse(s.replace(/'/g, '"'));
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (_) {
        /* fall through */
      }
    }
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  }
  return [val];
};

const toInt = (v, { min, max, field = "value" } = {}) => {
  const n = Number(v);
  if (!Number.isInteger(n)) throw badRequest(`${field} must be a whole number.`);
  if (min != null && n < min) throw badRequest(`${field} must be at least ${min}.`);
  if (max != null && n > max) throw badRequest(`${field} must be at most ${max}.`);
  return n;
};

const toDate = (v, field = "date") => {
  const d = new Date(v);
  if (v == null || v === "" || Number.isNaN(d.getTime())) throw badRequest(`Invalid ${field}.`);
  return d;
};

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = {
  HttpError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  asyncHandler,
  isObjectId,
  toObjectId,
  parseList,
  toInt,
  toDate,
  escapeRegex,
};
