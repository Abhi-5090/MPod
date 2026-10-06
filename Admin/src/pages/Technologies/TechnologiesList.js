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

const TechnologiesList = props => {
  document.title = "Technologies | Mpod"

  const [technologyData, setTechnologyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [technologyToDelete, setTechnologyToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Technologies", link: "#" },
      { title: "Technologies List", link: "#" },
    ]
    props.setBreadcrumbItems("Technologies", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl("get-technologies"))
      setTechnologyData(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      // Backend answers 404 when there are no technologies yet.
      if (err.response?.status === 404) {
        setTechnologyData([])
      } else {
        setError(getErrorMessage(err, "Failed to load technologies."))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    if (!technologyToDelete) return
    setDeleting(true)
    try {
      await axios.delete(apiUrl(`delete-technology/${technologyToDelete._id}`))
      toast.success("Technology deleted successfully")
      setTechnologyData(prev => prev.filter(t => t._id !== technologyToDelete._id))
      setTechnologyToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete technology."))
    } finally {
      setDeleting(false)
    }
  }

  const data = {
    columns: [
      { label: "Technology Name", field: "technology_name", sort: "asc", width: 150 },
      { label: "Category", field: "technology_category", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "disabled", width: 30 },
    ],
    rows: technologyData.map(technology => ({
      technology_name: technology.technology_name,
      technology_category: technology.technology_category,
      status:
        technology.status === 1 ? (
          <Badge color="success" className="bg-success">Active</Badge>
        ) : (
          <Badge color="danger" className="bg-danger">Inactive</Badge>
        ),
      actions: (
        <div>
          <Link to={`/edit-technology/${technology._id}`} className="btn btn-info btn-sm me-2">
            Edit
          </Link>
          {/* Delete is intentionally hidden (d-none) as before; the confirm flow is wired up. */}
          <Button color="danger" className="d-none" size="sm" onClick={() => setTechnologyToDelete(technology)}>
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
              <CardTitle className="h4">Add Technology</CardTitle>
              <Link to="/add-technology" className="btn btn-primary waves-effect waves-light">
                ADD Technology
              </Link>
            </CardBody>
            <CardBody>
              <LoadState
                loading={loading}
                error={error}
                empty={technologyData.length === 0}
                emptyText="No technologies found."
                onRetry={fetchData}
              >
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <ConfirmModal
        isOpen={!!technologyToDelete}
        toggle={() => setTechnologyToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the technology "${technologyToDelete?.technology_name || ""}"?`}
        busy={deleting}
      />
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(TechnologiesList)
