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
import { MDBDataTable } from "mdbreact"
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import Flatpickr from "react-flatpickr"
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../../store/actions";
import axios from "axios";
import { MutatingDots } from 'react-loader-spinner';
import "./datatables.scss"
import { useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"

const AddAptLogicAssessment = (props) => {
  document.title = "Technial Hub| Add Assessment";
  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Tests", link: "/aptlogic-tests-list" },
    { title: "Add Test", link: "/add-aptlogic-test" },
  ];
  const [data, setData] = useState({});
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null)
  const [selectedAssessmentGroup, setselectedAssessmentGroup] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [moduleData, setModuleData] = useState([])
  const [questionsCount, setQuestionsCount] = useState();
  const [availableQuestions, setAvaliableQuestions] = useState();
  const [checkedQuestions, setCheckedQuestions] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    props.setBreadcrumbItems('Add Test', breadcrumbItems);
    fetchData()
    if (selectedGroup) {
      fetchTechnologyData()
    }
    if (selectedTechnologyGroup) {
      fetchModuleData()
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
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-technology-by-course-id', { course_id: selectedGroup.value });
      if (response.status === 200) {
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
          setModuleData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
  }
  const fetchTopicsData = async () => {
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
  const fetchQuestions = async (val) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      let questions = await axios.post(backendUrl + "get-questions-by-topic-id", { topic: val})
      if (questions.status == 200) {
        setAvaliableQuestions(questions.data);
        setQuestionsCount(questions.data.length)
      }

    } catch (err) {
      console.log(err)
    }
  }

  const handleCheckboxChange = (event, question_id) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      // Add problem to checkedProblems
      setCheckedQuestions(prevChecked => [...prevChecked, { question_id: question_id}]);
    } else {
      // Remove problem from checkedProblems
      setCheckedQuestions(prevChecked => prevChecked.filter(p => p.question_id !== question_id));
    }
    console.log(checkedQuestions)

  };



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




  const handleChange = (e) => {
    setData({ ...data, questions_count: e.target.value });
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
    fetchQuestions(selectedGroup.value);
    setselectedTopicGroup(selectedGroup)
  }

  const handleLevelSelect = (selectedLevel) => {
    setSelectedLevel(selectedLevel);
  };

  const dataa = {
    columns: [
      { label: "Question name", field: "question", sort: "asc", width: 150 },
      { label: "Level", field: "level", sort: "asc", width: 250 },
      { label: "Option1", field: "option1", sort: "asc", width: 150 },
      { label: "Option2", field: "option2", sort: "asc", width: 150 },
      { label: "Option3", field: "option3", sort: "asc", width: 150 },
      { label: "Option4", field: "option4", sort: "asc", width: 150 },
      { label: "Correct Answer", field: "answer", sort: "asc", width: 150 },
      { label: "Select Questions", field: "actions", sort: "asc", width: 30 }
    ],

    rows: typeof (availableQuestions) != "undefined" ? availableQuestions.map((question, ind) => ({
      question:question.question,
      level: question.level,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      answer: question.answer,
      actions: (
        <div>
          <input
            style={{ width: "20px", height: "20px" }}
            className="form-check-input"
            type="checkbox"
            id={question._id}
            onChange={e => handleCheckboxChange(e, question._id)}

          />

        </div>
      ),
    })) : "",
  };



  const addAssessment = async () => {

    const dataList = {
      'course': selectedGroup.value,
      'technology': selectedTechnologyGroup.value,
      'module': selectedModuleGroup.value,
      'topic': selectedTopicGroup.value,
      'level': selectedLevel.value,
      "questions_count": data.questions_count,
    }
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'add-assessment', dataList);

      if (response.status == 200) {
        alert("success");
        navigate(`/assessments-list`)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
                      <Label htmlFor="validationCustom01">Test Name</Label>
                      <AvField
                        name="test_name"
                        placeholder="No.of Questions"
                        type="text"
                        errorMessage="Enter no. of questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.questions_count}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Test Description</Label>
                      <AvField
                        name="test_description"
                        placeholder="Test description"
                        type="textarea"
                        rows="4"
                        errorMessage="Enter no. of questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.questions_count}
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
                        name="questions_count"
                        placeholder="No.of Questions "
                        type="number"
                        errorMessage="Enter no. of questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.questions_count}
                      />
                    </div>
                    <div>
                      {questionsCount && <span style={{ color: "red" }}>Available Questions: {questionsCount}</span>}
                    </div>
                  </Col>

                </Row>
                <Button color="primary" type="button" onClick={addAssessment}>
                  Submit
                </Button>

              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Assessment</CardTitle>
              <a href="/admin/add-aptlogic-test">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD ASSESSEMENT</Button>
              </a>
            </CardBody>
            <CardBody>
            {
                dataa.rows.length !== 0 ? (
                  <MDBDataTable responsive bordered data={dataa} noBottomColumns />
                ) : (
                  <div className="row">
                    <div className="col-md-2 offset-5">
                      <MutatingDots
                        visible={true}
                        height="100"
                        width="100"
                        color="#2B3A4A"
                        secondaryColor="#2B3A4A"
                        radius="12.5"
                        ariaLabel="mutating-dots-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                      />
                    </div>
                  </div>
                )
              }
            </CardBody>
          </Card>
        </Col>
      </Row>
      
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddAptLogicAssessment);