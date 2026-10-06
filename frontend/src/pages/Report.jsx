import React, { useState, useEffect, useRef } from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import { Accordion } from 'react-bootstrap-accordion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import generatePDF from "react-to-pdf";
import { useSearchParams } from 'react-router-dom';
import DOMPurify from "dompurify";
// import * as am5xy3d from "@amcharts/amcharts5/xy3d";
import logo from '../assets/images/logo/mayalogo.png'
import { AiOutlineDownload } from "react-icons/ai";
import axiosInstance, { attemptTokenFor, forgetAttemptTokens } from "../api/axiosInstance";

// const AmCharts5Chart = ({ values, chartId, axisColor }) => {
//   const chartRef = useRef(null);

//   useEffect(() => {
//     const root = am5.Root.new(chartId);
//     chartRef.current = root;

//     // Disable amCharts logo
//     root._logo.dispose();

//     // Apply theme
//     root.setThemes([am5themes_Animated.default.new(root)]);

//     // Chart instance
//     const chart = root.container.children.push(
//       am5xy3d.XYChart3D.new(root, {
//         panX: false,
//         panY: false,
//         wheelX: "none",
//         wheelY: "none",
//         layout: root.verticalLayout,
//         angle: 30,
//         depth: 40,
//       })
//     );

//     // Colors
//     const colors = [
//       "#2866af",
//       "#1e97af",
//       "#54842b",
//       "#2ca871",
//       "#076333",
//       "#b29026",
//       "#7f4399",
//     ];

//     const capitalizeWords = (str) =>
//       str
//         .split(" ")
//         .map(
//           (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//         )
//         .join(" ");

//     // Chart data
//     const data = Object.keys(values)
//       .map((key, index) => ({
//         category: capitalizeWords(key.replace(/_/g, " ")),
//         value: values[key],
//         color: colors[index % colors.length],
//       }))
//       .sort((a, b) => b.value - a.value)
//       .slice(0, 7);

//     // X Axis
//     const xAxis = chart.xAxes.push(
//       am5xy.CategoryAxis.new(root, {
//         categoryField: "category",
//         renderer: am5xy.AxisRendererX.new(root, {
//           minGridDistance: 20,
//         }),
//       })
//     );
//     xAxis.data.setAll(data);
//     xAxis.get("renderer").labels.template.setAll({
//       fill: am5.color(axisColor),
//       dy: 10,
//     });

//     // Y Axis
//     const yAxis = chart.yAxes.push(
//       am5xy.ValueAxis.new(root, {
//         renderer: am5xy.AxisRendererY.new(root, {}),
//       })
//     );
//     yAxis.get("renderer").labels.template.setAll({
//       fill: am5.color(axisColor),
//     });

//     // Series (Cone Column Series)
//     const series = chart.series.push(
//       am5xy3d.ConeColumnSeries.new(root, {
//         name: "Values",
//         xAxis,
//         yAxis,
//         valueYField: "value",
//         categoryXField: "category",
//         width: am5.percent(30),
//       })
//     );

//     series.columns.template.setAll({
//       tooltipText: "{categoryX}: [bold]{valueY}[/]",
//       fillOpacity: 0.85,
//       strokeOpacity: 1,
//     });

//     series.columns.template.adapters.add("fill", (fill, target) => {
//       return am5.color(target.dataItem.dataContext.color);
//     });
//     series.columns.template.adapters.add("stroke", (stroke, target) => {
//       return am5.color(target.dataItem.dataContext.color);
//     });

//     // Add labels on top
//     series.bullets.push(() =>
//       am5.Label.new(root, {
//         text: "{valueY}",
//         fontSize: 14,
//         fill: am5.color(axisColor),
//         centerX: am5.p50,
//         centerY: am5.p100,
//         dy: -20,
//       })
//     );

//     series.data.setAll(data);

//     // Animate on load
//     series.appear(1000);
//     chart.appear(1000, 100);

//     return () => {
//       root.dispose();
//     };
//   }, [values, chartId, axisColor]);

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         width: "100%",
//       }}
//     >
//       <div
//         id={chartId}
//         style={{ width: "100%", height: "435px", fontSize: "14px" }}
//       ></div>
//     </div>
//   );
// };



