import React, { useEffect, useState } from "react"
import { Row, Col, Card, CardBody, Input, FormGroup, Button, Label, Spinner } from "reactstrap"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import { useAuth } from "../../context/AuthContext"

const AddTag = props => {
  document.title = "Add Tag | Mpod"

  const navigate = useNavigate()
  const { user } = useAuth()
  const [tagName, setTagName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Tags", link: "/tags-list" },
      { title: "Add Tag", link: "/add-tag" },
    ]
    props.setBreadcrumbItems("Add Tag", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addTag = async e => {
    if (e) e.preventDefault()
    if (!tagName.trim()) {
      toast.error("Tag name is required")
      return
    }

    const now = new Date()
    const payload = {
      tag_name: tagName.trim(),
      createdAt: now,
      updatedAt: now,
      added_by: user?.first_name || user?.roll_no || "admin",
      status: 1,
    }

    setSaving(true)
    try {
      await axios.post(apiUrl("add-tag"), payload)
      toast.success("Tag added successfully")
      navigate("/tags-list")
    } catch (err) {
      toast.error(getErrorMessage(err, "Tag not added"))
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
              <h4 className="card-title">Add Tag</h4>
              <form className="needs-validation" onSubmit={addTag}>
                <Row>
                  <Col md="6">
                    <FormGroup className="mb-3">
                      <Label htmlFor="tag_name">Tag Name</Label>
                      <Input
                        name="tag_name"
                        placeholder="Enter Tag Name"
                        type="text"
                        className="form-control"
                        id="tag_name"
                        onChange={e => setTagName(e.target.value)}
                        value={tagName}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <div className="col-12">
                  <Button color="primary" type="submit" disabled={saving}>
                    {saving && <Spinner size="sm" className="me-1" />}
                    Submit
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(AddTag)
