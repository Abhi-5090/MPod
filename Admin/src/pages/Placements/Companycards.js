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

const PlacementsList = (props) => {
  document.title = "Placements List | Technical Hub - All the placements list";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Placements", link: "#" },
    { title: "Placements List", link: "#" },
  ];

  const [placementsData, setPlacementsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [placementToDelete, setPlacementToDelete] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems('Placements', breadcrumbItems);
    fetchPlacementsData();
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

  const fetchPlacementsData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl+`get-placements`);
      if (response.status === 201) {
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
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.delete(backendUrl+`delete-data/${placementToDelete._id}`);
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
        const updatedPlacementsData = placementsData.filter(p => p._id !== placementToDelete._id);
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
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.put(backendUrl+`update-status/${placement._id}`, { status: updatedStatus });
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
        const updatedPlacementsData = placementsData.map(p => p._id === placement._id ? { ...p, status: updatedStatus } : p);
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
      { label: "Company Logo", field: "company_logo", sort: "asc", width: 150 },
      { label: "Register Link", field: "register_link", sort: "asc", width: 150 },
      { label: "Dead Line", field: "Deadline", sort: "asc", width: 150 },
      { label: "Eligibility", field: "eligibility", sort: "asc", width: 150 },
      { label: "Category", field: "category", sort: "asc", width: 150 },
      { label: "Added By", field: "addedby", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 100 },
      { label: "Action", field: "actions", sort: "asc", width: 150 },
    ],
    rows: Array.isArray(placementsData) && placementsData.length > 0
      ? placementsData.map((placement, index) => ({
          sno: index + 1,
          company_logo: (<img src={`${placement.company_logo}`} alt="Company Logo" width="200px" />),
          register_link: placement.register_link ? (
            <Button color="link" onClick={() => window.open(placement.register_link, '_blank')}>
              Register
            </Button>
          ) : (
            "null"
          ),
          Deadline: placement.Deadline,
          eligibility: placement.eligibility,
          category: placement.category,
          addedby: placement.addedby,
          status: (
            <span style={{ color: placement.status === 1 ? 'green' : 'red' }}>
              {placement.status === 1 ? 'Active' : 'Inactive'}
            </span>
          ),
          actions: (
            <div>
              <Link to={`/edit-placements/${placement._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
              <Button color="danger" size="sm" className="me-2" onClick={() => toggleDeleteModal(placement)}>Delete</Button>
              <Button
                color={placement.status === 1 ? 'success' : 'secondary'}
                size="sm"
                onClick={() => handleStatusToggle(placement)}
              >
                {placement.status === 1 ? 'Set Inactive' : 'Set Active'}
              </Button>
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
              <Link to="/add-placements">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD Data</Button>
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

export default connect(null, { setBreadcrumbItems })(PlacementsList);
