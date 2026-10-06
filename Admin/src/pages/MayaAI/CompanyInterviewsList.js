import React, { useEffect, useState } from "react"
import { Row, Col, Card, CardBody, CardTitle, Button, Modal, ModalHeader, ModalBody, ModalFooter, Badge, Input } from "reactstrap";
import { connect } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from "react-loader-spinner";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import "./datatables.scss"

const InterviewsList = (props) => {
  document.title = "Company Interviews list | Technical Hub - All the list of Company Interviews";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Maya Ai", link: "#" },
    { title: "Company Interviews List", link: "#" },
  ];
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [interviewsData, setInterviewsData] = useState([]); // date-scoped data from server
  const [filteredRows, setFilteredRows] = useState([]); // rows used by table after search/filter
  const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [modal, setModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(""); // YYYY-MM-DD
  const [loader, setLoader] = useState(true);

  // counts
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);

  useEffect(() => {
    fetchCurrentUserData();
  }, []);
  // useEffect(() => {
  //   // load current user from localStorage (same as before)
  //   const currentUser = JSON.parse(localStorage.getItem('authUser'));
  //   if (currentUser) {
  //     setUser(currentUser);
  //   } else {
  //     navigate("/login");
  //   }
  // }, [navigate]);
  useEffect(() => {
    props.setBreadcrumbItems('Maya AI', breadcrumbItems);
    if (user) {
      // set filterDate to yesterday and fetch
      const yesterday = getYesterdayString();
      setFilterDate(yesterday);
      fetchInterviewsData(yesterday);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // helper to get YYYY-MM-DD for yesterday
  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchCurrentUserData = async () => {
    try {
      const response = await axios.get(backendUrl + "get-admin-current-user");
      if (response.data) {
        setUser(response.data);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  // fetch interviews for a date (YYYY-MM-DD). if dateParam falsy, backend defaults to yesterday.
  const fetchInterviewsData = async (dateParam) => {
    try {
      setLoader(true);
      const url = `${backendUrl}get-company-interviews/${user.t_id}`;
      const res = await axios.get(url, { params: dateParam ? { date: dateParam } : {} });
      if (res.status === 200) {
        setInterviewsData(res.data || []);
        // compute initial filtered rows (before search)
        const mapped = mapToRows(res.data || []);
        setFilteredRows(mapped);
      } else {
        setInterviewsData([]);
        setFilteredRows([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setInterviewsData([]);
      setFilteredRows([]);
    } finally {
      setLoader(false);
    }
  };

  // map raw interviews to table rows
  const mapToRows = (arr) => {
    return (arr || []).map(interview => ({
      platform: interview.platform,
      roll_no: interview.roll_no,
      first_name: interview.first_name,
      gender: interview.gender,
      type: interview.type,
      round: interview.round,
      questions_count: interview.questions_count,
      start_date_time: interview.start_date_time_ist || interview.start_date_time,
      interview_status: interview.interview_status,
      _id: interview._id
    }));
  };

  // handle date change: request that specific date from server
  const handleDateChange = (e) => {
    const val = e.target.value; // YYYY-MM-DD or ""
    if (!val) {
      // if cleared, default to yesterday
      const yesterday = getYesterdayString();
      setFilterDate("");
      fetchInterviewsData(yesterday);
    } else {
      setFilterDate(val);
      fetchInterviewsData(val);
    }
  };

  // handle search; apply on interviewsData (already date-scoped)
  useEffect(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    if (!term) {
      setFilteredRows(mapToRows(interviewsData));
      return;
    }
    const filtered = (interviewsData || []).filter(interview =>
      (interview.first_name || "").toLowerCase().includes(term) ||
      String(interview.roll_no || "").toLowerCase().includes(term) ||
      (interview.platform || "").toLowerCase().includes(term)
    );
    setFilteredRows(mapToRows(filtered));
  }, [searchTerm, interviewsData]);

  // counts update when interviewsData changes (date-scoped results)
  useEffect(() => {
    const u = (interviewsData || []).filter(i => i.interview_status === "Upcoming").length;
    const a = (interviewsData || []).filter(i => i.interview_status === "Attempted").length;
    const e = (interviewsData || []).filter(i => i.interview_status === "Expired").length;
    setUpcomingCount(u);
    setAttemptedCount(a);
    setExpiredCount(e);
  }, [interviewsData]);

  const handleDeleteClick = (id) => {
    setSelectedInterviewId(id);
    setModal(true);
  };

  const confirmDeleteInterview = async () => {
    try {
      await axios.delete(`${backendUrl}delete-company-interviewee-details/${selectedInterviewId}`);
      const newData = interviewsData.filter((interview) => interview._id !== selectedInterviewId);
      setInterviewsData(newData);
      setFilteredRows(mapToRows(newData));
      setModal(false);
    } catch (error) {
      console.error("Error deleting interview:", error);
      setModal(false);
    }
  };

  const columns = [
    { dataField: "platform", text: "Platform", sort: true },
    { dataField: "roll_no", text: "Roll no", sort: true },
    { dataField: "first_name", text: "Name", sort: true },
    { dataField: "gender", text: "Gender", sort: true },
    { dataField: "type", text: "Type", sort: true },
    { dataField: "round", text: "Round", sort: true },
    { dataField: "questions_count", text: "No of Questions", sort: true },
    { dataField: "start_date_time", text: "Start Date & Time", sort: true },
    {
      dataField: "interview_status", text: "Status", sort: true, formatter: (cell) => (
        <Badge color={
          cell === "Attempted" ? "success" :
            cell === "Expired" ? "danger" : "warning"
        } pill>
          {cell}
        </Badge>
      )
    },
    {
      dataField: "actions", text: "Actions", sort: false, formatter: (cell, interview) => {
        return interview.interview_status === "Attempted" ? (
          <a href={`https://mpod.ai/report?roll_no=${interview.roll_no}&interview_type=company&id=${interview._id}`} className="btn btn-info btn-sm me-2">
            View
          </a>
        ) : (
          <Button color="danger" size="sm" onClick={() => handleDeleteClick(interview._id)}>
            Delete
          </Button>
        );
      }
    }
  ];

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">{user && user.organization}-Company Interviews List</CardTitle>
              <a href="/admin/add-company-interview">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD INTERVIEW</Button>
              </a>
            </CardBody>

            <CardBody>
              {/* --- ultra-compact small cards: minimal height --- */}
              <Row className="mb-2">
                <Col xs="2">
                  <div
                    style={{
                      background: "#eef4ff",
                      borderLeft: "4px solid #007bff",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      textAlign: "center",
                      minHeight: "44px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 500, color: "#555" }}>
                      Upcoming
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#007bff", lineHeight: "16px" }}>
                      {upcomingCount}
                    </div>
                  </div>
                </Col>

                <Col xs="2">
                  <div
                    style={{
                      background: "#eaffea",
                      borderLeft: "4px solid #28a745",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      textAlign: "center",
                      minHeight: "44px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 500, color: "#555" }}>
                      Attempted
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#28a745", lineHeight: "16px" }}>
                      {attemptedCount}
                    </div>
                  </div>
                </Col>

                <Col xs="2">
                  <div
                    style={{
                      background: "#ffeaea",
                      borderLeft: "4px solid #dc3545",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      textAlign: "center",
                      minHeight: "44px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 500, color: "#555" }}>
                      Expired
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#dc3545", lineHeight: "16px" }}>
                      {expiredCount}
                    </div>
                  </div>
                </Col>
                <Col xs="2">
                  <div
                    style={{
                      background: "#ffeaea",
                      borderLeft: "4px solid #fd8f00ff",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      minHeight: "44px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#555" }}>Percentage</div>
                    <div style={{ fontSize: "17px", fontWeight: "700", color: "#fd8f00ff" }}>
                      {attemptedCount / (attemptedCount + expiredCount) * 100 ? (attemptedCount / (attemptedCount + expiredCount) * 100).toFixed(2) : 0}%
                    </div>
                  </div>
                </Col>
              </Row>

              {/* --- Filters row (date + search) --- */}
              <Row className="mb-3">
                <Col xs="3">
                  <Input
                    type="text"
                    placeholder="Search by Name, Roll No, Platform"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>

                <Col xs="3">
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={handleDateChange}
                  />
                  <small className="text-muted">Showing yesterday by default</small>
                </Col>
              </Row>

              {/* --- Table / loader --- */}
              {
                !loader ? (
                  filteredRows.length !== 0 ? (
                    <BootstrapTable
                      bootstrap4
                      keyField="_id"
                      columns={columns}
                      data={filteredRows}
                      pagination={paginationFactory()}
                    />
                  ) : (
                    <div className="text-center py-4">
                      No interviews found for selected date.
                    </div>
                  )
                ) : (
                  <div className="row">
                    <div className="col-md-2 offset-5">
                      <MutatingDots
                        visible={true}
                        height="100"
                        width="100"
                        color="#2B3A4A"
                        secondaryColor="#2B3A4A"
                        radius="12.5"
                        ariaLabel="mutating-dots-loading"
                      />
                    </div>
                  </div>
                )
              }
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={modal} toggle={() => setModal(!modal)}>
        <ModalHeader toggle={() => setModal(!modal)}>Confirm Deletion</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this interview?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmDeleteInterview}>Delete</Button>
          <Button color="secondary" onClick={() => setModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(InterviewsList);
