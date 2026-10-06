const path = require("path");

const BACKEND_ROOT = path.resolve(__dirname, "../..");

// Absolute paths so the server behaves the same whatever directory it is started from.
module.exports = {
  BACKEND_ROOT,
  PROFILE_PICS_DIR: path.join(BACKEND_ROOT, "src/uploads/profile-pics"),
  TECH_ICONS_DIR: path.join(BACKEND_ROOT, "uploads/technology-icons"),
  MODULE_ICONS_DIR: path.join(BACKEND_ROOT, "uploads/module-icons"),
  FACE_MODELS_DIR: path.join(BACKEND_ROOT, "public/models"),
};
