import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import Banner from '../components/banner/banner-v2';
import dataBanner from '../assets/fake-data/data-banner';
import Rules from '.././components/rules/rules.jsx';
function Home2(props) {
    const [banner, setBanner] = useState(false);
    const [intervieweeId, setIntervieweeId] = useState('');
    const [rules, setRules] = useState(false);
    const [details, setDetails] = useState()
    const backendUrl= process.env.REACT_APP_PUBLIC_BACKEND_URL
    const EnableQuestions = async (e) => {
        e.preventDefault();
        if (!intervieweeId.trim()) {
            toast.error('Please enter Interviewee ID.');
            return;
        }
        try {
            // const res = await axios.post(`http://192.168.7.188/camera_control/control.php`, {action:"START", roll_no:intervieweeId})
            // console.log(res)
            const response = await axios.post(`${backendUrl}get-interviewee-details`,{roll_no:intervieweeId});
            if(response.data==null) {
                alert("No interview scheduled on this time")
            }
            if (response.data) {
                setRules(true);
                setDetails(response.data);
                localStorage.setItem('intervieweeDetails', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Error fetching interviewee details:', error);
            toast.error('Error fetching interviewee details.');
        }
    };

    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}

            {!rules ? (
                <div
                    className="tf-section flat-help home2"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        backgroundColor: "#1c1c1c",
                    }}
                >
                    <div
                        className="home-themes-container3 style-container"
                        style={{
                            backgroundColor: "#3c3a3a",
                            borderRadius: "15px",
                            // padding: "30px 40px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                            width: "600px",
                            border: "1px solid #ffffff3d",
                            marginTop:"140px"
                        }}
                    >
                        {/* Header Section */}
                        <div
                            style={{
                                backgroundColor: "#282828",
                                // borderRadius: "10px",
                                padding: "10px 15px",
                                marginBottom: "20px",
                                textAlign: "center",
                                border: "1px solid #444",
                                borderTopLeftRadius:"15px",
                                borderTopRightRadius:"15px",

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
                                ENTER ID/ROLL NUMBER
                            </h2>
                        </div>

                        {/* Content Section */}
                        <div
                            style={{
                                paddingLeft:"10px",
                                paddingRight:"10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            {/* Input Field */}
                            <div style={{ flex: "1" }}>
                                <form
                                    id="subscribe-form"
                                    action="#"
                                    method="GET"
                                    acceptCharset="utf-8"
                                    style={{ display: "flex", alignItems: "center" }}
                                >
                                    <input
                                        name="intervieweeId"
                                        className="intervieweeId"
                                        type="text"
                                        placeholder="Enter ID/Roll Number"
                                        value={intervieweeId}
                                        onChange={(e) => setIntervieweeId(e.target.value)}
                                        required
                                        style={{
                                            flex: "1",
                                            padding: "10px 15px",
                                            border: "none",
                                            borderRadius: "8px",
                                            marginRight: "10px",
                                            fontSize: "14px",
                                            color: "#ffffff",
                                            backgroundColor: "#525252",
                                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                                            fontFamily: "Orbitron, sans-serif",
                                        }}
                                    />
                                    <button
                                        id="submit"
                                        name="submit"
                                        type="submit"
                                        onClick={EnableQuestions}
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            backgroundColor: "#555",
                                            borderRadius: "8px",
                                            padding: "10px",
                                            border: "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <i
                                            className="far fa-long-arrow-right"
                                            style={{ color: "#fff", fontSize: "16px" }}
                                        ></i>
                                    </button>
                                </form>
                            </div>
                            {/* Right Section */}
                            <div style={{ marginLeft: "20px" }}>
                                <img
                                    src={"/assets/maya.png"}
                                    alt="Maya"
                                    style={{
                                        width: "150px",
                                        height: "auto",
                                        display: "block",
                                        borderRadius: "10px",
                                        filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <ToastContainer position="top-right" />
                </div>
            ) : (
                <Rules data={details} />
                // <Banner data={dataBanner} />
            )}
        </div>
    );
}

export default Home2;
