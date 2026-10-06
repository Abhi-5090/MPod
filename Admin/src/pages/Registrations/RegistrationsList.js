import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { Link } from "react-router-dom";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import "./datatables.scss";

const RegistrationsList = (props) => {
  document.title = "Registrations List | Technical Hub - All Registrations";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Registrations", link: "#" },
    { title: "Registrations List", link: "#" },
  ];

  const [registrationsData, setRegistrationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);
 
  useEffect(() => {
    props.setBreadcrumbItems('Registrations', breadcrumbItems);
    fetchRegistrationsData();
  }, []);

  const fetchRegistrationsData = async () => {
    try {
      const response = await axios.get('http://node.technicalhub.io:4001/api/get-registrations');
      if (response.status === 200) {
        setRegistrationsData(response.data);
        console.log("this is response",response.data)
        setLoading(false);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://node.technicalhub.io:4001/api/delete-registration/${registrationToDelete._id}`);
      if (response.status === 200) {
        toast.success('Registration deleted successfully', {
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
        const updatedRegistrationsData = registrationsData.filter(r => r._id !== registrationToDelete._id);
        setRegistrationsData(updatedRegistrationsData);
        setShowDeleteModal(false);
        setRegistrationToDelete(null);
      }
    } catch (error) {
      console.log("Error deleting registration:", error);
      toast.error('Error deleting registration', {
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

  const toggleDeleteModal = (registration) => {
    setRegistrationToDelete(registration);
    setShowDeleteModal(!showDeleteModal);
  };

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Title", field: "title", sort: "asc", width: 150 },
      { label: "Type", field: "type", sort: "asc", width: 150 },
      { label: "Batch", field: "batch", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 150 },
      { label: "Passout Year", field: "pass_out_year", sort: "asc", width: 150 },
      { label: "Gender", field: "gender", sort: "asc", width: 150 },
      { label: "Start Date", field: "start_date", sort: "asc", width: 150 },
      { label: "End Date", field: "end_date", sort: "asc", width: 150 },
      { label: "Seats", field: "seats", sort: "asc", width: 100 },
      { label: "Technology Name", field: "technology_name", sort: "asc", width: 100 },
      { label: "Technology Icon", field: "technology_icon", sort: "asc", width: 100 },
      { label: "Actions", field: "actions", sort: "asc", width: 150 },
    ],
    rows: Array.isArray(registrationsData) && registrationsData.length > 0
      ? registrationsData.map((registration, index) => ({
          sno: index + 1,
          title: registration.title,
          type: Array.isArray(registration.type) ? registration.type.join(', ') : registration.type,
          batch: Array.isArray(registration.batch) ? registration.batch.join(', ') : registration.batch,
          branch: Array.isArray(registration.branch) ? registration.branch.join(', ') : registration.branch,
          pass_out_year: Array.isArray(registration.pass_out_year) ? registration.pass_out_year.join(', ') : registration.pass_out_year,
          gender: registration.gender,
          start_date: new Date(registration.start_date).toLocaleDateString(),
          end_date: registration.end_date.split('-').join('/'),
          seats: registration.seats,
          technology_name: registration.technology_name,
          technology_icon: registration.technology_icon ? <img src={`${registration.technology_icon}`} alt="Technology Icon" style={{ width: '80px', height: '50px' }} /> : 'No Icon',
          actions: (
            <div>
              <Link to={`/edit-registration/${registration._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
              <Button color="danger" size="sm" className="me-2" onClick={() => toggleDeleteModal(registration)}>Delete</Button>
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
              <CardTitle className="h4">Registrations List</CardTitle>
              <Link to="/add-registrations">
                <Button type="button" color="primary" className="waves-effect waves-light">Add Registration</Button>
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
        <ModalHeader toggle={() => toggleDeleteModal(null)}>Delete Registration</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this registration?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => toggleDeleteModal(null)}>Cancel</Button>
          <Button color="danger" onClick={handleDelete}>Delete</Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(RegistrationsList);
