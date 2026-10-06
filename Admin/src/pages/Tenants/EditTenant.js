import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Row, Col, Card, CardBody, Button, Label, Input, FormFeedback, Form, Spinner } from "reactstrap"
import { toast } from "react-toastify"
import { connect } from "react-redux"
import { Link, useNavigate, useParams } from "react-router-dom"
import axios from "axios"

import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import LoadState from "../../components/Common/LoadState"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = data => {
  const errors = {}
  if (!data.organization_name.trim()) errors.organization_name = "Please enter organization name"
  if (!data.contact_person.trim()) errors.contact_person = "Please enter contact person"
  if (!EMAIL_RE.test(data.email.trim())) errors.email = "Please enter a valid email"
  const duration = Number(data.interview_duration_minutes)
  if (!Number.isInteger(duration) || duration <= 0)
    errors.interview_duration_minutes = "Please enter a duration in minutes"
  return errors
}

// GET get-tenant/:id, PUT update-tenant/:id.
// Credits are NOT edited here any more (the backend ignores assigned_credits/active_credits);
// they are managed on /tenant-credits/:id through the credit ledger.
const EditTenant = props => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setBreadcrumbItems: setBreadcrumbs } = props

  const [tenantData, setTenantData] = useState(null)
  const [activeCredits, setActiveCredits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    document.title = "Edit Tenant | Mpod"
    setBreadcrumbs("Edit Tenant", [
      { title: "Mpod", link: "#" },
      { title: "Tenants", link: "/tenants-list" },
      { title: "Edit Tenant", link: `/edit-tenant/${id}` },
    ])
  }, [setBreadcrumbs, id])

  const fetchTenant = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const { data: tenant } = await axios.get(apiUrl(`get-tenant/${id}`))
      setTenantData({
        organization_name: tenant.organization_name || "",
        organization_code: tenant.organization_code || "",
        contact_person: tenant.contact_person || "",
        email: tenant.email || "",
        interview_duration_minutes: String(tenant.interview_duration_minutes || 30),
        status: String(tenant.status === undefined || tenant.status === null ? 1 : tenant.status),
      })
      setActiveCredits(tenant.active_credits)
    } catch (error) {
      setLoadError(getErrorMessage(error, "Failed to load tenant."))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTenant()
  }, [fetchTenant])

  const errors = tenantData ? validate(tenantData) : {}
  const showError = name => touched && errors[name]
  const handleChange = e => setTenantData({ ...tenantData, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setTouched(true)
    if (Object.keys(errors).length) return
    setSubmitting(true)
    try {
      const response = await axios.put(apiUrl(`update-tenant/${id}`), {
        organization_name: tenantData.organization_name.trim(),
        contact_person: tenantData.contact_person.trim(),
        email: tenantData.email.trim(),
        interview_duration_minutes: parseInt(tenantData.interview_duration_minutes, 10),
        status: Number(tenantData.status),
      })
      toast.success((response.data && response.data.message) || "Tenant updated successfully")
      navigate("/tenants-list")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update tenant. Please try again."))
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name, label, type = "text", extra = {}) => (
    <div className="mb-3">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={tenantData[name]}
        onChange={handleChange}
        invalid={!!showError(name)}
        {...extra}
      />
      <FormFeedback>{errors[name]}</FormFeedback>
    </div>
  )

  return (
    <LoadState loading={loading} error={loadError} onRetry={fetchTenant}>
      {tenantData && (
        <Row>
          <Col xl="6">
            <Card>
              <CardBody>
                <h4 className="card-title mb-4">Edit Tenant</h4>
                <Form onSubmit={handleSubmit} noValidate>
                  {field("organization_name", "Organization Name")}
                  <div className="mb-3">
                    <Label htmlFor="organization_code">Organization Code</Label>
                    <Input id="organization_code" value={tenantData.organization_code} disabled readOnly />
                  </div>
                  {field("contact_person", "Contact Person")}
                  {field("email", "Email", "email")}
                  {field("interview_duration_minutes", "Interview Duration (minutes)", "number", {
                    min: 1,
                    step: 1,
                  })}
                  <div className="mb-3">
                    <Label htmlFor="status">Status</Label>
                    <Input id="status" type="select" name="status" value={tenantData.status} onChange={handleChange}>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </Input>
                  </div>
                  <Button color="primary" type="submit" disabled={submitting}>
                    {submitting && <Spinner size="sm" className="me-1" />}
                    Save
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
          <Col xl="6">
            <Card>
              <CardBody>
                <h4 className="card-title mb-3">Credits</h4>
                <p className="mb-1 text-muted">Current balance</p>
                <h2 className="mb-3">{activeCredits === undefined || activeCredits === null ? "—" : activeCredits}</h2>
                <p className="text-muted small">
                  Credits are changed through top-ups and adjustments so every change is recorded in the
                  tenant&apos;s credit history.
                </p>
                <Link to={`/tenant-credits/${id}`} className="btn btn-outline-primary">
                  Manage credits &amp; history
                </Link>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </LoadState>
  )
}

EditTenant.propTypes = {
  setBreadcrumbItems: PropTypes.func,
}

export default connect(null, { setBreadcrumbItems })(EditTenant)
