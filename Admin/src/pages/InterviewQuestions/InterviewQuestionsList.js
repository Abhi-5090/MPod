import React, { useCallback, useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button } from "reactstrap"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import axios from "axios"
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import LoadState from "../../components/Common/LoadState"
import ConfirmModal from "../../components/Common/ConfirmModal"
import "./datatables.scss"

const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Interview Questions", link: "#" },
  { title: "Interview Questions List", link: "#" },
]

const InterviewQuestionsList = props => {
  document.title = "Interview Questions | Mpod"

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl("get-interview-questions"))
      setQuestions(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load interview questions."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    props.setBreadcrumbItems("Interview Questions", breadcrumbItems)
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async () => {
    if (!questionToDelete) return
    setDeleting(true)
    try {
      await axios.delete(apiUrl(`delete-interview-question/${questionToDelete._id}`))
      toast.success("Interview Question deleted successfully")
      setQuestions(prev => prev.filter(q => q._id !== questionToDelete._id))
      setQuestionToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete interview question."))
    } finally {
      setDeleting(false)
    }
  }

  const data = {
    columns: [
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      { label: "Question", field: "question", sort: "asc", width: 150 },
      { label: "Answer", field: "answer", sort: "asc", width: 150 },
      { label: "Star Status", field: "previous_asked_status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: questions.map(q => ({
      technology_name: q.technology_name,
      question: q.question,
      answer: q.answer,
      previous_asked_status: q.previous_asked_status,
      actions: (
        <div>
          <Link to={`/edit-interview-question/${q._id}`} className="btn btn-info btn-sm me-2">
            Edit
          </Link>
          <Button color="danger" size="sm" onClick={() => setQuestionToDelete(q)}>
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
              <CardTitle className="h4">Add Interview Question</CardTitle>
              <Link to="/add-interview-question" className="btn btn-primary waves-effect waves-light">
                Add Interview Question
              </Link>
            </CardBody>
            <CardBody>
              <LoadState
                loading={loading}
                error={error}
                empty={!questions.length}
                emptyText="No interview questions found."
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
        message="Are you sure you want to delete this interview question?"
        busy={deleting}
      />
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(InterviewQuestionsList)
