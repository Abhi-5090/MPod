import React, { useEffect, useState } from "react"
import { Row, Col, Card, CardBody, Button, Label, Spinner } from "reactstrap"
import { AvForm } from "availity-reactstrap-validation"
import Select from "react-select"
import { toast } from "react-toastify"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"

const AddTopic = props => {
  document.title = "Add Topic | Mpod"

  const navigate = useNavigate()
  const [technologyData, setTechnologyData] = useState([])
  const [moduleData, setModuleData] = useState([])
  const [selectedTechnology, setSelectedTechnology] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Topics", link: "/topics-list" },
      { title: "Add Topic", link: "/add-topic" },
    ]
    props.setBreadcrumbItems("Add Topic", breadcrumbItems)

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

  // Load the modules of the selected technology.
  useEffect(() => {
    setModuleData([])
    if (!selectedTechnology) return
    let cancelled = false
    axios
      .post(apiUrl("get-modules-by-technology"), { technology_id: selectedTechnology.value })
      .then(response => {
        if (!cancelled) setModuleData(Array.isArray(response.data) ? response.data : [])
      })
      .catch(err => {
        if (!cancelled && err.response?.status !== 404) {
          toast.error(getErrorMessage(err, "Failed to load modules."))
        }
      })
    return () => {
      cancelled = true
    }
  }, [selectedTechnology])

  const technologyOptions = technologyData.map(ele => ({ label: ele.technology_name, value: ele._id }))
  const moduleOptions = moduleData.map(ele => ({ label: ele.module_name, value: ele._id }))

  const handleTechnologyChange = option => {
    setSelectedTechnology(option)
    setSelectedModule(null)
  }

  const addTopic = async () => {
    if (!selectedTechnology) {
      toast.error("Please select a technology")
      return
    }
    if (!selectedModule) {
      toast.error("Please select a module")
      return
    }
    if (!file) {
      toast.error("Please upload a topic file")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("module", selectedModule.value)
    formData.append("technology", selectedTechnology.value)

    setSaving(true)
    try {
      await axios.post(apiUrl("add-topic"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Topic created successfully")
      navigate("/topics-list")
    } catch (error) {
      toast.error(getErrorMessage(error, "Something went wrong while adding the topic"))
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
              <h4 className="card-title">ADD TOPIC</h4>

              <AvForm className="needs-validation" onValidSubmit={addTopic}>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select technology</Label>
                      <Select
                        value={selectedTechnology}
                        onChange={handleTechnologyChange}
                        options={technologyOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Module</Label>
                      <Select
                        value={selectedModule}
                        onChange={setSelectedModule}
                        options={moduleOptions}
                        classNamePrefix="select2-selection"
                        noOptionsMessage={() => (selectedTechnology ? "No modules" : "Select a technology first")}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <label className="form-label">Upload topics</label>
                      <br />
                      <input
                        type="file"
                        className="form-control form-control-file"
                        data-buttonname="btn-secondary"
                        onChange={e => setFile(e.target.files[0] || null)}
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

export default connect(null, { setBreadcrumbItems })(AddTopic)
