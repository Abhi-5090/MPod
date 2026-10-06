import React, { useEffect, useState } from "react"
import { Row, Col, Card, CardBody, FormGroup, Button, Input, Label, Spinner } from "reactstrap"
import { connect } from "react-redux"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { setBreadcrumbItems } from "../../store/actions"
import { apiUrl, getErrorMessage } from "../../config/api"
import LoadState from "../../components/Common/LoadState"

const EditTag = props => {
  document.title = "Edit Tag | Mpod"

  const { tagId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState({ tag_name: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const breadcrumbItems = [
      { title: "Mpod", link: "#" },
      { title: "Tags", link: "/tags-list" },
      { title: "Edit Tag", link: "#" },
    ]
    props.setBreadcrumbItems("Edit Tag", breadcrumbItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTag = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(apiUrl(`get-tag/${tagId}`))
      if (!response.data) {
        setError("Tag not found.")
      } else {
        setData(response.data)
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load tag."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTag()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId])

  const editTagSubmit = async e => {
    if (e) e.preventDefault()
    if (!data.tag_name || !data.tag_name.trim()) {
      toast.error("Tag name is required")
      return
    }

    // Backend overwrites every field it receives, so send the existing values back.
    const payload = {
      tag_name: data.tag_name.trim(),
      createdAt: data.createdAt,
      updatedAt: new Date(),
      added_by: data.added_by,
      status: data.status ?? 1,
    }

    setSaving(true)
    try {
      await axios.put(apiUrl(`update-tag/${tagId}`), payload)
      toast.success("Tag updated")
      navigate("/tags-list")
    } catch (err) {
      toast.error(getErrorMessage(err, "Tag not updated"))
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
              <h4 className="card-title">Edit Tag</h4>
              <LoadState loading={loading} error={error} onRetry={fetchTag}>
                <form className="needs-validation" onSubmit={editTagSubmit}>
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
                          onChange={e => setData({ ...data, tag_name: e.target.value })}
                          value={data.tag_name || ""}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" type="submit" disabled={saving}>
                    {saving && <Spinner size="sm" className="me-1" />}
                    Submit
                  </Button>
                </form>
              </LoadState>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(EditTag)
