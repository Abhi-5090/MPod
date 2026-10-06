const express = require("express");
const Session = require("../controllers/SessionController");
const Kiosk = require("../controllers/KioskController");
const rl = require("../middlewares/rateLimits");
const { requireStaff, requireStudent, requireKiosk } = require("../middlewares/auth");
const { CAN } = require("../config/roles");

const Router = express.Router();

// Interview attempt (website). Answer/submit/status are authorised by the
// X-Attempt-Token issued at start, which works for both website and kiosk.
Router.post("/api/interview-session/start", requireStudent(), rl.llm, Session.start);
Router.post("/api/interview-session/answer", Session.answer);
Router.post("/api/interview-session/analyze-idea", rl.llm, Session.analyzeIdea);
Router.post("/api/interview-session/submit", Session.submit);
Router.get("/api/interview-session/status", Session.status);
Router.post("/api/interview-session/retry-evaluation", requireStaff(CAN.scheduleInterviews), Session.retryEvaluation);

// AI provider status for the admin portal (cached; ?refresh=1 re-checks, platform admins only).
Router.get("/api/system-status", requireStaff(), async (req, res, next) => {
  try {
    const aiStatus = require("../services/aiStatus");
    const { isPlatformRole } = require("../config/roles");
    const ai = req.query.refresh === "1" && isPlatformRole(req.auth.role) ? await aiStatus.check() : aiStatus.getStatus();
    res.json({ ai });
  } catch (e) {
    next(e);
  }
});

// Kiosk devices
Router.post("/api/kiosk/register", rl.kioskRegister, Kiosk.register);
Router.get("/api/kiosk/me", requireKiosk(), Kiosk.me);
Router.post("/api/kiosk/unregister", requireKiosk(), Kiosk.unregister);
Router.post("/api/kiosk/interview", requireKiosk(), Kiosk.lookup);
Router.post("/api/kiosk/start", requireKiosk(), rl.llm, Kiosk.start);
Router.get("/api/kiosk/devices", requireStaff(CAN.manageKiosks), Kiosk.listDevices);
Router.put("/api/kiosk/devices/:id/revoke", requireStaff(CAN.manageKiosks), Kiosk.revokeDevice);

module.exports = Router;
