import React, { useEffect, useState, useMemo } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap";
import { MutatingDots } from "react-loader-spinner";
import { connect } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import "./datatables.scss";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import axiosInstance from "../../api/axiosInstance";

const UsersList = (props) => {
  document.title = "Users list | Technical Hub - All the list of Users";

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const breadcrumbItems = useMemo(() => [
    { title: "Technical Hub", link: "#" },
    { title: "Users", link: "#" },
    { title: "Users List", link: "#" },
  ], []);

  useEffect(() => {
    props.setBreadcrumbItems("Users", breadcrumbItems);
  }, [props, breadcrumbItems]); 
  useEffect(() => {
    fetchCurrentUserData();
  }, []); 
  useEffect(() => {
    if (user && ["tenantadmin","admin", "super admin"].includes(user.role)) {
      console.log("hello")
      fetchData();
    }
  }, [user]); 

  const fetchCurrentUserData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

      const response = await axios.get(backendUrl+"get-admin-current-user");
      if (response.data) {
        setUser(response.data);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  const fetchData = async () => {
    if (!user) return;

    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-users/${user.t_id}`);
      if (response.status === 200) {
        setUserData(response.data); 
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.delete(`${backendUrl}/delete-user/${userToDelete._id}`);
      if (response.status === 200) {
        toast.success("User deleted successfully", {
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

        setUserData(prevData => prevData.filter(u => u._id !== userToDelete._id));
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const toggleDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(!showDeleteModal);
  };

  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL;

  const data = useMemo(() => ({
    columns: [
      { label: "Profile Pic", field: "profile_pic", sort: "asc", width: 150 },
      { label: "Name", field: "first_name", sort: "asc", width: 150 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "Gender", field: "gender", sort: "asc", width: 150 },
      { label: "Email", field: "email", sort: "asc", width: 150 },
      { label: "Role", field: "role", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: userData.map(user => ({
      first_name: user.first_name,
      email: user.email,
      roll_no: user.roll_no,
      gender: user.gender,
      role: user.role,
      status: user.status === 1 ? <Badge color="success">Active</Badge> : <Badge color="danger">Inactive</Badge>,
      profile_pic: (
        <img
          src={`${backendImageUrl}profile-pics/${user.roll_no}.png`}
          alt="Profile Icon"
          width="50px"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${backendImageUrl}profile-pics/default.png`;
          }}
        />
      ),
      actions: (
        <div>
          <Link to={`/edit-user/${user._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" size="sm" onClick={() => toggleDeleteModal(user)}>Delete</Button>
        </div>
      ),
    })),
  }), [userData, backendImageUrl]); 

  return (
    <React.Fragment>
      <Row>
        <ToastContainer />
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">{user&&user.organization}-Users List</CardTitle>
              <Link to="/add-user">
                <Button color="primary">ADD Users</Button>
              </Link>
            </CardBody>
            <CardBody>
              {userData.length > 0 ? (
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              ) : (
            <CardBody className="d-flex justify-content-between align-items-center">

                <div className="text-center">
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
            </CardBody>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
      <DeleteConfirmationModal isOpen={showDeleteModal} toggle={toggleDeleteModal} onDelete={handleDelete} />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(UsersList);
