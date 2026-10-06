import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  CardTitle,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { MutatingDots } from 'react-loader-spinner';
const AddUser = (props) => {
  const navigate = useNavigate();
  document.title = "Technial Hub| Add User";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Users", link: "/users-list" },
    { title: "Add User", link: "/add-user" },
  ];
  const [technologySelectedGroup, setTechnologySelectedGroup] = useState()
  const [tenantData, setTenantData] = useState([])
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    props.setBreadcrumbItems('Add User', breadcrumbItems);
    fetchData()
  }, []);
  useEffect(() => {
    fetchCurrentUserData();
  }, []);

  const fetchCurrentUserData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

      const response = await axios.get(backendUrl + "get-admin-current-user");
      console.log(response.data);
      setUser(response.data);
    } catch (error) {
      console.log(error);
      navigate("/login");
    }
  };
  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-tenants');
      console.log(response.status)
      if (response.status === 200) {
        setTenantData(response.data);
      }

    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const optionGroup = tenantData.map((ele) => ({
    options: [
      { label: ele.organization_name, value: ele._id }
    ]
  }));

  function handleTechnologySelectGroup(e) {
    console.log(e)
    setTechnologySelectedGroup(e)
  }

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const fileReader = new FileReader();

    fileReader.readAsDataURL(event.target.files[0]);
  };
  const addUser = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenant_id', technologySelectedGroup.value);
    formData.append('status', 1);
    console.log(technologySelectedGroup.value)
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'add-user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status == 200) {
        setLoading(false);
        toast('User added successfully', {
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
        console.log(response.data.existingRollNos)
        if (response.data.existingRollNos.length > 0) {
          alert("These Roll Numbers already existed: " + response.data.existingRollNos.join(", "));
        }

        navigate(`/users-list`)
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("User already exists")
      } else if (error.response && error.resopnse.status == 500) {
        alert("something went wrong")
      }
      console.error('Error fetching data:', error);
    }
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

        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">ADD USER</h4>

              {
                loading ?
                  (<>
                    <div className="text-center mt-4">
                      <MutatingDots
                        visible={true}
                        height="100"
                        width="100"
                        color="#564da9ff" // Example color
                        secondaryColor="#564da9ff" // Example color
                        radius="12.5"
                        ariaLabel="mutating-dots-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                      />
                    </div>
                  </>) : (
                    <AvForm className="needs-validation">
                      <Row>
                        <Col md="6">
                          <div className="mb-3">

                            <div className="mb-3">
                              <label className="form-lable">User Details</label><br />
                              <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                            </div>

                          </div>
                        </Col>
                      </Row>

                      <Row>
                        <Col md="6">
                          <div className="mb-3">
                            <Label>Select Tenant</Label>
                            <Select
                              onChange={handleTechnologySelectGroup}
                              options={optionGroup}
                              classNamePrefix="select2-selection"
                              className="react-select-container"
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                // menu: (base) => ({
                                //   ...base,
                                //   maxHeight: "200px", // 👈 limits visible height
                                //   overflowY: "auto",  // 👈 enables scrolling
                                // }),
                              }}
                            />
                          </div>
                        </Col>
                      </Row>

                      <Button color="primary" type="button" onClick={addUser} disabled={!technologySelectedGroup || !file}>
                        Submit
                      </Button>
                    </AvForm>
                  )
              }

            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddUser);
