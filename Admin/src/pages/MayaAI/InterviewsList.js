import React, { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Button, Badge, Card, CardBody, CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { MutatingDots } from 'react-loader-spinner';
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const InterviewsList = () => {
  const [interviewsData, setInterviewsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
  const [modal, setModal] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [filterDate, setFilterDate] = useState(""); // Holds selected date
  const [statusFilter, setStatusFilter] = useState("All");
  const [technologyFilter, setTechnologyFilter] = useState("All");
  const [technologyOptions, setTechnologyOptions] = useState(["All"]);
  const [loader, setLoader] = useState(true);
const [upcomingCount, setUpcomingCount] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);

  // helper: return YYYY-MM-DD for yesterday
  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  useEffect(() => {
    fetchCurrentUserData();
  }, []);

  const fetchCurrentUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}get-admin-current-user`);
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

  useEffect(() => {
    if (user) fetchInterviewsData();
  }, [user]);
  useEffect(() => {
    if (!user) return;
    const yesterday = getYesterdayDateString();
    // set the date input to yesterday (so UI shows it)
    setFilterDate(yesterday);
    fetchInterviewsData(yesterday);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  useEffect(() => {
    const upcoming = filteredData.filter(i => i.interview_status === "Upcoming").length;
    const attempted = filteredData.filter(i => i.interview_status === "Attempted").length;
    const expired = filteredData.filter(i => i.interview_status === "Expired").length;

    setUpcomingCount(upcoming);
    setAttemptedCount(attempted);
    setExpiredCount(expired);
  }, [filteredData]);
  // Fetch interviews for a specific date (YYYY-MM-DD). If date is falsy,
  // backend will fall back to yesterday — but we always pass a date from UI.
  const fetchInterviewsData = async (dateString) => {
    try {
      setLoader(true);
      const url = `${backendUrl}get-all-interviewee-details/${user.t_id}`;
      const res = await axios.get(url, {
        params: dateString ? { date: dateString } : {}
      });
      if (res.status === 200) {
        setInterviewsData(res.data);
        setFilteredData(res.data); // base list to apply client-side filters
        // compute technology options for the returned date
        const uniqueTechnologies = ["All", ...Array.from(new Set(res.data.map((item) => item.technology_name).filter(Boolean)))];
        setTechnologyOptions(uniqueTechnologies);
      } else {
        setInterviewsData([]);
        setFilteredData([]);
        setTechnologyOptions(["All"]);
      }
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setInterviewsData([]);
      setFilteredData([]);
      setTechnologyOptions(["All"]);
    } finally {
      setLoader(false);
    }
  };
 // When user changes date input, fetch that date from server
  const handleDateChange = (e) => {
    const value = e.target.value; // YYYY-MM-DD or ""
    // If user clears date, we'll fetch yesterday again (as requested)
    const dateToRequest = value || getYesterdayDateString();
    setFilterDate(value || ""); // keep empty if user cleared, but still request yesterday
    fetchInterviewsData(dateToRequest);
  };
  // Filter interviews based on search term
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term === "") {
      setFilteredData(interviewsData); // Show all data if search is empty
    } else {
      const filtered = interviewsData.filter(
        (interview) =>
          interview.platform.toLowerCase().includes(term) ||
          interview.roll_no.toString().includes(term) ||
          interview.first_name.toLowerCase().includes(term)
      );
      setFilteredData(filtered);
    }
  };
  const handleDeleteClick = (id) => {
    setSelectedInterviewId(id);
    setModal(true);
  };
  const confirmDeleteInterview = async () => {
    try {
      const res = await axios.delete(`${backendUrl}delete-interviewee-details/${selectedInterviewId}`);
      if (res.status == 200) {
        setFilteredData(interviewsData.filter((interview) => interview._id !== selectedInterviewId));

        setModal(false);
        window.location.href("/ai-interviews-list");
      }

    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  };
  const columns = [
    { dataField: "platform", text: "Platform", sort: true },
    { dataField: "roll_no", text: "Roll No", sort: true },
    { dataField: "college", text: "College", sort: true },
    { dataField: "first_name", text: "Name", sort: true },
    { dataField: "gender", text: "Gender", sort: true },
    { dataField: "technology_name", text: "Technology", sort: true },
    {
      dataField: "module_name",
      text: "Modules",
      formatter: (cell) => cell.join(", "),
    },
    {
      dataField: "topic_name",
      text: "Topics",
      formatter: (cell) => cell.join(", "),
    },
    { dataField: "level", text: "Level" },
    { dataField: "questions_count", text: "No of Questions" },
    { dataField: "start_date_time_ist", text: "Start Date & Time" },
    {
      dataField: "interview_status",
      text: "Status",
      formatter: (status) => (
        <Badge color={status === "Attempted" ? "success" : status === "Expired" ? "danger" : "warning"}>
          {status}
        </Badge>
      ),
    },
    {
      dataField: "average_accuracy",
      text: "Total Accuracy",
      // formatter: (cell, interview) => (
      //   interview.interview_status === "Attempted" ? `${interview.question_details.reduce((acc, curr) => acc + (curr.accuracy || 0), 0).toFixed(0) / interview.questions_count}%` : "N/A"
      // ),
    },
    {
      dataField: "actions",
      text: "Actions",
      formatter: (cell, interview) => {
        return interview.interview_status === "Attempted" ? (
          <a
            href={`https://mpod.ai/report?roll_no=${interview.roll_no}&interview_type=ai generated&id=${interview._id}`}
            // target="_blank"
            rel="noopener noreferrer"
            className="btn btn-info btn-sm me-2"
          >
            View
          </a>
        ) : (
          <Button color="danger" size="sm" onClick={() => handleDeleteClick(interview._id)}>
            Delete
          </Button>
        );
      },
    }
  ];
  useEffect(() => {
    let filtered = interviewsData;
    if (filterDate) {
      filtered = filtered.filter((interview) => {
        const interviewDate = new Date(
          interview.start_date_time_ist.split(" ")[0].split("-").reverse().join("-")
        );
        const selectedDate = new Date(filterDate);
        return interviewDate.toDateString() === selectedDate.toDateString();
      });
    }
    
    if (statusFilter !== "All") {
      filtered = filtered.filter((interview) => interview.interview_status === statusFilter);
    }
    if (technologyFilter !== "All") {
      filtered = filtered.filter((interview) => interview.technology_name === technologyFilter);
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((interview) =>
        interview.platform.toLowerCase().includes(term) ||
        interview.roll_no.toString().toUpperCase().includes(searchTerm.toUpperCase()) ||
        interview.first_name.toLowerCase().includes(term)
      );
    }
    setFilteredData(filtered);
  }, [filterDate, statusFilter, technologyFilter, searchTerm, interviewsData]);
  const downloadExcel = () => {
    console.log(filteredData)
    const exportData = filteredData.map((item) => ({
      Platform: item.platform,
      "Roll No": item.roll_no,
      "College":item.college,
      Name: item.first_name,
      Gender: item.gender,
      Technology: item.technology_name,
      Modules: item.module_name.join(", "),
      Topics: item.topic_name.join(", "),
      Level: item.level,
      "No of Questions": item.questions_count,
      "Start Date & Time": item.start_date_time_ist,
      "Accuracy": item.average_accuracy,
      Status: item.interview_status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Interviews");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "InterviewsList.xlsx");
  };
  return (
    <React.Fragment>
      <Row>
        <Col xs="12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">{user?.organization} - Interview List</CardTitle>
              <div>
                <Button color="success" onClick={downloadExcel} className="me-2">
                  Download Excel
                </Button>
                <Button color="primary" href="/admin/add-ai-interview">
                  ADD INTERVIEW
                </Button>
              </div>
            </CardBody>
            <CardBody>
              <Row className="mb-2">
                <Col xs="2">
                  <div
                    style={{
                      background: "#eef4ff",
                      borderLeft: "4px solid #007bff",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      textAlign: "center",
                      minHeight: "48px"
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
                      minHeight: "48px"
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
                      minHeight: "48px"
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



              <Row className="mb-3">
                <Col xs="3">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by platform, roll no, or name"
                  />
                </Col>
                <Col xs="3">
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={handleDateChange}
                    placeholder="Filter by Date"
                  />
                  <small className="text-muted">Initial load shows yesterday's records</small>
                </Col>
                <Col xs="3">
                  <Input
                    type="select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Attempted">Attempted</option>
                    <option value="Expired">Expired</option>
                  </Input>
                </Col>
                <Col xs="3">
                  <Input
                    type="select"
                    value={technologyFilter}
                    onChange={(e) => setTechnologyFilter(e.target.value)}
                  >
                    {technologyOptions.map((tech, index) => (
                      <option key={index} value={tech}>
                        {tech}
                      </option>
                    ))}
                  </Input>
                </Col>
              </Row>
              {loader ? (
                <div className="d-flex justify-content-center">
                  <MutatingDots
                    height="100"
                    width="100"
                    color="rgba(83, 114, 209, 1)"
                    secondaryColor="rgba(106, 141, 218, 1)"
                    radius="12.5"
                    ariaLabel="mutating-dots-loading"
                    visible={true}
                  />
                </div>
              ) : (
                <BootstrapTable
                  keyField="_id"
                  data={filteredData}
                  columns={columns}
                  condensed
                  pagination={paginationFactory()}
                  noDataIndication="No interviews found"
                />
              )}
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

export default InterviewsList;
