import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  CardTitle,
  InputGroup,
  Input,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import Flatpickr from "react-flatpickr"
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const AddInterview = (props) => {
  document.title = "Technial Hub| Add Interview";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Coding Interviews List", link: "/ai-interviews-list" },
    { title: "Add Coding Interview", link: "/add-ai-interview" },
  ];
  const [data, setData] = useState({});
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [batchData, setBatchData] = useState([])
  const [moduleData, setModuleData] = useState([])
  const [startDate, setStartDate] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const [selectedStatus, setSelectedStatus] = useState([])
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [user, setUser] = useState()
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState();
  const [questionsCount, setQuestionsCount] = useState();
  const [file, setFile] = useState(null);
  const [failedResults, setFailedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    fetchCurrentUserData();
    fetchQuestionsData();
  }, []);

  const fetchCurrentUserData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

      const response = await axios.get(backendUrl + "get-admin-current-user");
      if (response.data) {
        setUser(response.data);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  const fetchQuestionsData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'coding-questions-count');
      if (response.status === 200) {
        setQuestionsCount(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };


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
  const handleChange = (e) => {
    setData({ ...data, no_of_questions: e.target.value });
  };
  const handleRollNoChange = (e) => {
    const { value } = e.target;
    setRollNo(value);
  };

  const handlePlatformSelect = (selectedplatform) => {
    console.log(selectedplatform)
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
  const AddInterview = async () => {
    setIsLoading(true)
    if (!selectedPlatform) {
      toast.warn("Please select a platform.");
      return;
    }
    if (!selectedInterviewType.value === "bulk" && !rollNo.trim()) {
      toast.error("Please enter Roll No.");
      return;
    }
    if (!selectedLevel) {
      toast.error("Please select complexity level.");
      return;
    }
    // if (!data.no_of_questions || data.no_of_questions <= 0) {
    //   toast.error("Please enter a valid number of questions.");
    //   return;
    // }
    if (!startDate) {
      toast.error("Please select start date and time.");
      return;
    }
    if (!selectedStatus) {
      toast.error("Please select interview status.");
      return;
    }
    if (selectedInterviewType.value === "single" && !rollNo) {
      toast.warn("Please enter a Roll No");
      return;
    }

    if (selectedInterviewType.value === "bulk" && !file) {
      toast.warn("Please upload a file");
      return;
    }
    if (selectedInterviewType.value === "single") {
      const dataList = {
        'platform': selectedPlatform.value,
        'roll_no': rollNo.trim(),
        'start_date_time': startDate,
        'level': selectedLevel.value,
        // "questions_count": data.no_of_questions,
        "questions_count": 2,
        "status": selectedStatus.value,
        "created_by": user ? user.roll_no : "",
        "tenant_id": user ? user.t_id : "null"
      };

      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
      try {
        const response = await axios.post(backendUrl + 'add-coding-interview', dataList);
        if (response.status === 200) {
          setIsLoading(false)

          toast.success("Interview added successfully!");
          navigate(`/coding-interviews-list`);
        }
      } catch (error) {
        if (error.response.status === 400) {
          alert(error.response.data.message);
        }
        console.error('Error adding data:', error);
      }
    } else {
      const dataList = {
        'platform': selectedPlatform.value,
        // 'roll_no': user ? user.roll_no : "null",
        'file': selectedInterviewType.value === "bulk" ? file : null,
        'start_date_time': startDate,
        'level': selectedLevel.value,
        "questions_count": 2,
        "status": selectedStatus.value,
        "created_by": user ? user.roll_no : "",
        "tenant_id": user ? user.t_id : "null",
        "type": selectedInterviewType.value
      };
      console.log(dataList)
      try {
        const formData = new FormData();
        Object.entries(dataList).forEach(([key, value]) => {
          if (key === "file" && value) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

        const response = await axios.post(backendUrl + "add-bulk-coding-interview", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 201) {
          setIsLoading(false)

          toast.success("Interview added successfully!");
          navigate("/coding-interviews-list");
        } else if (response.status === 207) {
          setIsLoading(false)

          if (response.data.failed != 0) {
            const failed = response.data.results.filter(r => r.status === "failed");
            setFailedResults(failed); // Show failed details on screen
            toast.error("Some interviews failed to be scheduled.");
          } else {
            toast.success("Interview added successfully!");
            navigate("/coding-interviews-list");
          }
        }
      } catch (error) {
        if (error.response?.status === 400) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong");
        }
        console.error("Error adding data:", error);
      }
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Coding Interview</h4>
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

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

                  {/* <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">No. of Questions</Label>
                      <AvField
                        name="no_of_questions"
                        placeholder="No. of Questions"
                        type="number"
                        errorMessage="Enter no. of questions"
                        className="form-control"
                        validate={{ required: { value: true }, min: { value: 1, errorMessage: "At least 1 question is required" } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.no_of_questions}
                      />

                    </div>
                  </Col> */}
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
            <h3>Avaiable Questions</h3>
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
                    <small>{failedResults.length} out of {failedResults?.total || 0} interviews failed</small>
                  </div>
                  <ul className="list-group list-group-flush">
                    {failedResults.map((item, index) => (
                      <li className="list-group-item d-flex align-items-start" key={index}>
                        <div className="me-3">
                          <span className="badge bg-danger rounded-pill">{item.roll_no}</span>
                        </div>
                        <div>
                          <strong>Reason:</strong> {item.message}
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

export default connect(null, { setBreadcrumbItems })(AddInterview);
