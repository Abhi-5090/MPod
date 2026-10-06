import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Spinner, Badge } from "reactstrap";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import "./datatables.scss";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { MutatingDots } from 'react-loader-spinner';

const TestsList = (props) => {
  document.title = "Mandatory Tests list | Technical Hub - Mandatory Tests List";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Mandatory Tests", link: "#" },
    { title: "Mandatory Tests List", link: "#" },
  ];

  const axiosAPI = axios.create();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);


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
    props.setBreadcrumbItems('Mandatory Tests List', breadcrumbItems);
  }, []);

  useEffect(() => {
    setLoading(true);
    const baseURL = `${process.env.REACT_APP_BACKEND_URL}mandatory-tests-list`;
    axiosAPI.get(baseURL)
      .then((response) => setTests(response.data['tests']))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const data = {
    columns: [
      { label: "Course", field: "course", sort: "asc", width: 150 },
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      // { label: "Test Name", field: "test_name", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 200 },
      { label: "Action", field: "action", width: 200 },
    ],
    rows: tests,
  };

  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
  };

  const handleDelete = (id) => {
    setTestToDelete(id);
    toggleDeleteModal();
  };

  const confirmDelete = () => {
    const baseURL = `${process.env.REACT_APP_BACKEND_URL}delete-mandatory-test/` + testToDelete;
    axiosAPI.delete(baseURL)
      .then((res) => {
        if (res.status === 200) {
          toast.success('Test Deleted', {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
          window.location.reload(true);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 400) {
          toast.error('Test not Deleted', {
            position: "top-right",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      })
      .finally(() => {
        toggleDeleteModal();
        setTestToDelete(null);
      });
  };
  const handleEdit = () => {


  }
  if (data) {
    tests.map((item) => {
      const activeBtn = (<Badge className="bg-success badge bg-secondary">ACTIVE</Badge>);
      const inActiveBtn = (<Badge className="bg-danger badge bg-secondary">INACTIVE</Badge>);
      const isStatus = (item.status === 1 ? activeBtn : inActiveBtn);
      item.status = isStatus;

      const edit = (
        <>
          <Link to={`/edit-coding-mandatory-test/${item._id}`} className="btn btn-info btn-sm me-2">Edit</Link>

          <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
        </>
      );
      item.action = edit;

      if (item['course_id']) {
        item.course_name = item['course_id']['course_name'];
      }
    });
  }

  return (
    <React.Fragment>
      <ToastContainer />
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody>
              <CardTitle className="h4"></CardTitle>
              <p className="card-title-desc"></p>
              <div className="text-right button-items" style={{ float: "right", clear: "both" }}>
                <Link to={`/add-coding-mandatory-test`} className="btn btn-primary">Add Mandatory Test</Link>
              </div>
              {loading ? (
                <div>
                  <Col lg={6}>
                    <Card>
                      <CardBody>
                        <div className="container">
                          <Spinner type="grow" className="ms-2" color="success" />
                          <Spinner type="grow" className="ms-2" color="danger" />
                          <Spinner type="grow" className="ms-2" color="warning" />
                          <Spinner type="grow" className="ms-2" color="light" />
                          <Spinner type="grow" className="ms-2" color="dark" />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </div>
              ) : (
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        toggle={toggleDeleteModal}
        onDelete={confirmDelete}
      />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(TestsList);
