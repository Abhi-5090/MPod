import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"

import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from 'react-loader-spinner';

import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
const CodingQuestionsList = (props) => {
  document.title = "Assessment Questions list | Technical Hub - All the list of Assessment Questions";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Assessment Questions", link: "#" },
    { title: "Assessment Questions List", link: "#" },
  ]
  const [codingQuestionData, setCodingQuestionData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [codingQuestionToDelete, setCodingQuestionToDelete] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems('Assessment Questions', breadcrumbItems);
    fetchData();
  }, []);



  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'coding' || authUser.role == 'operations' || authUser.role == 'manager') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const authUser = JSON.parse(localStorage.getItem('authUser'))
    try {
      const response = await axios.post(backendUrl + 'get-assessment-questions',{technologyIds:authUser.technology});

      console.log(response.data)
      if (response.status === 200) {
        setCodingQuestionData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (codingQuestion) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-codingQuestion/${codingQuestionToDelete._id}`);
    if (response.status == 200) {
      console.log("CodingQuestion deleted:", codingQuestionToDelete);
    }
    const updatedCodingQuestionData = codingQuestionData.filter(codingQuestion => codingQuestion._id !== codingQuestionToDelete._id);
    setCodingQuestionData(updatedCodingQuestionData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (codingQuestion) => {
    console.log(codingQuestion)
    setCodingQuestionToDelete(codingQuestion);
    setShowDeleteModal(!showDeleteModal);
  };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
  const currentDate = new Date();

  const data = {
    columns: [
      // { label: "Programme", field: "course_name", sort: "asc", width: 150 },
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      { label: "Module", field: "module_name", sort: "asc", width: 150 },
      { label: "Question", field: "question", sort: "asc", width: 150 },
         
      { label: "Level", field: "level", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: codingQuestionData.map(codingQuestion => {
      return {
        codingQuestion_name: codingQuestion.codingQuestion_name,
        technology_name: codingQuestion.technology_name,
        module_name: codingQuestion.module_name,
        question:codingQuestion.question,
      
        level: codingQuestion.level,
        status:codingQuestion.status,
        actions: (
          <div>
            <Link to={`/edit-assessment-question/${codingQuestion._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
            <Button color="danger" size="sm" onClick={() => toggleDeleteModal(codingQuestion)}>Delete</Button>
          </div>
        ),
      };
    }),
  };



  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Assessment Question</CardTitle>
              <a href="/admin/add-assessment-question">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD QUESTION</Button>
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

export default connect(null, { setBreadcrumbItems })(CodingQuestionsList);