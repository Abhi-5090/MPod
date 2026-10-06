import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Spinner
} from "reactstrap";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../../store/actions";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import InterviewComparisonChart from "./interviewComparisonChart";
const StudentExplore = (props) => {
  const tid = props.tenant;

  const styles = {
    sectionTitle: { color: "#008738" },
    dashboardContainer: {
      padding: "10px",
      width: "100%",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)"
    },
    card: {
      borderRadius: "10px",
      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.3)"
    },
    problemsText: {
      color: "#4caf50",
      fontSize: "0.9rem",
      marginBottom: 0,
      textAlign: "center"
    },
    problemsCount: {
      fontSize: "1.2rem",
      color: "#5a5a5a",
      textAlign: "center"
    },
    easy: { color: "#4caf50", margin: 0, fontSize: "0.85rem" },
    medium: { color: "#ff9800", margin: 0, fontSize: "0.85rem" },
    hard: { color: "#f44336", margin: 0, fontSize: "0.85rem" },
    horizontalLine: {
      borderTop: "3px solid #4caf50",
      margin: "1rem 0"
    }
  };

  const [userStats, setUserStats] = useState();
  const [interviewStats, setInterviewStats] = useState();
  const [assignedInterviewStats, setAssignedInterviewStats] = useState();
  const [platformStats, setPlatformStats] = useState();
  const [codingQuestionsStats, setCodingQuestionsStats] = useState();
  const [companyQuestionsStats, setCompanyQuestionsStats] = useState();
  const [yesterdayAssignedStats, setYesterdayAssignedStats] = useState();
  const [yesterdayAttemptedStats, setYesterdayAttemptedStats] = useState();

  const [yesterdayTechStats, setYesterdayTechStats] = useState();
  const [yesterdayAttemptedTechStats, setYesterdayAttemptedTechStats] = useState();
  const [mergedYesterdayTechStats, setMergedYesterdayTechStats] = useState([]);


  const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

  useEffect(() => {
    if (!tid) return;

    const fetchStats = async () => {
      try {
        const [
          userRes,
          interviewRes,
          assignedInterviewRes,
          platformRes,
          codingRes,
          companyRes,
          yesterdayAssignedInterviewRes,
          yesterdayAttemptedInterviewRes,
          yesterdayTechRes,
          yesterdayAttemptedTechRes

        ] = await Promise.all([
          axios.get(`${backendUrl}get-users-stats/${tid}`),
          axios.get(`${backendUrl}get-interview-stats/${tid}`),
          axios.get(`${backendUrl}get-assigned-interview-stats/${tid}`),
          axios.get(`${backendUrl}get-platform-stats/${tid}`),
          axios.get(`${backendUrl}get-coding-questions-count`),
          axios.get(`${backendUrl}get-company-questions-count`),
          axios.get(`${backendUrl}get-yesterday-assigned-interview-stats/${tid}`),
          axios.get(`${backendUrl}get-yesterday-attempted-interview-stats/${tid}`),
          axios.get(`${backendUrl}get-yesterday-tech-stats/${tid}`),
          axios.get(`${backendUrl}get-yesterday-attempted-tech-stats/${tid}`)

        ]);
        console.log(yesterdayTechRes.data)
        console.log(yesterdayAttemptedTechRes.data)
        if (userRes.status === 200) setUserStats(userRes.data);
        if (interviewRes.status === 200) setInterviewStats(interviewRes.data);
        if (assignedInterviewRes.status === 200) setAssignedInterviewStats(assignedInterviewRes.data)
        if (platformRes.status === 200) setPlatformStats(platformRes.data);
        if (codingRes.status === 200) setCodingQuestionsStats(codingRes.data);
        if (companyRes.status === 200) setCompanyQuestionsStats(companyRes.data);
        if (yesterdayAssignedInterviewRes.status === 200) setYesterdayAssignedStats(yesterdayAssignedInterviewRes.data);
        if (yesterdayAttemptedInterviewRes.status === 200) setYesterdayAttemptedStats(yesterdayAttemptedInterviewRes.data);
        if (yesterdayTechRes.status === 200) setYesterdayTechStats(yesterdayTechRes.data);
        if (yesterdayAttemptedTechRes.status === 200) setYesterdayAttemptedTechStats(yesterdayAttemptedTechRes.data);
        const mergedData = yesterdayTechRes.data.technologyWiseCounts.map((assignedItem) => {
          const attemptedItem = yesterdayAttemptedTechRes.data.technologyWiseCounts.find(
            (a) => a.technology === assignedItem.technology
          );
          return {
            technology: assignedItem.technology,
            assigned: assignedItem.count,
            attempted: attemptedItem ? attemptedItem.count : 0,
          };
        });

        // Also include attempted technologies that are not in assigned list
        yesterdayAttemptedTechRes.data.technologyWiseCounts.forEach((attemptedItem) => {
          if (!mergedData.find((item) => item.technology === attemptedItem.technology)) {
            mergedData.push({
              technology: attemptedItem.technology,
              assigned: 0,
              attempted: attemptedItem.count,
            });
          }
        });
        console.log(mergedData)
        setMergedYesterdayTechStats(mergedData);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    fetchStats();
  }, [tid]);

  const renderCount = (value) =>
    value !== undefined ? (
      <h6 style={{ fontSize: "1.2rem", fontWeight: "500" }}>{value}</h6>
    ) : (
      <Spinner style={{ width: "1rem", height: "1rem" }} color="warning" />
    );

  return (
    <React.Fragment>
      <Row className="Programming hoot-dark-test mt-4" style={styles.dashboardContainer}>
        <Row className="mt-2">
          {/* Users */}
          <Col md="3" sm="12">
            <Card style={styles.card}>
              <CardBody>
                <Row className="align-items-center">
                  <Col md={4} className="text-center d-flex justify-content-center align-items-center">
                    <img
                      src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-group-512.png"
                      alt="Users"
                      style={{ width: "42px" }}
                    />
                  </Col>
                  <Col md={2}></Col>
                  <Col md={6}>
                    <p style={styles.problemsText}>Users</p>
                    <h6 style={styles.problemsCount}>
                      {userStats ? userStats.male + userStats.female : <Spinner size="sm" color="warning" />}
                    </h6>
                  </Col>
                </Row>
                <hr style={styles.horizontalLine} />
                <Row className="text-center">
                  <Col>{renderCount(userStats?.male)}<p style={styles.easy}>Male</p></Col>
                  <Col>{renderCount(userStats?.female)}<p style={styles.medium}>Female</p></Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          {/* Interviews */}
          <Col md="3" sm="12">
            <Card style={styles.card}>
              <CardBody>
                <Row className="align-items-center">
                  <Col md={4} className="text-center d-flex justify-content-center align-items-center">
                    <img src="./dashboard-icons/interview.svg" alt="Interview" style={{ width: "42px" }} />
                  </Col>
                  <Col md={1}></Col>
                  <Col md={7}>
                    <p style={styles.problemsText}>Attempted Interviews</p>
                    <h6 style={styles.problemsCount}>
                      {interviewStats
                        ? interviewStats.technologyInterviews + interviewStats.codingInterviews + interviewStats.companyInterviews
                        : <Spinner size="sm" color="warning" />}
                    </h6>
                  </Col>
                </Row>
                <hr style={styles.horizontalLine} />
                <Row className="text-center">
                  <Col>{renderCount(interviewStats?.technologyInterviews)}<p style={styles.easy}>Technology</p></Col>
                  <Col>{renderCount(interviewStats?.codingInterviews)}<p style={styles.medium}>Coding</p></Col>
                  <Col>{renderCount(interviewStats?.companyInterviews)}<p style={styles.hard}>Company</p></Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col md="3" sm="12">
            <Card style={styles.card}>
              <CardBody>
                <Row className="align-items-center">
                  <Col md={4} className="text-center d-flex justify-content-center align-items-center">
                    <img src="./dashboard-icons/interview.svg" alt="Interview" style={{ width: "42px" }} />
                  </Col>
                  <Col md={2}></Col>
                  <Col md={6}>
                    <p style={styles.problemsText}>Assigned Interviews</p>
                    <h6 style={styles.problemsCount}>
                      {assignedInterviewStats
                        ? assignedInterviewStats.technologyInterviews + assignedInterviewStats.codingInterviews + assignedInterviewStats.companyInterviews
                        : <Spinner size="sm" color="warning" />}
                    </h6>
                  </Col>
                </Row>
                <hr style={styles.horizontalLine} />
                <Row className="text-center">
                  <Col>{renderCount(assignedInterviewStats?.technologyInterviews)}<p style={styles.easy}>Technology</p></Col>
                  <Col>{renderCount(assignedInterviewStats?.codingInterviews)}<p style={styles.medium}>Coding</p></Col>
                  <Col>{renderCount(assignedInterviewStats?.companyInterviews)}<p style={styles.hard}>Company</p></Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          {/* Platform */}
          <Col md="3" sm="12">
            <Card style={styles.card}>
              <CardBody>
                <Row className="align-items-center">
                  <Col md={4} className="text-center d-flex justify-content-center align-items-center">
                    <img src="./dashboard-icons/platform.svg" alt="Platform" style={{ width: "42px" }} />
                  </Col>
                  <Col md={2}></Col>
                  <Col md={6}>
                    <p style={styles.problemsText}>Platform</p>
                    <h6 style={styles.problemsCount}>
                      {platformStats
                        ? platformStats.web + platformStats.mpod
                        : <Spinner size="sm" color="warning" />}
                    </h6>
                  </Col>
                </Row>
                <hr style={styles.horizontalLine} />
                <Row className="text-center">
                  <Col>{renderCount(platformStats?.mpod)}<p style={styles.easy}>mPod</p></Col>
                  <Col>{renderCount(platformStats?.web)}<p style={styles.medium}>Sky</p></Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Coding Questions */}
        <Row className="mt-2">
          <Col md="3" sm="12">
            <Card style={styles.card}>
              <CardBody>
                <Row className="align-items-center">
                  <Col md={4} className="text-center d-flex justify-content-center align-items-center">
                    <img src="./dashboard-icons/coding.svg" alt="Coding" style={{ width: "46px" }} />
                  </Col>
                  <Col md={2}></Col>
                  <Col md={6}>
                    <p style={styles.problemsText}>Coding Questions</p>
                    <h6 style={styles.problemsCount}>
                      {codingQuestionsStats ? codingQuestionsStats.total : <Spinner size="sm" color="warning" />}
                    </h6>
                  </Col>
                </Row>
                <hr style={styles.horizontalLine} />
                <Row className="text-center">
                  <Col>{renderCount(codingQuestionsStats?.easy)}<p style={styles.easy}>Easy</p></Col>
                  <Col>{renderCount(codingQuestionsStats?.medium)}<p style={styles.medium}>Medium</p></Col>
                  <Col>{renderCount(codingQuestionsStats?.hard)}<p style={styles.hard}>Hard</p></Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          {/* Company Questions */}
          <Col md="3" sm="12">
            <Card style={styles.card}>
              <CardBody>
                <Row className="align-items-center">
                  <Col md={4} className="text-center d-flex justify-content-center align-items-center">
                    <img src="./dashboard-icons/company.svg" alt="Company" style={{ width: "46px" }} />
                  </Col>
                  <Col md={2}></Col>
                  <Col md={6}>
                    <p style={styles.problemsText}>Company Questions</p>
                    <h6 style={styles.problemsCount}>
                      {companyQuestionsStats ? companyQuestionsStats.totalCompanies : <Spinner size="sm" color="warning" />}
                    </h6>
                  </Col>
                </Row>
                <hr style={styles.horizontalLine} />
                <Row className="text-center">
                  <Col>{renderCount(companyQuestionsStats?.totalQuestions)}<p style={styles.easy}>Count</p></Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {/* yesterday statistics */}
        <Row className="mt-2">
          <h3>Yesterday's Statistics</h3>
          <Col md="3" sm="12">
            <Card style={styles.card}>
              <CardBody>
                <Row className="align-items-center">
                  <Col md={4} className="text-center d-flex justify-content-center align-items-center">
                    <img src="./dashboard-icons/interview.svg" alt="Interview" style={{ width: "42px" }} />
                  </Col>
                  <Col md={2}></Col>
                  <Col md={6}>
                    <p style={styles.problemsText}>Assigned Interviews</p>
                    <h6 style={styles.problemsCount}>
                      {yesterdayAssignedStats
                        ? yesterdayAssignedStats.technologyInterviews + yesterdayAssignedStats.codingInterviews + yesterdayAssignedStats.companyInterviews
                        : <Spinner size="sm" color="warning" />}
                    </h6>
                  </Col>
                </Row>
                <hr style={styles.horizontalLine} />
                <Row className="text-center">
                  <Col>{renderCount(yesterdayAssignedStats?.technologyInterviews)}<p style={styles.easy}>Technology</p></Col>
                  <Col>{renderCount(yesterdayAssignedStats?.codingInterviews)}<p style={styles.medium}>Coding</p></Col>
                  <Col>{renderCount(yesterdayAssignedStats?.companyInterviews)}<p style={styles.hard}>Company</p></Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col md="3" sm="12">
            <Card style={styles.card}>
              <CardBody>
                <Row className="align-items-center">
                  <Col md={4} className="text-center d-flex justify-content-center align-items-center">
                    <img src="./dashboard-icons/interview.svg" alt="Interview" style={{ width: "42px" }} />
                  </Col>
                  <Col md={1}></Col>
                  <Col md={7}>
                    <p style={styles.problemsText}>Attempted Interviews</p>
                    <h6 style={styles.problemsCount}>
                      {yesterdayAttemptedStats
                        ? yesterdayAttemptedStats.technologyInterviews + yesterdayAttemptedStats.codingInterviews + yesterdayAttemptedStats.companyInterviews
                        : <Spinner size="sm" color="warning" />}
                    </h6>
                  </Col>
                </Row>
                <hr style={styles.horizontalLine} />
                <Row className="text-center">
                  <Col>{renderCount(yesterdayAttemptedStats?.technologyInterviews)}<p style={styles.easy}>Technology</p></Col>
                  <Col>{renderCount(yesterdayAttemptedStats?.codingInterviews)}<p style={styles.medium}>Coding</p></Col>
                  <Col>{renderCount(yesterdayAttemptedStats?.companyInterviews)}<p style={styles.hard}>Company</p></Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col md="6" sm="12">
            <h5 className="me-5">Yesterday's Technology Interviews Assigned vs Attempted</h5>
            {mergedYesterdayTechStats.length === 0 ? (
              <Spinner size="sm" color="warning" />
            ) : (
              <Row>
                {mergedYesterdayTechStats.map(({ technology, assigned, attempted }) => (
                  <Col key={technology} md={4} sm={6} className="mb-3">
                    <Card style={styles.card}>
                      <CardBody>
                        <h6 style={{color:"rgb(76,175,80)"}}>{technology}</h6>
                        <hr style={{ borderTop: "3px solid rgb(76, 175, 80)", margin: " 1rem 0px" }}></hr>
                        <p>Assigned: {assigned}</p>
                        <p>Attempted: {attempted}</p>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>

          <Col md="6" sm="12">
            <InterviewComparisonChart
              assignedData={yesterdayTechStats}
              attemptedData={yesterdayAttemptedTechStats}
            />
          </Col>

        </Row>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(StudentExplore);