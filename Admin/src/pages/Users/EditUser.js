import React, { useCallback, useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Button, Label, Input, FormGroup, FormFeedback, FormText, Spinner } from "reactstrap";
import { connect } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { setBreadcrumbItems } from "../../store/actions";
import { apiUrl, getErrorMessage } from "../../config/api";
import { isPlatformRole } from "../../config/roles";
import { useAuth } from "../../context/AuthContext";
import LoadState from "../../components/Common/LoadState";

const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Users", link: "/users-list" },
  { title: "Edit User", link: "#" },
];

const ROLE_LABELS = {
  student: "Student",
  tenantadmin: "Tenant Admin",
  placementadmin: "Placement Admin",
  trainer: "Trainer",
  admin: "Admin",
  superadmin: "Super Admin",
};

const EDITABLE_FIELDS = ["first_name", "mobile", "email", "gender", "college", "branch", "passout_year", "role", "status"];

const emptyForm = {
  first_name: "",
  roll_no: "",
  mobile: "",
  email: "",
  gender: "",
  college: "",
  branch: "",
  passout_year: "",
  role: "student",
  status: 1,
  password: "",
};

const allowedRolesFor = (currentUser) => {
  if (isPlatformRole(currentUser.role)) {
    const roles = ["student", "tenantadmin", "placementadmin", "trainer"];
    if (currentUser.role === "superadmin") roles.push("admin");
    return roles;
  }
  return ["student", "placementadmin", "trainer"];
};

const EditUser = (props) => {
  document.title = "Edit User | Mpod";

  const { setBreadcrumbItems } = props;
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [original, setOriginal] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setBreadcrumbItems("Edit User", breadcrumbItems);
  }, [setBreadcrumbItems]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await axios.get(apiUrl(`get-user-by-id/${userId}`));
      const d = response.data || {};
      const loaded = {
        first_name: d.first_name || "",
        roll_no: d.roll_no || "",
        mobile: d.mobile != null ? String(d.mobile) : "",
        email: d.email || "",
        gender: d.gender || "",
        college: d.college || "",
        branch: d.branch || "",
        passout_year: d.passout_year != null ? String(d.passout_year) : "",
        role: d.role || "student",
        status: Number(d.status) === 1 ? 1 : 0,
        password: "",
      };
      setForm(loaded);
      setOriginal(loaded);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Failed to load user."));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const roleOptions = allowedRolesFor(currentUser);
  if (original.role && !roleOptions.includes(original.role)) roleOptions.unshift(original.role);

  // Only validate fields the admin changed, so bad legacy data does not block unrelated edits.
  const changed = (field) => String(form[field]).trim() !== String(original[field]);
  const errors = {};
  if (!form.first_name.trim()) errors.first_name = "Name is required.";
  if (changed("email") && form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Enter a valid email.";
  if (changed("mobile") && form.mobile && !/^\+?\d{7,15}$/.test(form.mobile.replace(/[\s-]/g, ""))) errors.mobile = "Enter a valid mobile number.";
  if (changed("passout_year") && form.passout_year && !/^\d{4}$/.test(String(form.passout_year).trim()))
    errors.passout_year = "Enter a 4-digit year.";
  if (form.password && form.password.length < 8) errors.password = "Password must be at least 8 characters.";
  const hasErrors = Object.keys(errors).length > 0;
  const showError = (field) => touched && !!errors[field];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) return;

    // Only send fields that actually changed, so untouched legacy values are not re-validated/overwritten.
    const body = {};
    EDITABLE_FIELDS.forEach((field) => {
      const value = typeof form[field] === "string" ? form[field].trim() : form[field];
      if (String(value) !== String(original[field])) body[field] = value;
    });
    if ("status" in body) body.status = Number(body.status);
    if (body.passout_year) body.passout_year = Number(body.passout_year);
    if (form.password) body.password = form.password;
    if (!Object.keys(body).length) {
      toast.info("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(apiUrl(`update-user/${userId}`), body);
      toast.success((response.data && response.data.message) || "User updated successfully.");
      navigate("/users-list");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update user."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="8">
          <Card>
            <CardBody>
              <h4 className="card-title mb-4">Edit User</h4>
              <LoadState loading={loading} error={loadError} onRetry={fetchUser}>
                <form onSubmit={handleSubmit} noValidate>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="first_name">Name</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={form.first_name}
                          onChange={handleChange}
                          invalid={showError("first_name")}
                        />
                        <FormFeedback>{errors.first_name}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="roll_no">Roll No</Label>
                        <Input id="roll_no" name="roll_no" value={form.roll_no} readOnly disabled />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="mobile">Mobile</Label>
                        <Input
                          id="mobile"
                          name="mobile"
                          type="tel"
                          value={form.mobile}
                          onChange={handleChange}
                          invalid={showError("mobile")}
                        />
                        <FormFeedback>{errors.mobile}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          invalid={showError("email")}
                        />
                        <FormFeedback>{errors.email}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="gender">Gender</Label>
                        <Input id="gender" name="gender" type="select" value={form.gender} onChange={handleChange}>
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          {form.gender && !["male", "female", "other"].includes(form.gender) && (
                            <option value={form.gender}>{form.gender}</option>
                          )}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="passout_year">Passout Year</Label>
                        <Input
                          id="passout_year"
                          name="passout_year"
                          type="number"
                          value={form.passout_year}
                          onChange={handleChange}
                          invalid={showError("passout_year")}
                        />
                        <FormFeedback>{errors.passout_year}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="college">College</Label>
                        <Input id="college" name="college" value={form.college} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="branch">Branch</Label>
                        <Input id="branch" name="branch" value={form.branch} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="role">Role</Label>
                        <Input id="role" name="role" type="select" value={form.role} onChange={handleChange}>
                          {roleOptions.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r] || r}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="status">Status</Label>
                        <Input id="status" name="status" type="select" value={form.status} onChange={handleChange}>
                          <option value={1}>Active</option>
                          <option value={0}>Inactive</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="password">New Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          value={form.password}
                          onChange={handleChange}
                          invalid={showError("password")}
                        />
                        <FormFeedback>{errors.password}</FormFeedback>
                        <FormText>Leave blank to keep the current password. Minimum 8 characters.</FormText>
                      </FormGroup>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button color="primary" type="submit" disabled={saving}>
                      {saving && <Spinner size="sm" className="me-1" />}
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Link to="/users-list" className="btn btn-light">
                      Cancel
                    </Link>
                  </div>
                </form>
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditUser);
