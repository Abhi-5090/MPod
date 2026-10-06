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
import { setBreadcrumbItems } from "../../../store/actions";
import axios from "axios";
import "./datatables.scss"
import { useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"
import { MDBDataTable } from "mdbreact";


const AddVerbalAssessment = (props) => {


  document.title = "Technial Hub| Add Assessment";
  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Verbal Tests", link: "/verbal-tests-list" },
    { title: "Add Verbal Test", link: "/add-verbal-test" },
  ];
  const [data, setData] = useState({});
  const [user, setUser] = useState()
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null)
  const [selectedAssessmentGroup, setselectedAssessmentGroup] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState({label:"Easy",value:"easy"});
  const [selectedQuestionsCount, setSelectedQuestionsCount] = useState(null);
  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [moduleData, setModuleData] = useState([])
  const [questionsCount, setQuestionsCount] = useState();
  const [availableQuestions, setAvaliableQuestions] = useState();
  const [checkedQuestions, setCheckedQuestions] = useState([]);


  const navigate = useNavigate();

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding' ||authUser.role == 'Principal' ||authUser.role == 'faculty' ||authUser.role == 'hod') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem('authUser'))

    props.setBreadcrumbItems('Add Verbal Test', breadcrumbItems);
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
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

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

  const fetchQuestions = async (level) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      let questions = await axios.post(backendUrl + "get-verbal-questions-by-topic-id-and-complexity", { topic: selectedTopicGroup.value, level: level.value })
      if (questions.status == 200) {
        setAvaliableQuestions(questions.data);
        setQuestionsCount(questions.data.length)
      }

    } catch (err) {
      console.log(err)
    }
  }

  const handleCheckboxChange = (event, question_id) => {
    if(selectedQuestionsCount&&selectedQuestionsCount.value>0){
      const isChecked = event.target.checked;
      if (isChecked) {
        // Add problem to checkedProblems
        setCheckedQuestions(prevChecked => [...prevChecked, { question_id: question_id }]);
      } else {
        // Remove problem from checkedProblems
        setCheckedQuestions(prevChecked => prevChecked.filter(p => p.question_id !== question_id));
      }
    }else{
      alert("Enter Number of questions")
      console.log(checkedQuestions)
      return false
    }
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
    // { label: "Any", value: "any" },

  ];
  const questionsCountOptions = [
    { label: "10", value: "10" },
    { label: "20", value: "20" },
    { label: "30", value: "30" },
    { label: "40", value: "40" },

  ];




  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    console.log(data)
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
    setselectedTopicGroup(selectedGroup)
  }

  const handleLevelSelect = (selectedLevel) => {
    if(selectedQuestionsCount){
      data.duration = selectedLevel.value=="easy"?parseInt(selectedQuestionsCount.value)*1:selectedLevel.value=="medium"?parseInt(selectedQuestionsCount.value)*1.5:selectedLevel.value=="hard"?parseInt(selectedQuestionsCount.value)*2:""
      fetchQuestions(selectedLevel);
      setSelectedLevel(selectedLevel);
    }else{
        alert("Select no of questions")
    }
  };

  const handleQuestionsCountSelect = (selectedQuestionsCount) => {
    if(selectedLevel){
      setSelectedQuestionsCount(selectedQuestionsCount);
      data.duration = selectedLevel.value=="easy"?parseInt(selectedQuestionsCount.value)*1:selectedLevel.value=="medium"?parseInt(selectedQuestionsCount.value)*1.5:selectedLevel.value=="hard"?parseInt(selectedQuestionsCount.value)*2:""
    }else{
      alert("Select any complexity level")
    }
  };

  const dataa = {
    columns: [
      { label: "Select Questions", field: "actions", sort: "asc", width: 30 },
      { label: "Question name", field: "question", sort: "asc", width: 150 },
      { label: "Level", field: "level", sort: "asc", width: 250 },
      { label: "Option1", field: "option1", sort: "asc", width: 150 },
      { label: "Option2", field: "option2", sort: "asc", width: 150 },
      { label: "Option3", field: "option3", sort: "asc", width: 150 },
      { label: "Option4", field: "option4", sort: "asc", width: 150 },
      { label: "Correct Answer", field: "answer", sort: "asc", width: 150 }
    ],

    rows: typeof (availableQuestions) != "undefined" ? availableQuestions.map((question, ind) => ({
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
      question: question.question,
      level: question.level,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      answer: question.answer,
    })) : "",
  };



  const addAssessment = async () => {

    const dataList = {
      'course': selectedGroup.value,
      'technology': selectedTechnologyGroup.value,
      'module': selectedModuleGroup.value,
      'topic': selectedTopicGroup.value,
      'level': selectedLevel.value,
      "questions_count": selectedQuestionsCount.value,
      "questions": checkedQuestions,
      "duration": data.duration,
      "test_name": data.test_name,
      "test_description": data.test_description,
      created_by: "test"
    }
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'add-verbal-practise-test', dataList);

      if (response.status == 200) {
        alert("success");
        navigate(`/verbal-tests-list`)
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
              <h4 className="card-title">Create Test</h4>

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
                      <Label>Select No.Of Questions</Label>
                      <Select
                        value={selectedQuestionsCount}
                        onChange={handleQuestionsCountSelect}
                        options={questionsCountOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                    <div style={{paddingBottom:"5px"}}>
                      {questionsCount?(<span className="text-success">Available Questions: {questionsCount}</span>):questionsCount==0?<span className="text-danger">No Questions avaliable</span>:""}
                    </div>
                  </Col>


                </Row>

                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Test Name</Label>
                      <AvField
                        name="test_name"
                        placeholder="Test name"
                        type="text"
                        errorMessage="Enter Test anem"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.test_name}
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
                        value={data.test_description}
                      />
                    </div>

                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Duration (Min)</Label>
                      <AvField
                        name="duration"
                        disabled
                        placeholder="Duration in minutes"
                        type="number"
                        errorMessage="Enter duration of the test"
                        style={{border:"none"}}
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.duration}
                      />
                    </div>
                  </Col>
                </Row>



                <Button color="primary" disabled={selectedQuestionsCount&& checkedQuestions.length == parseInt(selectedQuestionsCount.value) ? false : "disabled"} type="button" onClick={addAssessment}>
                  Create Test
                </Button>

              </AvForm>
            </CardBody>
          </Card>
        </Col>
        {/* Available questions data table */}
        {!selectedTopicGroup? <></> : <Col md="6">
          <Card>
            <CardBody>
              {
                availableQuestions != undefined ?
                  <>
                    <MDBDataTable responsive bordered data={dataa} noBottomColumns />
                  </>

                  : (<></>)
              }
            </CardBody>
          </Card>
        </Col>}

      </Row>

      <Row>

      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddVerbalAssessment);
