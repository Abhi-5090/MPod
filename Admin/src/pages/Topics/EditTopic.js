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
import { apiUrl, getErrorMessage } from "../../config/api"
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

const EditTopic = props => {
  document.title = "Edit Topic | Mpod"

  const { topicId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState({})
  const [active, setActive] = useState(true)
  const [technologyData, setTechnologyData] = useState([])
  const [moduleData, setModuleData] = useState([])
  const [selectedTechnology, setSelectedTechnology] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Topics", link: "/topics-list" },
      { title: "Edit Topic", link: "#" },
    ]
    props.setBreadcrumbItems("Edit Topic", breadcrumbItems)

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

  const fetchTopicData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl(`get-topic-by-id/${topicId}`))
      const topic = response.data || {}
      setData(topic)
      setActive(topic.status === 1)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load topic."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopicData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId])

  // Load modules for the selected technology.
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

  // Preselect the topic's technology.
  useEffect(() => {
    if (technologyData.length > 0 && data.technology) {
      const technology = technologyData.find(ele => ele._id === data.technology)
      if (technology) {
        setSelectedTechnology({ label: technology.technology_name, value: technology._id })
      }
    }
  }, [technologyData, data.technology])

  // Preselect the topic's module once the modules of its technology are loaded.
  useEffect(() => {
    if (moduleData.length > 0 && data.module) {
      const module = moduleData.find(ele => ele._id === data.module)
      if (module) {
        setSelectedModule({ label: module.module_name, value: module._id })
      }
    }
  }, [moduleData, data.module])

  const handleTechnologyChange = option => {
    setSelectedTechnology(option)
    setSelectedModule(null)
  }

  const updateTopic = async () => {
    if (!selectedTechnology) {
      toast.error("Please select a technology")
      return
    }
    if (!selectedModule) {
      toast.error("Please select a module")
      return
    }
    if (!data.topic_name || !data.topic_name.trim()) {
      toast.error("Topic name is required")
      return
    }

    const payload = {
      topic_name: data.topic_name.trim(),
      module: selectedModule.value,
      technology: selectedTechnology.value,
      status: active ? 1 : 0,
    }

    setSaving(true)
    try {
      await axios.post(apiUrl(`update-topic/${topicId}`), payload)
      toast.success("Topic updated successfully")
      navigate("/topics-list")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update topic."))
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
              <h4 className="card-title">EDIT TOPIC</h4>
              <LoadState loading={loading} error={error} onRetry={fetchTopicData}>
                <AvForm className="needs-validation" onValidSubmit={updateTopic}>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Select technology</Label>
                        <Select
                          value={selectedTechnology}
                          onChange={handleTechnologyChange}
                          options={technologyData.map(ele => ({ label: ele.technology_name, value: ele._id }))}
                          classNamePrefix="select2-selection"
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Select module</Label>
                        <Select
                          value={selectedModule}
                          onChange={setSelectedModule}
                          options={moduleData.map(ele => ({ label: ele.module_name, value: ele._id }))}
                          classNamePrefix="select2-selection"
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label htmlFor="validationCustom01">Topic Name</Label>
                        <AvField
                          name="topic_name"
                          placeholder="Topic name"
                          type="text"
                          errorMessage="Enter Topic Name"
                          className="form-control"
                          validate={REQUIRED}
                          id="validationCustom01"
                          onChange={e => setData({ ...data, topic_name: e.target.value })}
                          value={data.topic_name || ""}
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

export default connect(null, { setBreadcrumbItems })(EditTopic)
