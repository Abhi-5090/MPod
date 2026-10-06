import React, { useState, useEffect, useRef } from 'react';
import '../scss/components/section.scss';
import Header from '.././components/header/header.jsx';
import PageTitle from '../components/page-title/page-title-v1';
import Footer from '../components/footer/footer-v1';
import dataFooter from '../assets/fake-data/data-footer';
import Bottom from '../components/bottom';
import { Link } from "react-router-dom";
import * as echarts from 'echarts';
import { Chart } from "react-google-charts";
// import dataFaq from '../assets/fake-data/data-faq';
import { Accordion } from 'react-bootstrap-accordion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import generatePDF from "react-to-pdf";



import axios from "axios";


export const MyChart = ({ accuracyValues, color }) => {
    const chartRef = useRef(null);
    useEffect(() => {
        // Initialize ECharts instance
        const myChart = echarts.init(chartRef.current);

        const option = {
            series: [
                {
                    type: 'gauge',
                    progress: {
                        show: true,
                        width: 18,
                        color: color,
                    },
                    axisLine: {
                        lineStyle: {
                            width: 18,
                            // color: color,

                        },
                    },
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                        length: 10,
                        lineStyle: {
                            width: 2,
                            color: color,
                        },
                    },
                    axisLabel: {
                        distance: 25,
                        color: color,
                        fontSize: 10,
                    },
                    anchor: {
                        show: true,
                        showAbove: true,
                        size: 20,
                        itemStyle: {
                            borderWidth: 10,
                        },
                    },
                    title: {
                        show: false,
                    },
                    detail: {
                        valueAnimation: true,
                        fontSize: 20,
                        offsetCenter: [0, "70%"],
                    },
                    data: [
                        {
                            value: accuracyValues,
                        },
                    ],
                },
            ],
        };

        myChart.setOption(option);

        return () => {
            myChart.dispose();
        };
    }, [accuracyValues]);

    return (
        <div style={{ textAlign: 'center' }}>
            <div ref={chartRef} style={{ height: '300px' }} />
            {color == "#999" ? <h3>Overall average Accuracy</h3> : <h3>Accuracy</h3>}

        </div>
    )
};

export const ConfidenceChart = ({ accuracyValues, color }) => {
    const confidenceChartRef = useRef(null);
    useEffect(() => {
        // Initialize ECharts instance
        const myChart = echarts.init(confidenceChartRef.current);

        const option = {
            series: [
                {
                    type: 'gauge',
                    axisLine: {
                        lineStyle: {
                            width: 15,
                            color: [
                                [0.3, '#67e0e3'],
                                [0.7, '#37a2da'],
                                [1, '#fd666d']
                            ]
                        }
                    },
                    pointer: {
                        itemStyle: {
                            color: 'auto'
                        }
                    },
                    axisTick: {
                        distance: -10,
                        length: 4,
                        lineStyle: {
                            color: '#fff',
                            width: 2
                        }
                    },
                    splitLine: {
                        distance: -10,
                        length: 15,
                        lineStyle: {
                            color: '#fff',
                            width: 2
                        }
                    },
                    axisLabel: {
                        color: 'inherit',
                        distance: 25,
                        fontSize: 12
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value} %',
                        color: 'inherit',
                        fontSize: 15

                    },
                    data: [
                        {
                            value: accuracyValues.toFixed(2)
                        }
                    ]
                }
            ]
        };

        myChart.setOption(option);

        return () => {
            myChart.dispose();
        };
    }, [accuracyValues]);

    return (
        <div style={{ textAlign: 'center' }}>
            <div ref={confidenceChartRef} style={{ height: '300px' }} />
            {color == "#999" ? <h3>Overall average confidence</h3> : <h3>Confidence</h3>}

        </div>
    )
};




// export const options = ;

