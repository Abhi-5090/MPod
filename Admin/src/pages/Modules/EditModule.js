import React, { useEffect, useState } from "react"
import { REQUIRED } from "../../config/validation";
import { Row, Col, Card, CardBody, Button, Label, Spinner } from "reactstrap"
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

const EditModule = props => {
  document.title = "Edit Module | Mpod"

  const { moduleId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState({})
  const [active, setActive] = useState(true)
  const [selectedTechnology, setSelectedTechnology] = useState(null)
  const [technologyData, setTechnologyData] = useState([])
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Modules", link: "/modules-list" },
      { title: "Edit Module", link: "#" },
    ]
    props.setBreadcrumbItems("Edit Module", breadcrumbItems)

    axios
      .get(apiUrl("get-technologies"))
      .then(response => setTechnologyData(Array.isArray(response.data) ? response.data : []))
      .catch(err => {
        if (err.response?.status !== 404) {
          toast.error(getErrorMessage(err, "Failed to load technologies."))
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchModuleData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl(`get-module-by-id/${moduleId}`))
      const module = response.data || {}
      setData(module)
      setActive(module.status === 1)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load module."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModuleData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId])

  // Preselect the module's technology once both the module and technologies are loaded.
  useEffect(() => {
    if (technologyData.length > 0 && data.technology) {
      const technology = technologyData.find(ele => ele._id === data.technology)
      if (technology) {
        setSelectedTechnology({ label: technology.technology_name, value: technology._id })
      }
    }
  }, [technologyData, data.technology])

  const handleFileChange = event => {
    const selected = event.target.files[0] || null
    setFile(selected)
    setPreviewUrl("")
    if (selected) {
      const fileReader = new FileReader()
      fileReader.onload = () => setPreviewUrl(fileReader.result)
      fileReader.readAsDataURL(selected)
    }
  }

  const updateModule = async () => {
    if (!selectedTechnology) {
      toast.error("Please select a technology")
      return
    }
    if (!data.module_name || !data.module_name.trim()) {
      toast.error("Module name is required")
      return
    }

    const formData = new FormData()
    if (file) formData.append("file", file)
    formData.append("module_name", data.module_name.trim())
    formData.append("technology", selectedTechnology.value)
    formData.append("status", active ? 1 : 0)

    setSaving(true)
    try {
      await axios.post(apiUrl(`update-module/${moduleId}`), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Module updated successfully")
      navigate("/modules-list")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update module."))
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
              <h4 className="card-title">EDIT Module</h4>
              <LoadState loading={loading} error={error} onRetry={fetchModuleData}>
                <AvForm className="needs-validation" onValidSubmit={updateModule}>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Select Technology</Label>
                        <Select
                          value={selectedTechnology}
                          onChange={setSelectedTechnology}
                          options={technologyData.map(ele => ({ label: ele.technology_name, value: ele._id }))}
                          classNamePrefix="select2-selection"
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label htmlFor="validationCustom01">Module Name</Label>
                        <AvField
                          name="module_name"
                          placeholder="Module name"
                          type="text"
                          errorMessage="Enter Module Name"
                          className="form-control"
                          validate={REQUIRED}
                          id="validationCustom01"
                          onChange={e => setData({ ...data, module_name: e.target.value })}
                          value={data.module_name || ""}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <label className="form-label">Module icon</label>
                        <br />
                        {previewUrl && <img src={previewUrl} alt="Module Icon" width="50px" />}
                        {!previewUrl && data.module_icon && (
                          <img src={IMAGE_BASE + "module-icons/" + data.module_icon} alt="Module Icon" width="50px" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control form-control-file"
                          data-buttonname="btn-secondary"
                          onChange={handleFileChange}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Status</Label>&nbsp;&nbsp;&nbsp;&nbsp;
                        <Switch
                          uncheckedIcon={<Offsymbol />}
                          checkedIcon={<OnSymbol />}
                          onColor="#02a499"
                          onChange={() => setActive(!active)}
                          checked={active}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Button color="primary" type="submit" disabled={saving}>
                    {saving && <Spinner size="sm" className="me-1" />}
                    Submit
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

export default connect(null, { setBreadcrumbItems })(EditModule)
