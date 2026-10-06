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

const AddModule = props => {
  document.title = "Add Module | Mpod"

  const navigate = useNavigate()
  const [moduleName, setModuleName] = useState("")
  const [selectedTechnology, setSelectedTechnology] = useState(null)
  const [technologyData, setTechnologyData] = useState([])
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Modules", link: "/modules-list" },
      { title: "Add Module", link: "/add-module" },
    ]
    props.setBreadcrumbItems("Add Module", breadcrumbItems)

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

  const technologyOptions = technologyData.map(ele => ({ label: ele.technology_name, value: ele._id }))

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

  const addModule = async () => {
    if (!selectedTechnology) {
      toast.error("Please select a technology")
      return
    }
    if (!moduleName.trim()) {
      toast.error("Module name is required")
      return
    }

    const formData = new FormData()
    if (file) formData.append("file", file)
    formData.append("module_name", moduleName.trim())
    formData.append("technology", selectedTechnology.value)

    setSaving(true)
    try {
      await axios.post(apiUrl("add-module"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Module added successfully")
      navigate("/modules-list")
    } catch (error) {
      toast.error(getErrorMessage(error, "Something went wrong while adding the module"))
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
              <h4 className="card-title">ADD MODULE</h4>
              <AvForm className="needs-validation" onValidSubmit={addModule}>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select technology</Label>
                      <Select
                        value={selectedTechnology}
                        onChange={setSelectedTechnology}
                        options={technologyOptions}
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
                        onChange={e => setModuleName(e.target.value)}
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

export default connect(null, { setBreadcrumbItems })(AddModule)
