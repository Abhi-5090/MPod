import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Button, Label } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddTenant = (props) => {
  const navigate = useNavigate();
  document.title = "Technical Hub | Add Tenant";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Tenants", link: "/tenants-list" },
    { title: "Add Tenant", link: "/add-tenant" },
  ];

  const [tenantData, setTenantData] = useState({
    organization_name: "",
    contact_person: "",
    email: "",
    assigned_credits: [],
    interview_duration_minutes: 30,
    organization_code: "",
    status: 1,
  });

  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems("Add Tenant", breadcrumbItems);
    fetchCurrentUserData();
  }, []);

  // Fetch authenticated user info
  const fetchCurrentUserData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
      const response = await axios.get(`${backendUrl}get-admin-current-user`);
      if (response.status === 200) {
        setAuthUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching admin user data:", error);
      toast.error("Unable to fetch current user. Please login again.", {
        position: "top-right",
        autoClose: 4000,
        transition: Bounce,
      });
      localStorage.clear();
      window.location.href = "/admin/login";
    }
  };

  const handleChange = (e) => {
    setTenantData({ ...tenantData, [e.target.name]: e.target.value });
  };

  // Dynamically calculate active credits
  const getActiveCredits = () => {
    return tenantData.assigned_credits.reduce((sum, val) => sum + Number(val), 0);
  };

  const handleSubmit = async () => {
    if (!authUser) {
      toast.error("User not authenticated!", {
        position: "top-right",
        autoClose: 3000,
        transition: Bounce,
      });
      return;
    }

    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

    const dataToSend = {
      ...tenantData,
      active_credits: getActiveCredits(),
      created_by: authUser._id,
    };

    try {
      const response = await axios.post(`${backendUrl}add-tenant`, dataToSend);
      if (response.status === 201) {
        toast.success("Tenant added successfully!", {
          position: "top-right",
          autoClose: 3000,
          transition: Bounce,
        });
        setTimeout(() => navigate("/tenants-list"), 2000);
      }
    } catch (error) {
      console.error("Error adding tenant:", error);
      toast.error(
        error.response?.data?.message || "Failed to add tenant. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
          transition: Bounce,
        }
      );
    }
  };

  return (
    <React.Fragment>
      <ToastContainer />
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Tenant</h4>

              <AvForm className="needs-validation">
                <Row>
                  <Col md="12">
                    <div className="mb-3">
                      <Label>Organization Name</Label>
                      <AvField
                        name="organization_name"
                        placeholder="Enter organization name"
                        type="text"
                        value={tenantData.organization_name}
                        errorMessage="Please enter organization name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        onChange={handleChange}
                      />
                    </div>
                  </Col>

                  <Col md="12">
                    <div className="mb-3">
                      <Label>Organization Code</Label>
                      <AvField
                        name="organization_code"
                        placeholder="Enter organization code"
                        type="text"
                        value={tenantData.organization_code}
                        errorMessage="Please enter organization code"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        onChange={handleChange}
                      />
                    </div>
                  </Col>

                  <Col md="12">
                    <div className="mb-3">
                      <Label>Contact Person</Label>
                      <AvField
                        name="contact_person"
                        placeholder="Enter contact person name"
                        type="text"
                        value={tenantData.contact_person}
                        errorMessage="Please enter contact person"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                  
                  <Col md="12">
                    <div className="mb-3">
                      <Label>Email</Label>
                      <AvField
                        name="email"
                        placeholder="Enter email address"
                        type="email"
                        value={tenantData.email}
                        errorMessage="Please enter a valid email"
                        className="form-control"
                        validate={{
                          required: { value: true },
                          email: { value: true },
                        }}
                        onChange={handleChange}
                      />
                    </div>
                  </Col>

                  <Col md="12">
                    <div className="mb-3">
                      <Label>Assigned Credits (comma-separated)</Label>
                      <AvField
                        name="assigned_credits"
                        placeholder="Enter assigned credits (e.g. 10,20,30)"
                        type="text"
                        value={tenantData.assigned_credits.join(",")}
                        errorMessage="Please enter assigned credits"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        onChange={(e) =>
                          setTenantData({
                            ...tenantData,
                            assigned_credits: e.target.value
                              .split(",")
                              .map((num) => num.trim())
                              .filter((num) => num !== ""),
                          })
                        }
                      />
                    </div>
                  </Col>

                  <Col md="12">
                    <div className="mb-3">
                      <Label>Active Credits (auto-calculated)</Label>
                      <input
                        type="number"
                        className="form-control"
                        value={getActiveCredits()}
                        disabled
                      />
                    </div>
                  </Col>

                  <Col md="12">
                    <div className="mb-3">
                      <Label>Interview Duration (minutes)</Label>
                      <AvField
                        name="interview_duration_minutes"
                        placeholder="Enter interview duration"
                        type="number"
                        value={tenantData.interview_duration_minutes}
                        errorMessage="Please enter interview duration"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        onChange={handleChange}
                      />
                    </div>
                  </Col>

                  <Col md="12">
                    <div className="mb-3">
                      <Label>Status</Label>
                      <AvField
                        type="select"
                        name="status"
                        value={tenantData.status}
                        className="form-control"
                        onChange={handleChange}
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </AvField>
                    </div>
                  </Col>
                </Row>

                <Button color="primary" type="button" onClick={handleSubmit}>
                  Submit
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddTenant);
