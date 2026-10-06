import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
const CoursesList = (props) => {
  document.title = "Courses list | Technical Hub - All the list of Courses";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Courses", link: "#" },
    { title: "Courses List", link: "#" },
  ]
  const [courseData, setCourseData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems('Courses', breadcrumbItems);
    fetchData();
  }, []);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin') {
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
      const response = await axios.get(backendUrl + 'get-courses');
      if (response.status === 200) {
        setCourseData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (course) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-course/${courseToDelete._id}`);
    if(response.status == 200) {
      console.log("Course deleted:", courseToDelete);
    }
    const updatedCourseData = courseData.filter(course => course._id !== courseToDelete._id);
    setCourseData(updatedCourseData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(!showDeleteModal);
  };

  const data = {
    columns: [
      { label: "Course Name", field: "course_name", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: courseData.map(course => ({
      course_name: course.course_name,
      status: course.status === 1 ? <Badge color="success" className="bg-success">Active</Badge> : <Badge color="danger" className="bg-danger">Inactive</Badge>,
      actions: (
        <div>
          <Link to={`/edit-course/${course._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" className="d-none" size="sm" onClick={() => toggleDeleteModal(course)}>Delete</Button>
        </div>
      ),
    })),
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Course</CardTitle>
              <a href="/admin/add-course">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD COURSE</Button>
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

export default connect(null, { setBreadcrumbItems })(CoursesList);