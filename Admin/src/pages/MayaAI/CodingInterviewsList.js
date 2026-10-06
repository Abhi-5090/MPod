import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, CardTitle, Button, Modal, ModalHeader, ModalBody, ModalFooter, Badge, Input } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from 'react-loader-spinner';
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import "./datatables.scss";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const InterviewsList = (props) => {
  document.title = "Coding Interviews list | Technical Hub - All the list of Coding Interviews";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Maya Ai", link: "#" },
    { title: "Coding Interviews List", link: "#" },
  ];

  const [interviewsData, setInterviewsData] = useState([]);
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [filterDate, setFilterDate] = useState(""); // Holds selected date
  const [statusFilter, setStatusFilter] = useState("All");
  const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetchCurrentUserData();
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems('Maya AI', breadcrumbItems);
    if (user) {
      fetchInterviewsData();
    }
  }, [user]);

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

  const fetchInterviewsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}get-all-coding-interview-details/${user.t_id}`);
      if (response.status === 200) {
        setInterviewsData(response.data);
        setFilteredData(response.data)
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedInterviewId(id);
    setModal(true);
  };

  const confirmDeleteInterview = async () => {
    try {
      await axios.delete(`${backendUrl}delete-coding-interview/${selectedInterviewId}`);
      setInterviewsData(interviewsData.filter((interview) => interview._id !== selectedInterviewId));
      setModal(false);
    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRows = interviewsData.filter((interview) =>
    interview.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.roll_no.toString().includes(searchTerm) ||
    interview.first_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { dataField: "platform", text: "Platform", sort: true },
    { dataField: "roll_no", text: "Roll no", sort: true },
    { dataField: "first_name", text: "Name", sort: true },
    { dataField: "gender", text: "Gender", sort: true },
    { dataField: "level", text: "Level", sort: true },
    { dataField: "questions_count", text: "No of Questions", sort: true },
    { dataField: "start_date_time_ist", text: "Start Date & Time", sort: true },
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
          <Link to={`https://mpod.ai/coding-report?roll_no=${interview.roll_no}&interview_type=coding&id=${interview._id}`} className="btn btn-info btn-sm me-2">
            View
          </Link>
        ) : (
          <Button color="danger" size="sm" onClick={() => handleDeleteClick(interview._id)}>
            Delete
          </Button>
        );
      }
    }
  ];

  const rows = filteredData.map(interview => ({
    platform: interview.platform,
    roll_no: interview.roll_no,
    first_name: interview.first_name,
    gender: interview.gender,
    level: interview.level,
    questions_count: interview.questions_count,
    start_date_time: interview.start_date_time_ist,
    interview_status: interview.interview_status,
    _id: interview._id
  }));
  useEffect(() => {
    let filtered = interviewsData;

    // Filter by Date
    if (filterDate) {
      filtered = filtered.filter((interview) => {
        const interviewDate = new Date(interview.start_date_time_ist.split(" ")[0].split("-").reverse().join("-"));
        const selectedDate = new Date(filterDate);
        return interviewDate.toDateString() === selectedDate.toDateString();
      });
    }

    // Filter by Status
    if (statusFilter !== "All") {
      filtered = filtered.filter((interview) => interview.interview_status === statusFilter);
    }

    // Filter by Search Term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((interview) =>
        interview.platform.toLowerCase().includes(term) ||
        interview.roll_no.toString().includes(term) ||
        interview.first_name.toLowerCase().includes(term)
      );
    }

    setFilteredData(filtered);
  }, [filterDate, statusFilter, searchTerm, interviewsData]);
  const downloadExcel = () => {
    // Define a simplified version of the filteredData
    const exportData = filteredData.map((item) => ({
      Platform: item.platform,
      "Roll No": item.roll_no,
      Name: item.first_name,
      Gender: item.gender,
      Level: item.level,
      "No of Questions": item.questions_count,
      "Start Date & Time": item.start_date_time_ist,
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
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">{user && user.organization} - Coding Interviews List</CardTitle>
              <div>
                <Button color="success" onClick={downloadExcel} className="me-2">
                  Download Excel
                </Button>
                <Link to="/add-coding-interview">
                  <Button color="primary">ADD CODING INTERVIEW</Button>
                </Link>
              </div>
            </CardBody>
            <CardBody>
              {/* Search Input */}
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
                    onChange={(e) => setFilterDate(e.target.value)}
                    placeholder="Filter by Date"
                  />
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
              </Row>
              {
                filteredData.length !== 0 ? (
                  <BootstrapTable
                    bootstrap4
                    keyField="_id"
                    columns={columns}
                    data={filteredData}
                    pagination={paginationFactory()}
                  // striped
                  // hover
                  />
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

      {/* Delete Confirmation Modal */}
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
