import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const MODEL_BASE = process.env.REACT_APP_PUBLIC_BACKEND_MODEL_URL;
const EMPTY_EMOTIONS = { happy: 0, sad: 0, angry: 0, neutral: 0, surprise: 0, fear: 0, disgust: 0 };

const eyeAspectRatio = (eye) => {
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  return (d(eye[1], eye[5]) + d(eye[2], eye[4])) / (2 * d(eye[0], eye[3]));
};

/**
 * Camera-based attention tracking for the coding interview (runs entirely in the
 * browser; only aggregate counts are sent with the submission).
 * Returns { videoRef, status, warning, summary() }.
 */
export default function useFaceTracking(enabled = true) {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | on | denied | unavailable
  const [warning, setWarning] = useState("");

  const counts = useRef({ ...EMPTY_EMOTIONS });
  const head = useRef({ seen_left: 0, seen_right: 0, seen_center: 1, time_left: 0, time_right: 0, time_center: 0 });
  const last = useRef({ position: null, time: 0 });
  const blinks = useRef(0);
  const eyeClosed = useRef(false);
  const noFace = useRef(0);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_BASE}tiny_face_detector`),
          faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_BASE}face_landmark_68`),
          faceapi.nets.faceExpressionNet.loadFromUri(`${MODEL_BASE}face_expression`),
        ]);
      } catch (_) {
        if (!cancelled) setStatus("unavailable");
        return;
      }
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

      intervalRef.current = setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        let detections;
        try {
          detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
        } catch (_) {
          return;
        }
        if (detections.length > 1) {
          setWarning("More than one person is visible. Only you should be in front of the camera.");
          return;
        }
        if (detections.length === 0) {
          noFace.current += 1;
          if (noFace.current >= 10) setWarning("We cannot see your face. Please stay in front of the camera.");
          return;
        }
        noFace.current = 0;
        setWarning("");
        const d = detections[0];

        const total = Object.values(d.expressions).reduce((s, v) => s + v, 0) || 1;
        Object.keys(EMPTY_EMOTIONS).forEach((k) => {
          if ((d.expressions[k] / total) * 100 > 50) counts.current[k] += 1;
        });

        const jaw = d.landmarks.getJawOutline();
        const nose = d.landmarks.getNose()[0];
        const width = Math.abs(jaw[16].x - jaw[0].x);
        const th = width * 0.2;
        const pos = nose.x < jaw[0].x + th ? "right" : nose.x > jaw[16].x - th ? "left" : "center";
        const now = Date.now();
        if (last.current.position) {
          if (last.current.position !== pos) head.current[`seen_${pos}`] += 1;
          head.current[`time_${last.current.position}`] += now - last.current.time;
        }
        last.current = { position: pos, time: now };

        const ear = (eyeAspectRatio(d.landmarks.getLeftEye()) + eyeAspectRatio(d.landmarks.getRightEye())) / 2;
        if (ear < 0.29) eyeClosed.current = true;
        else if (eyeClosed.current) {
          blinks.current += 1;
          eyeClosed.current = false;
        }
      }, 400);
    })();
    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, stop]);

  // Aggregate shape stored with the interview (matches the existing report).
  const summary = useCallback(() => {
    const total = Object.values(counts.current).reduce((s, v) => s + v, 0) || 1;
    const emotions = Object.fromEntries(
      Object.entries(counts.current).map(([k, v]) => [k, Number(((v / total) * 100).toFixed(2))])
    );
    const h = head.current;
    return {
      seen_left: h.seen_left,
      seen_right: h.seen_right,
      seen_center: h.seen_center,
      blinks: blinks.current,
      time_straight: Math.round(h.time_center / 1000),
      time_left: Math.round(h.time_left / 1000),
      time_right: Math.round(h.time_right / 1000),
      emotions,
    };
  }, []);

  // Stable object so consumers' callbacks/effects are not recreated every render.
  return useMemo(() => ({ videoRef, status, warning, summary, stop }), [status, warning, summary, stop]);
}
