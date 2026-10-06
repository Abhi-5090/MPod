import React, { useEffect, useState } from "react"
import { Row, Col, Card, CardBody, Input, FormGroup, Form, Button, Label, Spinner } from "reactstrap"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import { useAuth } from "../../context/AuthContext"

const AddCompany = props => {
  document.title = "Add Company | Mpod"

  const navigate = useNavigate()
  const { user } = useAuth()
  const [companyName, setCompanyName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Companies", link: "/companies-list" },
      { title: "Add Company", link: "/add-company" },
    ]
    props.setBreadcrumbItems("Add Company", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addCompanySubmit = async e => {
    e.preventDefault()
    if (!companyName.trim()) {
      toast.error("Company name is required")
      return
    }

    const now = new Date()
    const payload = {
      company_name: companyName.trim(),
      added_date: now,
      update_date: now,
      added_by: user?.first_name || user?.roll_no || "admin",
      status: 1,
    }

    setSaving(true)
    try {
      await axios.post(apiUrl("add-company"), payload)
      toast.success("Company added")
      navigate("/companies-list")
    } catch (err) {
      toast.error(getErrorMessage(err, "Company not added"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Company</h4>
              <Form className="needs-validation" name="form" onSubmit={addCompanySubmit}>
                <Row>
                  <Col md="6">
                    <FormGroup className="mb-3">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        name="company_name"
                        id="company_name"
                        placeholder="Enter Company Name"
                        type="text"
                        className="form-control"
                        onChange={e => setCompanyName(e.target.value)}
                        value={companyName}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <div className="col-12">
                  <Button color="primary" type="submit" disabled={saving}>
                    {saving && <Spinner size="sm" className="me-1" />}
                    Submit
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(AddCompany)
