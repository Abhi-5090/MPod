import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap";
import { MutatingDots } from "react-loader-spinner";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./datatables.scss";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import axiosInstance from "../../api/axiosInstance";

const UsersList = (props) => {
  document.title = "Users list | Technical Hub - All the list of Users";

  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zipFile, setZipFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [user, setUser] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL;
  const mpodBackendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
  const navigate = useNavigate()
  console.log(mpodBackendUrl)
  useEffect(() => {
    if (user && ["tenantadmin","admin", "super admin"].includes(user.role)) {
      console.log("hello")
    fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${mpodBackendUrl}get-users/${user.t_id}`);
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchCurrentUserData();
  }, []); 

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
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".zip")) {
      setZipFile(file);
    } else {
      toast.error("Please upload a valid ZIP file containing profile pictures.");
      setZipFile(null);
    }
  };
  const handleUploadZip = async () => {
    if (!zipFile) {
      toast.error("Please select a valid ZIP file.");
      return;
    }
  
    const formData = new FormData();
    formData.append("profile_pics_zip", zipFile); // SAME AS BACKEND
  
    try {
      const response = await axios.post(`${mpodBackendUrl}upload-profile-pics`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      toast.success(response.data.message);
      setZipFile(null);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to upload profile pictures.");
      console.error(error);
    }
  };
  

  const toggleDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(!showDeleteModal);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${backendUrl}delete-user/${userToDelete._id}`);
      toast.success("User deleted successfully");
      setUserData(userData.filter((u) => u._id !== userToDelete._id));
    } catch (error) {
      toast.error("Failed to delete user.");
    }
    setShowDeleteModal(false);
  };

  const data = {
    columns: [
      { label: "Profile Pic", field: "profile_pic", sort: "asc", width: 150 },
      { label: "Name", field: "first_name", sort: "asc", width: 150 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 100 },
      { label: "Action", field: "actions", sort: "asc", width: 100 },
    ],
    rows: userData.map((user) => {
      console.log(`${backendImageUrl}profile-pics/${user.roll_no}.png`);
  
      return {
        profile_pic: user.roll_no ? (
          <img
            src={`${backendImageUrl}profile-pics/${user.roll_no}.png`}
            alt="Profile"
            width="50px"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${backendImageUrl}profile-pics/default.png`; // Fallback image if image not found
            }}
          />
        ) : (
          "No Image"
        ),
        first_name: user.first_name,
        roll_no: user.roll_no,
        status: user.status === 1 ? (
          <Badge color="success" className="bg-success">Active</Badge>
        ) : (
          <Badge color="danger" className="bg-danger">Inactive</Badge>
        ),
        actions: (
          <div>
            <Link to={`/edit-user/${user._id}`} className="btn btn-info btn-sm me-2">
              Edit
            </Link>
            <Button color="danger" size="sm" onClick={() => toggleDeleteModal(user)}>
              Delete
            </Button>
          </div>
        ),
      };
    }),
  };
  
  return (
    <React.Fragment>
      <Row>
        <ToastContainer position="top-right" autoClose={5000} transition={Bounce} />

        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Users List</CardTitle>
              <div>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="zipFileInput"
                />
                <Button color="primary" onClick={() => document.getElementById("zipFileInput").click()}>
                  Choose ZIP File
                </Button>{" "}
                <Button color="success" onClick={handleUploadZip} disabled={!zipFile}>
                  Upload Profile Pics
                </Button>
              </div>
            </CardBody>
            <CardBody>
              {loading ? (
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
              ) : (
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        toggle={() => setShowDeleteModal(!showDeleteModal)}
        onDelete={handleDelete}
      />
    </React.Fragment>
  );
};

export default UsersList;
