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
const lower = (v, dflt) => String(v == null || String(v).trim() === "" ? dflt : v).trim().toLowerCase();

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
  // AI providers. AI_PROVIDER serves every request; AI_FALLBACK_PROVIDER (optional)
  // takes over while the primary is unavailable. Each task uses its own model.
  ai: {
    provider: lower(process.env.AI_PROVIDER, "openai"),
    fallback: lower(process.env.AI_FALLBACK_PROVIDER, "none"),
    healthCheckMinutes: int(process.env.AI_HEALTH_CHECK_MINUTES, 10),
    openai: {
      apiKey: (process.env.OPENAI_API_KEY || "").trim(),
      // Optional: any OpenAI-compatible endpoint (e.g. a vLLM server).
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
    // Self-hosted models (e.g. on an NVIDIA DGX Spark) through Ollama's native API.
    ollama: {
      baseURL: (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").trim().replace(/\/+$/, ""),
      // Only needed when Ollama sits behind an authenticating reverse proxy.
      apiKey: (process.env.OLLAMA_API_KEY || "").trim(),
      // Local models are slower than the hosted API, and a cold model takes time to load.
      timeoutMs: int(process.env.OLLAMA_TIMEOUT_MS, 5 * 60 * 1000),
      interactiveTimeoutMs: int(process.env.OLLAMA_INTERACTIVE_TIMEOUT_MS, 90 * 1000),
      // Keep at or below the Ollama server's OLLAMA_NUM_PARALLEL.
      maxConcurrent: int(process.env.OLLAMA_MAX_CONCURRENCY, 4),
      numCtx: int(process.env.OLLAMA_NUM_CTX, 8192),
      keepAlive: process.env.OLLAMA_KEEP_ALIVE || "-1",
      // auto | true | false | low | medium | high (see services/ai/providers/ollama.js)
      think: lower(process.env.OLLAMA_THINK, "auto"),
      // Extra output tokens allowed for a reasoning model's thinking.
      reasoningTokens: int(process.env.OLLAMA_REASONING_TOKENS, 2048),
      preload: bool(process.env.OLLAMA_PRELOAD, isProd),
      models: {
        scoring: process.env.OLLAMA_SCORING_MODEL || "gpt-oss:120b",
        generation: process.env.OLLAMA_GENERATION_MODEL || "gpt-oss:20b",
        summary: process.env.OLLAMA_SUMMARY_MODEL || "gpt-oss:20b",
        coding: process.env.OLLAMA_CODING_MODEL || "qwen3-coder:30b",
      },
    },
  },
  mail: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

const AI_PROVIDERS = ["openai", "ollama"];
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
