require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const required = ["MONGODB_URI", "JWT_SECRET"];
const missing = required.filter((k) => !process.env[k] || !String(process.env[k]).trim());
if (missing.length && process.env.NODE_ENV !== "test") {
  // Fail fast: running without these would silently disable auth or the DB.
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const isProd = process.env.NODE_ENV === "production";
const bool = (v, dflt) => (v == null || v === "" ? dflt : String(v).toLowerCase() === "true");
const int = (v, dflt) => (v == null || v === "" || Number.isNaN(Number(v)) ? dflt : Number(v));

// Same origins the app allowed before, plus the local Admin dev port.
// In production set CORS_ORIGINS explicitly (e.g. "https://mpod.ai").
const DEFAULT_CORS = [
  "https://mpod.ai",
  "http://node.technicalhub.io:8000",
  "http://node.technicalhub.io:8001",
  "http://node.technicalhub.io:8003",
  "https://std-bio.web.app",
  "http://localhost:3000",
  "http://localhost:8003",
];

const env = {
  isProd,
  isTest: process.env.NODE_ENV === "test",
  port: int(process.env.PORT, 8002),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: (process.env.JWT_SECRET || "").trim(),
  openaiKey: (process.env.OPENAI_API_KEY || "").trim(),
  corsOrigins: (process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : DEFAULT_CORS)
    .map((s) => s.trim())
    .filter(Boolean),
  // Cookies must be Secure behind HTTPS. Defaults to true in production.
  cookieSecure: bool(process.env.COOKIE_SECURE, isProd),
  // Express "trust proxy" setting; "loopback" trusts only a reverse proxy on the same host.
  trustProxy: process.env.TRUST_PROXY || "loopback",
  sessionHours: int(process.env.SESSION_HOURS, 24),
  kioskSessionDays: int(process.env.KIOSK_SESSION_DAYS, 365),
  startGraceMinutes: int(process.env.INTERVIEW_START_GRACE_MINUTES, 5),
  earlyStartMinutes: int(process.env.INTERVIEW_EARLY_START_MINUTES, 1),
  submitGraceMinutes: int(process.env.INTERVIEW_SUBMIT_GRACE_MINUTES, 10),
  evalConcurrency: int(process.env.EVALUATION_CONCURRENCY, 3),
  llmParallelCalls: int(process.env.LLM_PARALLEL_CALLS, 4),
  models: {
    scoring: process.env.OPENAI_SCORING_MODEL || "gpt-4o",
    generation: process.env.OPENAI_GENERATION_MODEL || "gpt-3.5-turbo",
    summary: process.env.OPENAI_SUMMARY_MODEL || "gpt-3.5-turbo",
    coding: process.env.OPENAI_CODING_MODEL || "gpt-4-turbo",
  },
  mail: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

if (env.jwtSecret && env.jwtSecret.length < 32 && !env.isTest) {
  console.warn("[security] JWT_SECRET is shorter than 32 characters; use a long random value.");
}

module.exports = env;
