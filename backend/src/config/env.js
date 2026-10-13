const path = require("path");
const fs = require("fs");

// Local development overrides live in backend/.env.development.local (git-ignored,
// created by `npm run setup`). Values there win over backend/.env.
// Never loaded when NODE_ENV=production.
const localEnv = path.resolve(__dirname, "../../.env.development.local");
if (process.env.NODE_ENV !== "production" && fs.existsSync(localEnv)) {
  require("dotenv").config({ path: localEnv });
}
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const required = ["MONGODB_URI", "JWT_SECRET"];
const missing = required.filter((k) => !process.env[k] || !String(process.env[k]).trim());
if (missing.length && process.env.NODE_ENV !== "test") {
  // Fail fast: running without these would silently disable auth or the DB.
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const isProd = process.env.NODE_ENV === "production";
const bool = (v, dflt) => (v == null || v === "" ? dflt : String(v).toLowerCase() === "true");
const int = (v, dflt) => (v == null || v === "" || Number.isNaN(Number(v)) ? dflt : Number(v));
// DGX_* settings; OLLAMA_* names from the first self-hosting release still work.
const dgxVar = (name) => {
  const v = process.env[`DGX_${name}`];
  return v != null && v !== "" ? v : process.env[`OLLAMA_${name}`];
};
const lower = (v, dflt) => String(v == null || String(v).trim() === "" ? dflt : v).trim().toLowerCase();
// "ollama" is the old name of the self-hosted provider.
const providerName = (v, dflt) => {
  const n = lower(v, dflt);
  return n === "ollama" ? "dgx" : n;
};

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
  // Interface to listen on. Behind nginx on the same machine use 127.0.0.1 so the API
  // is reachable only through the proxy. Default: all interfaces.
  host: (process.env.HOST || "").trim() || undefined,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: (process.env.JWT_SECRET || "").trim(),
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
  // AI providers:
  //  - "dgx":    your self-hosted models on the NVIDIA DGX Spark (DGX_BASE_URL + DGX_API_KEY)
  //  - "openai": OpenAI's hosted API
  // AI_PROVIDER serves every request; AI_FALLBACK_PROVIDER (optional) takes over while
  // the primary is unavailable. Each task (scoring, generation, summary, coding) uses its
  // own model. Without AI_PROVIDER, "dgx" is used when DGX_BASE_URL is set.
  ai: {
    provider: providerName(process.env.AI_PROVIDER, dgxVar("BASE_URL") ? "dgx" : "openai"),
    fallback: providerName(process.env.AI_FALLBACK_PROVIDER, "none"),
    healthCheckMinutes: int(process.env.AI_HEALTH_CHECK_MINUTES, 10),
    openai: {
      apiKey: (process.env.OPENAI_API_KEY || "").trim(),
      // Optional: any OpenAI-compatible endpoint.
      baseURL: (process.env.OPENAI_BASE_URL || "").trim() || undefined,
      timeoutMs: int(process.env.OPENAI_TIMEOUT_MS, 60 * 1000),
      interactiveTimeoutMs: int(process.env.OPENAI_INTERACTIVE_TIMEOUT_MS, 25 * 1000),
      maxConcurrent: int(process.env.OPENAI_MAX_CONCURRENCY, 16),
      models: {
        scoring: process.env.OPENAI_SCORING_MODEL || "gpt-4o",
        generation: process.env.OPENAI_GENERATION_MODEL || "gpt-3.5-turbo",
        summary: process.env.OPENAI_SUMMARY_MODEL || "gpt-3.5-turbo",
        coding: process.env.OPENAI_CODING_MODEL || "gpt-4-turbo",
      },
    },
    // Self-hosted models on the DGX Spark (see services/ai/providers/dgx.js).
    dgx: {
      label: dgxVar("LABEL") || "DGX Spark",
      // Public HTTPS address of the DGX Spark API gateway (or http://127.0.0.1:11434 on the Spark itself).
      baseURL: (dgxVar("BASE_URL") || "http://127.0.0.1:11434").trim().replace(/\/+$/, ""),
      apiKey: (dgxVar("API_KEY") || "").trim(),
      // ollama = Ollama native API; openai = OpenAI-compatible API (vLLM, TensorRT-LLM, SGLang)
      protocol: lower(dgxVar("PROTOCOL"), "ollama"),
      // Optional per-task endpoint, key and protocol, e.g. DGX_SCORING_URL / DGX_SCORING_API_KEY.
      endpoints: Object.fromEntries(
        ["scoring", "generation", "summary", "coding"].map((t) => {
          const T = t.toUpperCase();
          return [
            t,
            {
              url: (process.env[`DGX_${T}_URL`] || "").trim() || undefined,
              apiKey: (process.env[`DGX_${T}_API_KEY`] || "").trim() || undefined,
              protocol: process.env[`DGX_${T}_PROTOCOL`] ? lower(process.env[`DGX_${T}_PROTOCOL`]) : undefined,
            },
          ];
        })
      ),
      // Plain HTTP is refused for public addresses unless this is set.
      allowInsecure: bool(dgxVar("ALLOW_INSECURE"), false),
      isProd,
      // Self-hosted models are slower than the hosted API, and a cold model takes time to load.
      timeoutMs: int(dgxVar("TIMEOUT_MS"), 5 * 60 * 1000),
      interactiveTimeoutMs: int(dgxVar("INTERACTIVE_TIMEOUT_MS"), 90 * 1000),
      // Requests sent to the DGX at once; keep at or below its OLLAMA_NUM_PARALLEL / vLLM capacity.
      maxConcurrent: int(dgxVar("MAX_CONCURRENCY"), 4),
      numCtx: int(dgxVar("NUM_CTX"), 8192),
      keepAlive: dgxVar("KEEP_ALIVE") || "-1",
      // auto | true | false | low | medium | high
      think: lower(dgxVar("THINK"), "auto"),
      // Extra output tokens allowed for a reasoning model's thinking.
      reasoningTokens: int(dgxVar("REASONING_TOKENS"), 2048),
      preload: bool(dgxVar("PRELOAD"), isProd),
      models: {
        scoring: dgxVar("SCORING_MODEL") || "gpt-oss:120b",
        generation: dgxVar("GENERATION_MODEL") || "gpt-oss:20b",
        summary: dgxVar("SUMMARY_MODEL") || "gpt-oss:20b",
        coding: dgxVar("CODING_MODEL") || "qwen3-coder:30b",
      },
    },
    // Camera analysis model (face detection, 68 landmarks, 7 expressions) served on the
    // DGX Spark. Without DGX_VISION_URL the student's browser runs the model itself.
    vision: {
      url: (process.env.DGX_VISION_URL || "").trim().replace(/\/+$/, "") || null,
      apiKey: (process.env.DGX_VISION_API_KEY || dgxVar("API_KEY") || "").trim(),
      timeoutMs: int(process.env.DGX_VISION_TIMEOUT_MS, 5000),
      // How often the browser sends a camera frame (ms).
      intervalMs: int(process.env.DGX_VISION_INTERVAL_MS, 1000),
      allowInsecure: bool(dgxVar("ALLOW_INSECURE"), false),
      isProd,
    },
  },
  mail: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

const AI_PROVIDERS = ["dgx", "openai"];
if (!AI_PROVIDERS.includes(env.ai.provider)) {
  throw new Error(`AI_PROVIDER must be one of: ${AI_PROVIDERS.join(", ")} (got "${env.ai.provider}").`);
}
if (env.ai.fallback !== "none" && !AI_PROVIDERS.includes(env.ai.fallback)) {
  throw new Error(`AI_FALLBACK_PROVIDER must be one of: none, ${AI_PROVIDERS.join(", ")} (got "${env.ai.fallback}").`);
}
if (env.ai.fallback === env.ai.provider) env.ai.fallback = "none";

if (env.jwtSecret && env.jwtSecret.length < 32 && !env.isTest) {
  console.warn("[security] JWT_SECRET is shorter than 32 characters; use a long random value.");
}

module.exports = env;
