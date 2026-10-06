import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from '../../button/button-st1';
import { useState } from 'react';
import Header from '../../header/header.jsx';
import InterviewDetails from '../interview-details';
import dataBanner from '../../../assets/fake-data/data-banner';
import { useSpeechSynthesis } from 'react-speech-kit';
import { Link } from "react-router-dom";
import '../../../scss/components/section.scss';

import icon from '../../../assets/images/icon/icon-check.svg';
import Webcam from 'react-webcam';
import axios from 'axios';
Rules.propTypes = {
    item: PropTypes.object,
};

function Rules(props) {
    const [test, setTest] = useState(false);
    const { item } = props;
    const [timer, setTimer] = useState(15);
    const [imageUrl, setImageUrl] = useState()
    const intervieweeDetails = JSON.parse(localStorage.getItem('intervieweeDetails'));
    useEffect(async () => {
        const res = await axios.post(`http://192.168.7.199/camera_control/control.php`, { action: "START", roll_no: item.roll_no })
        console.log(res)
    }, [item])
    console.log(item)
    useEffect(() => {
        setImageUrl(`https://mobile.technicalhub.io:5010/uploads/students-images/${item.roll_no}.png`)
    }, [item])
    useEffect(() => {
        if (timer > 0) {
            const timerInterval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);

            return () => clearInterval(timerInterval);
        } else if (timer === 0) {
            setTest(true);
        }
    }, [timer]);

    const startTest = (e) => {
        e.preventDefault();
        setTest(true);
        if (item.gender === "male") {
            speak({ text: "Hello mr." + intervieweeDetails.interviewee_name, voice: voices[5] });
        } else {
            speak({ text: "Hello miss." + intervieweeDetails.interviewee_name, voice: voices[5] });
        }
    };

    const onEnd = () => { };

    const { speak, voices } = useSpeechSynthesis({
        onEnd,
    });
    const handleError = () => {
        let dummyImage;
        if (item && item.gender == 'male') {
            dummyImage = "https://maya.technicalhub.io/assets/icons/boy.png";
        } else {
            dummyImage = "https://maya.technicalhub.io/assets/icons/girl.png";
        }
        setImageUrl(dummyImage);
    };
    return (
        <div className='wrapper-style' id='wrapper'>
            {!test ?
                <div
                    className="tf-section flat-help home2"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        backgroundColor: "#1c1c1c",
                        marginTop: "140px"
                    }}
                >
                    <div
                        className="themes-container3 style-container"
                        style={{
                            backgroundColor: "#2b2b2b",
                            borderRadius: "15px",
                            padding: "0px 0px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                            width: "1000px",
                            border: "1px solid #ffffff3d",
                        }}
                    >
                        {/* Header Section */}
                        <div
                            style={{
                                backgroundColor: "#333",
                                borderRadius: "10px",
                                padding: "10px 15px",
                                marginBottom: "20px",
                                textAlign: "center",
                                border: "1px solid #444",
                            }}
                        >
                            <h2
                                style={{
                                    color: "#fff",
                                    fontSize: "20px",
                                    margin: 0,
                                    fontFamily: "Orbitron, sans-serif",
                                }}
                            >
                                INSTRUCTIONS
                            </h2>
                        </div>
                        <p
                            style={{
                                color: "#fff",
                                fontSize: "14px",
                                marginBottom: "20px",
                                fontFamily: "Orbitron, sans-serif",
                                paddingLeft: "30px",
                                paddingRight: "30px",
                                textAlign: "center"
                            }}
                        >
                            * YOUR TEST IS ABOUT TO START IN{" "}
                            <span style={{ color: "#00ffcc" }}>{`00:${timer.toString().padStart(2, '0')} SEC`}</span> *
                        </p>
                        {/* Content Section */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                paddingLeft: "30px",
                                paddingRight: "30px"
                            }}
                        >
                            {/* Left Section */}
                            <div style={{ flex: "1" }}>
                                <div
                                    style={{
                                        backgroundColor: "#3b3b3b",
                                        borderRadius: "10px",
                                        padding: "15px",
                                        marginBottom: "20px",
                                        boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                                        fontFamily: "Orbitron, sans-serif",
                                    }}
                                >
                                    <p
                                        style={{
                                            color: "#fff",
                                            fontSize: "16px",
                                            margin: "0 0 5px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {item.roll_no}
                                    </p>
                                    <p
                                        style={{
                                            color: "#fff",
                                            fontSize: "16px",
                                            margin: "0 0 10px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {item.first_name}
                                    </p>
                                    <p
                                        style={{
                                            color: "#aaa",
                                            fontSize: "14px",
                                            margin: 0,
                                        }}
                                    >
                                        {item.technology_name}
                                    </p>
                                    <p
                                        style={{
                                            color: "#aaa",
                                            fontSize: "14px",
                                            margin: 0,
                                        }}
                                    >
                                        {item.module_details.map((ele, i) => (
                                            <>
                                                <span key={ele._id}>
                                                    {ele.module_name} - {ele.topic_names.join(", ")}
                                                    {i < item.module_details.length - 1 && ", "}
                                                </span><br />
                                            </>
                                        ))}
                                    </p>
                                </div>
                                <p style={{ color: "#fff", fontSize: "14px", margin: "10px 0" }}>
                                    This is a fully automated boot and every moment is digitally monitored.
                                </p>
                                <p style={{ color: "#fff", fontSize: "14px", margin: "10px 0" }}>
                                    Refrain from using your mobile phone at all times.
                                </p>
                                <p style={{ color: "#fff", fontSize: "14px", margin: "10px 0" }}>
                                    Look at the screen and focus on your interview as your facial expressions and confidence rating depends on this.
                                </p>
                                <p style={{ color: "#fff", fontSize: "14px", margin: "10px 0" }}>
                                    Respond to each question within 60 seconds.
                                </p>
                                <p style={{ color: "#fff", fontSize: "14px", margin: "10px 0" }}>
                                    Good luck with your interview.
                                </p>
                                {/* <p style={{ color: "#fff", fontSize: "14px", margin: "10px 0" }}>
                                    You are the (  ) person to test the pod..
                                </p> */}
                            </div>

                            {/* Right Section */}
                            <div style={{ marginLeft: "20px", flexShrink: 0 }}>
                                <img
                                    src={imageUrl}
                                    alt="Hexagon"
                                    style={{ marginTop: "20px" }}
                                    onError={handleError} className='coding-studentimage'
                                    width="400px"
                                />

                            </div>
                        </div>
                    </div>
                </div>
                : (
                    <InterviewDetails data={item} />
                )}

        </div>
    );
}

export default Rules;
