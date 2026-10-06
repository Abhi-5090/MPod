import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, CardBody, Button, Label, Input, FormGroup, FormText, Alert, Table, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import { setBreadcrumbItems } from "../../store/actions";
import { apiUrl, getErrorMessage } from "../../config/api";
import { isPlatformRole } from "../../config/roles";
import { useAuth } from "../../context/AuthContext";

const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Users", link: "/users-list" },
  { title: "Add User", link: "#" },
];

const SAMPLE_COLUMNS = [
  "first_name",
  "roll_no",
  "mobile",
  "email",
  "gender",
  "college",
  "branch",
  "passout_year",
  "role",
  "password",
];

const SAMPLE_ROW = {
  first_name: "Ravi Kumar",
  roll_no: "21A91A0501",
  mobile: "9876543210",
  email: "ravi.kumar@example.com",
  gender: "male",
  college: "Example College of Engineering",
  branch: "CSE",
  passout_year: 2025,
  role: "student",
  password: "ChangeMe123",
};

const isExcelFile = (file) => /\.(xlsx|xls)$/i.test(file.name);

const AddUser = (props) => {
  document.title = "Add User | Mpod";

  const { setBreadcrumbItems } = props;
  const { user } = useAuth();
  const isPlatform = isPlatformRole(user.role);

  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState(user.t_id || "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setBreadcrumbItems("Add User", breadcrumbItems);
  }, [setBreadcrumbItems]);

  useEffect(() => {
    if (!isPlatform) return;
    axios
      .get(apiUrl("get-tenants"))
      .then((res) => setTenants(Array.isArray(res.data) ? res.data : []))
      .catch((err) => toast.error(getErrorMessage(err, "Failed to load tenants.")));
  }, [isPlatform]);

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected && !isExcelFile(selected)) {
      toast.error("Please choose an Excel file (.xlsx or .xls).");
      setFile(null);
      event.target.value = "";
      return;
    }
    setFile(selected || null);
  };

  const downloadSample = () => {
    const sheet = XLSX.utils.json_to_sheet([SAMPLE_ROW], { header: SAMPLE_COLUMNS });
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Users");
    XLSX.writeFile(book, "users_sample.xlsx");
  };

  const effectiveTenantId = isPlatform ? tenantId : user.t_id;

  const addUsers = async () => {
    if (!file || !effectiveTenantId) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tenant_id", effectiveTenantId);

    setUploading(true);
    setResult(null);
    setErrorMessage(null);
    try {
      const response = await axios.post(apiUrl("add-user"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data || {};
      setResult({
        message: data.message || "Upload complete.",
        inserted: data.inserted || 0,
        existingRollNos: Array.isArray(data.existingRollNos) ? data.existingRollNos : [],
        rejected: Array.isArray(data.rejected) ? data.rejected : [],
      });
      toast.success(data.message || "Upload complete.");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to upload users.");
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const tenantOptions = tenants.some((t) => t._id === tenantId)
    ? tenants
    : [{ _id: tenantId, organization_name: tenantId ? user.organization || "Current tenant" : "Select tenant" }, ...tenants];

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0">Add Users (Excel upload)</h4>
                <Button color="secondary" outline size="sm" type="button" onClick={downloadSample}>
                  Download sample
                </Button>
              </div>

              {isPlatform && (
                <FormGroup>
                  <Label for="tenantSelect">Tenant</Label>
                  <Input
                    id="tenantSelect"
                    type="select"
                    value={tenantId || ""}
                    onChange={(e) => setTenantId(e.target.value)}
                    disabled={uploading}
                  >
                    {tenantOptions.map((t) => (
                      <option key={t._id || "none"} value={t._id || ""}>
                        {t.organization_name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              )}

              <FormGroup>
                <Label for="usersFile">Users file</Label>
                <Input
                  id="usersFile"
                  innerRef={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <FormText>
                  Columns: {SAMPLE_COLUMNS.join(", ")}. role is optional (defaults to student). Staff roles
                  (tenantadmin, placementadmin, trainer) can only be imported by platform admins. Passwords must be
                  at least 8 characters.
                </FormText>
              </FormGroup>

              {errorMessage && <Alert color="danger">{errorMessage}</Alert>}

              <div className="d-flex gap-2">
                <Button
                  color="primary"
                  type="button"
                  onClick={addUsers}
                  disabled={!file || !effectiveTenantId || uploading}
                >
                  {uploading && <Spinner size="sm" className="me-1" />}
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
                <Link to="/users-list" className="btn btn-light">
                  Back to users
                </Link>
              </div>
            </CardBody>
          </Card>
        </Col>

        {result && (
          <Col xl="6">
            <Card>
              <CardBody>
                <h4 className="card-title">Upload result</h4>
                <Alert color={result.rejected.length || result.existingRollNos.length ? "warning" : "success"}>
                  {result.message}
                </Alert>
                <p className="mb-2">
                  <strong>Inserted:</strong> {result.inserted}
                </p>
                <p className="mb-2">
                  <strong>Already existing roll numbers ({result.existingRollNos.length}):</strong>{" "}
                  {result.existingRollNos.length ? result.existingRollNos.join(", ") : "None"}
                </p>
                <p className="mb-2">
                  <strong>Rejected rows ({result.rejected.length}):</strong>
                  {!result.rejected.length && " None"}
                </p>
                {result.rejected.length > 0 && (
                  <div className="table-responsive">
                    <Table bordered size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Row #</th>
                          <th>Roll no</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rejected.map((r, idx) => (
                          <tr key={`${r.row}-${idx}`}>
                            <td>{r.row}</td>
                            <td>{r.roll_no || "-"}</td>
                            <td>{r.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
                <div className="mt-3">
                  <Link to="/users-list" className="btn btn-primary btn-sm">
                    Go to users list
                  </Link>
                </div>
              </CardBody>
            </Card>
          </Col>
        )}
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddUser);
