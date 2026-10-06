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
    const [timer, setTimer] = useState(30);
    const [wordsCount, setWordsCount] = useState(200);
    const [qna, setQna] = useState([]);
    const [submitButton, setSubmitButton] = useState(false);
    let timerId;
    let [newTimerId, setNewTimerId] = useState();
    let [answerTime, setAnswerTime] = useState();

    let isNext = false;
    const [qa, setQa] = useState([]);
    let allQuestions = [];
    let maxWords = 200;
    let timeLeft = 30;
    const navigate = useNavigate();
    var id = localStorage.getItem('id')
    const onEnd = () => {
        setIsEnable(true)
        timerId = setInterval(countdown, 1000);
        setNewTimerId(timerId);
        console.log(newTimerId + "first")
        // setAnswerTime(30)
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

    const resetting = () => {
        if (currQuestionIndex < 4) {
            if (currQuestionIndex < 4) {
                setSubmitButton(true)
            }
            AddQuestions();
            setCurrQuestionIndex(currQuestionIndex + 1);
            setWordsCount(maxWords)
            setTextToCopy('')
            // answerTime = timeLeft;
            timeLeft = 30;
            setTimer(timeLeft)
            setIsEnable(false);
            setAnswerTime(timeLeft)
        }
        else {
            AddQuestions();
            // console.log(qna)
            console.log('all questions completed')
            setQa(qna)


        }

    }

    useEffect(() => {
        
        console.log(qa);
        qa.map((ele, index) => {
            console.log(timeLeft)
            const data = { ...ele, id };
            console.log(data)
            axios.post("http://node.technicalhub.io:5001/api/get-accuracy/", data).then(async (response) => {
                if (response.data) {
                    navigate('/blog-details');
                }
            })
        })
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
        console.log(answerTime)
        console.log(30 - answerTime)
        allQuestions[0] = { "question": questions[currQuestionIndex], "answer": textToCopy, "time": (30 - answerTime) }
        qna[currQuestionIndex] = allQuestions[0]
        // console.log(qna)
    }


    //setting remaining words count starts
    const countWords = (str) => {
        const arr = str.split(' ');
        let words = arr.filter(word => word !== '').length
        if (wordsCount > 0 && timer > 0) {
            setWordsCount(maxWords - words)
            setTextToCopy(transcript)
        } else if (wordsCount <= 0 || timer <= 0) {
            NextQuestion();
            SpeechRecognition.stopListening();
            // handleStopRecording();
            resetTranscript();
            setTimeout(() => { resetting() }, 5000);
        }
    }

    useEffect(() => {
        countWords(transcript)
    }, [transcript, timer])
    //setting remaining words count ends

    const { item } = props;

    //Next question starts
    const NextQuestion = () => {
        isNext = true;
        SpeechRecognition.stopListening();
        // timeLeft = -1;
        // setTimer(timeLeft)
        // handleStopRecording();
        clearInterval(newTimerId);
        resetTranscript();
        setTimeout(() => { resetting() }, 5000);
    }
    //Next Question Ends

    //timer countdown starts

    const countdown = () => {
        // console.log(isEnable);
        if (timeLeft == 0) {
            clearInterval(newTimerId);
        } else {

            timeLeft--;
            setTimer(timeLeft)
            setAnswerTime(timeLeft)
        }
    }
    //timer countdown ends

    useEffect(() => {
        axios.post("http://node.technicalhub.io:5001/api/generate-questions/").then(async (response) => {
            // console.log(response.data.response.choices[0].message)
            let splitted = (response.data.response.choices[0].message.content).split('\n');
            console.log(splitted)
            const updatedSplitted = splitted.map((question, index) => {
                return question.replace(/^\d+\.\s*/, '').trim();
            });
            setQuestions(updatedSplitted);
        })
        // setQuestions(["Can you explain the role of Node.js in web development?", "How does MongoDB differ from traditional SQL databases?",
        //     //  "What are the advantages of using React.js for front-end development?",
        //     // "How do you handle asynchronous tasks in Node.js?", "Can you explain the concept of middleware in Express.js?", "How do you ensure data security in MongoDB?", "Can you describe the process of building a RESTful API using Express.js?",
        //     // "What are some popular libraries or frameworks used in React.js development?", "How do you handle errors and exceptions in Node.js?", "Can you explain the concept of virtual DOM in React.js and its advantages?"
        // ])
    }, [])

    //Question audio after loading the question starts
    useEffect(() => {
        if (typeof (questions) != 'undefined') {
            speak({ text: questions[currQuestionIndex], voice: voices[5] })
        }
    }, [questions, currQuestionIndex])
    //Question audio after loading the question ends


    if (!browserSupportsSpeechRecognition) {
        alert("not listening")
        return <span>Browser doesn't support speech recognition.</span>;
    }

    return (
        <div className="themes-container2 themes-slider">
            <div className="flat-wrap" style={{ padding: "27px", border: "3px dashed rgba(255, 255, 255, 0.07)", borderRadius: "10px", zIndex: "5" }}>
                <div className="wrap-heading flat-slider">
                    {/* <img className="absolute mark-page8 animate-right" src="https://nuftireact.themesflat.co/static/media/mark2-slider-home2.46e66da655b6b36d10fe.png" alt="" /> */}
                    <div className="row" >
                        <div className=" col-lg-8" style={{ padding: "25px" }}>
                            <div className="row" style={{ marginBottom: "20px" }}>
                                <div className="col-lg-1">
                                    <button className='speak-btn' onClick={() => speak({ text: questions[currQuestionIndex], voice: voices[5] })}>{currQuestionIndex + 1}</button>
                                </div>
                                <div className="col-lg-9">
                                    {/* <span style={{ paddingLeft: "12px", paddingRight: "12px", paddingTop: "5px", paddingBottom: "5px", borderRadius: "50%", marginRight: "10px", background: "#100B35", height: "50px", width: "50px", fontSize: "12pt" }}>{currQuestionIndex + 1}</span> */}
                                    <h1 className="text-justify" style={{ textAlign: "justify", fontSize: "15pt", lineHeight: "25pt" }}>
                                        <span className="" style={{ fontSize: "17pt", marginTop: "100px" }}></span>
                                        {typeof (questions) !== 'undefined' ?
                                            <span className="tf-text style s1">{questions[currQuestionIndex]}</span> :
                                            <ThreeDots
                                                visible={true}
                                                height="80"
                                                width="80"
                                                color="#100C39"
                                                radius="9"
                                                ariaLabel="three-dots-loading"
                                                wrapperStyle={{}}
                                                wrapperClass=""
                                            />}</h1>
                                </div>
                                <div className="col-lg-1">
                                    {
                                        isEnable ? !speaking ? <button className='speak-btn' onClick={() => speak({ text: questions[currQuestionIndex], voice: voices[5] })}><img width="20px" height="20px" src="https://img.icons8.com/sf-black-filled/64/FFFFFF/high-volume.png" alt="high-volume" /></button> : <button className='speak-btn' onClick={() => cancel()}><img width="20px" height="20px" src="https://image.pngaaa.com/825/4441825-middle.png" alt="high-volume" /></button> : <></>
                                    }
                                </div>
                            </div>
                            {
                                isEnable ?
                                    (
                                        <>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <span className='tf-text style s1' style={{ fontSize: "15pt", marginTop: "10px",color:"#5BF3E9" }}>Your Answer : </span>
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
                                                    <span className='tf-text style s1' style={{ fontSize: "15pt", marginTop: "10px", float: "right", color:"#5BF3E9"}}>Words remaining : {wordsCount} </span>
                                                </div>
                                            </div></>)
                                    :
                                    <></>
                            }
                            <div className="flat-bt-slider flex style2" style={{ marginTop: "30px" }}>
                                {/* <Button title={isListening ? 'Listening...' : 'Start Listening'} addclass='sc-button style-1 fl-button' onClick={handleStartListening} /> */}
                            </div>
                            {
                                isEnable ? (<div className="btn-bar" data-aos="fade-up" data-aos-duration="800" data-aos-delay="500">
                                    <button to="contact" spy={true} className="sc-button sc-button style-1 fl-button" onClick={startListening}>
                                        {!listening ? "Start Listening" : "Stop Listening"}
                                    </button>
                                    {submitButton == true ?
                                        <button to="contact" spy={true} className="sc-button sc-button style-2 btn-5" onClick={() => NextQuestion()} style={{ marginLeft: '20px' }}>Submit</button>
                                        :
                                        <button to="contact" spy={true} className="sc-button sc-button style-2 btn-5" onClick={() => NextQuestion()} style={{ marginLeft: '20px' }}>Next Question</button>
                                    }

                                </div>) : (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: "300px", width: "100%", margin: "0 auto" }}>
                                    <ThreeDots
                                        visible={true}
                                        height="80"
                                        width="80"
                                        color="#fff"
                                        radius="9"
                                        ariaLabel="three-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClass=""
                                    />
                                </div>)
                            }
                        </div>

                        <div className=" col-lg-4" style={{ paddingRight: "20px" }} >
                            <Lottie
                                animationData={animationData}
                                loop={true}
                                speed={1}
                                style={{ width: '400px', height: '400px', float: "right" }}
                                className="animate-up"
                            />
                            {/* <img style={{ float: "right" }} className="animate-up" src="https://nuftireact.themesflat.co/static/media/mark1-slider-home2.53082817d3688d7cfcf6.png" alt="" /> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Banner;