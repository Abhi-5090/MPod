import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "webrtc-adapter";

const FaceTracking = () => {
  const videoRef = useRef(null);
  const detectionInterval = useRef(null);
  const positionStartTime = useRef(Date.now()); // Track start time of each head position

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [totalDetections, setTotalDetections] = useState(0);

  const [emotionCounts, setEmotionCounts] = useState({
    happy: 0, sad: 0, angry: 0, neutral: 0, surprise: 0, fear: 0, disgust: 0
  });
  const [blinkCount, setBlinkCount] = useState(0);
  const [peopleCount, setPeopleCount] = useState(0);

  const isEyeClosedRef = useRef(false);
  const [headTracking, setHeadTracking] = useState({
    seen_left: 0, seen_right: 0, seen_center: 1,
    time_left: 0, time_right: 0, time_center: 0
  });

  const lastSeenRef = useRef({ position: null, time: 0 });
  const canvasRef = useRef(null);
  const [screenshot, setScreenshot] = useState(null);
  const [faceMatchMessage, setFaceMatchMessage] = useState("");
  const startCamera = async () => {
    try {
      console.log(navigator.mediaDevices);

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
      resetCounts();
      startDetection();
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
    clearInterval(detectionInterval.current);
  };

  const resetCounts = () => {
    setEmotionCounts({ happy: 0, sad: 0, angry: 0, neutral: 0, surprise: 0, fear: 0, disgust: 0 });
    setHeadTracking({ seen_left: 0, seen_right: 0, seen_center: 1, time_left: 0, time_right: 0, time_center: 0 });
    setTotalDetections(0);
    positionStartTime.current = Date.now();
  };

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("http://node.technicalhub.io:8002/models/tiny_face_detector"),
        faceapi.nets.faceLandmark68Net.loadFromUri("http://node.technicalhub.io:8002/models/face_landmark_68"),
        faceapi.nets.faceRecognitionNet.loadFromUri("http://node.technicalhub.io:8002/models/face_recognition"),
        faceapi.nets.faceExpressionNet.loadFromUri("http://node.technicalhub.io:8002/models/face_expression"),
      ]);
      setModelsLoaded(true);
      console.log("Face API models loaded successfully");
    } catch (error) {
      console.error("Error loading Face API models:", error);
    }
  };

  const startDetection = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (!videoRef.current) return;
    detectionInterval.current = setInterval(async () => {
      captureScreenshot();
    }, 10000); // Capture screenshot every 10 seconds
    detectionInterval.current = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      setPeopleCount(detections.length);

      if (detections.length > 1) {
        alert("Multiple people detected! Please ensure only one person is in the frame.");
        return;
      }

      if (detections.length === 1) {
        setTotalDetections(prev => prev + 1);
        updateEmotions(detections[0].expressions);
        trackHeadPosition(detections[0].landmarks);

        const leftEye = detections[0].landmarks.getLeftEye();
        const rightEye = detections[0].landmarks.getRightEye();
        const eyeOpenScore = calculateEyeOpenScore(leftEye, rightEye);
        detectEyeBlink(eyeOpenScore);
      }
    }, 300);
  };

  const updateEmotions = (expressions) => {
    const total = Object.values(expressions).reduce((sum, value) => sum + value, 0);

    if (total === 0) return;

    const normalizedExpressions = Object.fromEntries(
      Object.entries(expressions).map(([key, value]) => [key, (value / total) * 100])
    );

    setEmotionCounts(prev => ({
      happy: normalizedExpressions.happy > 50 ? prev.happy + 1 : prev.happy,
      sad: normalizedExpressions.sad > 50 ? prev.sad + 1 : prev.sad,
      angry: normalizedExpressions.angry > 50 ? prev.angry + 1 : prev.angry,
      neutral: normalizedExpressions.neutral > 50 ? prev.neutral + 1 : prev.neutral,
      surprise: normalizedExpressions.surprise > 50 ? prev.surprise + 1 : prev.surprise,
      fear: normalizedExpressions.fear > 50 ? prev.fear + 1 : prev.fear,
      disgust: normalizedExpressions.disgust > 50 ? prev.disgust + 1 : prev.disgust,
    }));
  };


  const trackHeadPosition = (landmarks) => {
    const jawOutline = landmarks.getJawOutline();
    const nose = landmarks.getNose()[0];

    const leftJaw = jawOutline[0];
    const rightJaw = jawOutline[16];
    const faceWidth = Math.abs(rightJaw.x - leftJaw.x);
    const threshold = faceWidth * 0.20;

    let newPosition = "center";
    if (nose.x < leftJaw.x + threshold) {
      newPosition = "right";
    } else if (nose.x > rightJaw.x - threshold) {
      newPosition = "left";
    }
    updateHeadTracking(newPosition);
  };

  const updateHeadTracking = (position) => {
    const now = Date.now();
    const lastSeen = lastSeenRef.current;

    if (!lastSeen.position) {
      lastSeenRef.current = { position, time: now };
      return;
    }

    if (lastSeen.position !== position) {
      setHeadTracking(prev => ({
        ...prev,
        seen_left: position === "left" ? prev.seen_left + 1 : prev.seen_left,
        seen_right: position === "right" ? prev.seen_right + 1 : prev.seen_right,
        seen_center: position === "center" ? prev.seen_center + 1 : prev.seen_center,
      }));
    }

    const timeSpent = now - lastSeen.time;
    setHeadTracking(prev => ({
      ...prev,
      time_left: lastSeen.position === "left" ? prev.time_left + timeSpent : prev.time_left,
      time_right: lastSeen.position === "right" ? prev.time_right + timeSpent : prev.time_right,
      time_center: lastSeen.position === "center" ? prev.time_center + timeSpent : prev.time_center,
    }));

    lastSeenRef.current = { position, time: now };
  };

  const detectEyeBlink = (eyeOpenScore) => {
    const threshold = 0.29;
    if (eyeOpenScore < threshold) {
      if (!isEyeClosedRef.current) {
        isEyeClosedRef.current = true;
      }
    } else {
      if (isEyeClosedRef.current) {
        setBlinkCount(prev => {
          return prev + 1;
        });
        isEyeClosedRef.current = false;
      }
    }
  };
  const calculateEyeOpenScore = (leftEye, rightEye) => {
    const eyeHeight = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    const leftEAR = (eyeHeight(leftEye[1], leftEye[5]) + eyeHeight(leftEye[2], leftEye[4])) / (2 * eyeHeight(leftEye[0], leftEye[3]));
    const rightEAR = (eyeHeight(rightEye[1], rightEye[5]) + eyeHeight(rightEye[2], rightEye[4])) / (2 * eyeHeight(rightEye[0], rightEye[3]));

    const ear = (leftEAR + rightEAR) / 2;
    console.log("Calculated EAR:", ear);
    return ear;
  };

  const captureScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setScreenshot(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <div>
      <h3>Face Tracking</h3>
      {!modelsLoaded && <p>Loading models...</p>}

      <video ref={videoRef} autoPlay playsInline width="640" height="480"></video>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <div>
        <button onClick={startCamera} disabled={isCameraOn}>Start Camera</button>
        <button onClick={stopCamera} disabled={!isCameraOn}>Stop Camera</button>
      </div>

      {!isCameraOn && totalDetections > 0 && (
        <div>
          <h4>Final Emotion Percentages:</h4>
          {Object.entries(emotionCounts).map(([key, value]) => (
            <p style={{ color: "white" }} key={key}>{key}: {((value / totalDetections) * 100).toFixed(2)}%</p>
          ))}

          <h4 style={{ color: "white" }}>Head Movement Details:</h4>
          <p style={{ color: "white" }}>Seen Left: {headTracking.seen_left} times</p>
          <p style={{ color: "white" }}>Seen Right: {headTracking.seen_right} times</p>
          <p style={{ color: "white" }}>Seen Center: {headTracking.seen_center} times</p>
          <p style={{ color: "white" }}>Time Left: {headTracking.time_left} ms</p>
          <p style={{ color: "white" }}>Time Right: {headTracking.time_right} ms</p>
          <p style={{ color: "white" }}>Time Center: {headTracking.time_center} ms</p>

          <h4 style={{ color: "white" }}>Blink Count: {blinkCount}</h4>
        </div>
      )}

      {screenshot && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: "black", color: "white", padding: "10px", borderRadius: "8px" }}>
          <p>{faceMatchMessage}</p>
          <img src={screenshot} alt="Captured Screenshot" width="100" height="100" />
        </div>
      )}
    </div>
  );

};

export default FaceTracking;
