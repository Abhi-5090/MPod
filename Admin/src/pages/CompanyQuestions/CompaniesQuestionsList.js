import React, { useCallback, useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge, FormGroup, Label, Input } from "reactstrap"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import axios from "axios"
import * as XLSX from "xlsx"
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import LoadState from "../../components/Common/LoadState"
import ConfirmModal from "../../components/Common/ConfirmModal"
import "./datatables.scss"

const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Companies", link: "#" },
  { title: "Company Questions List", link: "#" },
]

const CompanyQuestionsList = props => {
  document.title = "Company Questions | Mpod"

  const [questions, setQuestions] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchQuestions = useCallback(async tagId => {
    setLoading(true)
    setError(null)
    try {
      const response = tagId
        ? await axios.get(apiUrl(`get-company-questions-by-tag-id/${tagId}`))
        : await axios.get(apiUrl("get-company-questions"))
      setQuestions(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setQuestions([])
      setError(getErrorMessage(err, "Failed to load company questions."))
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTags = async () => {
    try {
      const response = await axios.get(apiUrl("tags-list"))
      const list = response.data && Array.isArray(response.data.tags) ? response.data.tags : []
      setTags(list)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load tags."))
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Company Questions", breadcrumbItems)
    fetchQuestions("")
    fetchTags()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTagFilterChange = e => {
    const tagId = e.target.value
    setSelectedTag(tagId)
    fetchQuestions(tagId)
  }

  const downloadExcel = () => {
    if (questions.length === 0) {
      toast.warning("No data available to download")
      return
    }

    const excelData = questions.map(item => ({
      Company: item.company_name,
      Tag: item.tag_name,
      Type: item.type,
      Round: item.round,
      Year: item.year,
      Question: item.question,
      Status: item.status === 1 ? "Active" : "Inactive",
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Company Questions")

    const tagName = selectedTag ? tags.find(t => t._id === selectedTag)?.tag_name : null
    const fileName = tagName ? `Questions_${tagName}.xlsx` : "All_Company_Questions.xlsx"

    XLSX.writeFile(workbook, fileName)
  }

  const handleDelete = async () => {
    if (!questionToDelete) return
    setDeleting(true)
    try {
      await axios.delete(apiUrl(`delete-company-question/${questionToDelete._id}`))
      toast.success("Company question deleted successfully")
      setQuestions(prev => prev.filter(q => q._id !== questionToDelete._id))
      setQuestionToDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete company question."))
    } finally {
      setDeleting(false)
    }
  }

  const data = {
    columns: [
      { label: "Company", field: "company_name", sort: "asc", width: 150 },
      { label: "Tag", field: "tag_name", sort: "asc", width: 150 },
      { label: "Type", field: "type", sort: "asc", width: 150 },
      { label: "Round", field: "round", sort: "asc", width: 150 },
      { label: "Year", field: "year", sort: "asc", width: 150 },
      { label: "Question", field: "question", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: questions.map(q => ({
      company_name: q.company_name,
      tag_name: q.tag_name,
      type: q.type,
      round: q.round,
      year: q.year,
      question: q.question,
      status:
        q.status === 1 ? (
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
          <Link to={`/edit-company-question/${q._id}`} className="btn btn-info btn-sm me-2">
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
              <CardTitle className="h4">Company Questions</CardTitle>
              <div>
                <Button color="success" className="me-2" onClick={downloadExcel} disabled={loading || questions.length === 0}>
                  <i className="mdi mdi-file-excel me-1"></i> EXPORT TO EXCEL
                </Button>
                <Link to="/add-company-question" className="btn btn-primary">
                  ADD COMPANY QUESTION
                </Link>
              </div>
            </CardBody>

            <CardBody className="border-top">
              <Row className="align-items-end">
                <Col md="4">
                  <FormGroup>
                    <Label for="tagFilter" className="fw-bold">
                      Filter by Tag
                    </Label>
                    <Input type="select" name="tagFilter" id="tagFilter" value={selectedTag} onChange={handleTagFilterChange}>
                      <option value="">All Tags</option>
                      {tags.map(tag => (
                        <option key={tag._id} value={tag._id}>
                          {tag.tag_name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>

            <CardBody>
              <LoadState
                loading={loading}
                error={error}
                empty={!questions.length}
                emptyText="No company questions found."
                onRetry={() => fetchQuestions(selectedTag)}
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
        message="Are you sure you want to delete this company question?"
        busy={deleting}
      />
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(CompanyQuestionsList)
