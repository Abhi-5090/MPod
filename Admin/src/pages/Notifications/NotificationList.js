import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import "./datatables.scss";

const NotificationsList = (props) => {
  document.title = "Notifications List | Technical Hub - All the Notifications list";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Notifications", link: "#" },
    { title: "Notifications List", link: "#" },
  ];

  const [notificationsData, setPlacementsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [placementToDelete, setPlacementToDelete] = useState(null);

  const notification_url = process.env.REACT_APP_BACKEND_IMAGE_URL+"notifications/";
  // const backendUrl = process.env.REACT_APP_BACKEND_URL;

  console.log(notification_url)

  useEffect(() => {
    props.setBreadcrumbItems('Notifications', breadcrumbItems);
    fetchPlacementsData();
  }, []);

  const fetchPlacementsData = async () => {
    try {
      const response = await axios.get(`http://node.technicalhub.io:4001/api/get-notificationsdata`);
      if (response.status === 200) {
        console.log(response.data);
        setPlacementsData(response.data);
        setLoading(false);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://node.technicalhub.io:4001/api/delete-Notification-data/${placementToDelete._id}`);
      if (response.status === 200) {
        toast.success('Placement deleted successfully', {
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
        const updatedPlacementsData = notificationsData.filter(p => p._id !== placementToDelete._id);
        setPlacementsData(updatedPlacementsData);
        setShowDeleteModal(false);
        setPlacementToDelete(null);
      }
    } catch (error) {
      console.log("Error deleting placement:", error);
      toast.error('Error deleting placement', {
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
  };

  const toggleDeleteModal = (placement) => {
    setPlacementToDelete(placement);
    setShowDeleteModal(!showDeleteModal);
  };

  const handleStatusToggle = async (placement) => {
    const updatedStatus = placement.status === 1 ? 0 : 1;
    try {
      const response = await axios.put(`http://node.technicalhub.io:4001/api/update-status/${placement._id}`, { status: updatedStatus });
      if (response.status === 200) {
        toast.success('Status updated successfully', {
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
        const updatedPlacementsData = notificationsData.map(p => p._id === placement._id ? { ...p, status: updatedStatus } : p);
        setPlacementsData(updatedPlacementsData);
      }
    } catch (error) {
      console.log("Error updating status:", error);
      toast.error('Error updating status', {
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
  };

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Image", field: "image", sort: "asc", width: 150 },
      { label: "Title", field: "heading", sort: "asc", width: 150 },
      { label: "Description", field: "Description", sort: "asc", width: 150 },
      { label: "Link", field: "link", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 150 },
      { label: "Pass Out Year", field: "pass_outyear", sort: "asc", width: 150 },
      { label: "Gender", field: "gender", sort: "asc", width: 150 },
      { label: "Batch", field: "batch", sort: "asc", width: 150 },
      { label: "Added By", field: "addedby", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 100 },
      { label: "Action", field: "actions", sort: "asc", width: 150 },
    ],
    rows: Array.isArray(notificationsData) && notificationsData.length > 0
      ? notificationsData.map((placement, index) => ({
          sno: index + 1,
          image: (<img src={`${placement.image}`} alt="Image" width="100px" />),
          heading: placement.heading,
          Description: placement.Description,
          link: placement.link ? (
            <Button color="link" onClick={() => window.open(placement.link, '_blank')}>
              Register
            </Button>
          ) : (
            "N/A"
          ),
          branch: placement.branch,
          pass_outyear: placement.pass_outyear,
          gender: placement.gender,
          batch: placement.batch,
          addedby: placement.addedby,
          status: (
            <span style={{ color: placement.status === 1 ? 'green' : 'red' }}>
              {placement.status === 1 ? 'Active' : 'Inactive'}
            </span>
          ),
          actions: (
            <div>
              <Link to={`/edit-notifications/${placement._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
              <Button color="danger" size="sm" className="me-2" onClick={() => toggleDeleteModal(placement)}>Delete</Button>
              
            </div>
          ),
        }))
      : [],
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
          transition={Bounce}
        />
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Placements List</CardTitle>
              <Link to="/Add-Notifications">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD Notifications data</Button>
              </Link>
            </CardBody>
            <CardBody>
              {loading ? (
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
              ) : (
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={showDeleteModal} toggle={() => toggleDeleteModal(null)}>
        <ModalHeader toggle={() => toggleDeleteModal(null)}>Delete Placement</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this placement?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => toggleDeleteModal(null)}>Cancel</Button>
          <Button color="danger" onClick={handleDelete}>Delete</Button>{' '}
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(NotificationsList);
