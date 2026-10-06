const multer = require("multer");
const env = require("../config/env");
const { HttpError } = require("../lib/http");

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) return;

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, ...(err.extra || {}) });
  }
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "File is too large." : `Upload error: ${err.message}`;
    return res.status(400).json({ message: msg });
  }
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large." });
  }
  if (err && (err.type === "entity.parse.failed" || err instanceof SyntaxError)) {
    return res.status(400).json({ message: "Malformed request body." });
  }
  if (err && (err.name === "CastError" || err.name === "BSONError")) {
    return res.status(400).json({ message: "Invalid identifier." });
  }
  if (err && err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed.", details: Object.keys(err.errors || {}) });
  }
  if (err && err.code === 11000) {
    return res.status(409).json({ message: "A record with the same unique value already exists." });
  }

  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  return res.status(500).json({
    message: "Internal server error.",
    ...(env.isProd ? {} : { error: err && err.message }),
  });
};
