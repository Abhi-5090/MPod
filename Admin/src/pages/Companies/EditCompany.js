import React, { useEffect, useState } from "react"
import { Row, Col, Card, CardBody, FormGroup, Button, Input, Label, Spinner } from "reactstrap"
import { connect } from "react-redux"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import LoadState from "../../components/Common/LoadState"

const EditCompany = props => {
  document.title = "Edit Company | Mpod"

  const { companyId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState({ company_name: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Companies", link: "/companies-list" },
      { title: "Edit Company", link: "#" },
    ]
    props.setBreadcrumbItems("Edit Company", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCompany = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl(`get-company/${companyId}`))
      if (!response.data) {
        setError("Company not found.")
      } else {
        setData(response.data)
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load company."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompany()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const editCompanySubmit = async e => {
    if (e) e.preventDefault()
    if (!data.company_name || !data.company_name.trim()) {
      toast.error("Company name is required")
      return
    }

    // Backend overwrites every field it receives, so send the existing values back.
    const payload = {
      company_name: data.company_name.trim(),
      added_date: data.added_date,
      update_date: new Date(),
      added_by: data.added_by,
      status: data.status ?? 1,
    }

    setSaving(true)
    try {
      await axios.put(apiUrl(`update-company/${companyId}`), payload)
      toast.success("Company updated")
      navigate("/companies-list")
    } catch (err) {
      toast.error(getErrorMessage(err, "Company not updated"))
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
              <h4 className="card-title">Edit Company</h4>
              <LoadState loading={loading} error={error} onRetry={fetchCompany}>
                <form className="needs-validation" onSubmit={editCompanySubmit}>
                  <Row>
                    <Col md="6">
                      <FormGroup className="mb-3">
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                          name="company_name"
                          placeholder="Enter Company Name"
                          type="text"
                          className="form-control"
                          id="company_name"
                          onChange={e => setData({ ...data, company_name: e.target.value })}
                          value={data.company_name || ""}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" type="submit" disabled={saving}>
                    {saving && <Spinner size="sm" className="me-1" />}
                    Submit
                  </Button>
                </form>
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(EditCompany)
