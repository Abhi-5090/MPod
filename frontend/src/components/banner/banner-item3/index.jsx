import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from '../../button/button-st1';
import { useState } from 'react';
import Header from '../../header/header.jsx';
import Bannerr from '../banner-v2';
import dataBanner from '../../../assets/fake-data/data-banner';
import { useSpeechSynthesis } from 'react-speech-kit';
import { Link } from "react-router-dom";
import '../../../scss/components/section.scss';
 
import html2canvas from 'html2canvas';
 
import img1 from '../../../assets/images/box-item/edit-profile.jpg';
// import img2 from '.././assets/images/box-item/edit-profile-2.jpg';
import icon from '../../../assets/images/icon/icon-check.svg';
import Webcam from 'react-webcam';
 
Banner.propTypes = {
    item: PropTypes.object,
};
 
function Banner(props) {
 
    const [test, setTest] = useState(false);
    const { item } = props;
 
    const intervieweeDetails = JSON.parse(localStorage.getItem('intervieweeDetails'));
    console.log(intervieweeDetails)
 
    const startTest = (e) => {
        e.preventDefault();
        setTest(true);
        if (item.gender == "male") {
            speak({ text: "Hello mr." + intervieweeDetails.interviewee_name, voice: voices[5] });
        }
        else {
            speak({ text: "Hello miss." + intervieweeDetails.interviewee_name, voice: voices[5] });
 
        }
    };
    const onEnd = () => {
 
    };
    const { speak, voices } = useSpeechSynthesis({
        onEnd,
    });
 
    const webcamRef = useRef(null);
    const [intervalId, setIntervalId] = useState(null);
 
    const handleUserMedia = useCallback((stream) => {
      webcamRef.current.video.srcObject = stream;
    }, []);
 
    const captureScreenshot = () => {
      const screenshot = webcamRef.current.getScreenshot();
 
      if (screenshot) {
        showNotification('Screenshot Taken', { body: 'Click to view', image: screenshot });
      }
    };
 
    const showNotification = (title, options) => {
      if (Notification.permission === 'granted') {
        new Notification(title, options);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, options);
          }
        });
      }
    };
 
    const startInterval = () => {
      const id = setInterval(captureScreenshot, 5000);
      setIntervalId(id);
    };
 
    const stopInterval = () => {
      clearInterval(intervalId);
      setIntervalId(null);
    };
 
    useEffect(() => {
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [intervalId]);
    // useEffect(() => {
    //     speak({ text: "Hello mr." + item.interviewee_name, voice: voices[5] });
    // }, []);
    return (
        <div className="themes-container2">
            {!test ?
                <div className='' id='wrapper'>
                    <div className="tf-section flat-explore flat-edit-profile flat-auctions-details ">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-9 col-lg-8">
                                    <h1 className="heading">Rules </h1>
                                    <div style={{ fontSize: "17pt" }}>
                                        <ul style={{ listStyleType: 'none', padding: 0, borderRadius: '8px', margin: '20px auto', padding: '30px' }}>
                                            <li style={{ marginBottom: '25px' }}>
                                                <span style={{ fontWeight: 'normal', color: '#fff' }}>Provide response to each question in 200 words</span>
                                            </li>
                                            <li style={{ marginBottom: '25px' }}>
                                                <span style={{ fontWeight: 'normal', color: '#fff' }}>Respond to each question within 30 seconds.</span>
                                            </li>
                                            <li style={{ marginBottom: '25px' }}>
                                                <span style={{ fontWeight: 'normal', color: '#fff' }}>Make sure your microphone is activated before providing each response.</span>
                                            </li>
                                            <li>
                                                <span style={{ fontWeight: 'normal', color: '#fff' }}>Say the words right, so your voice comes through correctly.</span>
                                            </li>
                                        </ul>
                                        {/* <div>
                                            <Webcam
                                                audio={false}
                                                ref={webcamRef}
                                                screenshotFormat="image/png"
                                                onUserMedia={handleUserMedia}
                                            />
 
                                            <button onClick={captureScreenshot}>Capture Screenshot</button>
                                            <button onClick={startInterval}>Start Interval</button>
                                            <button onClick={stopInterval}>Stop Interval</button>
                                        </div> */}
                                    </div>
                                    <div className="flat-bt-slider flex style2">
                                        {/* <Button title='Start Your Test' addclass='sc-button style-1 fl-button' path='/explore' /> */}
                                        {/* <Button title='Collect NFT' addclass='sc-button style-2 btn-5' path='/liveAuction' /> */}
                                        <button id="submit" name="submit" type="submit" onClick={startTest}>
                                            Start Your Test
                                        </button>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4">
                                    <div className="author-profile">
                                        <div className="feature-profile center">
                                            <div className="wrap-img flex j-content">
                                                <div className="img-box relative">
                                                    {console.log(`https://thecodemind.io/app/studentpics/${item.interviewee_id}.png`)}
                                                    <img className="avatar animate-up" id="profileimg" src={typeof (item) != 'undefined' ? `https://thecodemind.io/app/studentpics/${item.interviewee_id}.png` : ''} />
                                                    {/* <img className="check absolute" src={icon} alt="" /> */}
                                                </div>
                                            </div>
 
                                            <div id="upload-profile">
                                                <h2 style={{ marginBottom: "20px", marginTop: "20px" }}>{typeof (item) != 'undefined' ? item.interviewee_name : "technology"}</h2>
                                                <h3 style={{ marginBottom: "20px" }}>{typeof (item) != 'undefined' ? item.interviewee_id : "technology"} </h3>
                                                <h3 style={{ marginBottom: "20px" }}>{typeof (item) != 'undefined' ? item.technology_name : "technology"} </h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
 
                            </div>
                        </div>
                    </div>
                </div>
                : (
                    <Bannerr data={dataBanner} />
                )}
 
        </div>
    );
}
 
export default Banner;