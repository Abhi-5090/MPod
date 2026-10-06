import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  Input,
  Label,
} from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import Select from "react-select"
import Flatpickr from "react-flatpickr"
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { apiUrl, getErrorMessage } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const levelOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
  { label: "Any", value: "any" },
];
const statusOptions = [
  { label: "Active", value: "1" },
  { label: "not Active", value: "0" },
];
const platformOptions = [
  { label: "Web", value: "web" },
  { label: "MPOD", value: "mpod" },
];
const interviewTypeOptions = [
  { label: "Single", value: "single" },
  { label: "Bulk", value: "bulk" },
];
// Coding interviews always have 2 questions.
const CODING_QUESTIONS_COUNT = 2;

const AddCodingInterview = (props) => {
  document.title = "Add Coding Interview | Mpod";

  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [questionsCount, setQuestionsCount] = useState();
  const [file, setFile] = useState(null);
  const [failedResults, setFailedResults] = useState([]);
  const [bulkTotal, setBulkTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    props.setBreadcrumbItems("Add Coding Interview", [
      { title: "Mpod", link: "#" },
      { title: "Coding Interviews List", link: "/coding-interviews-list" },
      { title: "Add Coding Interview", link: "#" },
    ]);
    fetchQuestionsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuestionsData = async () => {
    try {
      const response = await axios.get(apiUrl('coding-questions-count'));
      setQuestionsCount(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load available questions count."));
    }
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

  const handlestatusSelect = (selectedLevel) => {
    setSelectedStatus(selectedLevel);
  };
  const handleInterviewTypeSelect = (selectedInterviewType) => {
    setSelectedInterviewType(selectedInterviewType);
    // Reset rollNo and file when switching types
    setRollNo("");
    setFile(null);
  };
  const handleSampleDownload = () => {
    const sampleData = [
      { roll_no: "" }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Data");

    XLSX.writeFile(workbook, "sample_data.xlsx");
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validate = () => {
    if (!selectedPlatform) return "Please select a platform.";
    if (!selectedInterviewType) return "Please select interview type.";
    if (!selectedLevel) return "Please select complexity level.";
    if (!startDate) return "Please select start date and time.";
    if (!selectedStatus) return "Please select interview status.";
    if (selectedInterviewType.value === "single" && !rollNo.trim()) return "Please enter a Roll No";
    if (selectedInterviewType.value === "bulk" && !file) return "Please upload a file";
    return null;
  };

  const AddInterview = async () => {
    const validationError = validate();
    if (validationError) {
      toast.warn(validationError);
      return;
    }
    setIsLoading(true);
    setFailedResults([]);
    try {
      if (selectedInterviewType.value === "single") {
        const dataList = {
          'platform': selectedPlatform.value,
          'roll_no': rollNo.trim(),
          'start_date_time': startDate,
          'level': selectedLevel.value,
          "questions_count": CODING_QUESTIONS_COUNT,
          "status": selectedStatus.value,
          "created_by": user.roll_no,
          "tenant_id": user.t_id
        };
        await axios.post(apiUrl('add-coding-interview'), dataList);
        toast.success("Interview added successfully!");
        navigate(`/coding-interviews-list`);
      } else {
        const dataList = {
          'platform': selectedPlatform.value,
          'file': file,
          'start_date_time': startDate,
          'level': selectedLevel.value,
          "questions_count": CODING_QUESTIONS_COUNT,
          "status": selectedStatus.value,
          "created_by": user.roll_no,
          "tenant_id": user.t_id,
          "type": selectedInterviewType.value
        };
        const formData = new FormData();
        Object.entries(dataList).forEach(([key, value]) => {
          if (key === "file" && value) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        });

        const response = await axios.post(apiUrl("add-bulk-coding-interview"), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const failed = response.status === 207 && Array.isArray(response.data?.results)
          ? response.data.results.filter(r => r.status === "failed")
          : [];
        if (failed.length) {
          setFailedResults(failed); // Show failed details on screen
          setBulkTotal(response.data.total || response.data.results.length);
          toast.error("Some interviews failed to be scheduled.");
        } else {
          toast.success("Interview added successfully!");
          navigate("/coding-interviews-list");
        }
      }
    } catch (error) {
      // e.g. 400 insufficient credits
      toast.error(getErrorMessage(error, "Failed to add coding interview."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Coding Interview</h4>
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
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Interview Type</Label>
                      <Select
                        value={selectedInterviewType}
                        onChange={handleInterviewTypeSelect}
                        options={interviewTypeOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  {selectedInterviewType?.value === "single" ? (
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
                  ) : selectedInterviewType?.value === "bulk" ? (
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Upload File</Label>
                        <Input
                          type="file"
                          name="file"
                          onChange={handleFileChange}
                          accept=".csv,.xlsx"
                          required
                        />
                        <Button color="secondary" onClick={handleSampleDownload}>
                          Download Sample
                        </Button>
                      </div>
                    </Col>
                  ) : null}

                </Row>

                <Row>
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
                      <FormGroup className="mb-4">
                        <Label>Start Date and Time</Label>
                        <Flatpickr
                          className="form-control d-block"
                          placeholder="dd M, yyyy HH:mm"
                          options={{
                            enableTime: true,
                            dateFormat: "Y-m-d H:i",
                            altInput: true,
                            altFormat: "F j, Y h:i K",
                            onChange: function (selectedDates) {
                              if (selectedDates.length > 0) {
                                const isoDate = selectedDates[0].toISOString();
                                setStartDate(isoDate);
                              }
                            }
                          }}
                        />

                      </FormGroup>
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Status</Label>
                      <Select
                        value={selectedStatus}
                        onChange={handlestatusSelect}
                        options={statusOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>

                {!isLoading ? <Button color="primary" type="button" onClick={AddInterview}>
                  Submit
                </Button> :
                  <Button color="primary" disabled>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </Button>
                }
              </AvForm>
            </CardBody>
          </Card>
        </Col>
        <Col xl="6">
          <div>
            <h3>Available Questions</h3>
            {questionsCount && (
              <>
                <h4>Easy: {questionsCount.easy}</h4>
                <h4>Medium: {questionsCount.medium}</h4>
                <h4>Hard: {questionsCount.hard}</h4>
              </>)
            }
          </div>
          {failedResults && failedResults.length > 0 && (
            <Col xl="12">
              <div className="mt-4">
                <div className="card border-danger shadow-sm">
                  <div className="card-header bg-danger text-white">
                    <h5 className="mb-0"> Failed Interview Creations</h5>
                    <small>{failedResults.length} out of {bulkTotal} interviews failed</small>
                  </div>
                  <ul className="list-group list-group-flush">
                    {failedResults.map((item, index) => (
                      <li className="list-group-item d-flex align-items-start" key={index}>
                        <div className="me-3">
                          <span className="badge bg-danger rounded-pill">{item.roll_no}</span>
                        </div>
                        <div>
                          <strong>Reason:</strong> {item.message || item.reason}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Col>
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddCodingInterview);
