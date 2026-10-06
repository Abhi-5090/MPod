import React, { useEffect, useState } from "react"
import { REQUIRED } from "../../config/validation";
import { Row, Col, Card, CardBody, Button, Label, Spinner } from "reactstrap"
import { AvForm, AvField } from "availity-reactstrap-validation"
import Select from "react-select"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"

const categoryOptions = [
  { label: "Low Code", value: "lowcode" },
  { label: "High Code", value: "highcode" },
  { label: "No Code", value: "nocode" },
]

const AddTechnology = props => {
  document.title = "Add Technology | Mpod"

  const navigate = useNavigate()
  const [technologyName, setTechnologyName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Technologies", link: "/technologies-list" },
      { title: "Add Technology", link: "/add-technology" },
    ]
    props.setBreadcrumbItems("Add Technology", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addTechnology = async () => {
    if (!technologyName.trim()) {
      toast.error("Technology name is required!")
      return
    }
    if (!selectedCategory) {
      toast.error("Please select a technology category!")
      return
    }

    setSaving(true)
    try {
      await axios.post(apiUrl("add-technology"), {
        technology_name: technologyName.trim(),
        technology_category: selectedCategory.value,
      })
      toast.success("Technology added successfully!")
      navigate("/technologies-list")
    } catch (error) {
      toast.error(getErrorMessage(error, "Something went wrong. Try again."))
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
              <h4 className="card-title">ADD Technology</h4>
              <AvForm className="needs-validation" onValidSubmit={addTechnology}>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Technology Name</Label>
                      <AvField
                        name="technology_name"
                        placeholder="Technology name"
                        type="text"
                        errorMessage="Enter Technology Name"
                        className="form-control"
                        validate={REQUIRED}
                        id="validationCustom01"
                        onChange={e => setTechnologyName(e.target.value)}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Category</Label>
                      <Select
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={categoryOptions}
                        classNamePrefix="select2-selection"
                        placeholder="Select a category"
                      />
                    </div>
                  </Col>
                </Row>

                <Button color="primary" type="submit" disabled={saving}>
                  {saving && <Spinner size="sm" className="me-1" />}
                  Submit
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(AddTechnology)
