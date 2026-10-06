import React, { useCallback, useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import axios from "axios"
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import LoadState from "../../components/Common/LoadState"
import ConfirmModal from "../../components/Common/ConfirmModal"
import ViewCodingQuestionModal from "./ViewCodingQuestionModal"
import "./datatables.scss"

const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Coding", link: "#" },
  { title: "Coding Questions List", link: "#" },
]

const CodingQuestionsList = props => {
  document.title = "Coding Questions | Mpod"

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl("get-coding-questions"))
      setQuestions(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setQuestions([])
      // Backend answers 404 when there are no coding questions yet.
      if (err.response?.status !== 404) {
        setError(getErrorMessage(err, "Failed to load coding questions."))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    props.setBreadcrumbItems("Coding Questions", breadcrumbItems)
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async () => {
    if (!questionToDelete) return
    setDeleting(true)
    try {
      await axios.delete(apiUrl(`delete-coding-question/${questionToDelete._id}`))
      toast.success("Coding question deleted successfully")
      setQuestions(prev => prev.filter(q => q._id !== questionToDelete._id))
      setQuestionToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete coding question."))
    } finally {
      setDeleting(false)
    }
  }

  const handleView = question => {
    setSelectedQuestion(question)
    setViewModalOpen(true)
  }

  const data = {
    columns: [
      { label: "Problem", field: "problem_name", sort: "asc", width: 150 },
      { label: "Complexity", field: "complexity", sort: "asc", width: 150 },
      { label: "Time", field: "time", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: questions.map(question => ({
      problem_name: question.problem_name,
      complexity: question.complexity,
      time: question.time,
      status:
        question.status === 1 ? (
          <Badge color="success" className="bg-success">
            Active
          </Badge>
        ) : (
          <Badge color="danger" className="bg-danger">
            Inactive
          </Badge>
        ),
      actions: (
        <div>
          <Link to={`/edit-coding-question/${question._id}`} className="btn btn-info btn-sm me-2">
            Edit
          </Link>
          <Button color="success" size="sm" className="me-2" onClick={() => handleView(question)}>
            View
          </Button>
          <Button color="danger" size="sm" onClick={() => setQuestionToDelete(question)}>
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
              <CardTitle className="h4">Coding Questions List</CardTitle>
              <Link to="/add-coding-question" className="btn btn-primary waves-effect waves-light">
                ADD CODING QUESTIONS
              </Link>
            </CardBody>
            <CardBody>
              <LoadState
                loading={loading}
                error={error}
                empty={!questions.length}
                emptyText="No coding questions found."
                onRetry={fetchData}
              >
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <ConfirmModal
        isOpen={!!questionToDelete}
        toggle={() => setQuestionToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${questionToDelete?.problem_name || "this coding question"}"?`}
        busy={deleting}
      />
      <ViewCodingQuestionModal
        isOpen={viewModalOpen}
        toggle={() => setViewModalOpen(!viewModalOpen)}
        question={selectedQuestion}
      />
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(CodingQuestionsList)
