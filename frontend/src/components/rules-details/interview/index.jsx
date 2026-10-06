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
import Coding from "./codingInterview"
import * as faceapi from "face-api.js";

Banner.propTypes = {
    item: PropTypes.object,
};

function Banner(props) {
    const { item } = props;

    const [questions, setQuestions] = useState();
    const [currQuestionIndex, setCurrQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState();
    const [isListening, setIsListening] = useState(false);
    const [isEnable, setIsEnable] = useState(false);
    const [textToCopy, setTextToCopy] = useState();
    const [timer, setTimer] = useState(60);
    const [wordsCount, setWordsCount] = useState(200);
    const [qna, setQna] = useState([]);
    const [submitButton, setSubmitButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState();
    const [videoLoaded, setVideoLoaded] = useState(true);
    const [loadButton, setLoadButton] = useState(false);
    const [bufferTimeLeft, setBufferTimeLeft] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [showAnswerSection, setShowAnswerSection] = useState(false);
    const [emotions, setEmotions] = useState()
    const [isSubmitting, setIsSubmitting] = useState(false)
    let timerId;
    let [newTimerId, setNewTimerId] = useState();
    let [answerTime, setAnswerTime] = useState();

    let isNext = false;
    const [qa, setQa] = useState([]);
    let allQuestions = [];
    let maxWords = 200;
    let timeLeft = 60;
    const navigate = useNavigate();
    var id = localStorage.getItem('id');
    const intervieweeDetails = JSON.parse(localStorage.getItem('intervieweeDetails'));
    const countdownBuffer = () => {
        if (bufferTimeLeft === 0) {
            setIsBuffering(false);
            setTimer(60);
            timerId = setInterval(countdown, 1000);
            setNewTimerId(timerId);
            setShowAnswerSection(true);
            SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        } else {
            setBufferTimeLeft(bufferTimeLeft - 1);
        }
    };
    const countdown = () => {
        if (timeLeft === 0) {
            clearInterval(newTimerId);
        } else {
            timeLeft--;
            setTimer(timeLeft);
            setAnswerTime(timeLeft);
        }
    };
    useEffect(() => {
        if (isBuffering) {
            const bufferTimerId = setInterval(countdownBuffer, 1000);
            return () => clearInterval(bufferTimerId);
        }
    }, [isBuffering, bufferTimeLeft]);

    const onEnd = () => {
        setIsEnable(true);
        setIsBuffering(true);
        setBufferTimeLeft(5);
        SpeechRecognition.stopListening();
    };
    const { speak, voices, cancel, speaking } = useSpeechSynthesis({
        onEnd,
    });

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    const resetting = async () => {
        const qnaLength = qna.length;
        const count = parseInt(item.questions_count, 10);

        if (currQuestionIndex < count-1) {
            if (currQuestionIndex == count-2) {
                setSubmitButton(true);
            }
            AddQuestions();
            setCurrQuestionIndex(currQuestionIndex + 1);
            setWordsCount(maxWords);
            setTextToCopy('');
            timeLeft = 60;
            setTimer(timeLeft);
            setIsEnable(false);
            setAnswerTime(timeLeft);
            setShowAnswerSection(false);
        } else {
            AddQuestions();
            setQa(qna);
            setLoadButton(true);
            for (let i = 0; i < qna.length; i++) {
                const isLast = i === qna.length - 1 ? 1 : 0;
                const data = { ...qna[i], id: intervieweeDetails.interviewee_id, last: isLast };
                try {
                    const response = await axios.post("http://node.technicalhub.io:4001/api/get-accuracy/", data);
                    console.log(response.data)
                    // if (isLast) {
                    //     navigate('/blog-details');
                    // }
                    handleSubmit()
                } catch (err) {
                    console.error("Error in API call:", err);
                }
            }
        }
    };
    useEffect(() => {
        return () => {
            SpeechRecognition.stopListening(); // Ensure mic stops when the component unmounts
            clearInterval(newTimerId); // Clean up timers
        };
    }, []);

    useEffect(() => {
        if (item.interview_type == "ai generated") {
            const data = {
                technology: item.technology,
                module: item.module,
                topic: item.topic,
                module_details: item.module_details,
                level: item.level,
                questions_count: item.questions_count,
                technology_name: item.technology_name
            };
            axiosInstance.post("generate-questions", data).then(async (response) => {
                let splitted = (response.data.response.choices[0].message.content).split('\n');
                const updatedSplitted = splitted
                    .filter(question => question.trim() !== '')
                    .map(question => question.replace(/^\d+\.\s*/, '').trim());
                console.log(updatedSplitted)
                setQuestions(updatedSplitted);
            });
        } else if (item.interview_type == "company") {
            const data = {
                company: item.company,
                round: item.round,
                type: item.type,
                questions_count: item.questions_count,
                tag:item.tag
            };
            let quesArr = []
            axiosInstance.post("generate-company-questions", data).then(async (response) => {
                console.log(response.data)
                response.data.map((ele) => {
                    quesArr.push(ele.question)
                })
                setQuestions(quesArr)
            });
        }
    }, []);
    useEffect(() => {
        if (typeof (questions) !== 'undefined') {
            speak({ text: questions[currQuestionIndex], voice: voices[5] });
            setShowAnswerSection(false);
        }
    }, [questions, currQuestionIndex]);
    const AddQuestions = () => {
        allQuestions[0] = { "question": questions[currQuestionIndex], "answer": textToCopy, "time": (60 - answerTime) };
        qna[currQuestionIndex] = allQuestions[0];
    };
    const countWords = (str) => {
        if (timer > 0) {
            setTextToCopy(transcript);
        } else if (timer <= 0) {
            SpeechRecognition.stopListening();
            resetTranscript();
            if (currQuestionIndex === questions?.length - 1) {

                handleSubmit();
            } else {
                NextQuestion();
                setTimeout(() => { resetting(); }, 5000);
            }
        }
    };
    useEffect(() => {
        countWords(transcript);
    }, [transcript, timer]);
    const NextQuestion = () => {
        SpeechRecognition.stopListening();
        resetTranscript();
        setBufferTimeLeft(0);
        setIsLoading(true);
        clearInterval(newTimerId);

        if (currQuestionIndex < questions?.length - 1) {
            setTimeout(() => {
                resetting();
                setIsLoading(false);
            }, 5000);
        }
    };
    const handleSubmit = async () => {
        SpeechRecognition.stopListening();
        // stopCamera();
        try {
            setIsLoading(true);
            AddQuestions();
            setQa(qna);
            // const totalDetections = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0) || 1;
            // const normalizedEmotions = Object.fromEntries(
            //     Object.entries(emotionCounts).map(([key, value]) => [key, ((value / totalDetections) * 100).toFixed(2)])
            // );
            // const formattedHeadTracking = {
            //     candidate_name: item.roll_no,
            //     seen_left: headTracking?.seen_left || 0,
            //     seen_right: headTracking?.seen_right || 0,
            //     seen_center: headTracking?.seen_center || 0,
            //     blinks: blinkCount,
            //     time_straight: Math.round((headTracking?.time_center || 0) / 1000),
            //     time_left: Math.round((headTracking?.time_left || 0) / 1000),
            //     time_right: Math.round((headTracking?.time_right || 0) / 1000),
            //     emotions: normalizedEmotions
            // };
            // const emotionsData = [formattedHeadTracking];
            const payload = {
                questions: qna.map((question) => ({
                    ...question,
                    roll_no: item.roll_no,
                })),
                roll_no: item.roll_no,
                interview_type: item.interview_type,
                platform: item.platform,
                id: item._id,
                // emotions: emotionsData
            };
            console.log(payload)
            const response = await axiosInstance.post("get-accuracy/",
                payload
            );
            if (response.status === 200) {

                setIsLoading(true)
                window.location.href = `/report?roll_no=${item.roll_no}&interview_type=${item.interview_type}&id=${item._id}`;

            } else {
                console.error("Failed to get accuracy:", response.data);
            }

        } catch (err) {
            console.error("Error in handleSubmit:", err);
        }
    };
    // const videoRef = useRef(null);
    // const canvasRef = useRef(null);
    // const detectionInterval = useRef([]);
    // const positionStartTime = useRef(Date.now());
    // const isEyeClosedRef = useRef(false);
    // const lastSeenRef = useRef({ position: null, time: 0 });

    // const [modelsLoaded, setModelsLoaded] = useState(false);
    // const [isCameraOn, setIsCameraOn] = useState(false);
    // const [screenshot, setScreenshot] = useState(null);
    // const [totalDetections, setTotalDetections] = useState(0);
    // const [blinkCount, setBlinkCount] = useState(0);
    // const [peopleCount, setPeopleCount] = useState(0);
    // const [emotionCounts, setEmotionCounts] = useState({
    //     happy: 0, sad: 0, angry: 0, neutral: 0, surprise: 0, fear: 0, disgust: 0
    // });
    // const [headTracking, setHeadTracking] = useState({
    //     seen_left: 0, seen_right: 0, seen_center: 1,
    //     time_left: 0, time_right: 0, time_center: 0
    // });
    // const [cameraAccess, setCameraAccess] = useState(true);
    // const currentHeadPositionRef = useRef("center");
    // const loadModels = async () => {
    //     try {
    //         const base = process.env.REACT_APP_PUBLIC_BACKEND_MODEL_URL;
    //         await Promise.all([
    //             faceapi.nets.tinyFaceDetector.loadFromUri(`${base}tiny_face_detector`),
    //             faceapi.nets.faceLandmark68Net.loadFromUri(`${base}face_landmark_68`),
    //             faceapi.nets.faceRecognitionNet.loadFromUri(`${base}face_recognition`),
    //             faceapi.nets.faceExpressionNet.loadFromUri(`${base}face_expression`)
    //         ]);
    //         console.log("Face-api models loaded");
    //         setModelsLoaded(true);
    //     } catch (err) {
    //         console.error("Model load error:", err);
    //     }
    // };

    // const startCamera = async () => {
    //     try {
    //         const stream = await navigator.mediaDevices.getUserMedia({
    //             video: { width: 640, height: 480 }
    //         });
    //         videoRef.current.srcObject = stream;
    //         setIsCameraOn(true);
    //         resetCounts();
    //         startDetection();
    //     } catch (err) {
    //         alert("Camera is not enabled");
    //         setCameraAccess(false)
    //         console.error(err);
    //     }
    // };

    // const stopCamera = () => {
    //     if (videoRef.current?.srcObject) {
    //         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    //         videoRef.current.srcObject = null;
    //     }
    //     setIsCameraOn(false);
    //     stopDetection();
        
    // };

    // const stopDetection = () => {
    //     detectionInterval.current.forEach(clearInterval);
    //     detectionInterval.current = [];
    //     setPeopleCount(0);
    //     setTotalDetections(0);
    // };

    // const resetCounts = () => {
    //     setEmotionCounts({
    //         happy: 0, sad: 0, angry: 0, neutral: 0, surprise: 0, fear: 0, disgust: 0
    //     });
    //     setHeadTracking({
    //         seen_left: 0, seen_right: 0, seen_center: 1,
    //         time_left: 0, time_right: 0, time_center: 0
    //     });
    //     setBlinkCount(0);
    //     setTotalDetections(0);
    //     positionStartTime.current = Date.now();
    // };

    // const captureScreenshot = () => {
    //     const video = videoRef.current;
    //     const canvas = canvasRef.current;
    //     if (!video || !canvas) return;

    //     canvas.width = video.videoWidth;
    //     canvas.height = video.videoHeight;
    //     const ctx = canvas.getContext("2d");
    //     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    //     setScreenshot(canvas.toDataURL("image/png"));
    // };

    // const calculateEyeOpenScore = (leftEye, rightEye) => {
    //     const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    //     const ear = (eye) =>
    //         (dist(eye[1], eye[5]) + dist(eye[2], eye[4])) / (2 * dist(eye[0], eye[3]));
    //     return (ear(leftEye) + ear(rightEye)) / 2;
    // };

    // const detectEyeBlink = (score) => {
    //     const threshold = 0.29;
    //     if (score < threshold && !isEyeClosedRef.current) {
    //         isEyeClosedRef.current = true;
    //     } else if (score >= threshold && isEyeClosedRef.current) {
    //         setBlinkCount(prev => prev + 1);
    //         isEyeClosedRef.current = false;
    //     }
    // };

    // const updateEmotions = (expressions) => {
    //     const total = Object.values(expressions).reduce((sum, v) => sum + v, 0);
    //     if (total === 0) return;
    //     const normalized = Object.fromEntries(
    //         Object.entries(expressions).map(([k, v]) => [k, (v / total) * 100])
    //     );
    //     setEmotionCounts(prev => ({
    //         happy: normalized.happy > 50 ? prev.happy + 1 : prev.happy,
    //         sad: normalized.sad > 50 ? prev.sad + 1 : prev.sad,
    //         angry: normalized.angry > 50 ? prev.angry + 1 : prev.angry,
    //         neutral: normalized.neutral > 50 ? prev.neutral + 1 : prev.neutral,
    //         surprise: normalized.surprise > 50 ? prev.surprise + 1 : prev.surprise,
    //         fear: normalized.fear > 50 ? prev.fear + 1 : prev.fear,
    //         disgust: normalized.disgust > 50 ? prev.disgust + 1 : prev.disgust
    //     }));
    // };

    // const trackHeadPosition = (landmarks) => {
    //     const jaw = landmarks.getJawOutline();
    //     const nose = landmarks.getNose()[0];
    //     const left = jaw[0];
    //     const right = jaw[16];
    //     const faceWidth = Math.abs(right.x - left.x);
    //     const threshold = faceWidth * 0.2;

    //     let position = "center";
    //     if (nose.x < left.x + threshold) position = "right";
    //     else if (nose.x > right.x - threshold) position = "left";
    //     currentHeadPositionRef.current = position;
    //     const now = Date.now();
    //     const last = lastSeenRef.current;

    //     if (!last.position) {
    //         lastSeenRef.current = { position, time: now };
    //         return;
    //     }

    //     if (last.position !== position) {
    //         setHeadTracking(prev => ({
    //             ...prev,
    //             seen_left: position === "left" ? prev.seen_left + 1 : prev.seen_left,
    //             seen_right: position === "right" ? prev.seen_right + 1 : prev.seen_right,
    //             seen_center: position === "center" ? prev.seen_center + 1 : prev.seen_center,
    //         }));
    //     }

    //     const timeSpent = now - last.time;
    //     setHeadTracking(prev => ({
    //         ...prev,
    //         time_left: last.position === "left" ? prev.time_left + timeSpent : prev.time_left,
    //         time_right: last.position === "right" ? prev.time_right + timeSpent : prev.time_right,
    //         time_center: last.position === "center" ? prev.time_center + timeSpent : prev.time_center,
    //     }));

    //     lastSeenRef.current = { position, time: now };
    // };
    // const startDetection = () => {
    //     if (!videoRef.current) return;
    //     const video = videoRef.current;

    //     if (!modelsLoaded) {
    //         console.error("Models not loaded yet.");
    //         return;
    //     }

    //     const screenshotInterval = setInterval(() => {
    //         captureScreenshot();
    //     }, 10000);

    //     let noFaceDetectedCount = 0;
    //     const maxNoFaceFrames = 10;

    //     const faceDetectionInterval = setInterval(async () => {
    //         if (!video) return;

    //         const detections = await faceapi
    //             .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    //             .withFaceLandmarks()
    //             .withFaceExpressions();

    //         setPeopleCount(detections.length);

    //         if (detections.length > 1) {
    //             alert("Multiple people detected! Please ensure only one person is in the frame.");
    //             return;
    //         }

    //         if (detections.length === 0) {
    //             noFaceDetectedCount++;
    //             if (noFaceDetectedCount >= maxNoFaceFrames) {
    //                 alert("No face detected! Please stay in front of the camera.");
    //                 noFaceDetectedCount = 0;
    //             }
    //             return;
    //         }

    //         noFaceDetectedCount = 0;

    //         if (detections.length === 1) {
    //             setTotalDetections((prev) => prev + 1);
    //             updateEmotions(detections[0].expressions);
    //             trackHeadPosition(detections[0].landmarks);

    //             const leftEye = detections[0].landmarks.getLeftEye();
    //             const rightEye = detections[0].landmarks.getRightEye();
    //             const eyeOpenScore = calculateEyeOpenScore(leftEye, rightEye);
    //             if (currentHeadPositionRef.current === "center") {
    //                 detectEyeBlink(eyeOpenScore);
    //             }
    //         }
    //     }, 300);

    //     detectionInterval.current = [screenshotInterval, faceDetectionInterval];
    // };

    // useEffect(() => {
    //     loadModels();
    // }, []);

    // useEffect(() => {
    //     if (
    //         (item.interview_type === "ai generated" || item.interview_type === "company") &&
    //         modelsLoaded
    //     ) {
    //         startCamera();
    //     }
    // }, [modelsLoaded, item.interview_type]);
    if (!browserSupportsSpeechRecognition) {
        alert("not listening");
        return <span>Browser doesn't support speech recognition.</span>;
    }

    return (
        <div className="themes-container2 themes-slider">

            <div
                className="wrap-heading flat-slider"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    padding: "20px",
                }}
            >
                {isLoading ? (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                        <ThreeDots
                            visible={true}
                            height={80}
                            width={80}
                            color="#fff"
                            radius={9}
                            ariaLabel="three-dots-loading"
                        />
                    </div>
                ) : (
                    item.interview_type == "ai generated" || item.interview_type == "company" ?
                        // cameraAccess ?
                            <div
                                className="question-container"
                                style={{
                                    display: "flex",
                                    width: "90%",
                                    maxWidth: "1200px",
                                    backgroundColor: "#2B2B2B",
                                    borderRadius: "15px",
                                    padding: "30px",
                                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
                                    border: "1px solid #ffffff3d",
                                    marginTop: "120px"
                                }}
                            >
                                {/* Left Section - Question & Answer */}
                                <div
                                    className="content-section"
                                    style={{
                                        flex: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    {/* Header Section */}
                                    <div
                                        className="header-section"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        <h2
                                            style={{
                                                color: "#FFF",
                                                fontSize: "18px",
                                                fontFamily: "Orbitron, sans-serif",
                                            }}
                                        >
                                            QUESTION - {currQuestionIndex + 1}
                                        </h2>
                                        <h2
                                            style={{
                                                color: "#5BF3E9",
                                                fontSize: "18px",
                                                fontFamily: "Orbitron, sans-serif",
                                            }}
                                        >
                                            {`0:${timer} SEC`}
                                        </h2>
                                    </div>

                                    {/* Question Section */}
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
                                            {typeof questions !== "undefined" ? (
                                                questions[currQuestionIndex]
                                            ) : (
                                                <ThreeDots
                                                    visible={true}
                                                    height={20}
                                                    width={30}
                                                    color="#FFF"
                                                    radius={9}
                                                />
                                            )}
                                        </h3>
                                    </div>

                                    {/* Conditional Answer Section */}
                                    {showAnswerSection && bufferTimeLeft == 0 ? (
                                        <>
                                            <span style={{
                                                fontWeight: "bold", color: "#5BF3E9",
                                                fontSize: "15px",
                                                fontFamily: "Arial, sans-serif",
                                                lineHeight: "1.8",
                                                marginBottom: "20px",
                                            }}>Answer:</span>

                                            <div
                                                className="answer-section"
                                                style={{
                                                    padding: "15px",
                                                    backgroundColor: "#3B3B3B",
                                                    borderRadius: "10px",
                                                    border: "1px dashed rgba(255, 255, 255, 0.1)",
                                                    color: "#AAA",
                                                    fontSize: "14px",
                                                    fontFamily: "Arial, sans-serif",
                                                    lineHeight: "1.8",
                                                    height: "200px",
                                                    overflowY: "auto",
                                                }}
                                            >
                                                <p>{textToCopy || "Your answer will appear here..."}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* <span style={{
                                        fontWeight: "bold", color: "#5BF3E9",
                                        fontSize: "15px",
                                        fontFamily: "Arial, sans-serif",
                                        lineHeight: "1.8",
                                        marginBottom: "20px",
                                    }}>Answer:</span> */}

                                            <div
                                                className="answer-section"
                                                style={{
                                                    padding: "15px",
                                                    backgroundColor: "#3B3B3B",
                                                    borderRadius: "10px",
                                                    border: "1px dashed rgba(255, 255, 255, 0.1)",
                                                    color: "#AAA",
                                                    fontSize: "14px",
                                                    fontFamily: "Arial, sans-serif",
                                                    lineHeight: "1.8",
                                                    height: "200px",
                                                    overflowY: "auto",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    flexDirection: "column",
                                                }}
                                            >
                                                {isBuffering ? (
                                                    <div style={{ textAlign: "center" }}>
                                                        <Lottie
                                                            animationData={animationData}
                                                            loop={true}
                                                            speed={1}
                                                            style={{ width: "100px", height: "100px" }}
                                                        />
                                                        <p style={{ color: "white", marginLeft: "-55px" }}>
                                                            Start answering in<span style={{ color: "#5EE3EC" }}>&nbsp;{bufferTimeLeft}</span> seconds...
                                                        </p>
                                                    </div>
                                                ) : !isLoading ? (
                                                    <div style={{ textAlign: "center" }}>
                                                        <Lottie
                                                            animationData={aiAnimationData}
                                                            loop={true}
                                                            speed={1}
                                                            style={{ width: "150px", height: "150px" }}
                                                        />
                                                        {/* <p>{textToCopy || "Your answer will appear here..."}</p> */}
                                                    </div>
                                                ) : null}
                                            </div>

                                        </>
                                    )}
                                    {showAnswerSection && <div
                                        className="footer-section"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginTop: "20px",
                                        }}
                                    >
                                        {currQuestionIndex === questions?.length - 1 && (
                                            <button
                                                style={{
                                                    padding: "10px 20px",
                                                    borderRadius: "5px",
                                                    background: "linear-gradient(90deg, #FF6C6C, #FF9F9F)",
                                                    color: "#000",
                                                    fontSize: "16px",
                                                    cursor: "pointer",
                                                    border: "none",
                                                }}
                                                onClick={handleSubmit}
                                            >
                                                Submit
                                            </button>
                                        )
                                            // : (
                                            //     <button
                                            //         style={{
                                            //             padding: "10px 20px",
                                            //             borderRadius: "5px",
                                            //             background: "linear-gradient(90deg, #6C91F9, #5EE3EC)",
                                            //             color: "#000",
                                            //             fontSize: "16px",
                                            //             cursor: "pointer",
                                            //             border: "none",
                                            //         }}
                                            //         onClick={NextQuestion}
                                            //     >
                                            //         Next Question
                                            //     </button>
                                            // )
                                        }
                                    </div>}
                                </div>
                                {/* Right Section - Animation */}
                                <div
                                    className="right-section"
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <img src="/ai-robo.gif" alt="AI Robo" width="200px" />
                                </div>
                            </div>
                            // : <h2>Camera is not started</h2>
                        : <Coding item={item} />

                )
                }
            </div>
            {/* <div>

                <video ref={videoRef} autoPlay playsInline width="640" height="480" style={{ display: "none" }}></video>
                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                {screenshot && (
                    <div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: "black", color: "white", padding: "10px", borderRadius: "8px" }}>
                        <img src={screenshot} alt="Captured Screenshot" width="100" height="100" />
                    </div>
                )}
            </div> */}
        </div>
    );
}
export default Banner;
