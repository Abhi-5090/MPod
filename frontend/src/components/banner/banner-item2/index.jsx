import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../button/button-st1';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner'
import { useSpeechSynthesis } from 'react-speech-kit';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import '../../../scss/components/questions.css';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import animationData from '../../../assets/images/interview.json';

Banner.propTypes = {
    item: PropTypes.object,
};

function Banner(props) {
    const [questions, setQuestions] = useState();
    const [currQuestionIndex, setCurrQuestionIndex] = useState(0)
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
    let timerId;
    let [newTimerId, setNewTimerId] = useState();
    let [answerTime, setAnswerTime] = useState();

    let isNext = false;
    const [qa, setQa] = useState([]);
    let allQuestions = [];
    let maxWords = 200;
    let timeLeft = 60;
    const navigate = useNavigate();
    var id = localStorage.getItem('id')
    const intervieweeDetails = JSON.parse(localStorage.getItem('intervieweeDetails'));

    const onEnd = () => {
        setIsEnable(true)
        timerId = setInterval(countdown, 1000);
        setNewTimerId(timerId);
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
        // let proctoringStats = {};
        // try {
        //     const proctoringResponse = await axios.post("http://your-proctoring-api-url");
        //     proctoringStats = proctoringResponse.data;
        //     console.log("Proctoring Statistics:", proctoringStats);
        // } catch (err) {
        //     console.error("Error fetching proctoring statistics:", err);
        // }
        if (currQuestionIndex < 4) {
            if (currQuestionIndex == 3) {
                setSubmitButton(true)
            }
            AddQuestions();
            setCurrQuestionIndex(currQuestionIndex + 1);
            setWordsCount(maxWords)
            setTextToCopy('')
            timeLeft = 60;
            setTimer(timeLeft)
            setIsEnable(false);
            setAnswerTime(timeLeft)
        } else {
            AddQuestions();
            setQa(qna)
            // navigate('/blog-details');
            setLoadButton(true);
            for (let i = 0; i < qna.length; i++) {
                const isLast = i === qna.length - 1 ? 1 : 0;
                const data = { ...qna[i], id: intervieweeDetails.interviewee_id, last: isLast };
                console.log(data);
                try {
                  console.log("Sending data:", data);
                  const response = await axios.post("http://node.technicalhub.io:6001/api/get-accuracy/", data);

            
                  console.log("Response:", response.data);
                  if (isLast) {
                    navigate('/blog-details');
                  }
                } catch (err) {
                  console.error("Error in API call:", err);
                }
              }
        }
    }
    // const handleVideoError = (error) => {
    //     console.error("Error loading or playing the video:", error);
    // };
    useEffect(() => {
        console.log(qa);

    }, [qa])

    const startListening = () => {
        if (!listening) {
            SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        } else {
            SpeechRecognition.stopListening();
        }
        console.log(listening);
    };

    const AddQuestions = () => {
        allQuestions[0] = { "question": questions[currQuestionIndex], "answer": textToCopy, "time": (60 - answerTime) }
        qna[currQuestionIndex] = allQuestions[0]
        // setIsLoading(true)

    }

    const countWords = (str) => {
        const arr = str.split(' ');
        let words = arr.filter(word => word !== '').length
        if (wordsCount > 0 && timer > 0) {
            setWordsCount(maxWords - words)
            setTextToCopy(transcript)
        } else if (wordsCount <= 0 || timer <= 0) {
            NextQuestion();
            SpeechRecognition.stopListening();
            resetTranscript();
            setTimeout(() => { resetting() }, 5000);
        }
    }

    useEffect(() => {
        countWords(transcript)
    }, [transcript, timer])

    const { item } = props;

    const NextQuestion = () => {
        setIsLoading(true);
        isNext = true;
        SpeechRecognition.stopListening();
        clearInterval(newTimerId);
        resetTranscript();
            setTimeout(() => {
                resetting();
                setIsLoading(false);
            }, 5000);
    }

    const countdown = () => {
        if (timeLeft === 0) {
            clearInterval(newTimerId);
        } else {
            timeLeft--;
            setTimer(timeLeft)
            setAnswerTime(timeLeft)
        }
    }

    useEffect(() => {
        const data = {
            technology: intervieweeDetails.technology_name
        }
        axios.post("http://node.technicalhub.io:6001/api/generate-questions/", data).then(async (response) => {
            let splitted = (response.data.response.choices[0].message.content).split('\n');
            console.log(splitted);

            const updatedSplitted = splitted
                .filter(question => question.trim() !== '')
                .map(question => question.replace(/^\d+\.\s*/, '').trim());

            setQuestions(updatedSplitted);
        });

    }, [])


    // useEffect(() => {
    //     if (typeof (questions) != 'undefined') {
    //         speak({ text: questions[currQuestionIndex], voice: voices[5] })

    //     }
    // }, [questions, currQuestionIndex])
    useEffect(() => {
        if (typeof (questions) != 'undefined') {
            speak({ text: questions[currQuestionIndex], voice: voices[5] })
            // const data = {
            //     question: questions[currQuestionIndex]
            // }
            // const fetchData = async () => {
            //     try {
            //         const response = await axios.post("http://node.technicalhub.io:5001/api/get-video", data);
            //         console.log(response.data.videoUrl)
            //         if (response.data) {
            //             setVideoUrl(response.data.videoUrl);

            //             setVideoLoaded(true)
            //         }
            //     } catch (error) {
            //         console.error("Error making POST request:", error);
            //     }
            // };

            // fetchData();
        }
    }, [questions, currQuestionIndex])

    if (!browserSupportsSpeechRecognition) {
        alert("not listening")
        return <span>Browser doesn't support speech recognition.</span>;
    }

    return (
        <div className="themes-container2 themes-slider">
            <div className="flat-wrap" style={{ padding: "27px", border: "3px dashed rgba(255, 255, 255, 0.07)", height: "600px", borderRadius: "10px", zIndex: "5" }}>
                {isLoading && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <ThreeDots
                            visible={true}
                            height={80}
                            width={80}
                            color="#fff"
                            radius={9}
                            ariaLabel="three-dots-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                    </div>
                )}
                {!isLoading && (
                    <>
                        <div className="wrap-heading flat-slider">
                            <div className="row">
                                <div className="col-lg-8" style={{ padding: "25px" }}>
                                    <div className="row" style={{ marginBottom: "20px" }}>
                                        <div className="col-lg-1">
                                            <button className='speak-btn' onClick={() => speak({ text: questions[currQuestionIndex], voice: voices[5] })}>{currQuestionIndex + 1}</button>
                                        </div>
                                        <div className="col-lg-9">
                                            <h1 className="text-justify" style={{ textAlign: "justify", fontSize: "15pt", lineHeight: "25pt" }}>
                                                {typeof (questions) !== 'undefined' ?
                                                    <span className="tf-text style s1">{questions[currQuestionIndex]}</span> :
                                                    <ThreeDots
                                                        visible={true}
                                                        height={80}
                                                        width={80}
                                                        color="#100C39"
                                                        radius={9}
                                                        ariaLabel="three-dots-loading"
                                                        wrapperStyle={{}}
                                                        wrapperClass=""
                                                    />}
                                            </h1>
                                        </div>
                                        <div className="col-lg-1">
                                            {isEnable ? !speaking ? (
                                                <button className='speak-btn' onClick={() => speak({ text: questions[currQuestionIndex], voice: voices[5] })}>
                                                    <img width="20px" height="20px" src="https://img.icons8.com/sf-black-filled/64/FFFFFF/high-volume.png" alt="high-volume" />
                                                </button>
                                            ) : (
                                                <button className='speak-btn' onClick={() => cancel()}>
                                                    <img width="20px" height="20px" src="https://image.pngaaa.com/825/4441825-middle.png" alt="high-volume" />
                                                </button>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </div>
                                    {isEnable && (
                                        <>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <span className='tf-text style s1' style={{ fontSize: "15pt", marginTop: "10px", color: "#5BF3E9" }}>Your Answer : </span>
                                                </div>
                                                <div className="col-lg-6">
                                                    <h2 className='' style={{ fontSize: "15pt", float: "right", paddingTop: "10px", paddingRight: "10px" }}>0:{timer}</h2>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <p className="text-justify" style={{ textAlign: "justify", border: "1px dashed rgba(255, 255, 255, 0.07)", fontSize: "15pt", lineHeight: "25pt", height: "300px", marginTop: "10px", overflowY: "auto", scrollbarColor: "unset", color: "lightgray" }}>
                                                        <span className="tf-text style s1">{textToCopy}</span>
                                                    </p>
                                                </div>
                                                <div className="col-lg-12">
                                                    <span className='tf-text style s1' style={{ fontSize: "15pt", marginTop: "10px", float: "right", color: "#5BF3E9" }}>Words remaining : {wordsCount} </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className="flat-bt-slider flex style2" style={{ marginTop: "30px" }}>
                                        {isEnable && (
                                            <>
                                                <button to="contact" spy={true} className="sc-button sc-button style-1 fl-button" onClick={startListening}>
                                                    {!listening ? "Start Listening" : "Stop Listening"}
                                                </button>
                                                {submitButton ? (
                                                    loadButton?(
                                                        <button to="contact" spy={true} className="sc-button sc-button style-2 btn-5"  style={{ marginLeft: '20px' }}><ThreeDots
                                                        visible={true}
                                                        height={20}
                                                        width={30}
                                                        color="#fff"
                                                        radius={9}
                                                        ariaLabel="three-dots-loading"
                                                        wrapperStyle={{}}
                                                        wrapperClass=""
                                                    /></button>
                                                ):(<button to="contact" spy={true} className="sc-button sc-button style-2 btn-5" onClick={() => resetting()} style={{ marginLeft: '20px' }}>Submit</button>
                                                )) : (
                                                    <button to="contact" spy={true} className="sc-button sc-button style-2 btn-5" onClick={() => NextQuestion()} style={{ marginLeft: '20px' }}>Next Question</button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="col-lg-4" style={{ paddingRight: "20px" }} >
                                    <Lottie
                                        animationData={animationData}
                                        loop={true}
                                        speed={1}
                                        style={{ width: '400px', height: '400px', float: "right" }}
                                    // className="animate-up"
                                    />
                                </div>
                                {/* <div className=" col-lg-4" style={{ paddingRight: "20px" }}>
                                    <div>
                                        <h2>Video Player</h2>
                                        {videoUrl && isEnable ? (
                                            <video
                                                width="400"
                                                height="400"
                                                autoPlay
                                                // controls
                                                onLoadedData={(event) => {
                                                    event.target.play();
                                                }}
                                                onError={handleVideoError}
                                                id="videoPlayer"
                                            >
                                                <source src={videoUrl} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : ''}
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Banner;
