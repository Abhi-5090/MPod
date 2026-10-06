import React, { useEffect, useMemo, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge, Input, Label } from "reactstrap";
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

const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Users", link: "#" },
  { title: "Users List", link: "#" },
];

const UsersList = (props) => {
  document.title = "Users List | Mpod";

  const { setBreadcrumbItems } = props;
  const { isPlatform, tenants, tenantId, setTenantId, tenantName, users, setUsers, loading, error, reload } =
    useTenantUsers();
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBreadcrumbItems("Users", breadcrumbItems);
  }, [setBreadcrumbItems]);

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
        { label: "Gender", field: "gender", sort: "asc", width: 100 },
        { label: "Email", field: "email", sort: "asc", width: 150 },
        { label: "Role", field: "role", sort: "asc", width: 120 },
        { label: "Status", field: "status", sort: "asc", width: 80 },
        { label: "Action", field: "actions", sort: "disabled", width: 160 },
      ],
      rows: users.map((u) => ({
        first_name: u.first_name,
        email: u.email,
        roll_no: u.roll_no,
        gender: u.gender,
        role: u.role,
        status:
          Number(u.status) === 1 ? (
            <Badge color="success" className="bg-success">Active</Badge>
          ) : (
            <Badge color="danger" className="bg-danger">Inactive</Badge>
          ),
        profile_pic: (
          <img
            src={`${IMAGE_BASE}profile-pics/${u.roll_no}.png`}
            alt="Profile"
            width="50px"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${IMAGE_BASE}profile-pics/default.png`;
            }}
          />
        ),
        actions: (
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
    [users]
  );

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <CardTitle className="h4 mb-0">
                {tenantName ? `${tenantName} - ` : ""}Users List
              </CardTitle>
              <div className="d-flex align-items-center gap-2">
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
                <Link to="/add-user" className="btn btn-primary text-nowrap">
                  Add Users
                </Link>
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

export default connect(null, { setBreadcrumbItems })(UsersList);
