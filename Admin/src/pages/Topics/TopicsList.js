import React, { useCallback, useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import LoadState from "../../components/Common/LoadState"
import ConfirmModal from "../../components/Common/ConfirmModal"
import "./datatables.scss"

const TopicsList = props => {
  document.title = "Topics | Mpod"

  const [topicData, setTopicData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [topicToDelete, setTopicToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Topics", link: "#" },
      { title: "Topics List", link: "#" },
    ]
    props.setBreadcrumbItems("Topics", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl("get-topics"))
      setTopicData(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      // Backend answers 404 when there are no topics yet.
      if (err.response?.status === 404) {
        setTopicData([])
      } else {
        setError(getErrorMessage(err, "Failed to load topics."))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    if (!topicToDelete) return
    setDeleting(true)
    try {
      await axios.delete(apiUrl(`delete-topic/${topicToDelete._id}`))
      toast.success("Topic deleted successfully")
      setTopicData(prev => prev.filter(t => t._id !== topicToDelete._id))
      setTopicToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete topic."))
    } finally {
      setDeleting(false)
    }
  }

  const data = {
    columns: [
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      { label: "Module", field: "module_name", sort: "asc", width: 150 },
      { label: "Topic", field: "topic_name", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "disabled", width: 30 },
    ],
    rows: topicData.map(topic => ({
      technology_name: topic.technology_name,
      module_name: topic.module_name,
      topic_name: topic.topic_name,
      status:
        topic.status === 1 ? (
          <Badge color="success" className="bg-success">Active</Badge>
        ) : (
          <Badge color="danger" className="bg-danger">Inactive</Badge>
        ),
      actions: (
        <div>
          <Link to={`/edit-topic/${topic._id}`} className="btn btn-info btn-sm me-2">
            Edit
          </Link>
          {/* Delete is intentionally hidden (d-none) as before; the confirm flow is wired up. */}
          <Button color="danger" className="d-none" size="sm" onClick={() => setTopicToDelete(topic)}>
            Delete
          </Button>
        </div>
      ),
    })),
  }

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Topic</CardTitle>
              <Link to="/add-topic" className="btn btn-primary waves-effect waves-light">
                ADD TOPIC
              </Link>
            </CardBody>
            <CardBody>
              <LoadState
                loading={loading}
                error={error}
                empty={topicData.length === 0}
                emptyText="No topics found."
                onRetry={fetchData}
              >
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <ConfirmModal
        isOpen={!!topicToDelete}
        toggle={() => setTopicToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the topic "${topicToDelete?.topic_name || ""}"?`}
        busy={deleting}
      />
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(TopicsList)
