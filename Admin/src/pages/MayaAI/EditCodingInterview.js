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
import { useParams, useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"

const EditInterview = (props) => {
  document.title = "Technial Hub | Edit Interview";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Interviews List", link: "/ai-interviews-list" },
    { title: "Edit Interview", link: "/add-ai-interview" },
  ];

  const [data, setData] = useState({});
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [moduleData, setModuleData] = useState([])
  const [startDate, setStartDate] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const [interviewDetails, setInterviewDetails] = useState();
  const [user, setUser] = useState()
  const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] =useState();

  useEffect(() => {
    props.setBreadcrumbItems('Edit Interview', breadcrumbItems);
    const userDetails = JSON.parse(localStorage.getItem('authUser'))
    if(userDetails) {
      setUser(userDetails)
    }
   
  }, []);
  useEffect(() => {
    if (id) {
        fetchDetails();
    }
}, [id]);

const fetchDetails = async () => {
    try {
        const response = await axios.get(`${backendUrl}get-coding-interview-details-by-id/${id}`);
        if (response.status === 200) {
            const interviewDetails = response.data;
            setInterviewDetails(interviewDetails);
            setRollNo(interviewDetails.roll_no || "");

            setSelectedLevel(
                levelOptions.find(option => option.value === interviewDetails.level) || null
            );

            setStartDate(interviewDetails.start_date_time || null);
            setSelectedPlatform(
              platformOptions.find(option => option.value === interviewDetails.platform) || null
            );
            setData({ no_of_questions: interviewDetails.questions_count || "" });
        }
    } catch (err) {
        console.log("Error fetching interview details:", err);
    }
};

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

  const handleSubmit = async () => {
    const utcDate = new Date(startDate).toISOString();

    const dataList = {
      'platform':selectedPlatform.value,
      'roll_no': rollNo,
      'start_date_time': utcDate,
      'level': selectedLevel.value,
      "questions_count": data.no_of_questions,
      "created_by": user ? user.roll_no : "null"

    }
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.put(backendUrl + 'update-coding-interview/' + id, dataList);
      if (response.status == 200) {
        console.log(response.data);
        alert("success");
        navigate(`/coding-interviews-list`)
      }
    } catch (error) {
      console.error('Error adding data:', error);
    }
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
                      <AvField
                        name="no_of_questions"
                        placeholder="No.of Questions "
                        type="number"
                        errorMessage="Enter no. of questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.no_of_questions}
                      />
                    </div>
                  </Col>

                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>Start Date and Time</Label>
                        <InputGroup>
                        <Flatpickr
                            value={startDate}
                            className="form-control d-block"
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              altInput: true,
                              altFormat: "F j, Y h:i K",
                              onChange: function (selectedDates) {
                                if (selectedDates.length > 0) {
                                  setStartDate(selectedDates[0]);
                                }
                              }
                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                </Row>

                <Button color="primary" type="button" onClick={handleSubmit}>
                  Update
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditInterview);