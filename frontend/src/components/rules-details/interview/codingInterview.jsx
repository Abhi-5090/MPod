import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner';
import { useSpeechSynthesis } from 'react-speech-kit';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import '../../../scss/components/questions.css';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import animationData from '../../../../src/assets/timer.json';
import aiAnimationData from '../../../../src/assets/ai.json';
import axiosInstance from "../../../api/axiosInstance";
import * as faceapi from "face-api.js";
Banner.propTypes = {
  item: PropTypes.object,
};

function Banner(props) {
  const { item } = props;
  const [questions, setQuestions] = useState();
  const [currQuestionIndex, setCurrQuestionIndex] = useState(0);
  const [idea, setIdea] = useState('');
  const [answer, setAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [qna, setQna] = useState([]);
  const [submitButton, setSubmitButton] = useState(false);
  const [nextButton, setNextButton] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [bufferTimeLeft, setBufferTimeLeft] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showIdeaSection, setShowIdeaSection] = useState(true);
  const [showAnswerSection, setShowAnswerSection] = useState(false);
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [questionsData, setQuestionsData] = useState();
  let [newTimerId, setNewTimerId] = useState();
  const navigate = useNavigate();
  const [showOptimizationSection, setShowOptimizationSection] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [optimizedAnswer, setOptimizedAnswer] = useState("");
  const [goon, setGoon] = useState(1); // Define this at the top in your component
  const answerRef = useRef("");
  const optimizedRef = useRef("");
  const countdownBuffer = () => {
    if (bufferTimeLeft === 0) {
      setIsBuffering(false);
      setShowIdeaSection(true);
    } else {
      setBufferTimeLeft(prev => prev - 1);
    }
  };
  const clearRefs = () => {
    answerRef.current = "";
    optimizedRef.current = "";
  };

  const countdown = () => {
    setTimer(prev => {
      if (prev <= 1) {
        clearInterval(newTimerId);

        if (currQuestionIndex < questionsData.length - 1) {

          NextQuestion();
        } else {
          handleSubmit();
        }
        return 0;
      }
      return prev - 1;
    });
  };
  useEffect(() => {
    if (questionsData && questionsData[currQuestionIndex]) {
      setShowIdeaSection(true);
      setShowAnswerSection(false);
      setIdea('');
      setAnswer('');
      const questionTime = questionsData[currQuestionIndex]?.time * 60 || 60;
      // const questionTime = 2 * 60 || 60;

      setTimer(questionTime);
      if (newTimerId) clearInterval(newTimerId);
      newTimerId = setInterval(countdown, 1000);
      setNewTimerId(newTimerId);
    }
    return () => clearInterval(newTimerId);
  }, [currQuestionIndex, questionsData]);

  useEffect(() => {
    if (isBuffering) {
      const bufferTimerId = setInterval(countdownBuffer, 1000);
      return () => clearInterval(bufferTimerId);
    }
  }, [isBuffering, bufferTimeLeft]);

  useEffect(() => {
    if (item.interview_type === "coding") {
      const data = {
        level: item.level,
        questions_count: item.questions_count,
      };
      axiosInstance.post("generate-coding-questions", data).then((response) => {
        setQuestionsData(response.data);
        setQuestions(response.data.map((ele) => ele.problem_name));
        setIsBuffering(true);
        setBufferTimeLeft(5);
      });
    }
  }, [item]);
  const handleNext = () => {
    NextQuestion()
  }
  const NextQuestion = () => {
    console.log(currQuestionIndex);

    const currentAnswer = answerRef.current || "";
    const currentOptimizedAnswer = optimizedRef.current !== ""
      ? optimizedRef.current
      : currentAnswer;


    setQna(prevQna => {
      const updatedQna = [...prevQna];
      const initialTime = questionsData[currQuestionIndex]?.time * 60 || 60;
      const timeTaken = initialTime - timer;
      if (!updatedQna[currQuestionIndex]) {
        updatedQna[currQuestionIndex] = {};
      }
      updatedQna[currQuestionIndex] = {
        ...updatedQna[currQuestionIndex],
        timer: timeTaken,
        answer: currentAnswer,
        optimizedAnswer: currentOptimizedAnswer,
        question: questionsData[currQuestionIndex]?.problem_name || "",
        description: questionsData[currQuestionIndex]?.description || "",
        problem: questionsData[currQuestionIndex]?._id || "",
        idea: idea !== "" ? idea : updatedQna[currQuestionIndex]?.idea || "",
        matched_accuracy: updatedQna[currQuestionIndex]?.matched_accuracy || 0,
        idea_check: goon
      };
      updatedQna[currQuestionIndex + 1] = {
        question: questionsData[currQuestionIndex + 1]?.problem_name || "",
        description: questionsData[currQuestionIndex + 1]?.description || "",
        idea: "",
        matched_accuracy: 0,
        answer: "",
        optimizedAnswer: "",
        timer: 0,
        problem: questionsData[currQuestionIndex + 1]?._id || "",
        idea_check: 0
      };

      console.log("Updated QnA:", updatedQna);

      return updatedQna;
    });

    // Now clear refs and reset other state variables after state update
    clearRefs();
    setGoon(1);
    setIdea('');
    setAnswer('');
    setBufferTimeLeft(5);
    setIsBuffering(true);

    // Set UI visibility for the next question
    setShowIdeaSection(true);
    setShowAnswerSection(false);
    setShowOptimizationSection(false);
    setShowFinish(false);

    // Move to the next question index
    setCurrQuestionIndex(prev => prev + 1);

    // Handle the next and submit button states
    if (currQuestionIndex === questionsData.length - 2) {
      setSubmitButton(true);
      setNextButton(false);
    } else {
      setNextButton(true);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    stopCamera();
    setScreenshot(null)
    console.log("before updated qna" + qna)
    setQna(prevQna => {
      const updatedQna = [...prevQna];
      const initialTime = questionsData[currQuestionIndex]?.time * 60 || 60;
      const timeTaken = initialTime - timer;
      const currentAnswer = answerRef.current || "";
      const currentOptimizedAnswer = optimizedRef.current !== ""
        ? optimizedRef.current
        : currentAnswer;
      if (updatedQna[currQuestionIndex]) {
        updatedQna[currQuestionIndex] = {
          ...updatedQna[currQuestionIndex],
          answer: answerRef.current || "",
          optimizedAnswer: currentOptimizedAnswer,
          question: questionsData[currQuestionIndex]?.problem_name || "",
          description: questionsData[currQuestionIndex]?.description || "",
          problem: questionsData[currQuestionIndex]?._id || "",
          idea: updatedQna[currQuestionIndex]?.idea || idea || "",
          timer: timeTaken,
          matched_accuracy: updatedQna[currQuestionIndex]?.matched_accuracy || 0,
          idea_check: goon
        };
      }


      const totalDetections = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0) || 1; // Avoid division by zero
      const normalizedEmotions = Object.fromEntries(
        Object.entries(emotionCounts).map(([key, value]) => [key, ((value / totalDetections) * 100).toFixed(2)])
      );

      const formattedHeadTracking = {
        candidate_name: item.roll_no,
        seen_left: headTracking?.seen_left || 0,
        seen_right: headTracking?.seen_right || 0,
        seen_center: headTracking?.seen_center || 0,
        blinks: blinkCount,
        time_straight: Math.round((headTracking?.time_center || 0) / 1000),
        time_left: Math.round((headTracking?.time_left || 0) / 1000),
        time_right: Math.round((headTracking?.time_right || 0) / 1000),
        emotions: normalizedEmotions
      };
      const emotionsData = [formattedHeadTracking];

      const payload = {
        questions: updatedQna.map(q => ({
          ...q,
          roll_no: item.roll_no
        })),
        roll_no: item.roll_no,
        interview_type: item.interview_type,
        platform: item.platform,
        id: item._id,
        emotions: emotionsData
      };
      console.log(payload)
      axiosInstance.post("submit-coding-interview/", payload)
        .then(response => {
          if (response.status === 200) {
            window.location.href = `/coding-report?roll_no=${item.roll_no}&interview_type=${item.interview_type}&id=${item._id}`;
          }
        })
        .catch(err => console.error("Error in handleSubmit:", err))
        .finally(() => setIsLoading(false));
      return updatedQna;
    });
  };
  const handleFinish = async () => {
    if (!answer) {
      alert("First enter your code")
    } else {
      alert("Optimize your code")
      setShowOptimizationSection(true)
      setShowAnswerSection(false)
      setShowFinish(false)
    }
  }
  const handleGoon = (description) => {
    if (!idea) {
      setGoon(prev => prev + 1);
      alert("Enter your Idea first");
    } else {
      const cleanDescription = description.replace(/<[^>]*>/g, '');
      setIdeaLoading(true);
      const data = {
        description: cleanDescription,
        idea: idea.trim()
      };

      axiosInstance.post("analyze-idea", data).then((response) => {
        if (response.status == 200) {
          setIdeaLoading(false);
          if (response.data.accuracy >= 50) {
            setShowIdeaSection(false);
            setShowAnswerSection(true);
            setShowFinish(true);
            setQna(prevQna => {
              const updatedQna = [...prevQna];
              updatedQna[currQuestionIndex] = {
                ...updatedQna[currQuestionIndex],
                problem: questionsData[currQuestionIndex]?._id || "",
                question: questionsData[currQuestionIndex]?.problem_name || "",
                description: questionsData[currQuestionIndex]?.description || "",
                idea: idea,
                matched_accuracy: response.data.accuracy,
                answer: answer,
                idea_check: goon
              };
              return updatedQna;
            });
          } else {
            setGoon(prev => prev + 1);
            console.log(goon)
            alert("Your idea is not matched with given problem");
          }
        }
      });
    }
  };

  useEffect(() => {
    console.log("Updated QnA:", qna);
  }, [qna]);

  useEffect(() => {
    if (showOptimizationSection) {
      const currentQna = qna[currQuestionIndex];
      if (currentQna) {
        if (!currentQna.optimizedAnswer || currentQna.optimizedAnswer.trim() === '') {
          setOptimizedAnswer(currentQna.answer);
          setQna(prevQna => {
            const updatedQna = [...prevQna];
            updatedQna[currQuestionIndex] = {
              ...updatedQna[currQuestionIndex],
              optimizedAnswer: currentQna.answer,
            };
            return updatedQna;
          });
        } else {
          // Load the existing optimized answer if it's already set
          setOptimizedAnswer(currentQna.optimizedAnswer);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOptimizationSection, currQuestionIndex]);

  const handleOptimizationChange = (event) => {
    console.log(event.target.value)
    setOptimizedAnswer(event.target.value);
    optimizedRef.current = event.target.value;

    setQna(prevQna => {
      const updatedQna = [...prevQna];
      updatedQna[currQuestionIndex] = {
        ...updatedQna[currQuestionIndex],
        optimizedAnswer: event.target.value,
      };
      return updatedQna;
    });
  };
  const handleChange = (event) => {
    setAnswer(event.target.value);
    answerRef.current = event.target.value;
    setQna(prevQna => {
      const updatedQna = [...prevQna];
      updatedQna[currQuestionIndex] = {
        ...updatedQna[currQuestionIndex],
        answer: event.target.value,
      };
      return updatedQna;
    });
  };
  const videoRef = useRef(null);
  const detectionInterval = useRef(null);
  const positionStartTime = useRef(Date.now());

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
  const [cameraAccess, setCameraAccess] = useState(true);

  const startCamera = async () => {
    try {
      console.log(navigator.mediaDevices);

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (!stream) {
        alert("camera is not enabled")
        console.error("No video stream available.");
        return;
      }
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
      resetCounts();
      startDetection();
    } catch (error) {
      alert("camera is not enabled")
      setCameraAccess(false)
      // setIsLoading(true)
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
    stopDetection();
    // faceapi.nets.tinyFaceDetector.dispose();
    // faceapi.nets.faceLandmark68Net.dispose();
    // faceapi.nets.faceRecognitionNet.dispose();
    // faceapi.nets.faceExpressionNet.dispose();
    setModelsLoaded(false);
  };
  const stopDetection = () => {
    if (detectionInterval.current) {
      detectionInterval.current.forEach(clearInterval); // Clear all active intervals
      detectionInterval.current = null; // Reset reference
    }
    setPeopleCount(0);
    setTotalDetections(0);
  };
  const resetCounts = () => {
    setEmotionCounts({ happy: 0, sad: 0, angry: 0, neutral: 0, surprise: 0, fear: 0, disgust: 0 });
    setHeadTracking({ seen_left: 0, seen_right: 0, seen_center: 1, time_left: 0, time_right: 0, time_center: 0 });
    setTotalDetections(0);
    positionStartTime.current = Date.now();
  };

  const loadModels = async () => {
    const backendModelUrl = process.env.REACT_APP_PUBLIC_BACKEND_MODEL_URL
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(`${backendModelUrl}tiny_face_detector`),
        faceapi.nets.faceLandmark68Net.loadFromUri(`${backendModelUrl}face_landmark_68`),
        faceapi.nets.faceRecognitionNet.loadFromUri(`${backendModelUrl}face_recognition`),
        faceapi.nets.faceExpressionNet.loadFromUri(`${backendModelUrl}face_expression`),
      ]);
      setModelsLoaded(true);

    } catch (error) {
      console.error("Error loading Face API models:", error);
    }
  };
  const startDetection = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (!modelsLoaded) {
      console.error("Models not loaded yet.");
      return;
    }

    const screenshotInterval = setInterval(() => {
      captureScreenshot();
    }, 10000);

    let noFaceDetectedCount = 0; // Counter for no face detection
    const maxNoFaceFrames = 10;  // 10 x 300ms = 3 seconds (adjust this if needed)

    const faceDetectionInterval = setInterval(async () => {
      if (!video) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      setPeopleCount(detections.length);

      if (detections.length > 1) {
        alert("Multiple people detected! Please ensure only one person is in the frame.");
        return;
      }

      if (detections.length === 0) {
        noFaceDetectedCount++; // Increment the count when no face is detected
        if (noFaceDetectedCount >= maxNoFaceFrames) {
          alert("No face detected! Please stay in front of the camera.");
          noFaceDetectedCount = 0; // Reset after alert
        }
        return;
      }

      // Face detected, reset counter
      noFaceDetectedCount = 0;

      if (detections.length === 1) {
        setTotalDetections((prev) => prev + 1);
        updateEmotions(detections[0].expressions);
        trackHeadPosition(detections[0].landmarks);

        const leftEye = detections[0].landmarks.getLeftEye();
        const rightEye = detections[0].landmarks.getRightEye();
        const eyeOpenScore = calculateEyeOpenScore(leftEye, rightEye);
        detectEyeBlink(eyeOpenScore);
      }
    }, 300);

    detectionInterval.current = [screenshotInterval, faceDetectionInterval];
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
  useEffect(() => {
    if (modelsLoaded)
      startCamera();
  }, [modelsLoaded]);
  const stripHtml = (html) => {
    if (!html) return "";

    let text = html.replace(/<\/?[^>]+(>|$)/g, "");

    text = text.replace(/&nbsp;/g, " ").replace(/\s+/g, " "); // Normalize spaces

    return text.trim();
  };
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (
        key === 'f12' ||
        (e.ctrlKey && key === 'u') ||
        (e.ctrlKey && key === 's') ||
        (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j'))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  useEffect(() => {
    let devtoolsOpened = false;

    const checkDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if (widthThreshold || heightThreshold) {
        devtoolsOpened = true;
        alert("DevTools are open. Please close it to continue.");
      }
    };
    const interval = setInterval(checkDevTools, 1000);
    return () => clearInterval(interval);
  }, []);
  const formatHtmlText = (html) => {
    return html
      ?.replace(/<\/(p|li|br)>/gi, '\n')
      ?.replace(/<br\s*\/?>/gi, '\n')
      ?.replace(/<[^>]+>/g, '')
      ?.replace(/&nbsp;/g, ' ')
      ?.replace(/&lt;/g, '<')
      ?.replace(/&gt;/g, '>')
      ?.trim();
    // if (!html) return '';

    // const textWithLineBreaks = html
    //   .replace(/<\/(p|li|br)>/gi, '\n')
    //   .replace(/<br\s*\/?>/gi, '\n')
    //   .replace(/<[^>]+>/g, '')
    //   .trim();

    // const textArea = document.createElement("textarea");
    // textArea.innerHTML = textWithLineBreaks;
    // return textArea.value;
  };
  const renderHTML = (html) => {
    const cleanedHtml = html
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<code>/g, '<code style="background:none;background-color:transparent;padding:0;border:none">');

    return { __html: cleanedHtml };
  };

  return (
    <div className="themes-container2 themes-slider" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", padding: "20px" }}>
      {isLoading ? (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <ThreeDots visible={true} height={80} width={80} color="#fff" radius={9} ariaLabel="three-dots-loading" />
        </div>
      ) : (cameraAccess ?
        <>
          <div className="question-container" style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "1500px", backgroundColor: "#2B2B2B", borderRadius: "15px", padding: "30px", boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)", border: "1px solid #ffffff3d" }}>
            <div className="header-section" style={{ alignItems: "center", marginBottom: "20px", textAlign: "center" }}>
              <h2 style={{ color: "#FFF", fontSize: "18px", fontFamily: "Orbitron, sans-serif" }}>QUESTION - {currQuestionIndex + 1}</h2>
            </div>

            <div style={{ display: "flex", width: "100%" }}>
              <div className="left-section" style={{ flex: 1, paddingRight: "20px" }}>
                <div
                  className="question-section"
                  style={{
                    color: "#FFF",
                    fontSize: "15px",
                    fontFamily: "Arial, sans-serif",
                    lineHeight: "1.8",
                    marginBottom: "20px",
                  }}
                >
                  <h3 style={{ marginBottom: "10px", fontWeight: "bold" }}>
                    {questionsData
                      ? questionsData[currQuestionIndex]?.problem_name
                      : <ThreeDots visible={true} height={20} width={30} color="#FFF" radius={9} />}
                  </h3>
                  <div
                    style={{
                      borderRadius: "10px",
                      background: "#333333",
                      padding: "15px",
                      maxHeight: "500px",
                      overflowY: "auto",
                    }}
                  >
                    {questionsData && (
                      <>
                        <h4>Description:</h4>
                        {/* <div style={{ color: "#9c9aa5", background: "#333333", borderRadius: "10px", padding: "15px", whiteSpace: "pre-line" }}>
                          {formatHtmlText(questionsData[currQuestionIndex]?.description)}
                        </div> */}
                        <div dangerouslySetInnerHTML={renderHTML(questionsData[currQuestionIndex]?.description)} />
                        <h4>Input:</h4>
                        <div style={{ color: "#9c9aa5", background: "#333333", borderRadius: "10px", padding: "15px", whiteSpace: "pre-line" }}>
                          {formatHtmlText(questionsData[currQuestionIndex]?.input)}
                        </div>

                        <h4>Output:</h4>
                        <div style={{ color: "#9c9aa5", background: "#333333", borderRadius: "10px", padding: "15px", whiteSpace: "pre-line" }}>
                          {formatHtmlText(questionsData[currQuestionIndex]?.output)}
                        </div>

                        <h4>Constraints:</h4>
                        <div style={{ color: "#9c9aa5", background: "#333333", borderRadius: "10px", padding: "15px", whiteSpace: "pre-line" }}>
                          {formatHtmlText(questionsData[currQuestionIndex]?.constraints)}
                        </div>

                      </>
                    )}
                  </div>
                </div>
              </div>


              <div className="right-section" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontWeight: "bold", color: "#5BF3E9", fontSize: "15px", textAlign: "left" }}>{showIdeaSection ? "Give your Idea" : showOptimizationSection ? "Optimize your Code" : "Answer"}</span>
                  <h2 style={{ color: "#5BF3E9", fontSize: "18px", fontFamily: "Orbitron, sans-serif" }}>
                    {`${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`}
                  </h2>

                </div>
                {showIdeaSection && (
                  <div>
                    <textarea
                      className="w-full p-2 rounded"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Describe your approach..."
                      wrap="hard"
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      onDrop={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      onKeyDown={(e) => {
                        if (e.ctrlKey && ['c', 'v', 'x', 'a', 's'].includes(e.key.toLowerCase())) {
                          e.preventDefault();
                        }

                        if (
                          e.key === 'F12' ||
                          (e.ctrlKey && e.shiftKey && ['i', 'j'].includes(e.key.toLowerCase())) ||
                          (e.ctrlKey && e.key.toLowerCase() === 'u')
                        ) {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        width: "100%",
                        height: "500px",
                        backgroundColor: "#3B3B3B",
                        color: "#FFF",
                        borderRadius: "15px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "10px",
                        marginBottom: "20px",
                        marginTop: "10px"
                      }}
                    />
                  </div>
                )}
                {!showIdeaSection && !showOptimizationSection && (
                  showAnswerSection && bufferTimeLeft === 0 ? (
                    <textarea
                      className="w-full p-2 rounded"
                      value={answer}
                      onChange={handleChange}
                      placeholder="Type your answer here..."
                      wrap="hard"
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      onDrop={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      onKeyDown={(e) => {
                        if (e.ctrlKey && ['c', 'v', 'x', 'a', 's'].includes(e.key.toLowerCase())) {
                          e.preventDefault();
                        }

                        if (
                          e.key === 'F12' ||
                          (e.ctrlKey && e.shiftKey && ['i', 'j'].includes(e.key.toLowerCase())) ||
                          (e.ctrlKey && e.key.toLowerCase() === 'u')
                        ) {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        width: "100%",
                        height: "500px",
                        backgroundColor: "#3B3B3B",
                        color: "#FFF",
                        borderRadius: "15px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "10px",
                        marginBottom: "20px",
                        marginTop: "10px"
                      }}
                    ></textarea>
                  ) : (
                    <div
                      className="answer-section"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "15px",
                        backgroundColor: "#3B3B3B",
                        borderRadius: "10px",
                        border: "1px dashed rgba(255, 255, 255, 0.1)",
                        height: "500px",
                        width: "100%",
                        marginBottom: "20px",
                        marginTop: "10px"
                      }}
                    >
                      {isBuffering ? (
                        <div style={{ textAlign: "center" }}>
                          <Lottie
                            animationData={animationData}
                            loop
                            style={{ width: "100px", height: "100px" }}
                          />
                          <p style={{ color: "white" }}>
                            Start answering in <span style={{ color: "#5EE3EC" }}>{bufferTimeLeft}</span> seconds...
                          </p>
                        </div>
                      ) : (
                        <Lottie
                          animationData={aiAnimationData}
                          loop
                          style={{ width: "150px", height: "150px" }}
                        />
                      )}
                    </div>
                  )
                )}
                {!showIdeaSection && !showAnswerSection && showOptimizationSection && (
                  <div>
                    <textarea
                      className="w-full p-2 rounded"
                      value={optimizedAnswer || answer}
                      onChange={handleOptimizationChange}
                      placeholder="Type your optimized answer here..."
                      wrap="hard"
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      onDrop={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      onKeyDown={(e) => {
                        if (e.ctrlKey && ['c', 'v', 'x', 'a', 's'].includes(e.key.toLowerCase())) {
                          e.preventDefault();
                        }
                        if (
                          e.key === 'F12' ||
                          (e.ctrlKey && e.shiftKey && ['i', 'j'].includes(e.key.toLowerCase())) ||
                          (e.ctrlKey && e.key.toLowerCase() === 'u')
                        ) {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        width: "100%",
                        height: "500px",
                        backgroundColor: "#3B3B3B",
                        color: "#FFF",
                        borderRadius: "15px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "10px",
                        marginBottom: "20px",
                        marginTop: "10px"
                      }}
                    />
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  {showIdeaSection && !ideaLoading && (<button
                    style={{ padding: "10px 20px", borderRadius: "5px", background: "linear-gradient(90deg, #FF6C6C, #FF9F9F)", color: "#000", fontSize: "16px", cursor: "pointer", border: "none" }}
                    // disabled={!idea.trim()}
                    onClick={() => handleGoon(questionsData && questionsData[currQuestionIndex]?.description)}
                  >
                    Go On
                  </button>
                  )}
                  {showIdeaSection && ideaLoading && (<p

                    disabled={!idea.trim()}
                  >
                    Loading...
                  </p>
                  )}
                  {showAnswerSection && showFinish && !showOptimizationSection && (<button
                    style={{ padding: "10px 20px", borderRadius: "5px", background: "linear-gradient(90deg, #FF6C6C, #FF9F9F)", color: "#000", fontSize: "16px", cursor: "pointer", border: "none" }}
                    onClick={() => handleFinish(questionsData && questionsData[currQuestionIndex]?.description)}
                  >
                    Finish
                  </button>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    {submitButton && (
                      <button
                        style={{ padding: "10px 20px", borderRadius: "5px", background: "linear-gradient(90deg, #008738,rgb(145, 184, 152))", color: "#000", fontSize: "16px", cursor: "pointer", border: "none" }}
                        onClick={handleSubmit}
                      >
                        Submit
                      </button>
                    )}
                    {nextButton && (
                      <button
                        style={{ padding: "10px 20px", borderRadius: "5px", background: "linear-gradient(90deg, #008738,rgb(145, 184, 152))", color: "#000", fontSize: "16px", cursor: "pointer", border: "none" }}
                        onClick={handleNext}
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </> : <h2>Camera is not started</h2>
      )}
      <div>
        {/* <h3>Face Tracking</h3> */}
        {/* {!modelsLoaded && <p>Loading models...</p>} */}

        <video ref={videoRef} autoPlay playsInline width="640" height="480" style={{ display: "none" }}></video>
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        <div>
          {/* <button onClick={startCamera} disabled={isCameraOn}>Start Camera</button> */}
          {/* <button onClick={stopCamera} disabled={!isCameraOn}>Stop Camera</button> */}
        </div>

        {/* {!isCameraOn && totalDetections > 0 && (
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
      )} */}

        {screenshot && (
          <div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: "black", color: "white", padding: "10px", borderRadius: "8px" }}>
            <p>{faceMatchMessage}</p>
            <img src={screenshot} alt="Captured Screenshot" width="100" height="100" />
          </div>
        )}
      </div>
    </div>
  );
}
export default Banner;