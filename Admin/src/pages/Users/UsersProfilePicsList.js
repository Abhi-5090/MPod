import React, { useEffect, useMemo, useRef, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge, Input, Label, Spinner } from "reactstrap";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { setBreadcrumbItems } from "../../store/actions";
import { apiUrl, IMAGE_BASE, getErrorMessage } from "../../config/api";
import LoadState from "../../components/Common/LoadState";
import ConfirmModal from "../../components/Common/ConfirmModal";
import useTenantUsers from "./useTenantUsers";
import "./datatables.scss";
import { canManageUserRole } from "../../config/roles";

const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Users", link: "/users-list" },
  { title: "Profile Pictures", link: "#" },
];

const UsersProfilePicsList = (props) => {
  document.title = "Users Profile Pictures | Mpod";

  const { setBreadcrumbItems } = props;
  const { user: viewer, isPlatform, tenants, tenantId, setTenantId, tenantName, users, setUsers, loading, error, reload } =
    useTenantUsers();
  const viewerRole = viewer && viewer.role;
  const [zipFile, setZipFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [busy, setBusy] = useState(false);
  // Bumped after an upload so <img> tags bypass the browser cache.
  const [imageVersion, setImageVersion] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setBreadcrumbItems("Profile Pictures", breadcrumbItems);
  }, [setBreadcrumbItems]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.toLowerCase().endsWith(".zip")) {
      setZipFile(file);
    } else {
      toast.error("Please upload a valid ZIP file containing profile pictures.");
      setZipFile(null);
    }
    e.target.value = "";
  };

  const handleUploadZip = async () => {
    if (!zipFile) {
      toast.error("Please select a valid ZIP file.");
      return;
    }
    const formData = new FormData();
    formData.append("profile_pics_zip", zipFile); // field name expected by backend

    setUploading(true);
    try {
      const response = await axios.post(apiUrl("upload-profile-pics"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success((response.data && response.data.message) || "Profile pictures uploaded.");
      setZipFile(null);
      setImageVersion(Date.now());
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload profile pictures."));
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    if (!busy) setUserToDeactivate(null);
  };

  const handleDeactivate = async () => {
    if (!userToDeactivate) return;
    const target = userToDeactivate;
    setBusy(true);
    try {
      const response = await axios.delete(apiUrl(`delete-user/${target._id}`));
      toast.success((response.data && response.data.message) || "User deactivated.");
      setUsers((prev) => prev.map((u) => (u._id === target._id ? { ...u, status: 0 } : u)));
      setUserToDeactivate(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to deactivate user."));
    } finally {
      setBusy(false);
    }
  };

  const data = useMemo(
    () => ({
      columns: [
        { label: "Profile Pic", field: "profile_pic", sort: "disabled", width: 80 },
        { label: "Name", field: "first_name", sort: "asc", width: 150 },
        { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
        { label: "Status", field: "status", sort: "asc", width: 100 },
        { label: "Action", field: "actions", sort: "disabled", width: 160 },
      ],
      rows: users.map((u) => ({
        profile_pic: u.roll_no ? (
          <img
            src={`${IMAGE_BASE}profile-pics/${u.roll_no}.png${imageVersion ? `?v=${imageVersion}` : ""}`}
            alt="Profile"
            width="50px"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${IMAGE_BASE}profile-pics/default.png`;
            }}
          />
        ) : (
          "No Image"
        ),
        first_name: u.first_name,
        roll_no: u.roll_no,
        status:
          Number(u.status) === 1 ? (
            <Badge color="success" className="bg-success">Active</Badge>
          ) : (
            <Badge color="danger" className="bg-danger">Inactive</Badge>
          ),
        actions: !canManageUserRole(viewerRole, u.role) ? (
          <span className="text-muted small">—</span>
        ) : (
          <div>
            <Link to={`/edit-user/${u._id}`} className="btn btn-info btn-sm me-2">
              Edit
            </Link>
            <Button
              color="danger"
              size="sm"
              disabled={Number(u.status) !== 1}
              onClick={() => setUserToDeactivate(u)}
            >
              Deactivate
            </Button>
          </div>
        ),
      })),
    }),
    [users, imageVersion, viewerRole]
  );

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle className="h4 mb-0">
                {tenantName ? `${tenantName} - ` : ""}Users Profile Pictures
              </CardTitle>
              <div className="d-flex flex-wrap align-items-center gap-2">
                {isPlatform && (
                  <div className="d-flex align-items-center gap-2">
                    <Label for="tenantSelect" className="mb-0 text-nowrap">Tenant</Label>
                    <Input
                      id="tenantSelect"
                      type="select"
                      value={tenantId || ""}
                      onChange={(e) => setTenantId(e.target.value)}
                    >
                      {!tenants.some((t) => t._id === tenantId) && (
                        <option value={tenantId || ""}>{tenantName || "Current tenant"}</option>
                      )}
                      {tenants.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.organization_name}
                        </option>
                      ))}
                    </Input>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <Button color="primary" onClick={() => fileInputRef.current && fileInputRef.current.click()} disabled={uploading}>
                  {zipFile ? `ZIP: ${zipFile.name}` : "Choose ZIP File"}
                </Button>
                <Button color="success" onClick={handleUploadZip} disabled={!zipFile || uploading}>
                  {uploading && <Spinner size="sm" className="me-1" />}
                  Upload Profile Pics
                </Button>
              </div>
            </CardBody>
            <CardBody>
              <LoadState
                loading={loading}
                error={error}
                empty={!users.length}
                emptyText="No users found for this tenant."
                onRetry={reload}
              >
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        isOpen={!!userToDeactivate}
        toggle={closeModal}
        onConfirm={handleDeactivate}
        title="Deactivate user"
        message={
          userToDeactivate
            ? `Deactivate ${userToDeactivate.first_name} (${userToDeactivate.roll_no})? They will no longer be able to log in.`
            : ""
        }
        confirmLabel="Deactivate"
        busy={busy}
      />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(UsersProfilePicsList);
