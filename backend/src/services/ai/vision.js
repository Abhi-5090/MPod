/**
 * Camera analysis on the DGX Spark (face detection, 68 face landmarks, 7 expressions).
 *
 * The browser sends a small JPEG frame to the backend, which forwards it to the DGX
 * vision service with the API key; frames are never stored. Without DGX_VISION_URL, or
 * while the service is unavailable, the student's browser runs the model itself.
 *
 * Contract the DGX vision service implements (also in docs/DGX_MODEL_CONTRACT.md):
 *   GET  {DGX_VISION_URL}/health            -> 200 {"status": "ok", "model": "..."}
 *   POST {DGX_VISION_URL}/v1/face/analyze   {"image": "<base64 JPEG>", "max_faces": 3}
 *     -> 200 {"faces": [{"box": {"x","y","width","height"}, "score": 0-1,
 *               "landmarks": [[x, y] x 68]   (iBUG-300W order, pixels of the image),
 *               "expressions": {"neutral","happy","sad","angry","fearful","disgusted","surprised"}: 0-1}]}
 *   Authorization: Bearer <DGX_VISION_API_KEY>
 */
const env = require("../../config/env");
const { AiError } = require("./errors");
const { checkTransport } = require("./providers/dgx");

const cfg = env.ai.vision;
const LABEL = "DGX vision service";
const MAX_IMAGE_B64 = 400 * 1024; // ~300 KB JPEG
const MAX_FACES = 5;

// Expression names accepted from the service -> names used in reports.
const EXPRESSIONS = {
  neutral: "neutral",
  happy: "happy",
  sad: "sad",
  angry: "angry",
  fearful: "fear",
  fear: "fear",
  disgusted: "disgust",
  disgust: "disgust",
  surprised: "surprise",
  surprise: "surprise",
};

const state = { ok: null, message: null, hint: null, checked_at: null, model: null };
let transportWarning = null;
if (cfg.url) transportWarning = checkTransport(cfg.url, { isProd: cfg.isProd, allowInsecure: cfg.allowInsecure });

const enabled = () => Boolean(cfg.url);

/** What the browser should do; sent with the interview start. */
function clientConfig() {
  const server = enabled() && state.ok !== false;
  return { mode: server ? "server" : "browser", interval_ms: server ? cfg.intervalMs : 400 };
}

async function request(method, path, body, timeoutMs) {
  let res;
  try {
    res = await fetch(`${cfg.url}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const timeout = err.name === "TimeoutError" || err.name === "AbortError";
    throw new AiError(timeout ? `${LABEL} did not answer within ${timeoutMs} ms.` : `Cannot reach the ${LABEL} at ${cfg.url}.`, {
      provider: "dgx-vision",
      reason: timeout ? "timeout" : "network",
      hint: "Check DGX_VISION_URL in backend/.env and that the vision service and gateway are running on the DGX Spark.",
      cause: err,
    });
  }
  const text = await res.text().catch(() => "");
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const auth = res.status === 401 || res.status === 403;
    throw new AiError(`${LABEL} returned ${res.status}${auth ? " (API key rejected)" : ""}.`, {
      provider: "dgx-vision",
      reason: auth ? "auth" : res.status >= 500 || res.status === 429 ? "provider" : "error",
      status: res.status,
      hint: auth ? "Check DGX_VISION_API_KEY (or DGX_API_KEY) in backend/.env." : null,
    });
  }
  return data;
}

const num = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v) * 10) / 10 : null);

/** Validates and normalises the service's answer to {faces: [{box, score, landmarks, expressions}]}. */
function normalise(data) {
  if (!data || !Array.isArray(data.faces)) {
    throw new AiError(`${LABEL} returned an unexpected response (no "faces" array).`, { provider: "dgx-vision", reason: "bad_response" });
  }
  return {
    faces: data.faces.slice(0, MAX_FACES).map((f) => {
      const pts = Array.isArray(f.landmarks) ? f.landmarks : [];
      const landmarks =
        pts.length === 68
          ? pts.map((p) => (Array.isArray(p) ? [num(p[0]), num(p[1])] : [num(p && p.x), num(p && p.y)]))
          : null;
      const expressions = {};
      for (const [k, v] of Object.entries(f.expressions || {})) {
        const name = EXPRESSIONS[String(k).toLowerCase()];
        if (name && Number.isFinite(Number(v))) expressions[name] = Math.max(0, Math.min(1, Number(v)));
      }
      const b = f.box || {};
      return {
        box: { x: num(b.x), y: num(b.y), width: num(b.width), height: num(b.height) },
        score: Number.isFinite(Number(f.score)) ? Number(f.score) : null,
        landmarks: landmarks && landmarks.every((p) => p[0] !== null && p[1] !== null) ? landmarks : null,
        expressions,
      };
    }),
  };
}

/** Analyses one camera frame. imageB64: base64 JPEG/PNG without the data: prefix. */
async function analyzeFrame(imageB64) {
  if (!enabled()) throw new AiError("Camera analysis on the DGX Spark is not configured.", { provider: "dgx-vision", reason: "no_key" });
  try {
    const out = normalise(await request("POST", "/v1/face/analyze", { image: imageB64, max_faces: 3 }, cfg.timeoutMs));
    if (state.ok !== true) Object.assign(state, { ok: true, message: null, hint: null, checked_at: new Date() });
    return out;
  } catch (err) {
    if (err.outage) Object.assign(state, { ok: false, message: err.message, hint: err.hint, checked_at: new Date() });
    throw err;
  }
}

/** Accepts only a plausible base64 JPEG or PNG of limited size. */
function validateImage(image) {
  if (typeof image !== "string") return "image must be a base64 string.";
  const b64 = image.replace(/^data:image\/(jpeg|png);base64,/, "");
  if (!b64 || b64.length > MAX_IMAGE_B64) return "image is empty or too large.";
  if (!/^[A-Za-z0-9+/]+=*$/.test(b64)) return "image is not valid base64.";
  if (!b64.startsWith("/9j/") && !b64.startsWith("iVBOR")) return "image must be a JPEG or PNG.";
  return null;
}

async function check() {
  if (!enabled()) return getStatus();
  try {
    const h = await request("GET", "/health", null, 10000);
    Object.assign(state, { ok: true, message: null, hint: null, checked_at: new Date(), model: (h && h.model) || null });
  } catch (err) {
    Object.assign(state, { ok: false, message: err.message, hint: err.hint, checked_at: new Date() });
    if (!env.isTest) console.warn(`[ai] ${err.message}${err.hint ? ` Fix: ${err.hint}` : ""}`);
  }
  return getStatus();
}

const getStatus = () => ({
  configured: enabled(),
  mode: clientConfig().mode,
  available: !enabled() || state.ok !== false,
  ...state,
});

const describe = () => ({ url: cfg.url, api_key: cfg.apiKey ? "set" : "none", interval_ms: cfg.intervalMs });

module.exports = {
  enabled,
  clientConfig,
  analyzeFrame,
  validateImage,
  normalise,
  check,
  getStatus,
  describe,
  transportWarning: () => transportWarning,
  _state: state,
};
