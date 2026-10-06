import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../button/button-st1';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner'
import { useSpeechSynthesis } from 'react-speech-kit';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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
    let allQuestions = [];
    let maxWords = 200;
    let timeLeft = 30;

    const onEnd = () => {
        setIsEnable(true)
        setInterval(countdown, 1000);
        console.log(qna);
    };

    const { speak, voices } = useSpeechSynthesis({
        onEnd,
    });

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    const resetting = () => {
        if(currQuestionIndex<=1){
           if(currQuestionIndex < 1) {
            setSubmitButton(true)
           } 
            AddQuestions();
            setCurrQuestionIndex(currQuestionIndex + 1);
            setWordsCount(maxWords)
            setTextToCopy('')
            timeLeft = 30;
            setTimer(timeLeft)
            setIsEnable(false);
        }
        else{
            console.log('all questions completed')
            console.log(qna)
        }
        
    }



    const startListening = () => {
        if (!listening) {
            SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        } else {
            SpeechRecognition.stopListening();
        }
        console.log(listening);
    };

    const AddQuestions = ()=>{
        allQuestions[0] = {"question":questions[currQuestionIndex], "answer":textToCopy}
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
        SpeechRecognition.stopListening();
        timeLeft = -1;
        setTimer(timeLeft)
        // handleStopRecording();
        resetTranscript();
        setTimeout(() => { resetting() }, 5000);
    }
    //Next Question Ends

    //timer countdown starts
    var timerId;
    const countdown = () => {
        // console.log(isEnable);
        if (timeLeft == 0) {
            clearTimeout(timerId);
            // doSomething();
        } else {
            setTimer(timeLeft)
            timeLeft--;
        }
    }
    //timer countdown ends

    useEffect(() => {
        // axios.post("http://node.technicalhub.io:5001/api/generate-questions/").then(async (response) => {
        //     console.log(response.data.response.choices[0].message)
        //     let splitted = (response.data.response.choices[0].message.content).split('\n');
        //     console.log(splitted)
        //     setQuestions(splitted);
        // })
        setQuestions(["Can you explain the role of Node.js in web development?", "How does MongoDB differ from traditional SQL databases?",
        //  "What are the advantages of using React.js for front-end development?",
            // "How do you handle asynchronous tasks in Node.js?", "Can you explain the concept of middleware in Express.js?", "How do you ensure data security in MongoDB?", "Can you describe the process of building a RESTful API using Express.js?",
            // "What are some popular libraries or frameworks used in React.js development?", "How do you handle errors and exceptions in Node.js?", "Can you explain the concept of virtual DOM in React.js and its advantages?"
        ])
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
                <div className="wrap-heading flat-slider" style={{ background: "#AAADEC" }}>
                    {/* <img className="absolute mark-page8 animate-right" src="https://nuftireact.themesflat.co/static/media/mark2-slider-home2.46e66da655b6b36d10fe.png" alt="" /> */}
                    <div className="row">

                        <div className=" col-lg-6" style={{ padding: "25px" }}>
                            <h1 className="text-justify" style={{ textAlign: "justify", fontSize: "15pt", lineHeight: "25pt" }}><span className="" style={{ fontSize: "17pt", marginTop: "100px" }}>
                                <span style={{ paddingLeft: "12px", paddingRight: "12px", paddingTop: "5px", paddingBottom: "5px", borderRadius: "50%", marginRight: "10px", background: "#100B35", height: "50px", width: "50px", fontSize: "12pt" }}>{currQuestionIndex + 1}</span>
                            </span>{typeof (questions) !== 'undefined' ?
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
                            {
                                isEnable ? <button onClick={() => speak({ text: questions[currQuestionIndex], voice: voices[5] })}><img width="30" height="30" src="https://img.icons8.com/sf-black-filled/64/FFFFFF/high-volume.png" alt="high-volume" /></button> : <></>
                            }
                            <h2><span style={{ fontSize: "17pt", marginTop: "100px" }}>Your Answer : </span><span style={{ fontSize: "17pt", marginTop: "10px", color: "red", float: "right" }}>Words remaining : {wordsCount} </span></h2>
                            <h1 className="text-justify" style={{ textAlign: "justify", fontSize: "15pt", lineHeight: "25pt", color: "#5257af" }}><span className="tf-text style s1">{textToCopy}</span>  </h1>
                            {/* <p className="sub-heading" style={{height:"100%", borderRadius:"20px"}}><span style={{padding:"20px"}}>{item.subtitle}</span></p> */}
                            <div className="flat-bt-slider flex style2" style={{ marginTop: "30px" }}>
                                {/* <Button title={isListening ? 'Listening...' : 'Start Listening'} addclass='sc-button style-1 fl-button' onClick={handleStartListening} /> */}
                            </div>
                            {
                                isEnable ? (<div className="btn-bar" data-aos="fade-up" data-aos-duration="800" data-aos-delay="500">
                                    <button to="contact" spy={true} className="px-btn" onClick={startListening}>
                                        {!listening ? "Start Listening" : "Stop Listening"}
                                    </button>
                                    <button to="contact" spy={true} className="px-btn" onClick={()=>NextQuestion()} style={{ marginLeft: '20px' }}>
                                        {submitButton ==true?"Submit":"Next Question"}
                                    </button>
                                </div>) : (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: "400px", width: "100%", margin: "0 auto" }}>
                                    <ThreeDots
                                        visible={true}
                                        height="80"
                                        width="80"
                                        color="#100C39"
                                        radius="9"
                                        ariaLabel="three-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClass=""
                                    />
                                </div>)
                            }


                        </div>

                        <div className=" col-lg-6" style={{ paddingRight: "20px" }} >
                            <h2 className='' style={{ float: "right", paddingTop: "10px", paddingRight: "10px" }}>0:{timer}</h2>
                            <img style={{ float: "right" }} className="animate-up" src="https://nuftireact.themesflat.co/static/media/mark1-slider-home2.53082817d3688d7cfcf6.png" alt="" />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
export default Banner;