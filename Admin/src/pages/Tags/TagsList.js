import React, { useCallback, useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, Button, Badge } from "reactstrap"
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

const TagsList = props => {
  document.title = "Tags | Mpod"

  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tagToDelete, setTagToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Tags", link: "#" },
      { title: "Tags List", link: "#" },
    ]
    props.setBreadcrumbItems("Tags List", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTags = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl("tags-list"))
      const list = response.data && response.data.tags
      setTags(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load tags."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const handleDelete = async () => {
    if (!tagToDelete) return
    setDeleting(true)
    try {
      await axios.delete(apiUrl(`delete-tag/${tagToDelete._id}`))
      toast.success("Tag deleted")
      setTags(prev => prev.filter(t => t._id !== tagToDelete._id))
      setTagToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Tag not deleted"))
    } finally {
      setDeleting(false)
    }
  }

  const data = {
    columns: [
      { label: "Tag Name", field: "tag_name", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 200 },
      { label: "Action", field: "action", sort: "disabled", width: 200 },
    ],
    rows: tags.map(item => ({
      tag_name: item.tag_name,
      status:
        item.status === 1 ? (
          <Badge className="bg-success">ACTIVE</Badge>
        ) : (
          <Badge className="bg-danger">INACTIVE</Badge>
        ),
      action: (
        <div>
          <Link to={`/edit-tag/${item._id}`} className="btn btn-info btn-sm me-2">
            Edit
          </Link>
          <Button color="danger" size="sm" onClick={() => setTagToDelete(item)}>
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
            <CardBody>
              <div className="d-flex justify-content-end mb-3">
                <Link to="/add-tag" className="btn btn-primary">
                  Add Tag
                </Link>
              </div>
              <LoadState
                loading={loading}
                error={error}
                empty={tags.length === 0}
                emptyText="No tags found."
                onRetry={fetchTags}
              >
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <ConfirmModal
        isOpen={!!tagToDelete}
        toggle={() => setTagToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the tag "${tagToDelete?.tag_name || ""}"?`}
        busy={deleting}
      />
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(TagsList)
