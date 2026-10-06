const fs = require("fs");
const os = require("os");
const path = require("path");
const multer = require("multer");
const { badRequest } = require("../lib/http");

const TMP_DIR = path.join(os.tmpdir(), "mpod-uploads");
fs.mkdirSync(TMP_DIR, { recursive: true });

const KINDS = {
  sheet: {
    exts: [".xlsx", ".xls", ".csv"],
    maxBytes: 5 * 1024 * 1024,
  },
  zip: { exts: [".zip"], maxBytes: 50 * 1024 * 1024 },
  image: { exts: [".png", ".jpg", ".jpeg", ".webp"], maxBytes: 2 * 1024 * 1024 },
};

// Uploads go to the OS temp dir and are deleted after the request (see cleanupUpload).
const single = (field, kind) => {
  const cfg = KINDS[kind];
  return multer({
    dest: TMP_DIR,
    limits: { fileSize: cfg.maxBytes, files: 1, fields: 50 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      if (!cfg.exts.includes(ext)) return cb(badRequest(`Only ${cfg.exts.join(", ")} files are allowed.`));
      cb(null, true);
    },
  }).single(field);
};

// Always remove the temp file once the response is finished, success or failure.
const cleanupUpload = (req, res, next) => {
  res.on("finish", () => {
    const f = req.file;
    if (f && f.path && f.path.startsWith(TMP_DIR)) fs.unlink(f.path, () => {});
  });
  next();
};

module.exports = { single, cleanupUpload, TMP_DIR };
