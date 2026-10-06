import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
const TopicsList = (props) => {
  document.title = "Topics list | Technical Hub - All the list of Topics";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Topics", link: "#" },
    { title: "Topics List", link: "#" },
  ]
  const [topicData, setTopicData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems('Topics', breadcrumbItems);
    fetchData();
  }, []);
  // useEffect(() => {
  //   let authUser = JSON.parse(localStorage.getItem('authUser'));
  //   if (authUser.role == 'admin' || authUser.role == 'superadmin') {
  //   }
  //   else {
  //     alert("your not autherized")
  //     localStorage.clear();
  //     window.location.href = '/admin/login';
  //   }
  // }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-topics');
      console.log(response.data)
      if (response.status === 200) {
        setTopicData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (topic) => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-topic/${topicToDelete._id}`);
    if (response.status == 200) {
      toast.success('Topic deleted successfully', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
    const updatedTopicData = topicData.filter(topic => topic._id !== topicToDelete._id);
    setTopicData(updatedTopicData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (topic) => {
    setTopicToDelete(topic);
    setShowDeleteModal(!showDeleteModal);
  };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
  const data = {
    columns: [
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      { label: "Module", field: "module_name", sort: "asc", width: 150 },
      { label: "Topic", field: "topic_name", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: topicData.map(topic => ({
      technology_name: topic.technology_name,
      module_name: topic.module_name,
      topic_name: topic.topic_name,
      status: topic.status === 1 ? <Badge color="success" className="bg-success">Active</Badge> : <Badge color="danger" className="bg-danger">Inactive</Badge>,
      actions: (
        <div>
          <Link to={`/edit-topic/${topic._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" className="d-none" size="sm" onClick={() => toggleDeleteModal(topic)}>Delete</Button>
        </div>
      ),
    })),
  };

  return (
    <React.Fragment>
      <Row>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}  // Corrected this line
        />

        {/* Same as */}
        <ToastContainer />
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Topic</CardTitle>
              <a href="add-topic">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD TOPIC</Button>
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

export default connect(null, { setBreadcrumbItems })(TopicsList);