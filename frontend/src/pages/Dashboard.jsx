import React, { useState, useEffect, useCallback } from "react";
import axiosInstance, { profilePicUrl, errorMessage } from "../api/axiosInstance";
import Header from "../components/header/header.jsx";
import InterviewFlow from "../components/interview/InterviewFlow";
import "../scss/components/section.scss";
import "./custom.css";
import { Row, Col, Card, Table, Pagination } from "react-bootstrap";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [interviewsData, setInterviewsData] = useState([]);
  const [pastInterviews, setPastInterviews] = useState([]);
  const [attemptedInterviewsCount, setAttemptedInterviewsCount] = useState();
  const [platformInterviewsCount, setPlatformInterviewsCount] = useState();
  const [overallAccuracies, setOverallAccuracies] = useState();
  const [overallAccuracy, setOverallAccuracy] = useState();
  const [rules, setRules] = useState(false);
  const [details, setDetails] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const navigate = useNavigate();
  const itemsPerPage = 5;
  const fiveMin = 5 * 60 * 1000;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pastInterviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pastInterviews.length / itemsPerPage);
  const [loadError, setLoadError] = useState("");
  // Fetch user data
  const fetchCurrentUserData = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-currentUser");
      const userData = response.data;
      setUser(userData);
      setImageUrl(profilePicUrl(userData.roll_no));
    } catch (error) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch all interview-related data
  const fetchAllInterviewData = useCallback(async (roll_no) => {
    try {
      const [assigned, past, attempted, platform, accuracy] = await Promise.all([
        axiosInstance.get(`/get-assigned-interviews/${roll_no}`),
        axiosInstance.get(`/get-past-interviews/${roll_no}`),
        axiosInstance.get(`/attempted-interviews-count/${roll_no}`),
        axiosInstance.get(`/platform-interviews-count/${roll_no}`),
        axiosInstance.get(`/overall-accuracy/${roll_no}`)
      ]);

      setInterviewsData(assigned.data);
      setPastInterviews(past.data);
      setAttemptedInterviewsCount(attempted.data);
      setPlatformInterviewsCount(platform.data);
      setOverallAccuracies(accuracy.data.accuracyData);
      setOverallAccuracy(accuracy.data.overall);
      setLoadError("");
    } catch (error) {
      setLoadError(errorMessage(error, "Could not load your interviews. Please refresh."));
    }
  }, []);
  // const shouldRefresh = interviewsData.some((interview) => {
  //   const start = new Date(interview.startDate);
  //   const diff = now - start;
  //   return diff > fiveMin;
  // });

  // Interview data refresh checker (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const checkForUpdates = () => {
      const now = new Date();
      const shouldRefresh = interviewsData.some((interview) => {
        const start = new Date(interview.startDate);
        return now - start > 5 * 60 * 1000;
      });

      if (shouldRefresh) {
        fetchAllInterviewData(user.roll_no);
      }
    };

    const interval = setInterval(checkForUpdates, 10000);
    return () => clearInterval(interval);
  }, [interviewsData, user, fetchAllInterviewData]);

  useEffect(() => {
    fetchCurrentUserData();
  }, [fetchCurrentUserData]);

  useEffect(() => {
    if (user?.roll_no) {
      fetchAllInterviewData(user.roll_no);
    }
  }, [user, fetchAllInterviewData]);

  // Time updating
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = async (interview) => {
    try {
      const data = { type: interview.interview_type, platform: interview.platform, roll_no: user.roll_no, id: interview._id };
      const response = await axiosInstance.post("get-interview-details-by-id", data);
      setDetails({ ...response.data, interview_type: interview.interview_type, in_progress: Boolean(interview.in_progress) });
      setRules(true);
    } catch (err) {
      setLoadError(errorMessage(err, "Could not open this interview."));
    }
  };

  const leaveInterview = () => {
    setRules(false);
    setDetails(null);
    if (user) fetchAllInterviewData(user.roll_no);
  };

  const handleViewClick = (id, type) => {
    const base = type === "coding" ? "coding-report" : "report";
    const q = new URLSearchParams({ roll_no: user.roll_no, interview_type: type, id });
    navigate(`/${base}?${q.toString()}`);
  };

  const handleError = () => {
    setImageUrl(user?.gender === "female" ? "/girl.png" : "/boy.png");
  };

  const formatTime = (diff) => {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
    const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
    return days > 0 ? `${days}d ${hours}:${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
  };
  return (
    <div className="wrapper-style" id="wrapper">
      <Header />
      {!rules ? (
        <div
          className="tf-section flat-help home2"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#1c1c1c",
            paddingTop: "20px", paddingLeft: "16px", paddingRight: "16px",
            color: "#fff",
            marginTop: "100px"
          }}
        >
          {loadError && <p role="alert" style={{ color: "#ffd166", width: "100%" }}>{loadError}</p>}
          <Row style={{ marginTop: "50px", width: "100%" }}>
            <Col md={3} className="left-section">
              <Card className="profile-card">

                <Card.Body>
                  <div className="row profile-header">
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6 order-2 order-md-1" style={{ padding: "15px"}}>
                      <p style={{ fontSize: "18px" }}>{user && user.first_name}</p>
                      <p>{user && user.roll_no}</p>
                      <p>{user && user.college}</p>
                      <p>{user && user.branch}</p>
                    </div>
                    <div className="col-12 col-sm-6 col-md-12 col-lg-6 order-1 order-md-2">
                      {user && user.roll_no && <img src={imageUrl} alt={user.first_name || "Profile"} className="profile-pic" style={{ width: "140px" }} onError={handleError} />}
                    </div>

                  </div>
                </Card.Body>
              </Card>
              <Card className="accuracy-card mt-4">
                <Card.Body>
                  <h5 style={{ padding: "10px", fontSize: "18px" }}>Overall Accuracy - <span className="highlight">{overallAccuracy ? overallAccuracy : 0}%</span></h5>
                  <Row className="parent mt-3 text-center">
                    {overallAccuracies?.map((item, index) => (
                      <Col key={index} xs={12} lg={4}>
                        <div className="child" style={{ width: "80px", height: "80px", margin: "0 auto" }}>
                          <CircularProgressbar
                            value={item.value}
                            text={`${item.value}%`}
                            styles={buildStyles({
                              textColor: "#fff",
                              pathColor: item.color,
                              trailColor: "#333",
                            })}
                          />
                        </div>
                        <p className="mt-2">{item.label}</p>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col md={8}>

              <Row>
                <Col md={6}>
                  <Card className="attempted-interviews-card p-3" style={{ background: "#222", color: "#fff", borderRadius: "10px" }}>
                    <Card.Body>
                      <h6 style={{ fontSize: "18px", marginBottom: "40px" }}>
                        Attempted Interviews - <span style={{ color: "#49c5b6", fontSize: "20px" }}>{attemptedInterviewsCount ? attemptedInterviewsCount.aiCount + attemptedInterviewsCount.codingCount + attemptedInterviewsCount.companyCount : 0}</span>
                      </h6>
                      <Row className="mt-3 text-center">
                        <Col className="border-end border-secondary">
                          <p className="mb-3" style={{ fontSize: "20px" }}>Technology</p>
                          <h5 style={{ fontSize: "25px" }}>{attemptedInterviewsCount ? attemptedInterviewsCount.aiCount : 0}</h5>
                        </Col>
                        <Col className="border-end border-secondary">
                          <p className="mb-3" style={{ fontSize: "20px" }}>Coding</p>
                          <h5 style={{ fontSize: "20px" }}>{attemptedInterviewsCount ? attemptedInterviewsCount.codingCount : 0}</h5>
                        </Col>
                        <Col>
                          <p className="mb-3" style={{ fontSize: "20px" }}>Company</p>
                          <h5 style={{ fontSize: "20px" }}>{attemptedInterviewsCount ? attemptedInterviewsCount.companyCount : 0}</h5>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="attempted-interviews-card p-3" style={{ background: "#222", color: "#fff", borderRadius: "10px" }}>
                    <Card.Body>
                      <h6 style={{ fontSize: "18px", marginBottom: "40px" }}>
                        Platform Interviews - <span style={{ color: "#49c5b6", fontSize: "20px" }}>{platformInterviewsCount ? platformInterviewsCount.mpodCount + platformInterviewsCount.webCount : 0}</span>
                      </h6>
                      <Row className="mt-3 text-center">
                        <Col className="border-end border-secondary">

                          <p className="mb-3" style={{ fontSize: "20px" }}>mPOD</p>
                          <h5 style={{ fontSize: "20px" }}>{platformInterviewsCount ? platformInterviewsCount.mpodCount : 0}</h5>
                        </Col>
                        <Col>
                          <p className="mb-3" style={{ fontSize: "20px" }}>Sky</p>
                          <h5 style={{ fontSize: "20px" }}>{platformInterviewsCount ? platformInterviewsCount.webCount : 0}</h5>
                        </Col>

                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row style={{ marginTop: "20px" }}>
                <Col md={12}>
                  <Card className="p-3 mt-3 interview-card" style={{ background: "#222", color: "#fff", borderRadius: "10px", marginBottom: "20px" }}>
                    <h6 className="mb-3" style={{ fontSize: "20px" }}>Upcoming Interviews</h6>
                    <Table bordered={false} hover responsive variant="dark" className="custom-table">
                      <thead>
                        <tr className="interview-font" style={{ color: "#fff" }}>
                          <td>Type</td>
                          <td>Platform</td>
                          <td>Date & Time</td>
                          <td>Action</td>
                        </tr>
                      </thead>
                      <tbody>
                        {interviewsData.length === 0 && (
                          <tr><td colSpan={4} style={{ color: "#bbb" }}>No upcoming interviews.</td></tr>
                        )}
                        {interviewsData.map((interview) => {
                          const startTime = new Date(interview.startDate);
                          const timeDiff = startTime - currentTime;
                          const isLive = (timeDiff <= 60 * 1000 && timeDiff >= -fiveMin) || interview.in_progress;

                          return (
                            <tr key={interview._id} className="interview-font">
                              <td>{interview.interview_type === "ai generated" ? "TECHNOLOGY" : interview.interview_type.toUpperCase()}</td>
                              <td>{interview.platform.toUpperCase()}</td>
                              <td>
                                {startTime.toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                })}
                              </td>
                              <td>
                                {interview.platform === "web" ? (
                                  isLive ? (
                                    <>
                                      <button
                                        style={{
                                          padding: "5px 10px",
                                          fontSize: "14px",
                                          color: "#5EE3EC",
                                          background: "rgba(255, 255, 255, 0.2)",
                                          borderRadius: "10px",
                                          border: "none",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                        }}
                                        onClick={() => handleClick(interview)}
                                      >
                                        {interview.in_progress ? "Resume" : "Attempt"}
                                      </button>
                                      {!interview.in_progress && (
                                        <span style={{ fontSize: "12px", color: "#fff", marginTop: "2px" }}>
                                          {formatTime(Math.max(0, fiveMin - (currentTime - startTime)))}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span style={{ color: "#FFD700", fontFamily: "monospace" }}>
                                      Starts in: {formatTime(timeDiff)}
                                    </span>
                                  )
                                ) : (
                                  <span style={{ fontSize: "13px", color: "#bbb" }}>Take this at the mPod kiosk</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Card>
                </Col>
                <Col md={12}>
                  <Card className="p-3 mt-3 interview-card" style={{ background: "#222", color: "#fff", borderRadius: "10px" }}>
                    <h6 className="mb-3" style={{ fontSize: "20px" }}>My Interviews</h6>
                    <Table bordered={false} hover responsive variant="dark" className="custom-table">
                      <thead>
                        <tr className="interview-font" style={{ color: "#fff" }}>
                          <td>Type</td>
                          <td>Platform</td>
                          <td>Date & Time</td>
                          <td>Status</td>
                          <td>Action</td>

                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length === 0 && (
                          <tr><td colSpan={5} style={{ color: "#bbb" }}>No past interviews yet.</td></tr>
                        )}
                        {currentItems.map((interview) => (
                          <tr key={interview._id} className="interview-font">
                            <td>{interview.interview_type === "ai generated" ? "TECHNOLOGY" : interview.interview_type.toUpperCase()}</td>
                            <td>{interview.platform.toUpperCase()}</td>
                            <td>{interview.start_date_time}</td>
                            <td>
                              {interview.interview_status === "expired" && (
                                <label
                                  style={{
                                    padding: "5px",
                                    fontSize: "15px",
                                    color: "#fff",
                                    background: "rgba(190, 61, 61, 0.2)",
                                    borderRadius: "10px",
                                    border: "none",
                                    cursor: "pointer"
                                  }}
                                // onClick={() => handleClick(interview._id, interview.platform, interview.interview_type)}
                                >
                                  {"expired"}
                                </label>
                              )}
                              {["evaluating", "in progress", "evaluation failed"].includes(interview.interview_status) && (
                                <label style={{ padding: "5px", fontSize: "15px", color: "#fff", background: "rgba(200, 160, 40, 0.25)", borderRadius: "10px" }}>
                                  {interview.interview_status}
                                </label>
                              )}
                              {interview.interview_status === "attended" && (
                                <label
                                  style={{
                                    padding: "5px",
                                    fontSize: "15px",
                                    color: "#fff",
                                    background: "rgba(30, 126, 43, 0.2)",
                                    borderRadius: "10px",
                                    border: "none",
                                    cursor: "pointer"
                                  }}
                                // onClick={() => handleClick(interview._id, interview.platform, interview.interview_type)}
                                >
                                  {"attended"}
                                </label>
                              )}
                            </td>
                            <td>
                              {interview.interview_status === "attended" && (
                                <button style={{ padding: "5px", background: "#008738", border: "none" }} onClick={() => handleViewClick(interview._id, interview.interview_type)}>View</button>)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <Pagination className="justify-content-center pagination-dark">
                      <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={index + 1 === currentPage}
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      />
                    </Pagination>

                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      ) : (
        <InterviewFlow
          details={details}
          startSession={() =>
            axiosInstance.post("interview-session/start", { interview_id: details._id, interview_type: details.interview_type })
          }
          onExit={leaveInterview}
        />
      )}
    </div>

  );
}

export default Dashboard;
