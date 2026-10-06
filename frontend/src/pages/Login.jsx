import React, { useState } from 'react';
import '../scss/components/section.scss';
import Header from '../components/header/header.jsx';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const [roll_no, setRollNo] = useState("");
    const [password, setPassword] = useState("");
    const backendUrl = process.env.REACT_APP_PUBLIC_BACKEND_URL
    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            let isConfirm;
            const response = await axios.get(`${backendUrl}find-session-token/${roll_no}`, { withCredentials: true })
            if (response.data.sessionToken &&response.data.cookieToken!=undefined) {
                isConfirm = window.confirm("You have already logged in on another system. Do you want to continue? If you continue, you will be logged in on this system.");
                if (isConfirm) {
                    const isClearedSessionToken = await axios.post(`${backendUrl}update-session-token`, { roll_no });
                    if (isClearedSessionToken) {
                        if (isConfirm) {
                            const response = await axios.post(
                                `${backendUrl}login`,
                                {
                                    roll_no,
                                    password,
                                    confirmLogout: false,
                                },
                                { withCredentials: true }
                            );
    
                            if (response.status === 200) {
                                console.log(response.data);
                                alert(response.data.message);
                                navigate("/dashboard");
                            }
                        }
                    }
                }
            } else {
                const isClearToken = await axios.post(`${backendUrl}update-session-token`, { roll_no });
                if(isClearToken) {
                    const response = await axios.post(
                        `${backendUrl}login`,
                        {
                            roll_no,
                            password,
                            confirmLogout: false,
                        },
                        { withCredentials: true }
                    );
    
                    if (response.status === 200) {
                        console.log(response.data);
                        alert(response.data.message);
                        navigate("/dashboard");
                    }  
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                const confirmLogout = window.confirm(error.response.data.message);
                if (confirmLogout) {
                    try {
                        const confirmResponse = await axios.post(
                            `${backendUrl}login`,
                            {
                                roll_no,
                                password,
                                confirmLogout: true,
                            },
                            { withCredentials: true }
                        );

                        alert(confirmResponse.data.message);
                        navigate("/dashboard");
                    } catch (confirmError) {
                        alert(confirmError.response?.data?.message || "Error during confirmation login.");
                    }
                }
            } else {
                alert(error.response?.data?.message || "Login failed. Please try again.");
            }
        }
    };
    return (
        <div className='wrapper-style' id='wrapper'>
            <Header />
            <div className="tf-section flat-login flat-auctions-details" style={{ marginTop: "50px", height:"100svh" }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="wrap-login">
                                <div className="box-login post justify-content-center">
                                    <div className="heading-login">
                                        <h2 className="fw-5">SignIn</h2>
                                    </div>
                                    <form id="contactform" onSubmit={handleLogin}>
                                        <div className="form-login flat-form flex-one">
                                            <div className="info-login">
                                                <fieldset>
                                                    <p className="title-infor-account">Roll Number/ Interviewee Id</p>
                                                    <input
                                                        type="text"
                                                        name="roll_no"
                                                        value={roll_no}
                                                        onChange={(e) => setRollNo(e.target.value)}
                                                        placeholder='Enter Your Id here'
                                                        required
                                                    />
                                                </fieldset>
                                                <fieldset className="style-pass">
                                                    <p className="title-infor-account">Password</p>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="***************"
                                                        required
                                                    />
                                                </fieldset>
                                                <div className="row-form style-1 flex-two">
                                                    <Link to="/forgot-password" className="forgot-pass text-p">Forgot Password?</Link>
                                                </div>
                                                <button className="submit button-login" type="submit">
                                                    Signin
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
