import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  FormGroup,
  Input
} from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import Select from "react-select";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState } from 'draft-js';
import { convertFromHTML } from 'draft-js';

const Option = ({ label, isChecked, onCheckChange,databaseOption,checkedOption, editorState, onEditorStateChange, isDisabled }) => (
  <Row>
    <Col lg="12">
      <FormGroup className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <Label>{label}</Label>
          {label !== "Question" && (
            <div className="d-flex align-items-center">
              <Label className="mr-2">Answer</Label>
              <Input
                type="checkbox"
                defaultChecked={isChecked}
                onChange={onCheckChange}
                // disabled={isDisabled}
                style={{ marginTop: '-5px', marginLeft: "10px" }}
              />
            </div>
          )}
        </div>
        <Editor
          editorState={editorState}
          toolbarClassName="toolbarClassName"
          wrapperClassName="wrapperClassName"
          editorClassName="editorClassName"
          onEditorStateChange={onEditorStateChange}
          editorStyle={{
            minHeight: "300px",
            border: "1px solid",
            borderRadius: "4px",
            padding: "10px",
          }}
        />
      </FormGroup>
    </Col>
  </Row>
);

const UploadCodingQuestions = (props) => {
  document.title = "Technical Hub | Edit Assessment Questions";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Edit Assessment Question", link: "/edit-assessment-question" },
    { title: "Edit Assessment Question", link: "/edit-assessment-question" },
  ];

  const [data, setData] = useState(null);
  const [selectedGroup, setselectedGroup] = useState(null);
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null);
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null);
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null);
  const [selectedLevelGroup, setSelectedLevelGroup] = useState(null);
  const [editorStates, setEditorStates] = useState({
    question: EditorState.createEmpty(),
    option1: EditorState.createEmpty(),
    option2: EditorState.createEmpty(),
    option3: EditorState.createEmpty(),
    option4: EditorState.createEmpty(),
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [courseData, setCourseData] = useState([]);
  const [technologyData, setTechnologyData] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [moduleData, setModuleData] = useState([]);
  const [showButton, setShowButton] = useState(true);
  const question = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestionData();
    fetchData();
  }, []);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role !== 'admin' && authUser.role !== 'superadmin' && authUser.role !== 'trainer' && authUser.role !== 'operations' && authUser.role !== 'coding' && authUser.role !== 'manager') {
      alert("You are not authorized");
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem('authUser'));
    props.setBreadcrumbItems('Edit Assessment Question', breadcrumbItems);
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchTechnologyData();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedTechnologyGroup) {
      fetchModuleData();
    }
  }, [selectedTechnologyGroup]);

  useEffect(() => {
    if (selectedModuleGroup) {
      fetchTopicsData();
    }
  }, [selectedModuleGroup]);

  useEffect(() => {
    if (data && courseData.length > 0 && !selectedGroup) {
      const initialSelectedGroup = courseData.find((ele) => ele._id === data.course);
      setselectedGroup({ label: initialSelectedGroup.course_name, value: initialSelectedGroup._id });
    }
  }, [courseData, data]);

  useEffect(() => {
    if (data && technologyData.length > 0 && !selectedTechnologyGroup) {
      const initialSelectedGroup = technologyData.find((ele) => ele._id === data.technology);
      setselectedTechnologyGroup({ label: initialSelectedGroup.technology_name, value: initialSelectedGroup._id });
    }
  }, [technologyData, data]);

  useEffect(() => {
    if (data && moduleData.length > 0 && !selectedModuleGroup) {
      const initialSelectedGroup = moduleData.find((ele) => ele._id === data.module);
      setselectedModuleGroup({ label: initialSelectedGroup.module_name, value: initialSelectedGroup._id });
    }
  }, [moduleData, data]);

  useEffect(() => {
    if (data && topicData.length > 0 && !selectedTopicGroup) {
      const initialSelectedGroup = topicData.find((ele) => ele._id === data.topic);
      setselectedTopicGroup({ label: initialSelectedGroup.topic_name, value: initialSelectedGroup._id });
    }
  }, [topicData, data]);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-courses`);
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
      const response = await axios.post(`${backendUrl}get-technology-by-course-id`, { course_id: selectedGroup.value });
      if (response.status === 200) {
        setTechnologyData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchModuleData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(`${backendUrl}get-modules-by-technology`, { technology_id: selectedTechnologyGroup.value });
      if (response.status === 200) {
        setModuleData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchTopicsData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(`${backendUrl}get-topics-by-module`, { module_id: selectedModuleGroup.value });
      if (response.status === 200) {
        setTopicData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchQuestionData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-assessment-question-by-id/${question.questionId}`);
      if (response.status === 200) {
        const questionData = response.data;
        setData(questionData);
        setSelectedLevelGroup({ value: questionData.level, label: questionData.level });

        setEditorStates({
          question: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(questionData.question))),
          option1: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(questionData.option1))),
          option2: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(questionData.option2))),
          option3: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(questionData.option3))),
          option4: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(questionData.option4))),
        });

        setSelectedOption(determineSelectedOption(questionData));
      }
    } catch (error) {
      console.log("Error fetching question data:", error);
    }
  };

  const determineSelectedOption = (data) => {
    if (data.option1 === data.answer) return 'option1';
    if (data.option2 === data.answer) return 'option2';
    if (data.option3 === data.answer) return 'option3';
    if (data.option4 === data.answer) return 'option4';
    return null;
  };

  const handleOptionChange = (option) => () => {
    console.log(option)
    setSelectedOption(option === selectedOption ? null : option);
  };

  const handleEditorStateChange = (key) => (editorState) => {
    setEditorStates(prevStates => ({
      ...prevStates,
      [key]: editorState
    }));
  };

  const handleSubmit = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const payload = {
      course: selectedGroup?.value,
      technology: selectedTechnologyGroup?.value,
      module: selectedModuleGroup?.value,
      topic: selectedTopicGroup?.value,
      level: selectedLevelGroup?.value,
      question: editorStates.question.getCurrentContent().getPlainText(),
      option1: editorStates.option1.getCurrentContent().getPlainText(),
      option2: editorStates.option2.getCurrentContent().getPlainText(),
      option3: editorStates.option3.getCurrentContent().getPlainText(),
      option4: editorStates.option4.getCurrentContent().getPlainText(),
      answer: selectedOption ? editorStates[selectedOption].getCurrentContent().getPlainText() : null,
    };
    try {
      const response = await axios.post(`${backendUrl}update-assessment-question-by-id/${question.questionId}`, payload);
      if (response.status === 200) {
        console.log("Question updated successfully:", response.data);
        // navigate('/edit-assessment-question');
      }
    } catch (error) {
      console.error("Error updating the question:", error);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <AvForm>
          <Row>
            <Col lg="6">
              <Card>
                <CardBody>
                  <Row>
                    <Col md="4">
                      <div className="mb-3">
                        <Label>Select Course</Label>
                        <Select
                          value={selectedGroup}
                          onChange={(group) => setselectedGroup(group)}
                          options={courseData.map((ele) => ({
                            label: ele.course_name,
                            value: ele._id,
                          }))}
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="mb-3">
                        <Label>Select Technology</Label>
                        <Select
                          value={selectedTechnologyGroup}
                          onChange={(group) => setselectedTechnologyGroup(group)}
                          options={technologyData.map((ele) => ({
                            label: ele.technology_name,
                            value: ele._id,
                          }))}
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="mb-3">
                        <Label>Select Module</Label>
                        <Select
                          value={selectedModuleGroup}
                          onChange={(group) => setselectedModuleGroup(group)}
                          options={moduleData.map((ele) => ({
                            label: ele.module_name,
                            value: ele._id,
                          }))}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Select Topic</Label>
                        <Select
                          value={selectedTopicGroup}
                          onChange={(group) => setselectedTopicGroup(group)}
                          options={topicData.map((ele) => ({
                            label: ele.topic_name,
                            value: ele._id,
                          }))}
                        />
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Level</Label>
                        <Select
                          value={selectedLevelGroup}
                          onChange={(level) => setSelectedLevelGroup(level)}
                          options={[
                            { value: "easy", label: "Easy" },
                            { value: "medium", label: "Medium" },
                            { value: "hard", label: "Hard" },
                          ]}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg="12">
                      <FormGroup>
                        <Label>Question</Label>
                        <Editor
                          editorState={editorStates.question}
                          onEditorStateChange={handleEditorStateChange("question")}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  {/* {selectedOption && (
                    <> */}
                      <Option
                        label="Option 1"
                        checkedOption="option1"
                        databaseOption={selectedOption}
                        isChecked={selectedOption&&selectedOption === "option1"}
                        onCheckChange={handleOptionChange("option1")}
                        editorState={editorStates.option1}
                        onEditorStateChange={handleEditorStateChange("option1")}
                        isDisabled={showButton}
                      />
                      <Option
                        label="Option 2"
                        isChecked={selectedOption&&selectedOption === "option2"}
                        onCheckChange={handleOptionChange("option2")}
                        editorState={editorStates.option2}
                        onEditorStateChange={handleEditorStateChange("option2")}
                        isDisabled={showButton}
                      />
                      <Option
                        label="Option 3"
                        isChecked={selectedOption&&selectedOption === "option3"}
                        onCheckChange={handleOptionChange("option3")}
                        editorState={editorStates.option3}
                        onEditorStateChange={handleEditorStateChange("option3")}
                        isDisabled={showButton}
                      />
                      <Option
                        label="Option 4"
                        isChecked={selectedOption&&selectedOption === "option4"}
                        onCheckChange={handleOptionChange("option4")}
                        editorState={editorStates.option4}
                        onEditorStateChange={handleEditorStateChange("option4")}
                        isDisabled={showButton}
                      />
                    {/* </>
                  )} */}
                </CardBody>
              </Card>
            </Col>
            <Col lg="12" className="d-flex justify-content-end">
              <Button onClick={handleSubmit}>Submit</Button>
            </Col>
          </Row>
        </AvForm>
      </div>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(UploadCodingQuestions);
