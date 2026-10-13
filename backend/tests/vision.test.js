// Camera analysis model on the DGX Spark: frames are forwarded with the key, never stored,
// and the browser runs the model itself when the service is missing or down.
const { app, request, startDb, stopDb, clearDb, seed, loginAs, installFakeLlm } = require("./helpers");
const env = require("../src/config/env");
const CodingInterview = require("../src/models/codingInterview");
const vision = require("../src/services/ai/vision");

// A tiny but valid-looking base64 JPEG (starts with the JPEG magic bytes /9j/).
const FRAME = `/9j/${"A".repeat(400)}`;
const landmarks = Array.from({ length: 68 }, (_, i) => [100 + i, 120 + (i % 10)]);

let s;
const realFetch = global.fetch;
const visionCalls = [];

function serveVision(handler) {
  global.fetch = async (url, init) => {
    if (!String(url).startsWith("https://vision.example.edu")) return realFetch(url, init);
    visionCalls.push({ url, auth: init.headers.Authorization, body: init.body ? JSON.parse(init.body) : null });
    const { status = 200, body } = await handler(url, init);
    return { ok: status < 300, status, text: async () => JSON.stringify(body) };
  };
}

beforeAll(async () => {
  await startDb();
  installFakeLlm();
});
afterAll(async () => {
  global.fetch = realFetch;
  await stopDb();
});
beforeEach(async () => {
  await clearDb();
  s = await seed();
  visionCalls.length = 0;
  Object.assign(env.ai.vision, { url: "https://vision.example.edu", apiKey: "vision-key" });
  Object.assign(vision._state, { ok: null, message: null });
});
afterEach(() => {
  global.fetch = realFetch;
  Object.assign(env.ai.vision, { url: null });
});

async function startCoding() {
  const iv = await CodingInterview.create({
    platform: "web", roll_no: s.studentA.roll_no, tenant_id: s.tenantA._id, start_date_time: new Date(Date.now() - 60000),
    level: "easy", questions_count: "1", status: 1,
  });
  const agent = await loginAs(s.studentA);
  const st = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "coding" });
  expect(st.status).toBe(200);
  const frame = (image = FRAME) =>
    request(app)
      .post("/backend/api/interview-session/face-frame")
      .set("X-Attempt-Token", st.body.attempt_token)
      .send({ interview_id: String(iv._id), interview_type: "coding", image });
  return { iv, st, frame };
}

test("the interview tells the browser to send frames to the DGX Spark when it is configured", async () => {
  const { st } = await startCoding();
  expect(st.body.face_analysis).toEqual({ mode: "server", interval_ms: env.ai.vision.intervalMs });
  env.ai.vision.url = null;
  const again = await startCoding();
  expect(again.st.body.face_analysis).toEqual({ mode: "browser", interval_ms: 400 });
});

test("a frame is forwarded with the API key and the answer is normalised", async () => {
  serveVision(async () => ({
    body: {
      faces: [
        {
          box: { x: 10, y: 20, width: 200, height: 220 },
          score: 0.98,
          landmarks: landmarks.map(([x, y]) => ({ x, y })),
          expressions: { neutral: 0.7, happy: 0.1, fearful: 0.1, surprised: 0.05, disgusted: 0.05, bogus: 1 },
        },
      ],
    },
  }));
  const { frame } = await startCoding();
  const res = await frame();
  expect(res.status).toBe(200);
  expect(visionCalls[0]).toMatchObject({ url: "https://vision.example.edu/v1/face/analyze", auth: "Bearer vision-key", body: { image: FRAME, max_faces: 3 } });
  const face = res.body.faces[0];
  expect(face.landmarks).toHaveLength(68);
  expect(face.landmarks[0]).toEqual([100, 120]);
  expect(face.expressions).toEqual({ neutral: 0.7, happy: 0.1, fear: 0.1, surprise: 0.05, disgust: 0.05 });
});

test("when the service is down the browser is told to run the model itself", async () => {
  serveVision(async () => {
    throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNREFUSED" } });
  });
  const { frame } = await startCoding();
  const res = await frame();
  expect(res.status).toBe(503);
  expect(res.body.unavailable).toBe(true);
  expect(vision.getStatus()).toMatchObject({ configured: true, available: false, mode: "browser" });
  // later interviews start straight in browser mode
  const next = await startCoding();
  expect(next.st.body.face_analysis.mode).toBe("browser");
});

test("frames are validated and only accepted while the attempt is open", async () => {
  serveVision(async () => ({ body: { faces: [] } }));
  const { frame, iv, st } = await startCoding();
  expect((await frame("not base64!")).status).toBe(400);
  expect((await frame("aGVsbG8=")).status).toBe(400); // not a JPEG/PNG
  expect((await frame(`/9j/${"A".repeat(500 * 1024)}`)).status).toBe(400); // too large
  expect((await frame()).status).toBe(200);

  const bad = await request(app)
    .post("/backend/api/interview-session/face-frame")
    .set("X-Attempt-Token", "wrong")
    .send({ interview_id: String(iv._id), interview_type: "coding", image: FRAME });
  expect(bad.status).toBe(401);

  await request(app).post("/backend/api/interview-session/submit").set("X-Attempt-Token", st.body.attempt_token)
    .send({ interview_id: String(iv._id), interview_type: "coding", emotions: { blinks: 3, analysis: "server", emotions: { happy: 10 } } });
  expect((await frame()).status).toBe(409);
  const doc = await CodingInterview.findById(iv._id).lean();
  expect(doc.emotions.analysis).toBe("server");
  expect(visionCalls).toHaveLength(1); // only the one valid frame reached the service
});

test("admins see the camera service status", async () => {
  serveVision(async () => ({ body: { status: "ok", model: "face-v1" } }));
  const aiStatus = require("../src/services/aiStatus");
  await aiStatus.check();
  aiStatus.stop();
  const admin = await loginAs(s.platform, { admin: true });
  const res = await admin.get("/backend/api/system-status");
  expect(res.body.ai.vision).toMatchObject({ configured: true, available: true, mode: "server", model: "face-v1" });
  expect(JSON.stringify(res.body)).not.toMatch(/vision-key/);
});

test("normalise rejects a response without faces", () => {
  expect(() => vision.normalise({})).toThrow(/no "faces" array/);
  expect(vision.normalise({ faces: [{ landmarks: [[1, 2]] }] }).faces[0].landmarks).toBeNull(); // not 68 points
});
