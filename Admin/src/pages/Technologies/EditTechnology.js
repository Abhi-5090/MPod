import React, { useEffect, useState } from "react"
import { Row, Col, Card, CardBody, FormGroup, Button, Label, Spinner } from "reactstrap"
import { AvForm, AvField } from "availity-reactstrap-validation"
import { connect } from "react-redux"
import axios from "axios"
import Switch from "react-switch"
import { useParams, useNavigate } from "react-router-dom"
import Select from "react-select"
import { toast } from "react-toastify"
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, IMAGE_BASE, getErrorMessage } from "../../config/api"
import LoadState from "../../components/Common/LoadState"

const categoryOptions = [
  { label: "Low Code", value: "lowcode" },
  { label: "High Code", value: "highcode" },
  { label: "No Code", value: "nocode" },
  { label: "Owl Ground", value: "owlground" },
]

const switchLabelStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  fontSize: 12,
  color: "#fff",
  paddingRight: 2,
}
const Offsymbol = () => <div style={switchLabelStyle}>No</div>
const OnSymbol = () => <div style={switchLabelStyle}>Yes</div>

const EditTechnology = props => {
  document.title = "Edit Technology | Mpod"

  const backendImageUrl = IMAGE_BASE + "technology-icons/"
  const [data, setData] = useState({})
  const [active, setActive] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [technologyIcon, setTechnologyIcon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const { technologyId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Technologies", link: "/technologies-list" },
      { title: "Edit Technology", link: "#" },
    ]
    props.setBreadcrumbItems("Edit Technology", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTechnologyData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl(`get-technology-by-id/${technologyId}`))
      const technology = response.data || {}
      setData(technology)
      setTechnologyIcon(technology.technology_icon || null)
      setSelectedCategory(categoryOptions.find(o => o.value === technology.technology_category) || null)
      setActive(technology.status === 1)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load technology."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechnologyData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [technologyId])

  const updateTechnology = async () => {
    if (!data.technology_name || !data.technology_name.trim()) {
      toast.error("Technology name is required!")
      return
    }
    if (!selectedCategory) {
      toast.error("Please select a technology category!")
      return
    }

    const formData = new FormData()
    formData.append("technology_name", data.technology_name.trim())
    formData.append("technology_category", selectedCategory.value)
    formData.append("status", active ? 1 : 0)
    if (technologyIcon instanceof File) {
      formData.append("technology_icon", technologyIcon)
    }

    setSaving(true)
    try {
      await axios.post(apiUrl(`update-technology/${technologyId}`), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Technology updated successfully")
      navigate("/technologies-list")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update technology."))
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
              <h4 className="card-title">EDIT Technology</h4>
              <LoadState loading={loading} error={error} onRetry={fetchTechnologyData}>
                <AvForm className="needs-validation" onValidSubmit={updateTechnology}>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label htmlFor="technology_name">Technology Name</Label>
                        <AvField
                          name="technology_name"
                          placeholder="Technology name"
                          type="text"
                          errorMessage="Enter Technology Name"
                          className="form-control"
                          validate={{ required: { value: true } }}
                          id="technology_name"
                          onChange={e => setData({ ...data, technology_name: e.target.value })}
                          value={data.technology_name || ""}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Select Category</Label>
                        <Select
                          value={selectedCategory}
                          onChange={setSelectedCategory}
                          options={categoryOptions}
                          classNamePrefix="select2-selection"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Upload Technology Icon</Label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={e => setTechnologyIcon(e.target.files[0] || null)}
                        />
                        {typeof technologyIcon === "string" && (
                          <img
                            src={`${backendImageUrl}${technologyIcon}`}
                            alt="Technology Icon"
                            style={{ height: "60px", marginTop: "10px" }}
                          />
                        )}
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Active</Label>
                        <Switch
                          onChange={() => setActive(!active)}
                          checked={active}
                          onColor="#0d6efd"
                          offColor="#6c757d"
                          onHandleColor="#fff"
                          offHandleColor="#fff"
                          handleDiameter={20}
                          uncheckedIcon={<Offsymbol />}
                          checkedIcon={<OnSymbol />}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Button color="primary" type="submit" disabled={saving}>
                    {saving && <Spinner size="sm" className="me-1" />}
                    Update
                  </Button>
                </AvForm>
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(EditTechnology)