function Report(props) {
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
    const [lowAverage, setLowAverage] = useState();
    const [mediumAverage, setMediumAverage] = useState();
    const [highAverage, setHighAverage] = useState();
    const [confidenceAverage, setConfidenceAverage] = useState();
    const [strengths, setStrengths] = useState([]);
    const [improvements, setImprovements] = useState([])
    const [interviewParameters, setInterviewParameters] = useState()
    const [user, setUser] = useState()
    const [startDate, setStartDate] = useState()
    const [interviewDetails, setInterviewDetails] = useState()

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


    useEffect(() => {
        setLoading(true); // Start loading
        axiosInstance.get("get-question-details/" + encodeURIComponent(id) + "/" + encodeURIComponent(interview_type) + "/" + encodeURIComponent(roll_no), { headers: attemptTokenFor(id) ? { "X-Attempt-Token": attemptTokenFor(id) } : {} })
            .then((response) => {
                if (response.data) {
                    setInterviewDetails(response.data)
                    setQna(response.data.question_details);
                    // setEmotions(response.data?.emotions[0]);
                    setUser(response.data?.user_details)
                    setStartDate(response.data.start_date_time)
                    setStrengths(response.data.overall_analysis.strengths);
                    setImprovements(response.data.overall_analysis.areas_of_improvement);
                    setInterviewParameters(response.data.overall_analysis.interview_parameters);
                    let lowCount = 0;
                    let mediumCount = 0;
                    let highCount = 0;
                    let noneCount = 0;
                    let totaltime = 0;
                    const questionDetails = response.data.question_details;

                    questionDetails.forEach((ele) => {
                        const confidenceLevel = ele.confidence_level;
                        totaltime += ele.time;
                        const minutes = Math.floor(totaltime / 60);
                        const seconds = totaltime % 60;
                        const formattedTime = `${minutes}m ${seconds}s`;
                        setTotalDuration(formattedTime);

                        switch (confidenceLevel) {
                            case 'low':
                                lowCount++;
                                break;
                            case 'medium':
                                mediumCount++;
                                break;
                            case 'high':
                                highCount++;
                                break;
                            case 'none':
                                noneCount++;
                                break;
                            default:
                                break;
                        }
                    });

                    let lowCountValue = lowCount * 1;
                    let mediumCountValue = mediumCount * 2;
                    let highCountValue = highCount * 3;
                    let noneCountValue = noneCount * 0;
                    let highestValue = questionDetails.length * 3;
                    const confidenceAverage = (((lowCountValue + mediumCountValue + highCountValue + noneCountValue) / highestValue) * 100).toFixed(2);
                    setConfidenceAverage(confidenceAverage);
                    const sum = questionDetails.reduce((acc, ele) => acc + ele.accuracy, 0);
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
                                                                    <img className="avatar" style={{ paddingTop: "80px", borderRadius: "50%", maxWidth: "100%" }} id="profileimg" src={imageUrl}
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
                                                    <h3 style={{ marginBottom: "20px" }}>{user ? user.roll_no : "rollno"} - {user ? user.college : "college"}</h3>

                                                    {/* <h3 style={{ marginBottom: "20px" }}>{user ? user.college : "college"} </h3> */}
                                                    {interviewDetails && interviewDetails.interview_type == "ai generated" && (
                                                        <>
                                                            <h4 style={{ marginBottom: "20px" }}>{interviewDetails ? interviewDetails.technology_name : "Technology"} </h4>
                                                            <h4 style={{ marginBottom: "20px" }}>{interviewDetails ? interviewDetails.module_names : "Modules"} </h4>
                                                            <h4 style={{ marginBottom: "20px" }}>{interviewDetails ? interviewDetails.topic_names : "Topics"} </h4>
                                                        </>
                                                    )}
                                                    {interviewDetails && interviewDetails.interview_type == "company" && (
                                                        <>
                                                            <h4 style={{ marginBottom: "20px" }}>{interviewDetails ? interviewDetails.company_names : "Company"} </h4>
                                                            <h4 style={{ marginBottom: "20px" }}>{interviewDetails ? interviewDetails.type : "Type"} </h4>
                                                            <h4 style={{ marginBottom: "20px" }}>{interviewDetails ? interviewDetails.round : "Round"} </h4>
                                                        </>
                                                    )}
                                                    <h4 style={{ marginBottom: "20px" }}>Scheduled On: {user ? <span style={{ color: "#5EE3EC" }}>{startDate && startDate}</span> : "00Sec"} </h4>



                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3" style={{ paddingTop: "70px", width: 200, marginRight: "30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                            <CircularProgressbar
                                                value={confidenceAverage}
                                                text={`${confidenceAverage}%`}
                                                styles={buildStyles({
                                                    textColor: "#ffffff",
                                                    pathColor: "#6C63FF",
                                                    trailColor: "#2E2E2E",
                                                    textSize: "16px",
                                                })}
                                            />
                                            <p style={{ color: "#ffffff", marginTop: "10px", fontSize: "14px", textAlign: "center" }}>CONFIDENCE</p>
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
                                    {/* <div className="container text-center text-light py-4">
                                        <div className="row g-3">
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
                                                            <h5 style={{ color: "#5EE3EC", marginTop: '5px' }}>{emotions?.blinks ? emotions.blinks : 0}
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
                                            <div className="row g-3 mt-3">
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

                                    </div> */}


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
                                                                <Accordion key={item.id || i} height="500px" title={(i + 1) + '.  ' + item.given_question} onSelect={onSelectTab} show={item.show}>
                                                                    {/* <p className="toggle-content section-desc">{item.content}</p> */}
                                                                    <div className="row">
                                                                        <div className="col-lg-9">
                                                                            <div className="post-image" style={{ marginTop: "10px", marginBottom: "20px", padding: "20px" }}>
                                                                                <div className="comment-meta" style={{ display: "flex" }}>
                                                                                    <div>
                                                                                        <img src={`${frontendImageUrl}answer.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                    </div>
                                                                                    <div className="comment-author mb-18" style={{ display: "flex", alignItems: "center" }}>
                                                                                        <h3 style={{ margin: "0" }}>Given Answer</h3>
                                                                                    </div>
                                                                                </div>

                                                                                <p className="mb-36" style={{ color: "#ebebeb", fontSize: "15px", marginLeft: "40px" }}>{item.given_answer != "" ? item.given_answer : "Not Answered"}</p>
                                                                                {item.given_answer != "" && <div id="comments">
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

                                                                                                    <p style={{ color: "#ebebeb", fontSize: "15px", marginLeft: "40px" }}>{item.analysis}</p>
                                                                                                </div>
                                                                                                <div className="comment" style={{ display: "flex", alignItems: "center" }}>
                                                                                                    <img src={`${frontendImageUrl}working.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                                    <div className="comment-author mb-18">
                                                                                                        <h3>Improvements</h3>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="comment-text">
                                                                                                    <p style={{ color: "#ebebeb", fontSize: "15px", marginLeft: "40px" }}>{item.improvements == '' ? "no improvements" : item.improvements}</p>
                                                                                                </div>

                                                                                            </div>
                                                                                        </li>
                                                                                    </ol>
                                                                                </div>}
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
                                                                                        <div className="comment-author mb-18"><h3>Confidence Level</h3></div>
                                                                                    </div>
                                                                                    <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                        <span
                                                                                            style={{
                                                                                                backgroundColor:
                                                                                                    item.confidence_level.toLowerCase() === "low" ? "#dc3545" :
                                                                                                        item.confidence_level.toLowerCase() === "medium" ? "#ffc107" :
                                                                                                            "#28a745",
                                                                                                color: "white",
                                                                                                padding: "5px",
                                                                                                borderRadius: "5px",
                                                                                                fontSize: "16px"
                                                                                            }}
                                                                                        >
                                                                                            {item.confidence_level}
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
                    <div className="row g-3">
                        {/* Left Column */}
                        <div
                            className="col-5"
                            style={{
                                backgroundColor: "#1c1c1c",
                                borderRadius: "10px",
                                marginRight: "20px",
                                marginLeft: "50px",
                                border: "1px solid #ffffff29",
                            }}
                        >
                            <div className="row g-3">
                                <div className="col-12">
                                    <div
                                        className="rounded"
                                        style={{
                                            fontSize: "13px",
                                            paddingTop: "10px",
                                            paddingBottom: "10px",
                                        }}
                                    >
                                        <p className="mb-1" style={{ color: "#5EE3EC" }}>STRENGTHS</p>
                                        {strengths && strengths.length != 0 ? (
                                            <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
                                                {strengths.map((ele, index) => (
                                                    <li
                                                        key={index}
                                                        style={{
                                                            display: "flex", // Use flex layout for the bullet and text
                                                            alignItems: "flex-start", // Align the bullet with the first line
                                                            marginTop: "10px",
                                                            fontSize: "15px",
                                                            lineHeight: "1.5", // Ensure proper line spacing
                                                            gap: "10px", // Add space between the bullet and text
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                flexShrink: "0", // Prevent the bullet from shrinking
                                                                width: "8px",
                                                                height: "8px",
                                                                marginTop: "5px", // Center-align the bullet with the first line
                                                                borderRadius: "50%",
                                                                backgroundColor: "#5EE3EC", // Bullet color
                                                            }}
                                                        ></span>
                                                        <span style={{ wordBreak: "break-word" }}>{ele}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : "No Strengths"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-5" style={{ backgroundColor: "#1c1c1c", borderRadius: "10px", marginRight: "20px", marginLeft: "50px", border: "1px solid #ffffff29" }}>
                            <div className="row g-3">
                                <div className="col-12">
                                    <div
                                        className="rounded"
                                        style={{
                                            fontSize: "13px",
                                            paddingTop: "10px",
                                            paddingBottom: "10px",
                                        }}
                                    >
                                        <p className="mb-3" style={{ color: "#5EE3EC" }}>AREAS OF IMPROVEMENTS</p>
                                        {improvements && (
                                            <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
                                                {improvements.map((ele, index) => (
                                                    <li
                                                        key={index}
                                                        style={{
                                                            display: "flex", // Use flex layout for the bullet and text
                                                            alignItems: "flex-start", // Align the bullet with the first line
                                                            marginTop: "10px",
                                                            fontSize: "15px",
                                                            lineHeight: "1.5", // Ensure proper line spacing
                                                            gap: "10px", // Add space between the bullet and text
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                flexShrink: "0", // Prevent the bullet from shrinking
                                                                width: "8px",
                                                                height: "8px",
                                                                marginTop: "5px", // Center-align the bullet with the first line
                                                                borderRadius: "50%",
                                                                backgroundColor: "#5EE3EC", // Bullet color
                                                            }}
                                                        ></span>
                                                        <span style={{ wordBreak: "break-word" }}>{ele}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <div className="row mt-5">
                        <h3 className="mt-5 text-center" style={{ fontSize: "20px" }}>CONFIDENCE METRICS</h3>
                        <div>
                            <AmCharts4Chart values={interviewParameters} chartId="chartdiv1" axisColor="#fff" />
                        </div>
                    </div> */}

                </div>
                <div style={{ marginTop: "70px" }}>
                    <div className="container" id="container" ref={ref}>
                        <div style={{ background: "#000" }}>

                            <img src={logo} style={{ width: "130px", height: "80px", alignItems: "center", marginLeft: "50px", margintop: "10px", marginBottom: "10px" }} alt="Icoland" />
                            {/* <h2 className="text-secondary" style={{ margin: 0 }}>Interview Report on {intervieweeDetails.technology_name}</h2> */}

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
                                                        <h3 style={{ marginBottom: "20px", color: "#008738" }}>{user ? user.roll_no : "rollno"} </h3>

                                                        <h3 style={{ marginBottom: "20px", color: "#008738" }}>{user ? user.college : "college"} </h3>
                                                        {interviewDetails && interviewDetails.interview_type == "ai generated" && (
                                                            <>
                                                                <h4 style={{ marginBottom: "20px", color: "#008738" }}>{interviewDetails ? interviewDetails.technology_name : "Technology"} </h4>
                                                                <h4 style={{ marginBottom: "20px", color: "#008738" }}>{interviewDetails ? interviewDetails.module_names : "Modules"} </h4>
                                                                <h4 style={{ marginBottom: "20px", color: "#008738" }}>{interviewDetails ? interviewDetails.topic_names : "Topics"} </h4>
                                                            </>
                                                        )}
                                                        {interviewDetails && interviewDetails.interview_type == "company" && (
                                                            <>
                                                                <h4 style={{ marginBottom: "20px", color: "#008738" }}>{interviewDetails ? interviewDetails.company_names : "Company"} </h4>
                                                                <h4 style={{ marginBottom: "20px", color: "#008738" }}>{interviewDetails ? interviewDetails.type : "Type"} </h4>
                                                                <h4 style={{ marginBottom: "20px", color: "#008738" }}>{interviewDetails ? interviewDetails.round : "Round"} </h4>
                                                            </>
                                                        )}
                                                        {/* <h3 style={{ marginBottom: "20px" }}>Duration: {typeof (intervieweeDetails) != 'undefined' ? <span style={{ color: "#5EE3EC" }}>{totalDuration}</span> : "00Sec"} </h3> */}
                                                        {/* <h3 style={{ marginBottom: "20px" }}>Scheduled On: {typeof (intervieweeDetails) != 'undefined' ? <span style={{ color: "#5EE3EC" }}>{startDate && startDate}</span> : "00Sec"} </h3> */}
                                                        <h3 style={{ marginBottom: "20px", color: "#008738" }}>Scheduled On: {user ? <span style={{ color: "#000" }}>{startDate && startDate}</span> : "00Sec"} </h3>


                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3" style={{ paddingTop: "70px", width: 200, marginRight: "30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

                                                <CircularProgressbar
                                                    value={confidenceAverage}
                                                    text={`${confidenceAverage}%`}
                                                    styles={buildStyles({
                                                        textColor: "#008738",
                                                        pathColor: "#6C63FF",
                                                        trailColor: "#e3e3e3",
                                                        textSize: "16px",
                                                    })}
                                                />
                                                <p style={{ color: "#008738", marginTop: "10px", fontSize: "14px", textAlign: "center" }}>CONFIDENCE</p>
                                                {/* </div> */}
                                                {/* <ConfidenceChart accuracyValues={typeof (lowAverage) != 'undefined' && typeof (mediumAverage) != 'undefined' && typeof (highAverage) != 'undefined' ? lowAverage + mediumAverage + highAverage / 3 : 0} color={"#999"} /> */}
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
                                                {/* <MyChart accuracyValues={accuracyAverage} color={"#999"} /> */}
                                            </div>

                                        </div>
                                        {/* <div className="container text-center text-light py-4">
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

                                        </div> */}


                                    </div>
                                </article>
                            </div>
                        </div>
                        <div className="row g-3 mt-5">
                            {/* Left Column */}
                            <div
                                className="col-5"
                                style={{
                                    backgroundColor: "#fff",
                                    borderRadius: "10px",
                                    marginRight: "20px",
                                    marginLeft: "50px",
                                    border: "1px solid #008738",
                                }}
                            >
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div
                                            className="rounded"
                                            style={{
                                                fontSize: "13px",
                                                paddingTop: "10px",
                                                paddingBottom: "10px",

                                            }}
                                        >
                                            <p className="mb-1" style={{ color: "#008738" }}>STRENGTHS</p>
                                            {strengths && strengths.length != 0 ? (
                                                <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
                                                    {strengths.map((ele, index) => (
                                                        <li
                                                            key={index}
                                                            style={{
                                                                display: "flex", // Use flex layout for the bullet and text
                                                                alignItems: "flex-start", // Align the bullet with the first line
                                                                marginTop: "10px",
                                                                fontSize: "15px",
                                                                lineHeight: "1.5", // Ensure proper line spacing
                                                                gap: "10px", // Add space between the bullet and text
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    flexShrink: "0", // Prevent the bullet from shrinking
                                                                    width: "8px",
                                                                    height: "8px",
                                                                    marginTop: "5px", // Center-align the bullet with the first line
                                                                    borderRadius: "50%",
                                                                    backgroundColor: "#008738", // Bullet color
                                                                }}
                                                            ></span>
                                                            <span style={{ wordBreak: "break-word", color: "#000" }}>{ele}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p style={{ color: "#000" }}>No Strengths</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-5" style={{ backgroundColor: "#fff", borderRadius: "10px", marginRight: "20px", marginLeft: "50px", border: "1px solid #008738" }}>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div
                                            className="rounded"
                                            style={{
                                                fontSize: "13px",
                                                paddingTop: "10px",
                                                paddingBottom: "10px",

                                            }}
                                        >
                                            <p className="mb-3" style={{ color: "#008738" }}>AREAS OF IMPROVEMENTS</p>
                                            {improvements && (
                                                <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
                                                    {improvements.map((ele, index) => (
                                                        <li
                                                            key={index}
                                                            style={{
                                                                display: "flex", // Use flex layout for the bullet and text
                                                                alignItems: "flex-start", // Align the bullet with the first line
                                                                marginTop: "10px",
                                                                fontSize: "15px",
                                                                lineHeight: "1.5", // Ensure proper line spacing
                                                                gap: "10px", // Add space between the bullet and text
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    flexShrink: "0", // Prevent the bullet from shrinking
                                                                    width: "8px",
                                                                    height: "8px",
                                                                    marginTop: "5px", // Center-align the bullet with the first line
                                                                    borderRadius: "50%",
                                                                    backgroundColor: "#008738", // Bullet color
                                                                }}
                                                            ></span>
                                                            <span style={{ wordBreak: "break-word", color: "#000" }}>{ele}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <div className="row mt-5" style={{ marginBottom: "50px" }}>
                            <h3 className="mt-5 text-center" style={{ fontSize: "20px", color: "#000" }}>CONFIDENCE METRICS</h3>
                            <div>
                                <AmCharts4Chart values={interviewParameters} chartId="chartdiv2" axisColor="#000" />
                            </div>
                        </div> */}
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
                                                                        <h3 style={{ lineHeight: "30px", color: "#000" }}>{(i + 1) + '.  ' + item.given_question}</h3>

                                                                        <div className="row">
                                                                            <div className="col-lg-9">
                                                                                <div className="post-image" style={{ marginTop: "10px", marginBottom: "20px", padding: "20px" }}>
                                                                                    <div className="comment-meta" style={{ display: "flex" }}>
                                                                                        <div>
                                                                                            <img src={`${frontendImageUrl}answer.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                        </div>
                                                                                        <div className="comment-author mb-18" style={{ display: "flex", alignItems: "center" }}>
                                                                                            <h3 style={{ margin: "0", color: "#008738" }}>Given Answer</h3>
                                                                                        </div>
                                                                                    </div>

                                                                                    <p className="mb-36" style={{ color: "#000", fontSize: "15px", marginLeft: "40px" }}>{item.given_answer != "" ? item.given_answer : "Not Answered"}</p>

                                                                                    {item.given_answer != "" && <div id="comments">
                                                                                        <ol className="comment-list">
                                                                                            <li className="comment-01 flex mb-44">
                                                                                                <div className="comment-content">
                                                                                                    <div className="comment-meta" style={{ display: "flex", alignItems: "center" }}>
                                                                                                        <img src={`${frontendImageUrl}analysis.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                                        <div className="comment-author mb-18">
                                                                                                            <h3 style={{ color: "#008738" }}>Analysis</h3>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                                        <p style={{ color: "#000", fontSize: "15px", marginLeft: "40px" }}>{item.analysis}</p>
                                                                                                    </div>
                                                                                                    <div className="comment" style={{ display: "flex", alignItems: "center" }}>
                                                                                                        <img src={`${frontendImageUrl}working.png`} width="30px" style={{ marginRight: "10px" }} />
                                                                                                        <div className="comment-author mb-18">
                                                                                                            <h3 style={{ color: "#008738" }}>Improvements</h3>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    <div className="comment-text" style={{ borderBottom: "1px solid #008738" }}>
                                                                                                        <p style={{ color: "#000", fontSize: "15px", marginLeft: "40px" }}>
                                                                                                            {item.improvements === '' ? "no improvements" : item.improvements}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </li>
                                                                                        </ol>
                                                                                    </div>}
                                                                                </div>
                                                                            </div>

                                                                            {item.given_answer != "" && <div className="col-lg-3">
                                                                                <div className="row" style={{ width: "90%", marginTop: "20px" }}>
                                                                                    <div className="col-md-12" style={{ marginBottom: "20px" }}>
                                                                                        <div className="" style={{ height: "200px", width: "150px", textAlign: "center" }}>
                                                                                            <CircularProgressbar value={item.accuracy} text={`${item.accuracy}%`} styles={buildStyles({ trailColor: "#e3e3e3", pathColor: "#6E83F4" })} />
                                                                                            <h3 style={{ marginTop: "20px", marginBottom: "20px", color: "#008738" }} className='text-center'> Accuracy</h3>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-md-12">
                                                                                        <div className="comment-meta">
                                                                                            <div className="comment-author mb-18" style={{ color: "#008738" }}><h3>Confidence Level</h3></div>
                                                                                        </div>
                                                                                        <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                            <span
                                                                                                style={{
                                                                                                    backgroundColor:
                                                                                                        item.confidence_level.toLowerCase() === "low" ? "#dc3545" :
                                                                                                            item.confidence_level.toLowerCase() === "medium" ? "#ffc107" :
                                                                                                                "#28a745",
                                                                                                    color: "white",
                                                                                                    padding: "5px",
                                                                                                    borderRadius: "5px",
                                                                                                    fontSize: "16px"
                                                                                                }}
                                                                                            >
                                                                                                {item.confidence_level}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="col-md-12">
                                                                                        <div className="comment-meta">
                                                                                            <div className="comment-author mb-18" style={{ color: "#008738" }}><h3>Time taken</h3></div>
                                                                                        </div>
                                                                                        <div className="comment" style={{ marginBottom: "25px" }}>
                                                                                            <p style={{ color: "#000" }}>{item.time} Sec</p>
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

export default Report;