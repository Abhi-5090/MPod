import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Row,
  Col,
  Card,
  CardBody,
  Spinner,
  Alert,
  Button
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import InterviewComparisonChart from "./interviewComparisonChart";
import { apiUrl, getErrorMessage } from "../../../config/api";

const asArray = value => (Array.isArray(value) ? value : []);

const TotalStats = (props) => {
  const tid = props.tenant;

  const styles = {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!tid) return;
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        axios.get(apiUrl(`get-users-stats/${tid}`)),
        axios.get(apiUrl(`get-interview-stats/${tid}`)),
        axios.get(apiUrl(`get-assigned-interview-stats/${tid}`)),
        axios.get(apiUrl(`get-platform-stats/${tid}`)),
        axios.get(apiUrl("get-coding-questions-count")),
        axios.get(apiUrl("get-company-questions-count")),
        axios.get(apiUrl(`get-yesterday-assigned-interview-stats/${tid}`)),
        axios.get(apiUrl(`get-yesterday-attempted-interview-stats/${tid}`)),
        axios.get(apiUrl(`get-yesterday-tech-stats/${tid}`)),
        axios.get(apiUrl(`get-yesterday-attempted-tech-stats/${tid}`)),
      ]);
      const value = i => (results[i].status === "fulfilled" ? results[i].value.data : undefined);

      setUserStats(value(0));
      setInterviewStats(value(1));
      setAssignedInterviewStats(value(2));
      setPlatformStats(value(3));
      setCodingQuestionsStats(value(4));
      setCompanyQuestionsStats(value(5));
      setYesterdayAssignedStats(value(6));
      setYesterdayAttemptedStats(value(7));

      const techStats = value(8);
      const attemptedTechStats = value(9);
      setYesterdayTechStats(techStats);
      setYesterdayAttemptedTechStats(attemptedTechStats);

      const assignedList = asArray(techStats?.technologyWiseCounts);
      const attemptedList = asArray(attemptedTechStats?.technologyWiseCounts);
      const mergedData = assignedList.map((assignedItem) => {
        const attemptedItem = attemptedList.find((a) => a.technology === assignedItem.technology);
        return {
          technology: assignedItem.technology,
          assigned: assignedItem.count,
          attempted: attemptedItem ? attemptedItem.count : 0,
        };
      });

      // Also include attempted technologies that are not in assigned list
      attemptedList.forEach((attemptedItem) => {
        if (!mergedData.find((item) => item.technology === attemptedItem.technology)) {
          mergedData.push({
            technology: attemptedItem.technology,
            assigned: 0,
            attempted: attemptedItem.count,
          });
        }
      });
      setMergedYesterdayTechStats(mergedData);

      const failed = results.find(r => r.status === "rejected");
      if (failed) setError(getErrorMessage(failed.reason, "Some statistics failed to load."));
    } finally {
      setLoading(false);
    }
  }, [tid]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const placeholder = loading ? (
    <Spinner style={{ width: "1rem", height: "1rem" }} color="warning" />
  ) : (
    <span className="text-muted">-</span>
  );

  const renderCount = (value) =>
    value !== undefined && value !== null ? (
      <h6 style={{ fontSize: "1.2rem", fontWeight: "500" }}>{value}</h6>
    ) : (
      placeholder
    );

  // Sum of the given numeric keys of a stats object, or the loading/empty placeholder.
  const renderTotal = (obj, keys) =>
    obj ? keys.reduce((sum, key) => sum + (Number(obj[key]) || 0), 0) : placeholder;

  return (
    <React.Fragment>
      {error && (
        <Alert color="danger" className="d-flex justify-content-between align-items-center mt-4">
          <span>{error}</span>
          <Button size="sm" color="danger" outline onClick={fetchStats} disabled={loading}>
            Retry
          </Button>
        </Alert>
      )}
      <Row className="Programming hoot-dark-test mt-4" style={styles.dashboardContainer}>
        <Row className="mt-2">
          {/* Users */}
          <Col md="3" sm="12">
            <Card style={styles.card}>
              <CardBody>
                <Row className="align-items-center">
                  <Col md={4} className="text-center d-flex justify-content-center align-items-center">
                    <i
                      className="mdi mdi-account-group text-primary"
                      role="img"
                      aria-label="Users"
                      style={{ fontSize: "42px", lineHeight: 1 }}
                    />
                  </Col>
                  <Col md={2}></Col>
                  <Col md={6}>
                    <p style={styles.problemsText}>Users</p>
                    <h6 style={styles.problemsCount}>
                      {renderTotal(userStats, ["male", "female"])}
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
                      {renderTotal(interviewStats, ["technologyInterviews", "codingInterviews", "companyInterviews"])}
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
                      {renderTotal(assignedInterviewStats, ["technologyInterviews", "codingInterviews", "companyInterviews"])}
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
                      {renderTotal(platformStats, ["web", "mpod"])}
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
                      {codingQuestionsStats ? codingQuestionsStats.total : placeholder}
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
                      {companyQuestionsStats ? companyQuestionsStats.totalCompanies : placeholder}
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
                      {renderTotal(yesterdayAssignedStats, ["technologyInterviews", "codingInterviews", "companyInterviews"])}
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
                      {renderTotal(yesterdayAttemptedStats, ["technologyInterviews", "codingInterviews", "companyInterviews"])}
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
            {loading ? (
              <Spinner size="sm" color="warning" />
            ) : mergedYesterdayTechStats.length === 0 ? (
              <p className="text-muted">No technology interviews yesterday.</p>
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

TotalStats.propTypes = {
  tenant: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default TotalStats;