import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Row, Col, Card, CardBody, Button, Label, Input, FormFeedback, Form, Spinner } from "reactstrap"
import { toast } from "react-toastify"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"

import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"

const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Tenants", link: "/tenants-list" },
  { title: "Add Tenant", link: "/add-tenant" },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = data => {
  const errors = {}
  if (!data.organization_name.trim()) errors.organization_name = "Please enter organization name"
  if (!data.organization_code.trim()) errors.organization_code = "Please enter organization code"
  if (!data.contact_person.trim()) errors.contact_person = "Please enter contact person"
  if (!EMAIL_RE.test(data.email.trim())) errors.email = "Please enter a valid email"
  if (!/^\d+$/.test(String(data.assigned_credits).trim()))
    errors.assigned_credits = "Initial credits must be a whole number (0 or more)"
  const duration = Number(data.interview_duration_minutes)
  if (!Number.isInteger(duration) || duration <= 0)
    errors.interview_duration_minutes = "Please enter a duration in minutes"
  return errors
}

// POST add-tenant {organization_name, contact_person, email, assigned_credits:<int>,
//                  status, interview_duration_minutes, organization_code}
const AddTenant = props => {
  const navigate = useNavigate()
  const { setBreadcrumbItems: setBreadcrumbs } = props
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)
  const [tenantData, setTenantData] = useState({
    organization_name: "",
    organization_code: "",
    contact_person: "",
    email: "",
    assigned_credits: "0",
    interview_duration_minutes: "30",
    status: "1",
  })

  useEffect(() => {
    document.title = "Add Tenant | Mpod"
    setBreadcrumbs("Add Tenant", breadcrumbItems)
  }, [setBreadcrumbs])

  const errors = validate(tenantData)
  const showError = field => touched && errors[field]

  const handleChange = e => setTenantData({ ...tenantData, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setTouched(true)
    if (Object.keys(errors).length) return

    const payload = {
      organization_name: tenantData.organization_name.trim(),
      organization_code: tenantData.organization_code.trim(),
      contact_person: tenantData.contact_person.trim(),
      email: tenantData.email.trim(),
      assigned_credits: parseInt(tenantData.assigned_credits, 10),
      interview_duration_minutes: parseInt(tenantData.interview_duration_minutes, 10),
      status: Number(tenantData.status),
    }

    setSubmitting(true)
    try {
      const response = await axios.post(apiUrl("add-tenant"), payload)
      toast.success((response.data && response.data.message) || "Tenant added successfully")
      navigate("/tenants-list")
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add tenant. Please try again."))
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name, label, type = "text", placeholder = "", extra = {}) => (
    <div className="mb-3">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={tenantData[name]}
        onChange={handleChange}
        invalid={!!showError(name)}
        {...extra}
      />
      <FormFeedback>{errors[name]}</FormFeedback>
    </div>
  )

  return (
    <Row>
      <Col xl="6">
        <Card>
          <CardBody>
            <h4 className="card-title mb-4">Add Tenant</h4>
            <Form onSubmit={handleSubmit} noValidate>
              {field("organization_name", "Organization Name", "text", "Enter organization name")}
              {field("organization_code", "Organization Code", "text", "Enter organization code")}
              {field("contact_person", "Contact Person", "text", "Enter contact person name")}
              {field("email", "Email", "email", "Enter email address")}
              {field("assigned_credits", "Initial credits", "number", "e.g. 100", { min: 0, step: 1 })}
              <p className="text-muted small mt-n2">
                Recorded as the opening balance. Later changes are made from the tenant&apos;s Credits page.
              </p>
              {field("interview_duration_minutes", "Interview Duration (minutes)", "number", "e.g. 30", {
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
                Submit
              </Button>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

AddTenant.propTypes = {
  setBreadcrumbItems: PropTypes.func,
}

export default connect(null, { setBreadcrumbItems })(AddTenant)