function BlogDetails(props) {
    const [qna, setQna] = useState([]);
    const [accuracy, setAccuracy] = useState();
    const [accuracysum, setAccuracySum] = useState(0);
    const [accuracyAverage, setAccuracyAverage] = useState(0);
    const [totalDuration, setTotalDuration] = useState();
    var id = localStorage.getItem('id');
    var name = localStorage.getItem('name');
    var technology = localStorage.getItem('technology_name')
    let intervieweeDetails;

    intervieweeDetails = JSON.parse(localStorage.getItem('intervieweeDetails'));
    var thisIsMyCopy = '<p>copy copy copy <strong>strong copy</strong></p>';

    console.log(intervieweeDetails);

    const options = {
        filename: "InterviewReport.pdf",
        page: {
            margin: 20
        }
    };

    useEffect(() => {
        // intervieweeDetails = JSON.parse(localStorage.getItem('intervieweeDetails'));
        // console.log(intervieweeDetails)

    }, [intervieweeDetails])



    const getTargetElement = () => document.getElementById("container");

    const downloadPdf = () => generatePDF(getTargetElement, options);

    const [lowAverage, setLowAverage] = useState();
    const [mediumAverage, setMediumAverage] = useState();

    const [highAverage, setHighAverage] = useState();


    useEffect(() => {
        axios.get("http://node.technicalhub.io:6001/api/get-question-details", {
            params: { interviewee_id: intervieweeDetails.interviewee_id }
        })
            .then(async (response) => {
                if (response.data) {
                    setQna(response.data);
                    // console.log(response.data)
                    let lowCount = 0;
                    let mediumCount = 0;
                    let highCount = 0;
                    let totaltime = 0;
                    response.data.forEach((ele) => {
                        const confidenceLevel = ele.confidence_level;
                        totaltime +=  30 - ele.time;
                        // console.log(totaltime)
                        setTotalDuration(totaltime);
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
                            default:
                                break;
                        }
                    });

                    setLowAverage(parseFloat((lowCount / response.data.length).toFixed(2)) * 100)
                    setMediumAverage(parseFloat((mediumCount / response.data.length).toFixed(2)) * 100)
                    setHighAverage(parseFloat((highCount / response.data.length).toFixed(2)) * 100)

                    const sum = response.data.reduce((accumulator, ele) => accumulator + ele.accuracy, 0);

                    const average = response.data.length > 0 ? sum / response.data.length : 0;
                    const roundedAverage = parseFloat(average.toFixed(2));
                    // console.log(roundedAverage)
                    setAccuracySum(sum);
                    setAccuracyAverage(roundedAverage);
                    // if (id) {
                    //     localStorage.removeItem('id');
                    // }
                    // if (name) {
                    //     localStorage.removeItem('name');
                    // }
                }
            })
            .catch(error => {
                console.error(error);
            });
    }, [qna]);

    // console.log(accuracysum)

    const onSelectTab = () => {
        alert('alsdfjk')
    }
    return (
        <div className='wrapper-style' id='wrapper'>
            {<Header />}
            <div className="tf-section flat-blog-details" style={{ padding: "60px" }}>
                <div className="container" >
                    <div className="row" style={{ marginTop: "100px" }}>
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
                                                                    <img className="avatar animate-up" style={{ paddingTop: "40px", borderRadius: "50%", maxWidth: "90%" }} id="profileimg" src={typeof (intervieweeDetails) != 'undefined' ? `https://thecodemind.io/app/studentpics/${intervieweeDetails.interviewee_id}.png` : ''} alt="" />
                                                                    {/* <img className="check absolute" src={icon} alt="" /> */}
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
                                                    <h2 style={{ marginBottom: "20px", marginTop: "20px" }}>{intervieweeDetails.interviewee_name}</h2>
                                                    <h3 style={{ marginBottom: "20px" }}>{typeof (intervieweeDetails) != 'undefined' ? intervieweeDetails.interviewee_id : "rollno"} </h3>
                                                    <h3 style={{ marginBottom: "20px" }}>{typeof (intervieweeDetails) != 'undefined' ? intervieweeDetails.technology_name : "technology"} </h3>
                                                    <h3 style={{ marginBottom: "20px" }}>Duration: {typeof (intervieweeDetails) != 'undefined' ? totalDuration+ " sec" : "00Sec"} </h3>
                                                    

                                                </div>
                                            </div>

                                        </div>
                                        <div className="col-lg-3" style={{ paddingTop: "20px" }}>

                                            <ConfidenceChart accuracyValues={typeof (lowAverage) != 'undefined' && typeof (mediumAverage) != 'undefined' && typeof (highAverage) != 'undefined' ? lowAverage + mediumAverage + highAverage / 3 : 0} color={"#999"} />
                                        </div>
                                        <div className="col-lg-3" style={{ paddingTop: "20px" }}>
                                            {/* <p>{accuracyAverage}</p> */}
                                            <MyChart accuracyValues={accuracyAverage} color={"#999"} />
                                        </div>

                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                    {/* <div className='row bg-light'>
                        <span className='text-dark fw-bold'>Proctored statistics</span>
                    </div> */}

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="flat-create-item">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="wrap-faq">
                                                <div className="flat-tabs tab-create-item flat-form flex-one">
                                                    <div className="content-inner flat-accordion">
                                                        {
                                                            qna?.map((item, i) => (
                                                                <Accordion key={item.id} height="500px" title={(i + 1) + '.  ' + item.given_question} onSelect={onSelectTab} show={item.show}>
                                                                    {/* <p className="toggle-content section-desc">{item.content}</p> */}
                                                                    <div className="row">
                                                                        <div className="col-lg-9">
                                                                            <div className="post-image" style={{ marginTop: "10px", marginBottom: "20px", padding: "20px" }}>
                                                                                <div className="comment-meta" style={{ display: "flex" }}>
                                                                                    <div>
                                                                                        <img src="http://node.technicalhub.io:9000/answer.png" width="30px" style={{ marginRight: "10px" }} />
                                                                                    </div>
                                                                                    <div className="comment-author mb-18" style={{ display: "flex", alignItems: "center" }}>
                                                                                        <h3 style={{ margin: "0" }}>Given Answer</h3>
                                                                                    </div>
                                                                                </div>

                                                                                <p className="mb-36" style={{ color: "#ebebeb", fontSize: "15px", marginLeft: "40px" }}>{item.given_answer}</p>
                                                                                <div id="comments">
                                                                                    <ol className="comment-list">
                                                                                        <li className="comment-01 flex mb-44">
                                                                                            <div className="comment-content">
                                                                                                <div className="comment-meta" style={{ display: "flex", alignItems: "center" }}>
                                                                                                    <img src="http://node.technicalhub.io:9000/analysis.png" width="30px" style={{ marginRight: "10px" }} />
                                                                                                    <div className="comment-author mb-18">
                                                                                                        <h3>Analysis</h3>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="comment" style={{ marginBottom: "25px" }}>

                                                                                                    <p style={{ color: "#ebebeb", fontSize: "15px", marginLeft: "40px" }}>{item.analysis}</p>
                                                                                                </div>
                                                                                                <div className="comment" style={{ display: "flex", alignItems: "center" }}>
                                                                                                    <img src="http://node.technicalhub.io:9000/working.png" width="30px" style={{ marginRight: "10px" }} />
                                                                                                    <div className="comment-author mb-18">
                                                                                                        <h3>Improvements</h3>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="comment-text">
                                                                                                    <p style={{ color: "#ebebeb", fontSize: "15px", marginLeft: "40px" }}>{item.improvements == '' ? "no improvements" : item.improvements}</p>
                                                                                                </div>

                                                                                                {/* <div className="comment-icon font flex link-style-1">
                                                                                                    <Link to="#" className="icon icon-one">Reply</Link>
                                                                                                    <Link to="#" className="icon icon-two">Love </Link>
                                                                                                </div> */}
                                                                                            </div>
                                                                                        </li>
                                                                                    </ol>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-lg-3">
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
                                                                        </div>

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

                    <div>
                        <button onClick={downloadPdf}>Download Report</button>
                        <div style={{ opacity: 0 }}>
                            <div id="container" style={{ border: "1px solid #11092B", padding: "20px", borderRadius: "15px" }}>
                                <div className="row" >
                                    <div className="col-md-12 text-center">
                                        <h2 className='text-secondary'>Interview Report on  {intervieweeDetails.technology_name} </h2>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-3">
                                        <div className="inner-side-bar">
                                            <div className="widget search">
                                                <div className="author-profile">
                                                    <div className="feature-profile center">
                                                        <div className="wrap-img flex j-content">
                                                            <div className="img-box relative">
                                                                <img className="avatar animate-up" style={{ paddingTop: "40px", borderRadius: "50%", maxWidth: "90%" }} id="profileimg" src={typeof (intervieweeDetails) != 'undefined' ? `http://node.technicalhub.io:9000/${intervieweeDetails.interviewee_id}.png` : ''} alt="" />
                                                                {/* <img className="check absolute" src={icon} alt="" /> */}
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
                                                <h2 style={{ marginBottom: "20px", color:"#11092B", marginTop: "20px" }}>{intervieweeDetails.interviewee_name}</h2>
                                                <h3 style={{ marginBottom: "20px",color:"#11092B", }}>{typeof (intervieweeDetails) != 'undefined' ? intervieweeDetails.interviewee_id : "rollno"} </h3>
                                                <h3 style={{ marginBottom: "20px", color:"#11092B", }}>{typeof (intervieweeDetails) != 'undefined' ? intervieweeDetails.technology_name : "technology"} </h3>
                                                <h3 style={{ marginBottom: "20px" }}>{typeof (intervieweeDetails) != 'undefined' ? totalDuration+ " sec" : "00Sec"} </h3>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="col-lg-3" style={{ paddingTop: "20px" }}>

                                        <ConfidenceChart accuracyValues={typeof (lowAverage) != 'undefined' && typeof (mediumAverage) != 'undefined' && typeof (highAverage) != 'undefined' ? lowAverage + mediumAverage + highAverage / 3 : 0} color={"#999"} />
                                    </div>
                                    <div className="col-lg-3" style={{ paddingTop: "20px" }}>
                                        {/* <p>{accuracyAverage}</p> */}
                                        <MyChart accuracyValues={accuracyAverage} color={"#999"} />
                                    </div>

                                </div>
                                <div className="row" >
                                    <div className="col-lg-12">
                                        <div className="wrap-faq">
                                            <div className="flat-tabs tab-create-item flat-form flex-one">
                                                <div className="content-inner flat-accordion">

                                                    {
                                                        qna?.map((item, i) => (
                                                            <div className="row">
                                                                        <div className="col-lg-9">
                                                                            <div className="post-image" style={{ marginTop: "10px", marginBottom: "20px", padding: "20px" }}>
                                                                                <div className="comment-meta" style={{ display: "flex" }}>
                                                                                    <div>
                                                                                        <img src="http://node.technicalhub.io:9000/answer.png" width="30px" style={{ marginRight: "10px" }} />
                                                                                    </div>
                                                                                    <div className="comment-author mb-18" style={{ display: "flex", alignItems: "center" }}>
                                                                                        <h3 style={{ margin: "0", color: "#11092B" }}>Given Answer</h3>
                                                                                    </div>
                                                                                </div>

                                                                                <p className="mb-36" style={{ color: "#11092B", fontSize: "15px", marginLeft: "40px" }}>{item.given_answer}</p>
                                                                                <div id="comments">
                                                                                    <ol className="comment-list">
                                                                                        <li className="comment-01 flex mb-44">
                                                                                            <div className="comment-content">
                                                                                                <div className="comment-meta" style={{ display: "flex", alignItems: "center" }}>
                                                                                                    <img src="http://node.technicalhub.io:9000/analysis.png" width="30px" style={{ marginRight: "10px" }} />
                                                                                                    <div className="comment-author mb-18">
                                                                                                        <h3 style={{color: "#11092B"}}>Analysis</h3>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="comment" style={{ marginBottom: "25px" }}>

                                                                                                    <p style={{ color: "#11092B", fontSize: "15px", marginLeft: "40px" }}>{item.analysis}</p>
                                                                                                </div>
                                                                                                <div className="comment" style={{ display: "flex", alignItems: "center" }}>
                                                                                                    <img src="http://node.technicalhub.io:9000/working.png" width="30px" style={{ marginRight: "10px" }} />
                                                                                                    <div className="comment-author mb-18">
                                                                                                        <h3 style={{color: "#11092B"}}>Improvements</h3>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="comment-text">
                                                                                                    <p style={{ color: "#11092B", fontSize: "15px", marginLeft: "40px" }}>{item.improvements == '' ? "no improvements" : item.improvements}</p>
                                                                                                </div>

                                                                                                {/* <div className="comment-icon font flex link-style-1">
                                                                                                    <Link to="#" className="icon icon-one">Reply</Link>
                                                                                                    <Link to="#" className="icon icon-two">Love </Link>
                                                                                                </div> */}
                                                                                            </div>
                                                                                        </li>
                                                                                    </ol>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-lg-3">
                                                                            <div className="row" style={{ width: "90%", marginTop: "20px" }}>
                                                                                <div className="col-md-12" style={{ marginBottom: "20px" }}>
                                                                                    <div className="" style={{ height: "200px", width: "150px", textAlign: "center" }}>
                                                                                        <CircularProgressbar value={item.accuracy} text={`${item.accuracy}%`} styles={buildStyles({ trailColor: "#11092B", pathColor: "#6E83F4" })} />
                                                                                        <h3 style={{ marginTop: "20px", marginBottom: "20px" }} className='text-center'> Accuracy</h3>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-12">
                                                                                    <div className="comment-meta">
                                                                                        <div className="comment-author mb-18" style={{color: "#11092B"}}><h3>Confidence Level</h3></div>
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
                                                                                        <p style={{color: "#11092B"}}>{item.time} Sec</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                        ))
                                                    }
                                                    <div className="row" style={{ paddingTop: "20px" }}>
                                                        <div className="col-md-12 text-center">
                                                            <h3 style={{ color: "#11092B" }}>All Copyrights reserved by MayaAI</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* <div className="row" style={{ marginTop: "20px" }}>
                        <div className="col-lg-12 col-md-12">
                            <article className="report" style={{ marginBottom: "42.2px", backgroundColor: "var(--primary-color10)", padding: "44px 22px 37px 22px", borderRadius: "5px", border: "1px solid var(--primary-color6)" }}>
                                <div className="inner-content">
                                    <div className="row">
                                        <div className="col-lg-8">
                                            <div className="post-image">
                                                <div className="font-20 mb-15">Advice To Grow Businesses</div>
                                                <p className="mb-36">Sed nec sapien eu nibh porta fringilla. Aenean in lectus id tellus tempus rutrum vitae a elit. Nulla sit amet interdum
                                                    ligula. Duis bibendum porttitor tempus. Morbi nisi nisl, sagittis in enim at, tempus convallis magna. Nam malesuada risus
                                                    non congue viverra. Nullam ultrices massa orci, in eleifend diam fringilla a. Maecenas eu dignissim nulla. Morbi aliquet
                                                    luctus massa fermentum pulvinar. Fusce vel dictum magna.</p>
                                                <div id="comments">
                                                    <ol className="comment-list">
                                                        <li className="comment-01 flex mb-44">
                                                            <div className="comment-content">
                                                                <div className="comment-meta">
                                                                    <div className="comment-author mb-18"><h3>Monsur Rahman Lito </h3></div>
                                                                </div>
                                                                <div className="comment" style={{ marginBottom: "25px" }}>
                                                                    <p>Phasellus ac consequat turpis, sit amet fermentum nulla. Donec dignissim augue nunc. Praesent bibendum erat ac lectus molestie lobortis. Curabitur ultrices justo ac leo facilisis tincidunt. Maecenas et dui eget nisl ornare scelerisque.</p>
                                                                </div>
                                                                <div className="comment">
                                                                    <div className="comment-author mb-18"><h3>Monsur Rahman Lito </h3></div>
                                                                </div>
                                                                <div className="comment-text">
                                                                    <p>Phasellus ac consequat turpis, sit amet fermentum nulla. Donec dignissim augue nunc. Praesent bibendum erat ac lectus molestie lobortis. Curabitur ultrices justo ac leo facilisis tincidunt. Maecenas et dui eget nisl ornare scelerisque.</p>
                                                                </div>
                                                                <div className="comment-icon font flex link-style-1">
                                                                    <Link to="#" className="icon icon-one">Reply</Link>
                                                                    <Link to="#" className="icon icon-two">Love </Link>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <Chart
                                                chartType="PieChart"
                                                data={[
                                                    ["Task", "Hours per Day"],
                                                    ["Correct", 70],
                                                    ["Wrong", 30],

                                                ]}
                                                options={options}
                                                width={"100%"}
                                                height={"800px"}
                                            />
                                        </div>
                                    </div>
                                </div>



                            </article>
                        </div>
                    </div> */}


                </div>
            </div>
            {/* {<Bottom classection='widget-social-footer' />} */}
        </div>
    );
}

export default BlogDetails;