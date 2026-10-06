const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const { TECH_ICONS_DIR, MODULE_ICONS_DIR, FACE_MODELS_DIR } = require("./config/paths");
const rl = require("./middlewares/rateLimits");
const errorHandler = require("./middlewares/errorHandler");
const { authenticate } = require("./middlewares/auth");
const { serveProfilePic } = require("./controllers/UserController");

const app = express();
app.set("trust proxy", env.trustProxy);
app.disable("x-powered-by");

app.use(
  helmet({
    // The API is consumed cross-origin by the two front-ends and serves images/models to them.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || env.corsOrigins.includes(origin)),
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, X-Attempt-Token",
  })
);
// Coding problem descriptions may embed images, hence the larger JSON limit.
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Public static assets (no personal data)
const staticOpts = { fallthrough: true, index: false, dotfiles: "deny", maxAge: "7d" };
app.use("/backend/technology-icons", express.static(TECH_ICONS_DIR, staticOpts));
app.use("/backend/module-icons", express.static(MODULE_ICONS_DIR, staticOpts));
app.use("/backend/models", express.static(FACE_MODELS_DIR, { ...staticOpts, maxAge: "30d" }));

// Student photos are personal data: only the student, their college's staff,
// platform staff or their college's registered kiosk may load them.
app.get(
  "/backend/profile-pics/:file",
  authenticate({ allow: ["staff", "student", "kiosk"] }),
  serveProfilePic
);

app.use("/backend/api", rl.api);
app.use("/backend/", require("./routes/userRoutes"));
app.use("/backend/", require("./routes/sessionRoutes"));
app.use("/backend/", require("./routes/tenantRoutes"));
app.use("/backend/", require("./routes/contentRoutes"));
app.use("/backend/", require("./routes/practiceRoutes"));
app.use("/backend/", require("./routes/interviewRoutes"));
app.use("/backend/", require("./routes/dashboardRoutes"));

app.get("/backend", (req, res) => res.json({ message: "API Working" }));
app.get("/backend/api/health", (req, res) => {
  const mongoose = require("mongoose");
  const up = mongoose.connection.readyState === 1;
  res.status(up ? 200 : 503).json({ status: up ? "ok" : "degraded", db: up });
});
app.get(["/api/server-time", "/backend/api/server-time"], (req, res) => {
  res.json({ currentTime: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use(errorHandler);

module.exports = app;
