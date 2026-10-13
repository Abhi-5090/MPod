import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IMAGE_BASE } from "../../api/axiosInstance";

const MODEL_BASE = `${IMAGE_BASE}models/`;
const EMPTY_EMOTIONS = { happy: 0, sad: 0, angry: 0, neutral: 0, surprise: 0, fear: 0, disgust: 0 };
// face-api.js expression names -> names used in reports (same as the server's).
const EXPRESSION_NAMES = { fearful: "fear", disgusted: "disgust", surprised: "surprise" };
const BROWSER_INTERVAL_MS = 400;
const FRAME_WIDTH = 320; // frames sent to the server are downscaled
const SERVER_FAILURES_BEFORE_FALLBACK = 3;

const eyeAspectRatio = (eye) => {
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  return (d(eye[1], eye[5]) + d(eye[2], eye[4])) / (2 * d(eye[0], eye[3]));
};

// face-api.js detection -> { points: [{x,y}] x 68, expressions }
const fromBrowser = (d) => ({
  points: d.landmarks.positions.map((p) => ({ x: p.x, y: p.y })),
  expressions: Object.fromEntries(Object.entries(d.expressions).map(([k, v]) => [EXPRESSION_NAMES[k] || k, v])),
});

// DGX vision service face -> same shape
const fromServer = (f) => ({
  points: Array.isArray(f.landmarks) && f.landmarks.length === 68 ? f.landmarks.map(([x, y]) => ({ x, y })) : null,
  expressions: f.expressions || {},
});

/**
 * Camera-based attention tracking for the coding interview. Only aggregate counts are
 * sent with the submission.
 *
 * The face model (detector, 68 landmarks, 7 expressions) runs either:
 *  - on the DGX Spark ("server"): a downscaled frame is sent every interval_ms to the
 *    backend, which forwards it to the DGX vision service; frames are not stored, or
 *  - in the browser ("browser"): face-api.js, the fallback when the server mode is not
 *    configured or stops answering.
 *
 * @param {boolean} enabled
 * @param {{client?: {faceFrame: Function}, config?: {mode: string, interval_ms: number}}} options
 * Returns { videoRef, status, warning, summary(), stop() }.
 */
