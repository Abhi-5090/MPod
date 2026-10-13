#!/usr/bin/env node
/**
 * Stand-in for the camera model service, implementing the mPod vision contract
 * (docs/DGX_MODEL_CONTRACT.md) with fixed answers. Use it to test the gateway, keys and
 * the AWS -> DGX connection before your trained model is ready, then replace it with
 * the real service on the same port.
 *
 *   node mock-vision-server.js            # listens on 127.0.0.1:8100
 *   PORT=8101 node mock-vision-server.js
 */
const http = require("http");

const PORT = Number(process.env.PORT) || 8100;
const HOST = process.env.HOST || "127.0.0.1";

// A frontal face: 68 iBUG-300W points inside a 320x240 frame.
function face() {
  const pts = [];
  for (let i = 0; i < 17; i++) pts.push([100 + i * 7.5, 110 + Math.sin((i / 16) * Math.PI) * 70]); // jaw 0-16
  for (let i = 0; i < 10; i++) pts.push([115 + i * 9, 95]); // brows 17-26
  for (let i = 0; i < 9; i++) pts.push([160, 105 + i * 5]); // nose 27-35 (27 = bridge top, centred)
  const eye = (cx) => [[cx - 12, 112], [cx - 6, 108], [cx + 6, 108], [cx + 12, 112], [cx + 6, 116], [cx - 6, 116]];
  pts.push(...eye(135), ...eye(185)); // eyes 36-47, open
  for (let i = 0; i < 20; i++) pts.push([140 + (i % 12) * 3.5, 160 + (i < 12 ? 0 : 6)]); // mouth 48-67
  return {
    box: { x: 95, y: 80, width: 130, height: 150 },
    score: 0.99,
    landmarks: pts,
    expressions: { neutral: 0.82, happy: 0.1, sad: 0.02, angry: 0.02, fearful: 0.01, disgusted: 0.01, surprised: 0.02 },
  };
}

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

http
  .createServer((req, res) => {
    if (req.method === "GET" && req.url === "/health") return send(res, 200, { status: "ok", model: "mock-face-v0" });
    if (req.method === "POST" && req.url === "/v1/face/analyze") {
      let size = 0;
      const chunks = [];
      req.on("data", (c) => {
        size += c.length;
        if (size > 2 * 1024 * 1024) req.destroy();
        else chunks.push(c);
      });
      req.on("end", () => {
        let body;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          return send(res, 400, { error: "invalid JSON" });
        }
        if (typeof body.image !== "string" || !body.image) return send(res, 400, { error: "image is required" });
        return send(res, 200, { faces: [face()], model: "mock-face-v0" });
      });
      return undefined;
    }
    return send(res, 404, { error: "not found" });
  })
  .listen(PORT, HOST, () => console.log(`mock vision service on http://${HOST}:${PORT}`));
