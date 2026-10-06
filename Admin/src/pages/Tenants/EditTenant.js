import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Button, Label } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditTenant = (props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  document.title = "Technical Hub | Edit Tenant";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Tenants", link: "/tenants-list" },
    { title: "Edit Tenant", link: `/edit-tenant/${id}` },
  ];

  const [tenantData, setTenantData] = useState({
    organization_name: "",
    contact_person: "",
    email: "",
    assigned_credits: [],
    interview_duration_minutes: 30,
    status: 1,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props.setBreadcrumbItems("Edit Tenant", breadcrumbItems);
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
      const response = await axios.get(`${backendUrl}get-tenant/${id}`);
      if (response.status === 200) {
        const tenant = response.data;
        setTenantData({
          organization_name: tenant.organization_name || "",
          contact_person: tenant.contact_person || "",
          email: tenant.email || "",
          assigned_credits: tenant.assigned_credits || [],
          interview_duration_minutes: tenant.interview_duration_minutes || 30,
          status: tenant.status || 1,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching tenant data:", error);
      toast.error("Failed to fetch tenant data.", {
        position: "top-right",
        autoClose: 4000,
        transition: Bounce,
      });
      navigate("/tenants-list");
    }
  };

  const handleChange = (e) => {
    setTenantData({ ...tenantData, [e.target.name]: e.target.value });
  };

  const getActiveCredits = () => {
    return tenantData.assigned_credits.reduce((sum, val) => sum + Number(val), 0);
  };

  const handleSubmit = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    const dataToSend = {
      ...tenantData,
      active_credits: getActiveCredits(),
    };

    try {
      const response = await axios.put(`${backendUrl}update-tenant/${id}`, dataToSend);
      if (response.status === 200) {
        toast.success("Tenant updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          transition: Bounce,
        });
        setTimeout(() => navigate("/tenants-list"), 2000);
      }
    } catch (error) {
      console.error("Error updating tenant:", error);
      toast.error(
        error.response?.data?.message || "Failed to update tenant. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
          transition: Bounce,
        }
      );
    }
  };

  if (loading) {
    return <div>Loading tenant data...</div>;
  }

  return (
    <React.Fragment>
      <ToastContainer />
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Edit Tenant</h4>
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
                      <Label>Contact Person</Label>
                      <AvField
                        name="contact_person"
                        placeholder="Enter contact person"
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
                  Update Tenant
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditTenant);
