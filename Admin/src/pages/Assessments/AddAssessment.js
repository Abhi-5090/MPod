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

const AddAssessment = (props) => {
  document.title = "Technial Hub| Add Assessment";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Assessments", link: "/assessments-list" },
    { title: "Add Assessment", link: "/add-assessment" },
  ];
  const [data, setData] = useState({});
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null)
  const [selectedBatchGroup, setselectedBatchGroup] = useState(null)
  const [selectedAssessmentGroup, setselectedAssessmentGroup] = useState(null)


  const [selectedLevel, setSelectedLevel] = useState(null);
  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [batchData, setBatchData] = useState([])

  const [moduleData, setModuleData] = useState([])

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [questionsCount, setQuestionsCount] = useState();
  const navigate = useNavigate();
  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'trainer' || authUser.role == 'operations' || authUser.role == 'coding' || authUser.role == 'manager') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);



  useEffect(() => {
    props.setBreadcrumbItems('Add Assessment', breadcrumbItems);
    fetchData()
    if (selectedGroup) {
      fetchTechnologyData()
    }
    if (selectedTechnologyGroup) {
      fetchModuleData()
      fetchBatchesData()

    }
    if (selectedModuleGroup) {
      fetchTopicsData()
    }
  }, [selectedGroup, selectedTechnologyGroup, selectedModuleGroup]);
  useEffect(() => {
    const fetchQuestionsCount = async (course, technology, module, topic, level) => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const data = {
        technology: technology,
        module: module,
        topic: topic,
        course: course,
        level: level
      }
      try {
        const questionsCountResponse = await axios.post(backendUrl + 'get-questions-count-by-topic', data)
        if (questionsCountResponse.status == 200) {
          console.log(questionsCountResponse.data)
          setQuestionsCount(questionsCountResponse.data)
        }
      } catch (error) {

      }
    }
    if (selectedGroup && selectedTechnologyGroup && selectedModuleGroup && selectedTopicGroup && selectedLevel) {
      if (selectedAssessmentGroup && selectedAssessmentGroup.value == "general") {

        fetchQuestionsCount(selectedGroup.value, selectedTechnologyGroup.value, selectedModuleGroup.value, selectedTopicGroup.value, selectedLevel.value);
      }
    }

  }, [selectedGroup, selectedTechnologyGroup, selectedModuleGroup, selectedTopicGroup, selectedAssessmentGroup, selectedLevel])
  useEffect(() => {
    const fetchQuestionsCountByTechnology = async (course, technology, module, topic, level) => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const data = {
        technology: technology,
        module: module,
        topic: topic,

      }
      try {
        const questionsCountResponse = await axios.post(backendUrl + 'assessment-questions-count-by-technology', data)
        if (questionsCountResponse.status == 200) {
          console.log(questionsCountResponse.data.data)
          setQuestionsCount(questionsCountResponse.data.data)
        }
      } catch (error) {

      }
    }
    if (selectedGroup && selectedTechnologyGroup && selectedModuleGroup && selectedTopicGroup) {

      fetchQuestionsCountByTechnology(selectedGroup.value, selectedTechnologyGroup.value, selectedModuleGroup.value, selectedTopicGroup.value);

    }

  }, [selectedGroup, selectedTechnologyGroup, selectedModuleGroup, selectedTopicGroup, selectedAssessmentGroup, selectedLevel])
  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-courses');
      if (response.status === 200) {
        setCourseData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const fetchTechnologyData = async () => {
    console.log(selectedGroup.value)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-technology-by-course-id', { course_id: selectedGroup.value });
      if (response.status === 200) {
        console.log(response.data)
        setTechnologyData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchModuleData = async () => {
    if (typeof (selectedTechnologyGroup) != 'undefined') {

      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.post(backendUrl + 'get-modules-by-technology', { technology_id: selectedTechnologyGroup.value });
        if (response.status === 200) {
          console.log(response.data)
          setModuleData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
  }
  const fetchTopicsData = async () => {
    console.log(selectedModuleGroup.value)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-topics-by-module', { module_id: selectedModuleGroup.value });
      if (response.status === 200) {
        setTopicData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };



  const fetchBatchesData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-batch-by-technology', { technology_id: selectedTechnologyGroup.value });
      if (response.status === 200) {
        console.log(response.data)
        setBatchData(response.data)
      }
    } catch (error) {
      console.log("Error fetching data:", error)
    }
  }

  const optionGroup = courseData.map((ele) => ({
    options: [
      { label: ele.course_name, value: ele._id }
    ]
  }));
  const technologyOptionGroup = technologyData.map((ele) => ({
    options: [
      { label: ele.technology_name, value: ele._id }
    ]
  }));

  const optionModuleGroup = moduleData.map((ele) => ({
    options: [
      { label: ele.module_name, value: ele._id }
    ]
  }));
  const topicOptionGroup = topicData.map((ele) => ({
    options: [
      { label: ele.topic_name, value: ele._id }
    ]
  }));
  const levelOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
    { label: "Any", value: "any" },

  ];
  const assessmentOptions = [
    { label: "AI", value: "ai" },
    { label: "General", value: "general" },
    { label: "Certification", value: "certification" }

  ]
  const batchOptionGroup = batchData.map((ele) => ({
    options: [
      { label: ele.batch_name, value: ele._id }
    ]
  }));

  const handleChange = (e) => {
    setData({ ...data, no_of_questions: e.target.value });
  };
  function handleSelectGroup(selectedGroup) {
    setselectedGroup(selectedGroup)
  }
  function handleTechnologySelectGroup(selectedGroup) {
    setselectedTechnologyGroup(selectedGroup)
  }
  function handleSelectModuleGroup(selectedGroup) {
    setselectedModuleGroup(selectedGroup)
  }
  function handleSelectModuleGroup(selectedGroup) {
    setselectedModuleGroup(selectedGroup)
  }
  function handleTopicGroup(selectedGroup) {
    console.log(selectedGroup)
    setselectedTopicGroup(selectedGroup)
  }


  function handleAssessmentSelectGroup(selectedGroup) {
    setselectedAssessmentGroup(selectedGroup)
  }

  const handleLevelSelect = (selectedLevel) => {
    setSelectedLevel(selectedLevel);
  };

  function handleSelectBatchGroup(selectedGroup) {
    setselectedBatchGroup(selectedGroup)
  }
  const addAssessment = async () => {

    const dataList = {
      'course': selectedGroup.value,
      'technology': selectedTechnologyGroup.value,
      'module': selectedModuleGroup.value,
      'topic': selectedTopicGroup.value,
      'batch': selectedBatchGroup.value,
      'start_date': startDate,
      'end_date': endDate,
      'level': selectedLevel.value,
      "no_of_questions": data.no_of_questions,
      "test_type": selectedAssessmentGroup.value
    }
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'add-assessment', dataList);
      if (response.status == 409) {
        alert("batch name already exist")
      }
      if (response.status == 200) {
        alert("success");
        navigate(`/assessments-list`)
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("Batch name already exists");
      } else {
        console.error('Error fetching data:', error);
      }
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Assessment</h4>

              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Course</Label>
                      <Select
                        value={selectedGroup}
                        onChange={handleSelectGroup}
                        options={optionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
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
                        value={selectedModuleGroup}
                        onChange={handleSelectModuleGroup}
                        options={optionModuleGroup}
                        classNamePrefix="select2-selection"
                      // name="module"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <label className="control-label">
                        Topic
                      </label>
                      <Select
                        value={selectedTopicGroup}

                        onChange={(selectedGroup) => {
                          handleTopicGroup(selectedGroup);
                        }}
                        options={topicOptionGroup}
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
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M, yyyy HH:mm"
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              altInput: true,
                              altFormat: "F j, Y h:i K",
                              onChange: function (selectedDates, dateStr, instance) {
                                console.log(selectedDates)
                                const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y H:i");
                                setStartDate(formattedDate);
                              }
                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>End Date and Time</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M, yyyy HH:mm"
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              altInput: true,
                              altFormat: "F j, Y h:i K",
                              onChange: function (selectedDates, dateStr, instance) {
                                const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y H:i");
                                setEndDate(formattedDate);
                              }
                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                </Row>


                <Row>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Batch</Label>
                      <Select
                        value={selectedBatchGroup}
                        onChange={handleSelectBatchGroup}

                        // onChange={(selectedGroup) => {
                        //   handleSelectModuleGroup(selectedGroup)
                        // }}
                        options={batchOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Type of Assessment</Label>
                      <Select
                        // isMulti={true}
                        value={selectedAssessmentGroup}
                        onChange={handleAssessmentSelectGroup}
                        options={assessmentOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>

                </Row>

                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Level</Label>
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
                    {/* <div>
                      {questionsCount && <span style={{ color: "red" }}>Available Questions: {questionsCount.count}</span>}
                    </div> */}
                  </Col>

                </Row>
                <Button color="primary" type="button" onClick={addAssessment}>
                  Submit
                </Button>

              </AvForm>
            </CardBody>
          </Card>
        </Col>
        {questionsCount &&
          <Col xl="6">
            <Card>
              <CardBody>
                  <h2>Available Questions Count</h2>
                  <h5>Easy: {questionsCount.easy}</h5>
                  <h5>Medium: {questionsCount.medium}</h5>
                  <h5>Hard: {questionsCount.hard}</h5>

              </CardBody>
            </Card>
          </Col>
        }
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddAssessment);