export default function useFaceTracking(enabled = true, { client, config } = {}) {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | on | denied | unavailable
  const [warning, setWarning] = useState("");

  const counts = useRef({ ...EMPTY_EMOTIONS });
  const head = useRef({ seen_left: 0, seen_right: 0, seen_center: 1, time_left: 0, time_right: 0, time_center: 0 });
  const last = useRef({ position: null, time: 0 });
  const blinks = useRef(0);
  const eyeClosed = useRef(false);
  const noFace = useRef(0);
  const modesUsed = useRef(new Set());

  // Read once: the mode only changes from server to browser (fallback), never back.
  const startMode = config && config.mode === "server" && client && client.faceFrame ? "server" : "browser";
  const serverInterval = Math.max(250, Number(config && config.interval_ms) || 1000);
  const clientRef = useRef(client);
  clientRef.current = client;

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Updates the counters from the faces found in one frame.
  const process = useCallback((faces, intervalMs) => {
    if (faces.length > 1) {
      setWarning("More than one person is visible. Only you should be in front of the camera.");
      return;
    }
    if (faces.length === 0) {
      noFace.current += 1;
      // about 4 seconds without a face
      if (noFace.current * intervalMs >= 4000) setWarning("We cannot see your face. Please stay in front of the camera.");
      return;
    }
    noFace.current = 0;
    setWarning("");
    const d = faces[0];

    const total = Object.values(d.expressions).reduce((s, v) => s + (Number(v) || 0), 0) || 1;
    Object.keys(EMPTY_EMOTIONS).forEach((k) => {
      if (((Number(d.expressions[k]) || 0) / total) * 100 > 50) counts.current[k] += 1;
    });

    if (!d.points) return;
    const p = d.points;
    const jaw = p.slice(0, 17);
    const nose = p[27];
    const width = Math.abs(jaw[16].x - jaw[0].x);
    const th = width * 0.2;
    const pos = nose.x < jaw[0].x + th ? "right" : nose.x > jaw[16].x - th ? "left" : "center";
    const now = Date.now();
    if (last.current.position) {
      if (last.current.position !== pos) head.current[`seen_${pos}`] += 1;
      head.current[`time_${last.current.position}`] += now - last.current.time;
    }
    last.current = { position: pos, time: now };

    const ear = (eyeAspectRatio(p.slice(36, 42)) + eyeAspectRatio(p.slice(42, 48))) / 2;
    if (ear < 0.29) eyeClosed.current = true;
    else if (eyeClosed.current) {
      blinks.current += 1;
      eyeClosed.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    const startLoop = (fn, ms) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fn, ms);
    };

    // Browser mode: face-api.js + TensorFlow.js, loaded on demand (large).
    const runInBrowser = async () => {
      let faceapi;
      try {
        faceapi = await import("face-api.js");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_BASE}tiny_face_detector`),
          faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_BASE}face_landmark_68`),
          faceapi.nets.faceExpressionNet.loadFromUri(`${MODEL_BASE}face_expression`),
        ]);
      } catch (_) {
        if (!cancelled) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus("unavailable");
        }
        return;
      }
      if (cancelled) return;
      modesUsed.current.add("browser");
      startLoop(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        try {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
          process(detections.map(fromBrowser), BROWSER_INTERVAL_MS);
        } catch (_) {
          // skip this frame
        }
      }, BROWSER_INTERVAL_MS);
    };

    // Server mode: frames go to the DGX Spark through the backend.
    const runOnServer = () => {
      let inFlight = false;
      let failures = 0;
      modesUsed.current.add("server");
      startLoop(async () => {
        const video = videoRef.current;
        if (inFlight || !video || video.readyState < 2 || !video.videoWidth) return;
        const canvas = canvasRef.current || (canvasRef.current = document.createElement("canvas"));
        canvas.width = FRAME_WIDTH;
        canvas.height = Math.round((video.videoHeight / video.videoWidth) * FRAME_WIDTH);
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL("image/jpeg", 0.7).replace(/^data:image\/jpeg;base64,/, "");
        inFlight = true;
        try {
          const res = await clientRef.current.faceFrame(image);
          failures = 0;
          if (!cancelled) process(((res.data && res.data.faces) || []).map(fromServer), serverInterval);
        } catch (err) {
          const st = err && err.response && err.response.status;
          const unavailable = st === 503 || (err && err.response && err.response.data && err.response.data.unavailable);
          // The attempt is over (submitted / time up): stop sending frames.
          if (st === 409 || st === 401) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
          }
          failures += 1;
          if (!cancelled && (unavailable || failures >= SERVER_FAILURES_BEFORE_FALLBACK)) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            runInBrowser();
          }
        } finally {
          inFlight = false;
        }
      }, serverInterval);
    };

    (async () => {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      } catch (_) {
        if (!cancelled) setStatus("denied");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus("on");
      if (startMode === "server") runOnServer();
      else runInBrowser();
    })();
    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, stop, process, startMode, serverInterval]);

  // Aggregate shape stored with the interview (matches the existing report).
  const summary = useCallback(() => {
    const total = Object.values(counts.current).reduce((s, v) => s + v, 0) || 1;
    const emotions = Object.fromEntries(
      Object.entries(counts.current).map(([k, v]) => [k, Number(((v / total) * 100).toFixed(2))])
    );
    const h = head.current;
    const used = [...modesUsed.current];
    return {
      seen_left: h.seen_left,
      seen_right: h.seen_right,
      seen_center: h.seen_center,
      blinks: blinks.current,
      time_straight: Math.round(h.time_center / 1000),
      time_left: Math.round(h.time_left / 1000),
      time_right: Math.round(h.time_right / 1000),
      analysis: used.length > 1 ? "mixed" : used[0],
      emotions,
    };
  }, []);

  // Stable object so consumers' callbacks/effects are not recreated every render.
  return useMemo(() => ({ videoRef, status, warning, summary, stop }), [status, warning, summary, stop]);
}
