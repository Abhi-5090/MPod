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
const AssessmentsList = (props) => {
  document.title = "Assessments list | Technical Hub - All the list of Assessments";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Assessments", link: "#" },
    { title: "Assessments List", link: "#" },
  ]
  const [assessmentData, setAssessmentData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'trainer' || authUser.role == 'manager' || authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems('Assessments', breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const authUser = JSON.parse(localStorage.getItem('authUser'))
    console.log(authUser.technology)
    try {
      const response = await axios.post(backendUrl + 'get-assessments-by-technology',{technologyIds:authUser.technology});
      // const response = await axios.get(backendUrl + 'get-assessments');

      console.log(response.data)
      if (response.status === 200) {
        setAssessmentData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (assessment) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-assessment/${assessmentToDelete._id}`);
    if (response.status == 200) {
      console.log("Assessment deleted:", assessmentToDelete);
    }
    const updatedAssessmentData = assessmentData.filter(assessment => assessment._id !== assessmentToDelete._id);
    setAssessmentData(updatedAssessmentData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (assessment) => {
    console.log(assessment)
    setAssessmentToDelete(assessment);
    setShowDeleteModal(!showDeleteModal);
  };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
  const currentDate = new Date();

  const data = {
    columns: [
      { label: "Programme", field: "course_name", sort: "asc", width: 150 },
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      { label: "Module", field: "module_name", sort: "asc", width: 150 },
      { label: "Topic", field: "topic_name", sort: "asc", width: 150 },
      { label: "Assessment Type", field: "assessment_name", sort: "asc", width: 150 },
      { label: "Start Date", field: "start_date_time", sort: "asc", width: 150 },
      { label: "End Date", field: "end_date_time", sort: "asc", width: 150 },
      { label: "Level", field: "level", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: assessmentData.map(assessment => {
      const parseDateTime = (dateTime) => {
        const [date, time] = dateTime.split(' ');
        const [day, month, year] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
      };

      const startDate = parseDateTime(assessment.start_date_time);
      const endDate = parseDateTime(assessment.end_date_time);

      const currentDate = new Date();

      let status = '';
      if (startDate > currentDate && assessment.status == 1) {
        status = <Badge color="info" className="bg-info">Upcoming</Badge>;
      } else if (startDate <= currentDate && endDate >= currentDate && assessment.status == 1) {
        status = <Badge color="warning" className="bg-warning">In Progress</Badge>;
      } else if (endDate < currentDate && assessment.status == 1) {
        status = <Badge color="danger" className="bg-danger">Completed</Badge>;
      } else if (assessment.status == 0) {
        status = <Badge color="secondary" className="bg-secondary">Hold</Badge>;
      }

      return {
        course_name: assessment.course_name,
        assessment_name: assessment.assessment_name,
        technology_name: assessment.technology_name,
        module_name: assessment.module_name,
        topic_name: assessment.topic_name,
        assessment_name:assessment.test_type,
        start_date_time: assessment.start_date_time,
        end_date_time: assessment.end_date_time,
        level: assessment.level,
        year: assessment.year,
        status: status,
        assessment_icon: (<img src={backendImageUrl + "assessment-icons/" + assessment.assessment_icon} alt="Assessment Icon" width="50px" />),
        actions: (
          <div>
            <Link to={`/edit-assessment/${assessment._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
            <Button color="danger" size="sm" onClick={() => toggleDeleteModal(assessment)}>Delete</Button>
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
              <CardTitle className="h4">Add Assessment</CardTitle>
              <a href="/admin/add-assessment">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD ASSESSEMENT</Button>
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