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
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  { label: "Not Active", value: "0" },
];

const platformOptions = [
  { label: "Web", value: "web" },
  { label: "MPOD", value: "mpod" },
];

const interviewTypeOptions = [
  { label: "Single", value: "single" },
  { label: "Bulk", value: "bulk" },
];

const AddInterview = (props) => {
  document.title = "Add Interview | Mpod";

  const { user } = useAuth();
  const [data, setData] = useState({});
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null);
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null);
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [technologyData, setTechnologyData] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [moduleData, setModuleData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [failedResults, setFailedResults] = useState([]);
  const [bulkTotal, setBulkTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    props.setBreadcrumbItems("Add Interview", [
      { title: "Mpod", link: "#" },
      { title: "Interviews List", link: "/ai-interviews-list" },
      { title: "Add Interview", link: "/add-ai-interview" },
    ]);
    fetchTechnologyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTechnologyGroup) fetchModuleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTechnologyGroup]);

  useEffect(() => {
    if (selectedModuleGroup && selectedModuleGroup.length) {
      fetchTopicsData();
    } else {
      setTopicData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModuleGroup]);

  const fetchTechnologyData = async () => {
    try {
      const response = await axios.get(apiUrl("get-technologies"));
      setTechnologyData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load technologies."));
    }
  };

  const fetchModuleData = async () => {
    try {
      const response = await axios.post(apiUrl("get-modules-by-technology"), {
        technology_id: selectedTechnologyGroup.value,
      });
      setModuleData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load modules."));
    }
  };

  const fetchTopicsData = async () => {
    try {
      const moduleIds = selectedModuleGroup.map((group) => group.value);
      const response = await axios.post(apiUrl("get-topics-by-multi-modules"), {
        module_ids: moduleIds,
      });
      setTopicData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load topics."));
    }
  };

  const technologyOptionGroup = technologyData.map((ele) => ({
    options: [{ label: ele.technology_name, value: ele._id }],
  }));

  const optionModuleGroup = moduleData.map((ele) => ({
    label: ele.module_name,
    value: ele._id,
  }));

  const topicOptionGroup = topicData.map((ele) => ({
    options: [{ label: ele.topic_name, value: ele._id }],
  }));

  const handleChange = (e) => {
    setData({ ...data, no_of_questions: e.target.value });
  };

  const handleRollNoChange = (e) => {
    setRollNo(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTechnologySelectGroup = (selectedGroup) => {
    setselectedTechnologyGroup(selectedGroup);
    // Modules/topics belong to the previous technology
    setselectedModuleGroup(null);
    setselectedTopicGroup(null);
    setModuleData([]);
  };

  const handleSelectModuleGroup = (selectedGroup) => {
    setselectedModuleGroup(selectedGroup);
  };

  const handleTopicGroup = (selectedGroup) => {
    setselectedTopicGroup(selectedGroup);
  };

  const handleLevelSelect = (selectedLevel) => {
    setSelectedLevel(selectedLevel);
  };

  const handlePlatformSelect = (selectedPlatform) => {
    setSelectedPlatform(selectedPlatform);
  };

  const handleStatusSelect = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
  };

  const handleInterviewTypeSelect = (selectedInterviewType) => {
    setSelectedInterviewType(selectedInterviewType);
    // Reset rollNo and file when switching types
    setRollNo("");
    setFile(null);
  };

  const validate = () => {
    if (
      !selectedPlatform ||
      !selectedTechnologyGroup ||
      !selectedModuleGroup?.length ||
      !selectedTopicGroup?.length ||
      !selectedLevel ||
      !data.no_of_questions ||
      !startDate ||
      !selectedStatus ||
      !selectedInterviewType
    ) {
      return "Please fill all required fields";
    }
    if (Number(data.no_of_questions) > 10) return "please enter upto 10 questions";
    if (selectedInterviewType.value === "single" && !rollNo) return "Please enter a Roll No";
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
          platform: selectedPlatform.value,
          roll_no: rollNo.trim().toUpperCase(),
          technology: selectedTechnologyGroup.value,
          module: selectedModuleGroup.map((group) => group.value),
          topic: selectedTopicGroup.map((group) => group.value),
          start_date_time: startDate,
          level: selectedLevel.value,
          questions_count: data.no_of_questions,
          status: selectedStatus.value,
          created_by: user.roll_no,
          tenant_id: user.t_id,
        };
        await axios.post(apiUrl("add-interviewee-details"), dataList);
        toast.success("Interview added successfully!");
        navigate("/ai-interviews-list");
      } else {
        const dataList = {
          platform: selectedPlatform.value,
          file,
          technology: selectedTechnologyGroup.value,
          module: selectedModuleGroup.map((group) => group.value),
          topic: selectedTopicGroup.map((group) => group.value),
          start_date_time: startDate,
          level: selectedLevel.value,
          questions_count: data.no_of_questions,
          status: selectedStatus.value,
          created_by: user.roll_no,
          tenant_id: user.t_id,
          type: selectedInterviewType.value,
        };
        const formData = new FormData();
        Object.entries(dataList).forEach(([key, value]) => {
          if (key === "module" || key === "topic") {
            formData.append(key, JSON.stringify(value));
          } else if (key === "file" && value) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        });

        const response = await axios.post(apiUrl("add-bulk-interviewee-details"), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const failed = response.status === 207 && Array.isArray(response.data?.results)
          ? response.data.results.filter((r) => r.status === "failed")
          : [];
        if (failed.length) {
          setFailedResults(failed); // Show failed details on screen
          setBulkTotal(response.data.total || response.data.results.length);
          toast.error("Some interviews failed to be scheduled.");
        } else {
          toast.success("Interview added successfully!");
          navigate("/ai-interviews-list");
        }
      }
    } catch (error) {
      // e.g. 400 insufficient credits
      toast.error(getErrorMessage(error, "Failed to add interview."));
    } finally {
      setIsLoading(false);
    }
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
  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Interview</h4>
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
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Technology</Label>
                      <Select
                        value={selectedTechnologyGroup}
                        onChange={handleTechnologySelectGroup}
                        options={technologyOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Module</Label>
                      <Select
                        isMulti
                        value={selectedModuleGroup}
                        onChange={handleSelectModuleGroup}
                        options={optionModuleGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Topic</Label>
                      <Select
                        isMulti
                        value={selectedTopicGroup}
                        onChange={handleTopicGroup}
                        options={topicOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
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
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">No. of Questions</Label>
                      <AvField
                        name="no_of_questions"
                        placeholder="No. of Questions"
                        type="number"
                        errorMessage="Enter no. of questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.no_of_questions}
                      />
                    </div>
                    <p style={{color:"red"}}>Upto 10 Questions is Valid</p>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>Start Date and Time</Label>
                        <InputGroup>
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
                              },
                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Status</Label>
                      <Select
                        value={selectedStatus}
                        onChange={handleStatusSelect}
                        options={statusOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>

                {!isLoading ? (
                  <Button color="primary" type="button" onClick={AddInterview}>
                    Submit
                  </Button>
                ) : (
                  <Button color="primary" disabled>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </Button>
                )}

              </AvForm>
            </CardBody>
          </Card>
        </Col>
        {failedResults && failedResults.length > 0 && (
          <Col xl="6">
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

      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddInterview);