const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Moves an uploaded temp file into a permanent public directory under a random
// name (never the client-supplied name). Returns the stored file name.
const handleFileUpload = async (file, uploadDir) => {
  if (!file) return "";
  const ext = path.extname(file.originalname || "").toLowerCase().replace(/[^.a-z0-9]/g, "");
  const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  await fs.promises.mkdir(uploadDir, { recursive: true });
  const dest = path.join(uploadDir, filename);
  try {
    await fs.promises.rename(file.path, dest);
  } catch (err) {
    if (err.code !== "EXDEV") throw err;
    // temp dir on another filesystem
    await fs.promises.copyFile(file.path, dest);
    await fs.promises.unlink(file.path).catch(() => {});
  }
  return filename;
};

module.exports = { handleFileUpload };
