import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import axios from "axios"

import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import LoadState from "../../components/Common/LoadState"
import ConfirmModal from "../../components/Common/ConfirmModal"
import "./datatables.scss"

const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Tenants", link: "#" },
  { title: "Tenants List", link: "#" },
]

const columns = [
  { label: "Organization Name", field: "organization_name", sort: "asc", width: 150 },
  { label: "Code", field: "organization_code", sort: "asc", width: 100 },
  { label: "Contact Person", field: "contact_person", sort: "asc", width: 150 },
  { label: "Email", field: "email", sort: "asc", width: 150 },
  { label: "Credits", field: "active_credits", sort: "asc", width: 100 },
  { label: "Status", field: "status", sort: "disabled", width: 100 },
  { label: "Actions", field: "actions", sort: "disabled", width: 220 },
]

// GET get-tenants, DELETE delete-tenant/:id
const TenantsList = props => {
  const { setBreadcrumbItems: setBreadcrumbs } = props
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tenantToDelete, setTenantToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    document.title = "Tenants | Mpod"
    setBreadcrumbs("Tenants", breadcrumbItems)
  }, [setBreadcrumbs])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl("get-tenants"))
      setTenants(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch tenants."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    if (!tenantToDelete) return
    setDeleting(true)
    try {
      const response = await axios.delete(apiUrl(`delete-tenant/${tenantToDelete._id}`))
      toast.success((response.data && response.data.message) || "Tenant deleted")
      setTenants(prev => prev.filter(t => t._id !== tenantToDelete._id))
      setTenantToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete tenant."))
    } finally {
      setDeleting(false)
    }
  }

  const data = {
    columns,
    rows: tenants.map(tenant => ({
      organization_name: tenant.organization_name,
      organization_code: tenant.organization_code,
      contact_person: tenant.contact_person,
      email: tenant.email,
      active_credits: tenant.active_credits,
      status:
        tenant.status === 1 ? (
          <Badge className="bg-success">Active</Badge>
        ) : (
          <Badge className="bg-danger">Inactive</Badge>
        ),
      actions: (
        <div className="d-flex flex-wrap gap-1">
          <Link to={`/edit-tenant/${tenant._id}`} className="btn btn-info btn-sm">
            Edit
          </Link>
          <Link to={`/tenant-credits/${tenant._id}`} className="btn btn-primary btn-sm">
            Credits
          </Link>
          <Link to={`/kiosk-devices?tenant_id=${tenant._id}`} className="btn btn-secondary btn-sm">
            Kiosks
          </Link>
          <Button color="danger" size="sm" onClick={() => setTenantToDelete(tenant)}>
            Delete
          </Button>
        </div>
      ),
    })),
  }

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4 mb-0">Tenants List</CardTitle>
              <Link to="/add-tenant" className="btn btn-primary">
                + Add Tenant
              </Link>
            </CardBody>
            <CardBody>
              <LoadState
                loading={loading}
                error={error}
                empty={!tenants.length}
                emptyText="No tenants yet."
                onRetry={fetchData}
              >
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        isOpen={!!tenantToDelete}
        toggle={() => setTenantToDelete(null)}
        onConfirm={handleDelete}
        busy={deleting}
        title="Delete tenant"
        message={
          tenantToDelete
            ? `Delete tenant "${tenantToDelete.organization_name}"? This cannot be undone.`
            : ""
        }
      />
    </React.Fragment>
  )
}

TenantsList.propTypes = {
  setBreadcrumbItems: PropTypes.func,
}

export default connect(null, { setBreadcrumbItems })(TenantsList)
