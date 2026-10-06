import React, { useCallback, useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, IMAGE_BASE, getErrorMessage } from "../../config/api"
import LoadState from "../../components/Common/LoadState"
import ConfirmModal from "../../components/Common/ConfirmModal"
import "./datatables.scss"

const ModulesList = props => {
  document.title = "Modules | Mpod"

  const [moduleData, setModuleData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [moduleToDelete, setModuleToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Modules", link: "#" },
      { title: "Modules List", link: "#" },
    ]
    props.setBreadcrumbItems("Modules", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl("get-modules"))
      setModuleData(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      // Backend answers 404 when there are no modules yet.
      if (err.response?.status === 404) {
        setModuleData([])
      } else {
        setError(getErrorMessage(err, "Failed to load modules."))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    if (!moduleToDelete) return
    setDeleting(true)
    try {
      await axios.delete(apiUrl(`delete-module/${moduleToDelete._id}`))
      toast.success("Module deleted successfully")
      setModuleData(prev => prev.filter(m => m._id !== moduleToDelete._id))
      setModuleToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete module."))
    } finally {
      setDeleting(false)
    }
  }

  const data = {
    columns: [
      { label: "Technology Name", field: "technology_name", sort: "asc", width: 150 },
      { label: "Module Name", field: "module_name", sort: "asc", width: 150 },
      { label: "Module Icon", field: "module_icon", sort: "disabled", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "disabled", width: 30 },
    ],
    rows: moduleData.map(module => ({
      technology_name: module.technology_name,
      module_name: module.module_name,
      status:
        module.status === 1 ? (
          <Badge color="success" className="bg-success">Active</Badge>
        ) : (
          <Badge color="danger" className="bg-danger">Inactive</Badge>
        ),
      module_icon: module.module_icon ? (
        <img src={IMAGE_BASE + "module-icons/" + module.module_icon} alt="Module Icon" width="50px" />
      ) : (
        ""
      ),
      actions: (
        <div>
          <Link to={`/edit-module/${module._id}`} className="btn btn-info btn-sm me-2">
            Edit
          </Link>
          {/* Delete is intentionally hidden (d-none) as before; the confirm flow is wired up. */}
          <Button color="danger" className="d-none" size="sm" onClick={() => setModuleToDelete(module)}>
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
              <CardTitle className="h4">Add Module</CardTitle>
              <Link to="/add-module" className="btn btn-primary waves-effect waves-light">
                ADD Module
              </Link>
            </CardBody>
            <CardBody>
              <LoadState
                loading={loading}
                error={error}
                empty={moduleData.length === 0}
                emptyText="No modules found."
                onRetry={fetchData}
              >
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <ConfirmModal
        isOpen={!!moduleToDelete}
        toggle={() => setModuleToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the module "${moduleToDelete?.module_name || ""}"?`}
        busy={deleting}
      />
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(ModulesList)
