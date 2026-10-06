import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../../store/actions";
import { MutatingDots } from 'react-loader-spinner';
import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const AssessmentsList = (props) => {
  document.title = "Verbal Tests list | Technical Hub";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Verbal", link: "#" },
    { title: "Verbal Tests List", link: "#" },
  ]
  const [testsData, setTestsData] = useState([]);
  const [questionsLoader, setQuestionsLoader] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);
  useEffect(() => {
    props.setBreadcrumbItems('Verbal Tests', breadcrumbItems);
    fetchData();
  }, []);

 useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding' ||authUser.role == 'Principal' ||authUser.role == 'faculty' ||authUser.role == 'hod') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-verbal-mandatory-tests');
      // const response = await axios.get(backendUrl + 'get-assessments');

      if (response.status === 200) {
        setTestsData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };



  const handleDelete = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-verbal-mandatory-test/${assessmentToDelete}`);
    if (response.status == 200) {
      console.log("Assessment deleted:", assessmentToDelete);
    }
    const updatedAssessmentData = testsData.filter(assessment => assessment._id !== assessmentToDelete);
    setTestsData(updatedAssessmentData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (assessment) => {
    console.log(assessment)
    setAssessmentToDelete(assessment);
    setShowDeleteModal(!showDeleteModal);
  };


  const data = {
    columns: [
      { label: "Test name", field: "test_name", sort: "asc", width: "250px" },
      { label: "complexity", field: "level", sort: "asc", width: "150px" },
      { label: "Topic", field: "topic_name", sort: "asc", width: 200 },
      { label: "# Questions", field: "questions_count", sort: "asc", width: 20 },
      { label: "Action", field: "actions", sort: "asc", width: 50 },
    ],
    rows: testsData.map(test => {

      let complexity = '';
      if (test.level == "easy") {
        complexity = <Badge color="info" className="bg-info">Easy</Badge>;
      } else if (test.level == "medium") {
        complexity = <Badge color="warning" className="bg-warning">Medium</Badge>;
      } else if (test.level == "hard") {
        complexity = <Badge color="danger" className="bg-danger">Hard</Badge>;
      }
      let actions = "";
      actions =
        <div>
          <Link to={`/edit-verbal--mandatory-test/${test._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" size="sm" onClick={() => toggleDeleteModal(test._id)}>Delete</Button>
        </div>

      return {
        test_name: test.test_name,
        level: complexity,
        topic_name: test.topic_name,
        questions_count: test.questions_count,
        actions: actions
      };
    }),
  };



  return (
    <React.Fragment>
      <Row>
        <Col className="col-8">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Verbal Tests List</CardTitle>
              <a href="/admin/add-mandatory-test">
                <Button type="button" color="primary" className="waves-effect waves-light">Add Test</Button>
              </a>
            </CardBody>
            <CardBody>
              {
                data.rows.length !== 0 ? (
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
                        wrapperStyle={{}}
                        wrapperClass=""
                      />
                    </div>
                  </div>
                )
              }
            </CardBody>
          </Card>
        </Col>

      </Row>
      <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AssessmentsList);