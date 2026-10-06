import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../button/button-st1';
import { useState } from 'react';
import Header from '../../header/header.jsx';
import Bannerr from '../banner-v2';
import dataBanner from '../../../assets/fake-data/data-banner';
import { useSpeechSynthesis } from 'react-speech-kit';

Banner.propTypes = {
    item: PropTypes.object,
};

function Banner(props) {

    const [test, setTest] = useState(false);
    const { item } = props;
    console.log(item)
    const startTest = (e) => {
        e.preventDefault();
        setTest(true);
        if (item.gender == "male") {
            speak({ text: "Hello mr." + item.interviewee_name, voice: voices[5] });
        }
        else {
            speak({ text: "Hello miss." + item.interviewee_name, voice: voices[5] });

        }
    };
    const onEnd = () => {

    };
    const { speak, voices } = useSpeechSynthesis({
        onEnd,
    });
    // useEffect(() => {
    //     speak({ text: "Hello mr." + item.interviewee_name, voice: voices[5] });
    // }, []);
    return (
        <div className="themes-container2">
            {!test ?
                <div className="flat-wrap">
                    <div className="wrap-heading flat-slider flex" >
                        <div className="row" style={{width:"100%"}}>
                        <div className="col-lg-9">
                            <div className="content">
                                <h1 className="heading">Rules.... </h1>
                                <p className="sub-heading">Answer all the questions within 200 words.</p>
                                <p className="sub-heading">You have 30 seconds to respond to each question.</p>
                                <p className="sub-heading">Ensure that your microphone is turned on every time you are about to answer.</p>
                                <p className="sub-heading">Pronounce the words properly to capture your voice accurately.</p>
                                <div className="flat-bt-slider flex style2">
                                    {/* <Button title='Start Your Test' addclass='sc-button style-1 fl-button' path='/explore' /> */}
                                    {/* <Button title='Collect NFT' addclass='sc-button style-2 btn-5' path='/liveAuction' /> */}
                                    <button id="submit" name="submit" type="submit" onClick={startTest}>
                                        Start Your Test
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3" style={{marginTop:"123px"}}>
                            <div className="img-slider">
                                <div >
                                    <div className="image ">
                                        <img className="animate-up" style={{height:""}} src="http://node.technicalhub.io:3010/assets/dummy.svg" alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className='flat-slider'>
                                <h2>{item.interviewee_name}</h2>
                            </div>
                        </div>
                        </div>
                    </div>
                </div> : (
                    <Bannerr data={dataBanner} />
                )}
        </div>
    );
}

export default Banner;