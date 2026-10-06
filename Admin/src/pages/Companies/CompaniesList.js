import React, { useCallback, useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, Button } from "reactstrap"
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

const CompaniesList = props => {
  document.title = "Companies | Mpod"

  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [companyToDelete, setCompanyToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Companies", link: "#" },
      { title: "Companies List", link: "#" },
    ]
    props.setBreadcrumbItems("Companies List", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl("companies-list"))
      setCompanies(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load companies."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleDelete = async () => {
    if (!companyToDelete) return
    setDeleting(true)
    try {
      await axios.delete(apiUrl(`delete-company/${companyToDelete._id}`))
      toast.success("Company deleted")
      setCompanies(prev => prev.filter(c => c._id !== companyToDelete._id))
      setCompanyToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Company not deleted"))
    } finally {
      setDeleting(false)
    }
  }

  const data = {
    columns: [
      { label: "Company Name", field: "company_name", sort: "asc", width: 150 },
      { label: "Action", field: "action", sort: "disabled", width: 50 },
    ],
    rows: companies.map(item => ({
      company_name: item.company_name,
      action: (
        <div>
          <Link to={`/edit-company/${item._id}`} className="btn btn-info btn-sm me-2">
            Edit
          </Link>
          <Button color="danger" size="sm" onClick={() => setCompanyToDelete(item)}>
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
                <Link to="/add-company" className="btn btn-primary">
                  Add Company
                </Link>
              </div>
              <LoadState
                loading={loading}
                error={error}
                empty={companies.length === 0}
                emptyText="No companies found."
                onRetry={fetchCompanies}
              >
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <ConfirmModal
        isOpen={!!companyToDelete}
        toggle={() => setCompanyToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the company "${companyToDelete?.company_name || ""}"?`}
        busy={deleting}
      />
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(CompaniesList)
