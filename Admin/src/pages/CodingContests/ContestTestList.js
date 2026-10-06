import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge, Modal, ModalHeader, ModalBody, Table } from "reactstrap";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from "react-loader-spinner";
import axios from "axios";
import * as XLSX from "xlsx";
import "./datatables.scss";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const ContestsList = (props) => {
  document.title = "Contests list | Technical Hub - All the list of Contests";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Contests", link: "#" },
    { title: "Contests List", link: "#" },
  ];

  const [contestData, setContestData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contestToDelete, setContestToDelete] = useState(null);
  const [questionsModal, setQuestionsModal] = useState(false); // For Questions Modal
  const [questionsData, setQuestionsData] = useState([]); // Questions data for the modal.

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
  useEffect(() => {
    props.setBreadcrumbItems("Contests", breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-coding-contests`);
      if (response.status === 200) {
        setContestData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchRegisteredData = async (contest) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(`${backendUrl}registered-students`, { contest: contest });
      if (response.status === 200) {
        console.log(response.data)
        const rollNumbers = response.data; // Assuming this is the array of roll numbers
        generateExcel(rollNumbers);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const generateExcel = (data) => {
    // Convert the data array into a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([["Roll Numbers"], ...data.map((roll) => [roll])]);

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registered Students");

    // Write the Excel file and trigger download
    XLSX.writeFile(workbook, "Registered_Students.xlsx");
  };
  const fetchQuestionsData = async (contest) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(`${backendUrl}contest-questions`, { contest: contest });
      if (response.status === 200) {
        setQuestionsData(response.data.problem_details || []); // Set fetched questions data
        setQuestionsModal(true); // Open the modal
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const toggleQuestionsModal = () => {
    setQuestionsModal(!questionsModal);
  };
  const handleDelete = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-contest/${contestToDelete._id}`);
    if (response.status === 200) {
      console.log("Contest deleted:", contestToDelete);
      const updatedContestData = contestData.filter((contest) => contest._id !== contestToDelete._id);
      setContestData(updatedContestData);
      setShowDeleteModal(false);
    }
  };

  const toggleDeleteModal = (contest) => {
    setContestToDelete(contest);
    setShowDeleteModal(!showDeleteModal);
  };

  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL;

  function convertToIST(utcDateString) {
    const date = new Date(utcDateString);
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return date.toLocaleString("en-IN", options);
  }

  const data = {
    columns: [
      { label: "Contest Test Name", field: "contest_name", sort: "asc", width: 150 },
      { label: "Start Date", field: "start_date_time", sort: "asc", width: 150 },
      { label: "End Date", field: "end_date_time", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "action", sort: "asc", width: 60 },
    ],
    rows: contestData.map((contest) => {
      const startDate = new Date(contest.contest_start_date);
      const endDate = new Date(contest.contest_end_date);
      const currentDate = new Date();

      let status = "";
      if (startDate > currentDate && contest.status === 1) {
        status = <Badge color="info">Upcoming</Badge>;
      } else if (startDate <= currentDate && endDate >= currentDate && contest.status === 1) {
        status = <Badge color="warning">In Progress</Badge>;
      } else if (endDate < currentDate && contest.status === 1) {
        status = <Badge color="danger">Completed</Badge>;
      } else if (contest.status === 0) {
        status = <Badge color="secondary">Hold</Badge>;
      } else {
        status = <Badge color="light">Unknown</Badge>;
      }

      const action = (
        <>
          <Link to={`/edit-contest-test/${contest._id}`} className="btn btn-info btn-sm me-2">Edit</Link>

        <button class="waves-effect waves-light btn btn-primary" style={{marginRight:"20px"}} onClick={() => fetchRegisteredData(contest._id)}>Registered</button>
        <button class="waves-effect waves-light btn btn-primary" onClick={() => fetchQuestionsData(contest._id)}>Questions</button>
        </>

      );

      return {
        contest_name: contest.title,
        start_date_time: convertToIST(contest.contest_start_date),
        end_date_time: convertToIST(contest.contest_end_date),
        status: status,
        action: action,
      };
    }),
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Contest</CardTitle>
              <a href="/admin/add-contest-test">
                <Button type="button" color="primary" className="waves-effect waves-light">
                  ADD CONTEST
                </Button>
              </a>
            </CardBody>
            <CardBody>
              {data.rows.length !== 0 ? (
                <MDBDataTable responsive bordered data={data} noBottomColumns />
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
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        toggle={() => setShowDeleteModal(!showDeleteModal)}
        onDelete={handleDelete}
      />
       {/* Questions Modal */}
       <Modal isOpen={questionsModal} toggle={toggleQuestionsModal}>
        <ModalHeader toggle={toggleQuestionsModal}>Questions List</ModalHeader>
        <ModalBody>
          {questionsData.length > 0 ? (
            <Table bordered>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Problem Name</th>
                  <th>Complexity</th>
                </tr>
              </thead>
              <tbody>
                {questionsData.map((question, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{question.problem_name}</td>
                    <td>{question.complexity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No questions available.</p>
          )}
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(ContestsList);
