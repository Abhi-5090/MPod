import React, { useState } from 'react';
import '../scss/components/section.scss';
import Header from '../components/header/header.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const backendUrl = process.env.REACT_APP_PUBLIC_BACKEND_URL;

    const handleOTP = async () => {
        try {
            const response = await axios.post(`${backendUrl}send-otp`, {
                roll_no: rollNo
            });
            if (response.status === 200) {
                setIsSent(true);
                alert("OTP sent to your email.");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to send OTP");
        }
    };

    const handleEnter = async () => {
        try {
            const response = await axios.post(`${backendUrl}check-otp`, {
                roll_no: rollNo,
                otp
            });

            if (response.status === 200) {
                setIsCorrect(true);
                alert("OTP Verified Successfully");
            } else {
                alert("Invalid OTP");
            }
        } catch (err) {
            console.error(err);
            alert("Invalid OTP or server error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otp || !newPassword || !confirmPassword || !rollNo) {
            alert("Please fill all the fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const response = await axios.post(`${backendUrl}reset-password`, {
                roll_no: rollNo,
                otp,
                new_password: newPassword
            });

            if (response.data.success) {
                alert("Password reset successful!");
                navigate("/login");
            } else {
                alert(response.data.message || "Reset failed.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong!");
        }
    };

    return (
        <div className='wrapper-style' id='wrapper'>
            <Header />
            <div className="tf-section flat-login flat-auctions-details" style={{ marginTop: "150px", marginBottom: "70px" }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="wrap-login">
                                <div className="box-login post justify-content-center">
                                    <div className="heading-login">
                                        <h2 className="fw-5">Reset Password</h2>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-login flat-form flex-one">
                                            <div className="info-login">
                                                {!isCorrect && (
                                                    <>
                                                        <fieldset>
                                                            <p className="title-infor-account">Roll Number</p>
                                                            <input
                                                                type="text"
                                                                value={rollNo}
                                                                onChange={(e) => setRollNo(e.target.value)}
                                                                placeholder="Enter Roll Number"
                                                                required
                                                            />
                                                        </fieldset>

                                                        {isSent && (
                                                            <fieldset>
                                                                <p className="title-infor-account">OTP</p>
                                                                <input
                                                                    type="text"
                                                                    value={otp}
                                                                    onChange={(e) => setOtp(e.target.value)}
                                                                    placeholder="Enter OTP"
                                                                    required
                                                                />
                                                            </fieldset>
                                                        )}

                                                        {!isSent ? (
                                                            <button
                                                                className="button-login"
                                                                type="button"
                                                                onClick={handleOTP}
                                                            >
                                                                Send OTP
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="button-login"
                                                                type="button"
                                                                onClick={handleEnter}
                                                            >
                                                                Check OTP
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {isCorrect && (
                                                    <>
                                                        <fieldset className="style-pass">
                                                            <p className="title-infor-account">New Password</p>
                                                            <input
                                                                type="password"
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                                placeholder="***************"
                                                                required
                                                            />
                                                        </fieldset>

                                                        <fieldset className="style-pass">
                                                            <p className="title-infor-account">Re-enter New Password</p>
                                                            <input
                                                                type="password"
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                placeholder="***************"
                                                                required
                                                            />
                                                        </fieldset>

                                                        <button
                                                            className="submit button-login"
                                                            type="submit"
                                                        >
                                                            Reset Password
                                                        </button>
                                                    </>
                                                )}
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

export default ResetPassword;
