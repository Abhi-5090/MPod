import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  InputGroup,
  Input,
  Label,
} from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import Select from "react-select"
import DateTimePicker from "./DateTimePicker";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify";
import { apiUrl, getErrorMessage } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const levelOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
  { label: "Any", value: "any" },
];
const platformOptions = [
  { label: "Web", value: "web" },
  { label: "MPOD", value: "mpod" },
];

const EditCodingInterview = (props) => {
  document.title = "Edit Coding Interview | Mpod";

  const { user } = useAuth();
  const [data, setData] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    props.setBreadcrumbItems('Edit Coding Interview', [
      { title: "Mpod", link: "#" },
      { title: "Coding Interviews List", link: "/coding-interviews-list" },
      { title: "Edit Coding Interview", link: "#" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(apiUrl(`get-coding-interview-details-by-id/${id}`));
      const interviewDetails = response.data || {};
      setRollNo(interviewDetails.roll_no || "");
      setSelectedLevel(
        levelOptions.find(option => option.value === interviewDetails.level) || null
      );
      setStartDate(interviewDetails.start_date_time || null);
      setSelectedPlatform(
        platformOptions.find(option => option.value === interviewDetails.platform) || null
      );
      setData({ no_of_questions: interviewDetails.questions_count || "" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load interview details."));
    }
  };

  const handleChange = (e) => {
    setData({ ...data, no_of_questions: e.target.value });
  };
  const handleRollNoChange = (e) => {
    setRollNo(e.target.value);
  };
  const handlePlatformSelect = (selectedplatform) => {
    setSelectedPlatform(selectedplatform);
  };
  const handleLevelSelect = (selectedLevel) => {
    setSelectedLevel(selectedLevel);
  };

  const handleSubmit = async () => {
    if (!selectedPlatform || !rollNo.trim() || !selectedLevel || !startDate || !data.no_of_questions) {
      toast.warn("Please fill all required fields");
      return;
    }
    const dataList = {
      'platform': selectedPlatform.value,
      'roll_no': rollNo.trim(),
      'start_date_time': new Date(startDate).toISOString(),
      'level': selectedLevel.value,
      "questions_count": data.no_of_questions,
      "created_by": user.roll_no
    }
    setIsSaving(true);
    try {
      await axios.put(apiUrl('update-coding-interview/' + id), dataList);
      toast.success("Interview updated successfully!");
      navigate(`/coding-interviews-list`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update interview."));
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Edit Coding Interview</h4>

              <AvForm className="needs-validation">
              <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Platform</Label>
                      <Select
                        value={selectedPlatform}
                        onChange={handlePlatformSelect}
                        options={platformOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Enter Roll No</Label>
                      <Input
                        type="text"
                        name="roll_no"
                        placeholder="Enter Roll No"
                        value={rollNo}
                        onChange={handleRollNoChange}
                        required
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Complexity</Label>
                      <Select
                        value={selectedLevel}
                        onChange={handleLevelSelect}
                        options={levelOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  

                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">No. of Questions</Label>
                      <Input
                        name="no_of_questions"
                        placeholder="No. of Questions"
                        type="number"
                        min="1"
                        max="30"
                        className="form-control"
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.no_of_questions ?? ""}
                      />
                    </div>
                  </Col>

                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>Start Date and Time</Label>
                        <InputGroup>
                        <DateTimePicker value={startDate} onChange={(d) => setStartDate(d)} allowPast />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                </Row>

                <Button color="primary" type="button" onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? "Updating..." : "Update"}
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditCodingInterview);