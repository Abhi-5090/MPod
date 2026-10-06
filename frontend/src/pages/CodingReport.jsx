import React, { useState, useEffect, useRef } from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import { Accordion } from 'react-bootstrap-accordion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import generatePDF from "react-to-pdf";
import { useSearchParams } from 'react-router-dom';
import DOMPurify from "dompurify";

import logo from '../assets/images/logo/mayalogo.png'
import { AiOutlineDownload } from "react-icons/ai";
import axiosInstance, { attemptTokenFor, forgetAttemptTokens } from "../api/axiosInstance";


function CodingReport(props) {
    const ref = useRef();
    const [searchParams] = useSearchParams();
    const roll_no = searchParams.get('roll_no');
    const interview_type = searchParams.get('interview_type');
    const id = searchParams.get('id');

    const [qna, setQna] = useState([]);
    const [accuracy, setAccuracy] = useState();
    const [accuracysum, setAccuracySum] = useState(0);
    const [accuracyAverage, setAccuracyAverage] = useState(0);
    const [totalDuration, setTotalDuration] = useState();
    const [loading, setLoading] = useState(true);
    const frontendUrl = process.env.REACT_APP_PUBLIC_FRONTEND_URL;
    const [imageUrl, setImageUrl] = useState()
    const [emotions, setEmotions] = useState()
    const [imageLoaded, setImageLoaded] = useState(false);
    const backendImageUrl = process.env.REACT_APP_PUBLIC_BACKEND_IMAGE_URL;
    const frontendImageUrl = process.env.REACT_APP_PUBLIC_FRONTEND_URL;
    useEffect(() => {
        if (!roll_no) {
            console.error("Roll number is missing. Cannot load report.");
            setLoading(false);
            return;
        }
        setImageUrl(`${backendImageUrl}profile-pics/${roll_no}.png`);
    }, [roll_no]);


    const handleError = () => {
        let dummyImage;
        if (user && user.gender == 'male') {
            dummyImage = "/boy.png";
        } else {
            dummyImage = "/girl.png";
        }
        setImageUrl(dummyImage);
    };
    const options = {
        filename: "InterviewReport.pdf",
        page: {
            margin: 20
        }
    };
    const getTargetElement = () => document.getElementById("container");
    const downloadPdf = () => {
        if (imageLoaded && roll_no) {
            const container = document.getElementById("container");

            // Temporarily show content for PDF generation
            container.style.visibility = "visible";
            container.style.position = "static";

            generatePDF(ref, options)
                .then(() => {
                    // Hide it again after generating the PDF
                    container.style.visibility = "hidden";
                    container.style.position = "absolute";
                    container.style.left = "-9999px";
                })
                .catch((err) => console.error("PDF Generation Error: ", err));
        } else {
            console.log("Wait for the image to load or check roll_no.");
        }
    };
    // useEffect(() => {
    //     const handleBeforeUnload = () => {
    //         localStorage.removeItem("intervieweeDetails");
    //     };

    //     window.addEventListener("beforeunload", handleBeforeUnload);

    //     return () => {
    //         window.removeEventListener("beforeunload", handleBeforeUnload);
    //     };
    // }, []);
    const handleImageLoad = () => {
        setImageLoaded(true); // Image loaded
    };
    const [lowAverage, setLowAverage] = useState();
    const [mediumAverage, setMediumAverage] = useState();
    const [highAverage, setHighAverage] = useState();
    const [confidenceAverage, setConfidenceAverage] = useState();
    const [strengths, setStrengths] = useState([]);
    const [improvements, setImprovements] = useState([])
    const [interviewParameters, setInterviewParameters] = useState()
    const [user, setUser] = useState()
    const [startDate, setStartDate] = useState()
    useEffect(() => {
        setLoading(true); // Start loading
        axiosInstance.get("get-coding-report-details/" + encodeURIComponent(id) + "/" + encodeURIComponent(interview_type) + "/" + encodeURIComponent(roll_no), { headers: attemptTokenFor(id) ? { "X-Attempt-Token": attemptTokenFor(id) } : {} })
            .then((response) => {
                if (response.data) {
                    setQna(response.data.question_details);
                    setUser(response.data.user_details)
                    setEmotions(response.data.emotions[0]);
                    setStartDate(response.data.start_date_time_ist)
                    // setStrengths(response.data.overall_analysis.strengths);
                    // setImprovements(response.data.overall_analysis.areas_of_improvement);
                    // setInterviewParameters(response.data.overall_analysis.interview_parameters);
                    // console.log(response.data.overall_analysis.interview_parameters)
                    const questionDetails = response.data.question_details;
                    const sum = questionDetails.reduce((acc, ele) => acc + Number(ele.accuracy), 0);
                    const average = questionDetails.length > 0 ? sum / questionDetails.length : 0;

                    setAccuracySum(sum);
                    setAccuracyAverage(parseFloat(average.toFixed(2)));

                }
                setLoading(false); // Finish loading
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [roll_no]);
    if (loading) {
        return <div>Loading data, please wait...</div>;
    }

    if (!qna || qna.length === 0) {
        return <div>No questions available for this interviewee.</div>;
    }

    // if (!emotions || Object.keys(emotions).length === 0) {
    //     return <div>Emotion data not available. Please try again later.</div>;
    // }
    const onSelectTab = () => {};
    const kioskSession = Boolean(attemptTokenFor(id));
    const finishKiosk = () => {
        forgetAttemptTokens();
        window.location.href = "/home-2";
    };
    const formatHtmlText = (html) => {
        return html
            ?.replace(/<\/(p|li|br)>/gi, '\n')
            ?.replace(/<br\s*\/?>/gi, '\n')
            ?.replace(/<[^>]+>/g, '')
            ?.replace(/&nbsp;/g, ' ')
            ?.replace(/&lt;/g, '<')
            ?.replace(/&gt;/g, '>')
            ?.trim();
        // if (!html) return '';

        // const textWithLineBreaks = html
        //   .replace(/<\/(p|li|br)>/gi, '\n')
        //   .replace(/<br\s*\/?>/gi, '\n')
        //   .replace(/<[^>]+>/g, '')
        //   .trim();

        // const textArea = document.createElement("textarea");
        // textArea.innerHTML = textWithLineBreaks;
        // return textArea.value;
    };
    const renderHTML = (html) => {
        const cleanedHtml = html
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/<code>/g, '<code style="background:none;background-color:transparent;padding:0;border:none">');

        return { __html: DOMPurify.sanitize(cleanedHtml) };
    };
    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            {kioskSession && (
                <div style={{ position: "fixed", top: 120, right: 20, zIndex: 1000 }}>
                    <button onClick={finishKiosk} style={{ padding: "10px 18px", background: "#008738", color: "#fff", border: "none", borderRadius: 6 }}>
                        Done - next student
                    </button>
                </div>
            )}
            <div className="tf-section flat-blog-details" style={{ padding: "60px" }}>

                <div className="container" >

                    <div className="button-container" style={{ display: "flex", justifyContent: "flex-end", marginTop: "120px", marginLeft: "200px" }}>
                        <button onClick={downloadPdf} style={{ marginRight: "-250px", padding: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <AiOutlineDownload size={18} />
                            Report
                        </button>
                    </div>
                    <div className="row" >

                        <div className="col-lg-12 col-md-12">
                            <article className="report" style={{ marginBottom: "0.2px", backgroundColor: "var(--primary-color10)", padding: "0px 22px 37px 22px", borderRadius: "5px", border: "1px solid var(--primary-color6)" }}>
                                <div className='col-lg-12'>
                                    <div className="row">
                                        <div className="col-lg-3">
                                            <div className="inner-side-bar">
                                                <div className="widget search">
                                                    <div className="author-profile">
                                                        <div className="feature-profile center">
                                                            <div className="wrap-img flex j-content">
                                                                <div className="img-box relative">
                                                                    <img className="avatar" style={{ paddingTop: "40px", borderRadius: "50%", maxWidth: "100%" }} id="profileimg" src={imageUrl}
                                                                        onError={handleError}
                                                                        alt="" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3" style={{ paddingTop: "20px" }}>
                                            <div className="widget style2">
                                                <div id="upload-profile" style={{ marginBottom: "20px", marginTop: "50px", paddingTop: "20px" }} >
                                                    <h2 style={{ marginBottom: "20px", color: "#5EE3EC" }}>{user ? user.first_name : "firstname"} </h2>
                                                    <h3 style={{ marginBottom: "20px" }}>{user ? user.roll_no : "rollno"} </h3>

                                                    <h3 style={{ marginBottom: "20px" }}>{user ? user.college : "college"} </h3>
                                                    {/* <h3 style={{ marginBottom: "20px" }}>Duration: {user ? <span style={{ color: "#5EE3EC" }}>{totalDuration}</span> : "00Sec"} </h3> */}
                                                    <h3 style={{ marginBottom: "20px" }}>Scheduled On: {user ? <span style={{ color: "#5EE3EC" }}>{startDate && startDate}</span> : "00Sec"} </h3>


                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-2" style={{ paddingTop: "70px", width: 200, marginRight: "30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                            {/* <CircularProgressbar
                                                value={confidenceAverage}
                                                text={`${confidenceAverage}%`}
                                                styles={buildStyles({
                                                    textColor: "#ffffff",
                                                    pathColor: "#6C63FF",
                                                    trailColor: "#2E2E2E",
                                                    textSize: "16px",
                                                })}
                                            />
                                            <p style={{ color: "#ffffff", marginTop: "10px", fontSize: "14px", textAlign: "center" }}>CONFIDENCE</p> */}
                                        </div>

                                        <div className="col-lg-3" style={{ paddingTop: "70px", width: 200, marginRight: "30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

                                            <CircularProgressbar
                                                value={accuracyAverage}
                                                text={`${accuracyAverage}%`}
                                                styles={buildStyles({
                                                    textColor: "#ffffff",
                                                    pathColor: "#5EE3EC",
                                                    trailColor: "#2E2E2E",
                                                    textSize: "16px",

                                                })}

                                            />
                                            <p style={{ color: "#ffffff", marginTop: "10px", fontSize: "14px", textAlign: "center" }}>ACCURACY</p>
                                            {/* <MyChart accuracyValues={accuracyAverage} color={"#999"} /> */}
                                        </div>

                                    </div>
                                    <div className="container text-center text-light py-4">
                                        <div className="row g-3 d-flex justify-content-evenly">
                                            <div className="col-12 col-md-6" style={{ backgroundColor: "#1c1c1c", borderRadius: "10px", border: "1px solid #ffffff29" }}>
                                                <div className="row g-3">
                                                    <div className="col-6 col-sm-3" style={{ marginBottom: "20px" }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <img src={`${frontendUrl}report-icons/seen-left.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                <p className="mb-1">SEEN LEFT</p>
                                                            </div>
                                                            <h5 style={{ color: "#5EE3EC", marginTop: '5px' }}>{emotions && emotions.seen_left}</h5>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 col-sm-3">
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <img src={`${frontendUrl}report-icons/seen-center.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                <p className="mb-1">SEEN CENTER</p>
                                                            </div>
                                                            <h5 style={{ color: "#5EE3EC", marginTop: '5px' }}>{emotions && emotions.seen_center}</h5>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 col-sm-3">
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <img src={`${frontendUrl}report-icons/blink.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                <p className="mb-1">EYES BLINK</p>
                                                            </div>
                                                            <h5 style={{ color: "#5EE3EC", marginTop: '5px' }}>{emotions && emotions.blinks}
                                                            </h5>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 col-sm-3">
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <img src={`${frontendUrl}report-icons/seen-right.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                <p className="mb-1">SEEN RIGHT</p>
                                                            </div>
                                                            <h5 style={{ color: "#5EE3EC", marginTop: '5px' }}>{emotions && emotions.seen_right}</h5>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12 col-md-6" style={{ backgroundColor: "#1c1c1c", borderRadius: "10px", border: "1px solid #ffffff29" }}>
                                                <div className="row g-3">
                                                    <div className="col-6 col-sm-3">
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <img src={`${frontendUrl}report-icons/angry.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                <p className="mb-1">ANGRY</p>
                                                            </div>
                                                            <h5 style={{ color: "#5EE3EC" }}>{emotions && emotions.emotions.angry}%</h5>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 col-sm-3">
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <img src={`${frontendUrl}report-icons/disgust.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                <p className="mb-1">DISGUST</p>
                                                            </div>
                                                            <h5 style={{ color: "#5EE3EC" }}>{emotions && emotions.emotions.disgust}%</h5>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 col-sm-3">
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <img src={`${frontendUrl}report-icons/fear.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                <p className="mb-1">FEAR</p>
                                                            </div>
                                                            <h5 style={{ color: "#5EE3EC" }}>{emotions && emotions.emotions.fear}%</h5>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 col-sm-3">
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <img src={`${frontendUrl}report-icons/happy.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                <p className="mb-1">HAPPY</p>
                                                            </div>
                                                            <h5 style={{ color: "#5EE3EC" }}>{emotions && emotions.emotions.happy}%</h5>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {emotions &&
                                            <div className="row g-3 mt-3 d-flex justify-content-evenly">
                                                <div className="col-12 col-md-6" style={{ backgroundColor: "#1c1c1c", borderRadius: "10px", border: "1px solid #ffffff29" }}>
                                                    <div className="row g-3">
                                                        <div className="col-4 col-sm-4" style={{ marginBottom: "20px" }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/seen-left.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1">LOOKING LEFT</p>
                                                                </div>
                                                                <h5 style={{ color: "#5EE3EC" }}>{emotions && emotions.time_left} SEC</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-4 col-sm-4">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/seen-center.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1">LOOKING STRAIGHT</p>
                                                                </div>
                                                                <h5 style={{ color: "#5EE3EC" }}>{emotions && emotions.time_straight} SEC</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-4 col-sm-4">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/seen-right.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1">LOOKING RIGHT</p>
                                                                </div>
                                                                <h5 style={{ color: "#5EE3EC" }}>{emotions && emotions.time_right} SEC</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-12 col-md-6" style={{ backgroundColor: "#1c1c1c", borderRadius: "10px", border: "1px solid #ffffff29" }}>
                                                    <div className="row g-3">
                                                        <div className="col-4 col-sm-4">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/neutral.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1">NEUTRAL</p>
                                                                </div>
                                                                <h5 style={{ color: "#5EE3EC" }}>{emotions && emotions.emotions.neutral}%</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-4 col-sm-4">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/sad.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1">SAD</p>
                                                                </div>
                                                                <h5 style={{ color: "#5EE3EC" }}>{emotions && emotions.emotions.sad}%</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-4 col-sm-4">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/surprise.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1">SURPRISE</p>
                                                                </div>
                                                                <h5 style={{ color: "#5EE3EC" }}>{emotions && emotions.emotions.surprise}%</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }

                                    </div>


                                </div>
                            </article>
                        </div>
                    </div>







                    <div className="row mt-5">
                        <div className="col-lg-12">
                            <div className="flat-create-item">
                                <div className="container">
                                    <div className="row ">
                                        <div className="col-lg-12">
                                            <div className="wrap-faq">
                                                <div className="flat-tabs tab-create-item flat-form flex-one">
                                                    <div className="content-inner flat-accordion">
                                                        {
                                                            qna?.map((item, i) => (
                                                                <Accordion key={item.id || i} height="500px" title={(i + 1) + '.  ' + item.question} onSelect={onSelectTab} show={item.show}>
                                                                    <p
                                                                        className="toggle-content section-desc"
                                                                        style={{ paddingLeft: "20px" }}
                                                                        // dangerouslySetInnerHTML={{ __html: item.description }}
                                                                        dangerouslySetInnerHTML={renderHTML(item.description)}
                                                                    ></p>

                                                                    <div className="row">
                                                                        <div className="col-lg-9">
                                                                            <div className="post-image" style={{ marginTop: "10px", marginBottom: "20px", padding: "20px" }}>
                                                                                <div className="comment-meta" style={{ display: "flex", alignItems: "center" }}>
                                                                                    <img src={`${frontendImageUrl}idea.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                    <h3 style={{ margin: "0" }}>Given Idea</h3>
                                                                                </div>
                                                                                <p className="mb-36" style={{ lineHeight: "2.2", background: "#1c1c1c", padding: "20px", color: "#ebebeb", fontSize: "15px", marginLeft: "40px", border: "1px solid #ffffff29", wordWrap: "break-word", whiteSpace: "pre-wrap", overflowWrap: "break-word", }}>
                                                                                    <div style={{ marginTop: "10px", color: "#bbb", fontSize: "14px", textAlign: "right" }}>
                                                                                        Idea Validations: <span style={{ fontSize: "15px", fontWeight: "bold" }}>{item.idea_check !== "" ? item.idea_check : 0}</span>
                                                                                    </div>
                                                                                    {item.idea !== "" ? item.idea : "Not Answered"}
                                                                                    <div style={{ display: "flex", alignItems: "center", marginTop: "10px", marginLeft: "40px", width: "80%" }}>
                                                                                        <div style={{ flex: 1, background: "#333", borderRadius: "10px", overflow: "hidden", height: "8px" }}>
                                                                                            <div style={{
                                                                                                width: `${item.matched_accuracy}%`,
                                                                                                background: "#4CAF50",
                                                                                                height: "8px",
                                                                                                borderRadius: "10px"
                                                                                            }}>
                                                                                            </div>
                                                                                        </div>
                                                                                        <span style={{ marginLeft: "10px", color: "#fff", fontSize: "14px", fontWeight: "bold" }}>
                                                                                            {item.matched_accuracy}%
                                                                                        </span>
                                                                                    </div>
                                                                                </p>
                                                                                <div className="comment-meta" style={{ display: "flex" }}>
                                                                                    <div>
                                                                                        <img src={`${frontendImageUrl}answer.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                    </div>
                                                                                    <div className="comment-author mb-18" style={{ display: "flex", alignItems: "center" }}>
                                                                                        <h3 style={{ margin: "0" }}>Given Answer</h3>
                                                                                    </div>
                                                                                </div>

                                                                                <pre className="mb-36" style={{ lineHeight: "2.2", background: "#1c1c1c", padding: "20px", color: "#ebebeb", fontSize: "15px", marginLeft: "40px", border: "1px solid #ffffff29" }}>{item.given_answer != "" ? item.given_answer : "Not Answered"}</pre>
                                                                                {item.given_answer && item.is_code == false &&
                                                                                    <>
                                                                                        <h3 style={{ margin: "0" }}>Note</h3>
                                                                                        <p>{item.message}</p>
                                                                                    </>
                                                                                }
                                                                                {item.given_answer != "" && item.is_code == true &&
                                                                                    <>
                                                                                        <div id="comments">
                                                                                            <ol className="comment-list">
                                                                                                <li className="comment-01 flex mb-44">
                                                                                                    <div className="comment-content">
                                                                                                        <div className="comment-meta" style={{ display: "flex", alignItems: "center" }}>
                                                                                                            <img src={`${frontendImageUrl}analysis.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                                            <div className="comment-author mb-18">
                                                                                                                <h3>Analysis</h3>
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                                            <p style={{ color: "#ebebeb", fontSize: "15px", marginLeft: "40px" }}>{item.analysis != "" ? item.analysis : "no analysis"}</p>
                                                                                                        </div>
                                                                                                        <div className="comment" style={{ display: "flex", alignItems: "center" }}>
                                                                                                            <img src={`${frontendImageUrl}working.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                                            <div className="comment-author mb-18">
                                                                                                                <h3>Observations</h3>
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div className="comment-text">
                                                                                                            {item && item.observations?.map((ele, index) => (
                                                                                                                <p key={index} style={{ color: "#ebebeb", fontSize: "15px", marginLeft: "40px" }}>
                                                                                                                    {ele}
                                                                                                                </p>
                                                                                                            ))}
                                                                                                            <div className="container text-center text-light py-4">
                                                                                                                <div className="row g-3">
                                                                                                                    <div className="col-12 col-md-12" style={{ backgroundColor: "#1c1c1c", borderRadius: "10px", marginRight: "20px", marginLeft: "30px", border: "1px solid #ffffff29" }}>
                                                                                                                        <div className="row g-3">
                                                                                                                            <div className="col-6 col-sm-3" style={{ marginBottom: "20px" }}>
                                                                                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                                        <p className="mb-1">Readability</p>
                                                                                                                                    </div>
                                                                                                                                    <h5 style={{ color: "#5EE3EC", marginTop: '5px' }}>{item && item.code_quality.readability}</h5>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                            <div className="col-6 col-sm-3">
                                                                                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                                        <p className="mb-1">Variable Naming</p>
                                                                                                                                    </div>
                                                                                                                                    <h5 style={{ color: "#5EE3EC", marginTop: '5px' }}>{item && item.code_quality.variable_naming}</h5>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                            <div className="col-6 col-sm-3">
                                                                                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                                        <p className="mb-1">Logical Approach</p>
                                                                                                                                    </div>
                                                                                                                                    <h5 style={{ color: "#5EE3EC", marginTop: '5px' }}>{item && item.logical_approach}
                                                                                                                                    </h5>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                            <div className="col-6 col-sm-3">
                                                                                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                                        <p className="mb-1">Output Format</p>
                                                                                                                                    </div>
                                                                                                                                    <h5 style={{ color: "#5EE3EC", marginTop: '5px' }}>{item && item.output_format}</h5>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>


                                                                                                                </div>

                                                                                                            </div>
                                                                                                        </div>

                                                                                                    </div>
                                                                                                </li>
                                                                                            </ol>

                                                                                        </div>
                                                                                        {item && item.optimized_result.optimization_comment != "Unknown" &&
                                                                                            <>
                                                                                                <div className="comment-meta" style={{ display: "flex", alignItems: "center" }}>
                                                                                                    <img src={`${frontendImageUrl}idea.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                                    <h3 style={{ margin: "0" }}>Optimized Code Analysis</h3>
                                                                                                </div>
                                                                                                <p className="mb-36" style={{ lineHeight: "2.2", background: "#1c1c1c", padding: "20px", color: "#ebebeb", fontSize: "15px", marginLeft: "40px", border: "1px solid #ffffff29", wordWrap: "break-word", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
                                                                                                    <p style={{ color: "#5EE3EC" }}>Comment:</p >
                                                                                                    <span style={{ color: "#fff" }}>{item.optimized_result.optimization_comment}</span>
                                                                                                    <br />

                                                                                                    {/* <p  style={{ color: "#5EE3EC"}}>Optimized Percentage:</p > */}
                                                                                                    <div style={{ display: "flex", alignItems: "center", marginTop: "10px", marginLeft: "40px", width: "80%" }}>
                                                                                                        <div style={{ flex: 1, background: "#333", borderRadius: "10px", overflow: "hidden", height: "8px" }}>
                                                                                                            <div style={{
                                                                                                                width: `${item.optimized_result.optimized_percentage}%`,
                                                                                                                background: "#4CAF50",
                                                                                                                height: "8px",
                                                                                                                borderRadius: "10px"
                                                                                                            }}></div>
                                                                                                        </div>
                                                                                                        <span style={{ marginLeft: "10px", color: "#fff", fontSize: "14px", fontWeight: "bold" }}>
                                                                                                            {item.optimized_result.optimized_percentage}%
                                                                                                        </span>
                                                                                                    </div>

                                                                                                    {/* Blocks for Time Complexity, Space Complexity, and Memory Usage */}
                                                                                                    <div style={{ border: "1px solid #ffffff29", borderRadius: "5px", display: "flex", marginTop: "20px", marginRight: "10px", padding: "15px", width: "100%" }}>
                                                                                                        <div style={{ flex: 1, marginRight: "10px", alignItems: 'center' }}>
                                                                                                            <p >Time Complexity:</p >
                                                                                                            <span style={{ color: "#5EE3EC" }}>{item.optimized_result.time_complexity}</span>
                                                                                                        </div>

                                                                                                        <div style={{ flex: 1, marginRight: "10px", alignItems: 'center' }}>
                                                                                                            <p  >Space Complexity:</p >
                                                                                                            <span style={{ color: "#5EE3EC" }}>{item.optimized_result.space_complexity}</span>
                                                                                                        </div>

                                                                                                        <div style={{ flex: 1, alignItems: 'center' }}>
                                                                                                            <p  >Memory Usage (KB):</p >
                                                                                                            <span style={{ color: "#5EE3EC" }}>{item.optimized_result.memory_usage_kb != null ? `${item.optimized_result.memory_usage_kb} KB` : "N/A"}</span>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    <span style={{ color: "#5EE3EC" }}>Optimized Answer:</span >
                                                                                                    <br />
                                                                                                    <div style={{ border: "1px solid #ffffff29", borderRadius: "5px", padding: "10px" }}>
                                                                                                        <span style={{ color: "#fff" }}>
                                                                                                            {item.optimized_answer !== "" ? item.optimized_answer : "Not Answered"}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </p>
                                                                                            </>

                                                                                        }
                                                                                    </>
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        {item.given_answer != "" && <div className="col-lg-3">
                                                                            <div className="row" style={{ width: "90%", marginTop: "20px" }}>
                                                                                <div className="col-md-12" style={{ marginBottom: "20px" }}>
                                                                                    <div className="" style={{ height: "200px", width: "150px", textAlign: "center" }}>
                                                                                        <CircularProgressbar value={item.accuracy} text={`${item.accuracy}%`} styles={buildStyles({ trailColor: "white", pathColor: "#6E83F4" })} />
                                                                                        <h3 style={{ marginTop: "20px", marginBottom: "20px" }} className='text-center'> Accuracy</h3>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-12">
                                                                                    <div className="comment-meta">
                                                                                        <div className="comment-author mb-18"><h3>Time Complexity</h3></div>
                                                                                    </div>
                                                                                    <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                        <span
                                                                                            style={{
                                                                                                color: "white",
                                                                                                padding: "5px",
                                                                                                borderRadius: "5px",
                                                                                                fontSize: "16px"
                                                                                            }}
                                                                                        >
                                                                                            {item.efficiency.time_complexity}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="comment-meta">
                                                                                        <div className="comment-author mb-18"><h3>Space Complexity</h3></div>
                                                                                    </div>
                                                                                    <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                        <span
                                                                                            style={{
                                                                                                color: "white",
                                                                                                padding: "5px",
                                                                                                borderRadius: "5px",
                                                                                                fontSize: "16px"
                                                                                            }}
                                                                                        >
                                                                                            {item.efficiency.space_complexity}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-12">
                                                                                    <div className="comment-meta">
                                                                                        <div className="comment-author mb-18"><h3>Time taken</h3></div>
                                                                                    </div>
                                                                                    <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                        <p>{item.time} Sec</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>}

                                                                    </div>

                                                                </Accordion>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-5">
                        {/* <h3 className="mt-5 text-center" style={{ fontSize: "20px" }}>CONFIDENCE METRICS</h3> */}
                        <div>
                            {/* <AmCharts4Chart values={interviewParameters} chartId="chartdiv1" axisColor="#fff" /> */}
                        </div>
                    </div>

                </div>
                <div style={{ marginTop: "70px" }}>
                    <div className="container" id="container" ref={ref}>
                        <div style={{ background: "#000" }}>

                            <img src={logo} style={{ width: "130px", height: "80px", alignItems: "center", marginLeft: "50px", margintop: "10px", marginBottom: "10px" }} alt="Icoland" />

                        </div>
                        <div className="row">

                            <div className="col-lg-12 col-md-12">

                                <article className="report" style={{ marginBottom: "0.2px", backgroundColor: "var(--primary-color10)", padding: "0px 22px 37px 22px", borderRadius: "5px", border: "1px solid #008738" }}>
                                    <div className='col-lg-12'>
                                        <div className="row">

                                            <div className="col-lg-3">
                                                <div className="inner-side-bar">
                                                    <div className="widget search">
                                                        <div className="author-profile">
                                                            <div className="feature-profile center">
                                                                <div className="wrap-img flex j-content">
                                                                    <div className="img-box relative">
                                                                        <img className="avatar " style={{ paddingTop: "40px", borderRadius: "50%", maxWidth: "100%" }} id="profileimg" src={imageUrl}
                                                                            onError={handleError}
                                                                            onLoad={handleImageLoad}
                                                                            alt="" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3" style={{ paddingTop: "20px" }}>
                                                <div className="widget style2">
                                                    <div id="upload-profile" style={{ marginBottom: "20px", marginTop: "50px", paddingTop: "20px" }} >
                                                        <h2 style={{ marginBottom: "20px", color: "#008738" }}>{user ? user.first_name : "firstname"} </h2>
                                                        <h3 style={{ marginBottom: "20px", color: "#008738" }}>{user ? user.roll_no : "rollno"} </h3>

                                                        <h3 style={{ marginBottom: "20px", color: "#008738" }}>{user ? user.college : "college"} </h3>
                                                        <h3 style={{ marginBottom: "20px", color: "#008738" }}>Scheduled On: {user ? <span style={{ color: "#000" }}>{startDate && startDate}</span> : "00Sec"} </h3>


                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-3" style={{ paddingTop: "70px", width: 200, marginRight: "30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

                                                <CircularProgressbar
                                                    value={accuracyAverage}
                                                    text={`${accuracyAverage}%`}
                                                    styles={buildStyles({
                                                        textColor: "#008738",
                                                        pathColor: "#5EE3EC",
                                                        trailColor: "#e3e3e3",
                                                        textSize: "16px",

                                                    })}

                                                />
                                                <p style={{ color: "#008738", marginTop: "10px", fontSize: "14px", textAlign: "center" }}>ACCURACY</p>
                                            </div>

                                        </div>
                                        <div className="container text-center text-light py-4">
                                            <div className="row g-3" >
                                                <div className="col-12 col-md-6" style={{ backgroundColor: "#fff", borderRadius: "10px", marginRight: "20px", marginLeft: "30px", border: "1px solid #008738" }}>
                                                    <div className="row g-3">
                                                        <div className="col-6 col-sm-3" style={{ marginBottom: "20px" }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/seen-left.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1" style={{ color: "black" }}>SEEN LEFT</p>
                                                                </div>
                                                                <h5 style={{ color: "#008738", marginTop: '5px' }}>{emotions && emotions.seen_left}</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 col-sm-3">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/seen-center.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1" style={{ color: "black" }}>SEEN CENTER</p>
                                                                </div>
                                                                <h5 style={{ color: "#008738", marginTop: '5px' }}>{emotions && emotions.seen_center}</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 col-sm-3">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/blink.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1" style={{ color: "black" }}>EYES BLINK</p>
                                                                </div>
                                                                <h5 style={{ color: "#008738", marginTop: '5px' }}>{emotions?.blinks ? emotions.blinks / 4 : 0}
                                                                </h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 col-sm-3">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/seen-right.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1" style={{ color: "black" }}>SEEN RIGHT</p>
                                                                </div>
                                                                <h5 style={{ color: "#008738", marginTop: '5px' }}>{emotions && emotions.seen_right}</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-12 col-md-5" style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #008738" }}>
                                                    <div className="row g-3">
                                                        <div className="col-6 col-sm-3">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/angry.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1" style={{ color: "black" }}>ANGRY</p>
                                                                </div>
                                                                <h5 style={{ color: "#008738" }}>{emotions && emotions.emotions.angry}%</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 col-sm-3">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/disgust.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1" style={{ color: "black" }}>DISGUST</p>
                                                                </div>
                                                                <h5 style={{ color: "#008738" }}>{emotions && emotions.emotions.disgust}%</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 col-sm-3">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/fear.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1" style={{ color: "black" }}>FEAR</p>
                                                                </div>
                                                                <h5 style={{ color: "#008738" }}>{emotions && emotions.emotions.fear}%</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 col-sm-3">
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <img src={`${frontendUrl}report-icons/happy.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                    <p className="mb-1" style={{ color: "black" }}>HAPPY</p>
                                                                </div>
                                                                <h5 style={{ color: "#008738" }}>{emotions && emotions.emotions.happy}%</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {emotions &&
                                                <div className="row g-3 mt-3">
                                                    <div className="col-12 col-md-6" style={{ backgroundColor: "#fff", borderRadius: "10px", marginRight: "20px", marginLeft: "30px", border: "1px solid #008738" }}>
                                                        <div className="row g-3">
                                                            <div className="col-4 col-sm-4" style={{ marginBottom: "20px" }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <img src={`${frontendUrl}report-icons/seen-left.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                        <p className="mb-1" style={{ color: "black" }}>LOOKING LEFT</p>
                                                                    </div>
                                                                    <h5 style={{ color: "#008738" }}>{emotions && emotions.time_left} SEC</h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-4 col-sm-4">
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <img src={`${frontendUrl}report-icons/seen-center.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                        <p className="mb-1" style={{ color: "black" }}>LOOKING STRAIGHT</p>
                                                                    </div>
                                                                    <h5 style={{ color: "#008738" }}>{emotions && emotions.time_straight} SEC</h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-4 col-sm-4">
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <img src={`${frontendUrl}report-icons/seen-right.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                        <p className="mb-1" style={{ color: "black" }}>LOOKING RIGHT</p>
                                                                    </div>
                                                                    <h5 style={{ color: "#008738" }}>{emotions && emotions.time_right} SEC</h5>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-12 col-md-5" style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #008738" }}>
                                                        <div className="row g-3">
                                                            <div className="col-4 col-sm-4">
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <img src={`${frontendUrl}report-icons/neutral.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                        <p className="mb-1" style={{ color: "black" }}>NEUTRAL</p>
                                                                    </div>
                                                                    <h5 style={{ color: "#008738" }}>{emotions && emotions.emotions.neutral}%</h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-4 col-sm-4">
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <img src={`${frontendUrl}report-icons/sad.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                        <p className="mb-1" style={{ color: "black" }}>SAD</p>
                                                                    </div>
                                                                    <h5 style={{ color: "#008738" }}>{emotions && emotions.emotions.sad}%</h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-4 col-sm-4">
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <img src={`${frontendUrl}report-icons/surprise.png`} width="20px" style={{ marginRight: "5px" }} alt="icon" />
                                                                        <p className="mb-1" style={{ color: "black" }}>SURPRISE</p>
                                                                    </div>
                                                                    <h5 style={{ color: "#008738" }}>{emotions && emotions.emotions.surprise}%</h5>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }

                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                        <div className="row mt-5">
                            <div className="col-lg-12">
                                <div className="flat-create-item">
                                    <div className="container">
                                        <div className="row ">
                                            <div className="col-lg-12">
                                                <div className="wrap-faq">
                                                    <div className="flat-tabs tab-create-item flat-form flex-one">
                                                        <div className="content-inner flat-accordion">
                                                            {
                                                                qna?.map((item, i) => (
                                                                    <div key={item.id || i} style={{ marginBottom: "30px", fontSize: "14px" }}>
                                                                        <h3 style={{ lineHeight: "30px", color: "#008738" }}>{(i + 1) + '.  ' + item && item.question}</h3>
                                                                        <p
                                                                            className="toggle-content section-desc"
                                                                            style={{ paddingLeft: "20px", color: "#000" }}
                                                                            dangerouslySetInnerHTML={renderHTML(item.description)}
                                                                        ></p>
                                                                        <div className="row">
                                                                            <div className="col-lg-9">
                                                                                <div className="post-image" style={{ marginTop: "10px", marginBottom: "20px", padding: "20px" }}>
                                                                                    <div className="comment-meta" style={{ display: "flex", alignItems: "center" }}>
                                                                                        <img src={`${frontendUrl}idea.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                        <h3 style={{ margin: "0", color: "#008738", marginBottom: "10px" }}>Given Idea</h3>
                                                                                    </div>
                                                                                    <p className="mb-36" style={{ lineHeight: "2.2", background: "#fff", padding: "20px", color: "black", fontSize: "15px", marginLeft: "40px", marginBottom: "10px", border: "1px solid #008738" }}>
                                                                                        <div style={{ marginTop: "10px", color: "#008738", fontSize: "14px", textAlign: "right" }}>
                                                                                            Idea Validations: <span style={{ fontSize: "15px", fontWeight: "bold", color: "#000" }}>{item.idea_check !== "" ? item.idea_check : 0}</span>
                                                                                        </div>
                                                                                        {item.idea !== "" ? item.idea : "Not Answered"}
                                                                                        <div style={{ display: "flex", alignItems: "center", marginTop: "10px", marginLeft: "40px", width: "80%" }}>
                                                                                            <div style={{ flex: 1, background: "#333", borderRadius: "10px", overflow: "hidden", height: "8px" }}>
                                                                                                <div style={{
                                                                                                    width: `${item.matched_accuracy}%`,
                                                                                                    background: "#4CAF50",
                                                                                                    height: "8px",
                                                                                                    borderRadius: "10px"
                                                                                                }}>
                                                                                                </div>
                                                                                            </div>
                                                                                            <span style={{ marginLeft: "10px", color: "#000", fontSize: "14px", fontWeight: "bold" }}>
                                                                                                {item.matched_accuracy}%
                                                                                            </span>
                                                                                        </div>
                                                                                    </p>
                                                                                    <div className="comment-meta" style={{ display: "flex" }}>
                                                                                        <div>
                                                                                            <img src={`${frontendUrl}answer.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                        </div>
                                                                                        <div className="comment-author mb-18" style={{ display: "flex", alignItems: "center" }}>
                                                                                            <h3 style={{ margin: "0", color: "#008738" }}>Given Answer</h3>
                                                                                        </div>
                                                                                    </div>

                                                                                    <pre className="mb-36" style={{ lineHeight: "2.2", border: "1px solid #008738", background: "#fff", padding: "20px", color: "#000", fontSize: "15px", marginLeft: "40px" }}>{item.given_answer != "" ? item.given_answer : "Not Answered"}</pre>
                                                                                    {item.given_answer && item.is_code == false &&
                                                                                        <>
                                                                                            <h3 style={{ margin: "0", color: "#008738" }}>Note</h3>
                                                                                            <p style={{ color: "black" }}>{item.message}</p>
                                                                                        </>
                                                                                    }
                                                                                    {item.given_answer != "" && item.is_code == true && <div id="comments">
                                                                                        <ol className="comment-list">
                                                                                            <li className="comment-01 flex mb-44">
                                                                                                <div className="comment-content">
                                                                                                    <div className="comment-meta" style={{ display: "flex", alignItems: "center" }}>
                                                                                                        <img src={`${frontendUrl}analysis.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                                        <div className="comment-author mb-18">
                                                                                                            <h3 style={{ margin: "0", color: "#008738" }}>Analysis</h3>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                                        <p style={{ color: "#000", fontSize: "15px", marginLeft: "40px" }}>{item.analysis != "" ? item.analysis : "no analysis"}</p>
                                                                                                    </div>
                                                                                                    <div className="comment" style={{ display: "flex", alignItems: "center" }}>
                                                                                                        <img src={`${frontendUrl}working.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                                        <div className="comment-author mb-18">
                                                                                                            <h3 style={{ margin: "0", color: "#008738" }}>Observations</h3>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    <div className="comment-text">
                                                                                                        {item && item.observations?.map((ele, index) => (
                                                                                                            <p key={index} style={{ color: "#000", fontSize: "15px", marginLeft: "40px" }}>
                                                                                                                {ele}
                                                                                                            </p>
                                                                                                        ))}
                                                                                                        <div className="container text-center text-light py-4">
                                                                                                            <div className="row g-3">
                                                                                                                <div className="col-12 col-md-12" style={{ backgroundColor: "#fff", borderRadius: "10px", marginRight: "20px", marginLeft: "30px", border: "1px solid #ffffff29" }}>
                                                                                                                    <div className="row g-3">
                                                                                                                        <div className="col-6 col-sm-3" style={{ marginBottom: "20px" }}>
                                                                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                                    <p className="mb-1" style={{ color: "#000" }} >Readability</p>
                                                                                                                                </div>
                                                                                                                                <h5 style={{ color: "#008738", marginTop: '5px' }}>{item && item.code_quality.readability}</h5>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div className="col-6 col-sm-3">
                                                                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                                    <p className="mb-1" style={{ color: "#000" }}>Variable Naming</p>
                                                                                                                                </div>
                                                                                                                                <h5 style={{ color: "#008738", marginTop: '5px' }}>{item && item.code_quality.variable_naming}</h5>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div className="col-6 col-sm-3">
                                                                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                                    <p className="mb-1" style={{ color: "#000" }}>Logical Approach</p>
                                                                                                                                </div>
                                                                                                                                <h5 style={{ color: "#008738", marginTop: '5px' }}>{item && item.logical_approach}
                                                                                                                                </h5>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div className="col-6 col-sm-3">
                                                                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "10px" }}>
                                                                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                                    <p className="mb-1" style={{ color: "#000" }}>Output Format</p>
                                                                                                                                </div>
                                                                                                                                <h5 style={{ color: "#008738", marginTop: '5px' }}>{item && item.output_format}</h5>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>


                                                                                                            </div>

                                                                                                        </div>
                                                                                                    </div>
                                                                                                    {item && item.optimized_result.optimization_comment != "Unknown" &&
                                                                                                        <>
                                                                                                            <div className="comment-meta" style={{ display: "flex", alignItems: "center" }}>
                                                                                                                <img src={`${frontendImageUrl}idea.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                                                <h3 style={{ margin: "0", color: "#000" }}>Optimized Code Analysis</h3>
                                                                                                            </div>
                                                                                                            <p className="mb-36" style={{ background: "#fff", lineHeight: "2.2", background: "#ffffff", padding: "20px", color: "#000000", fontSize: "15px", marginLeft: "40px", border: "1px solid #ffffff29", wordWrap: "break-word", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
                                                                                                                <p style={{ color: "#008738" }}>Comment:</p >
                                                                                                                <span style={{ color: "#000" }}>{item.optimized_result.optimization_comment}</span>
                                                                                                                <br />

                                                                                                                {/* <p  style={{ color: "#5EE3EC"}}>Optimized Percentage:</p > */}
                                                                                                                <div style={{ display: "flex", alignItems: "center", marginTop: "10px", marginLeft: "40px", width: "80%" }}>
                                                                                                                    <div style={{ flex: 1, background: "#333", borderRadius: "10px", overflow: "hidden", height: "8px" }}>
                                                                                                                        <div style={{
                                                                                                                            width: `${item.optimized_result.optimized_percentage}%`,
                                                                                                                            background: "#4CAF50",
                                                                                                                            height: "8px",
                                                                                                                            borderRadius: "10px"
                                                                                                                        }}></div>
                                                                                                                    </div>
                                                                                                                    <span style={{ marginLeft: "10px", color: "#000", fontSize: "14px", fontWeight: "bold" }}>
                                                                                                                        {item.optimized_result.optimized_percentage}%
                                                                                                                    </span>
                                                                                                                </div>

                                                                                                                {/* Blocks for Time Complexity, Space Complexity, and Memory Usage */}
                                                                                                                <div style={{ border: "1px solid #ffffff29", borderRadius: "5px", display: "flex", marginTop: "20px", marginRight: "10px", padding: "15px", width: "100%" }}>
                                                                                                                    <div style={{ flex: 1, marginRight: "10px", alignItems: 'center' }}>
                                                                                                                        <p style={{ color: "#000" }}>Time Complexity:</p >
                                                                                                                        <span style={{ color: "#008738" }}>{item.optimized_result.time_complexity}</span>
                                                                                                                    </div>

                                                                                                                    <div style={{ flex: 1, marginRight: "10px", alignItems: 'center' }}>
                                                                                                                        <p style={{ color: "#000" }}>Space Complexity:</p >
                                                                                                                        <span style={{ color: "#008738" }}>{item.optimized_result.space_complexity}</span>
                                                                                                                    </div>

                                                                                                                    <div style={{ flex: 1, alignItems: 'center' }}>
                                                                                                                        <p style={{ color: "#000" }}>Memory Usage (KB):</p >
                                                                                                                        <span style={{ color: "#008738" }}>{item.optimized_result.memory_usage_kb != null ? `${item.optimized_result.memory_usage_kb} KB` : "N/A"}</span>
                                                                                                                    </div>
                                                                                                                </div>

                                                                                                                <span style={{ color: "#008738" }}>Optimized Answer:</span >
                                                                                                                <br />
                                                                                                                <div style={{ border: "1px solid #ffffff29", borderRadius: "5px", padding: "10px" }}>
                                                                                                                    <span style={{ color: "#000" }}>
                                                                                                                        {item.optimized_answer !== "" ? item.optimized_answer : "Not Answered"}
                                                                                                                    </span>
                                                                                                                </div>
                                                                                                            </p>
                                                                                                        </>
                                                                                                    }
                                                                                                </div>
                                                                                            </li>
                                                                                        </ol>

                                                                                    </div>
                                                                                    }
                                                                                </div>
                                                                            </div>

                                                                            {item.given_answer != "" && <div className="col-lg-3">
                                                                                <div className="row" style={{ width: "90%", marginTop: "20px" }}>
                                                                                    <div className="col-md-12" style={{ marginBottom: "20px" }}>
                                                                                        <div className="" style={{ height: "200px", width: "150px", textAlign: "center" }}>
                                                                                            <CircularProgressbar value={item.accuracy} text={`${item.accuracy}%`} styles={buildStyles({ trailColor: "2E2E2E", pathColor: "#6E83F4" })} />
                                                                                            <h3 style={{ marginTop: "20px", marginBottom: "20px", color: "#008738" }} className='text-center'> Accuracy</h3>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-md-12">
                                                                                        <div className="comment-meta">
                                                                                            <div className="comment-author mb-18"><h3 style={{ margin: "0", color: "#008738" }}>Time Complexity</h3></div>
                                                                                        </div>
                                                                                        <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                            <span
                                                                                                style={{
                                                                                                    color: "#000",
                                                                                                    padding: "5px",
                                                                                                    borderRadius: "5px",
                                                                                                    fontSize: "16px"
                                                                                                }}
                                                                                            >
                                                                                                {item.efficiency.time_complexity}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="comment-meta">
                                                                                            <div className="comment-author mb-18"><h3 style={{ margin: "0", color: "#008738" }}>Space Complexity</h3></div>
                                                                                        </div>
                                                                                        <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                            <span
                                                                                                style={{
                                                                                                    color: "#000",
                                                                                                    padding: "5px",
                                                                                                    borderRadius: "5px",
                                                                                                    fontSize: "16px"
                                                                                                }}
                                                                                            >
                                                                                                {item.efficiency.space_complexity}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-md-12">
                                                                                        <div className="comment-meta">
                                                                                            <div className="comment-author mb-18"><h3 style={{ margin: "0", color: "#008738" }}>Time taken</h3></div>
                                                                                        </div>
                                                                                        <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                            <p>{item.time} Sec</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ background: "#000", paddingTop: "15px", paddingBottom: "15px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <span style={{ fontSize: "15px" }} alt="Icoland">Powered by Technical Hub</span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default CodingReport;