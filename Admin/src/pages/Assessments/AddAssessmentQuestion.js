import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  FormGroup, Input
} from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import Select from "react-select"
import axios from "axios";
import { Editor } from "react-draft-wysiwyg"
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from "draftjs-to-html";
import * as XLSX from "xlsx";
const Option = ({ label, isChecked, onCheckChange, editorState, onEditorStateChange, isDisabled }) => (
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
                checked={isChecked}
                onChange={onCheckChange}
                disabled={isDisabled}
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
  document.title = "Technical Hub| Add Assessment Questions";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Add Assessment Question", link: "/add-assessment-question" },
    { title: "Add Assessment Question", link: "/add-assessment-question" },
  ];
  const [user, setUser] = useState();
  const [file, setFile] = useState(null);
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null)
  // const navigate = useNavigate();
  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [moduleData, setModuleData] = useState([])

  const [selectedTypeGroup, setSelectedTypeGroup] = useState(null);
  const [selectedLevelGroup, setSelectedLevelGroup] = useState(null);
  const [selectedTagGroup, setSelectedTagGroup] = useState(null);

  const [showButton, setShowButton] = useState(true); // State for button visibility
  const [isLoading, setIsLoading] = useState(false); // State for loading animation visibility
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [plainText, setPlainText] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [editorStates, setEditorStates] = useState({
    question: EditorState.createEmpty(),
    option1: EditorState.createEmpty(),
    option2: EditorState.createEmpty(),
    option3: EditorState.createEmpty(),
    option4: EditorState.createEmpty(),
  });
  const [selectedAnswers, setSelectedAnswers] = useState({
    option1: null,
    option2: null,
    option3: null,
    option4: null,
  });

  // Function to handle answer change
  const handleAnswerChange = (option) => (answer) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [option]: answer,
    }));
  };
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (option) => () => {
    if (selectedOption === option) {
      setSelectedOption(null);
    } else {
      setSelectedOption(option);
    }
  };

  const handleEditorStateChange = (key) => (editorState) => {
    setEditorStates(prevStates => ({
      ...prevStates,
      [key]: editorState
    }));
  };

  const getEditorContentAsString = (editorState) => {
    const contentState = editorState.getCurrentContent();
    return draftToHtml(convertToRaw(contentState));
  };

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
    const authUser = JSON.parse(localStorage.getItem('authUser'))
    setUser(authUser);
    props.setBreadcrumbItems('Add Assessment Question', breadcrumbItems);
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
  const optionTypeGroup = [
    { value: 'bulk', label: 'Bulk' },
    { value: 'single', label: 'Single' },
  ];
  const levelGroup = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },

  ];
  const tagGroup = [
    { value: 'certification', label: 'Certification' },
    { value: 'general', label: 'General' },

  ];
  function handleSelectGroup(selectedGroup) {
    setselectedGroup(selectedGroup)
  }
  function handleTechnologySelectGroup(selectedGroup) {

    setselectedTechnologyGroup(selectedGroup)
  }
  function handleSelectModuleGroup(selectedGroup) {
    setselectedModuleGroup(selectedGroup)
  }
  const handleSelectTypeGroup = (selectedOption) => {
    setSelectedTypeGroup(selectedOption);
  };
  const handleLevelGroup = (selectedOption) => {
    setSelectedLevelGroup(selectedOption);
  };
  const handleTagGroup = (selectedOption) => {
    setSelectedTagGroup(selectedOption);
  };
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  function handleTopicGroup(selectedGroup) {
    setselectedTopicGroup(selectedGroup)
  }

  const handleQuestionTypeChange = (e) => {
    setSelectedQuestionType(e.target.value);
  };
  const handleSubmit = async () => {

    const questionContent = getEditorContentAsString(editorStates.question);
    const option1Content = getEditorContentAsString(editorStates.option1);
    const option2Content = getEditorContentAsString(editorStates.option2);
    const option3Content = getEditorContentAsString(editorStates.option3);
    const option4Content = getEditorContentAsString(editorStates.option4);

    const options = [
      { content: option1Content, isChecked: selectedOption === 'option1' },
      { content: option2Content, isChecked: selectedOption === 'option2' },
      { content: option3Content, isChecked: selectedOption === 'option3' },
      { content: option4Content, isChecked: selectedOption === 'option4' },
    ];

    let answer;
    options.forEach((ele) => {
      if (ele.isChecked) {
        answer = ele.content;
      }
    });

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('course', selectedGroup.value);
      formData.append('technology', selectedTechnologyGroup.value);
      formData.append('topic', selectedTopicGroup.value);
      formData.append('tag', selectedTagGroup.value);

      formData.append('module', selectedModuleGroup.value);
      // formData.append('level', selectedLevelGroup.value);

      formData.append('added_by', user.first_name);

      setShowButton(false);
      setIsLoading(true);

      try {
        const response = await axios.post(`${backendUrl}add-assessment-question`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (response.status === 200) {
          // navigate(`/dashboard`);
          alert('success')
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setShowButton(true);
        setIsLoading(false);
      }
    } else {
      const data = {
        course: selectedGroup.value,
        technology: selectedTechnologyGroup.value,
        module: selectedModuleGroup.value,
        topic: selectedTopicGroup.value,
        level: selectedLevelGroup.value,
        tag: selectedTagGroup.value,
        added_by: user.first_name,
        question: questionContent,
        option1: option1Content,
        option2: option2Content,
        option3: option3Content,
        option4: option4Content,
        answer: answer
      };
      setShowButton(false);
      setIsLoading(true);

      try {
        const response = await axios.post(`${backendUrl}add-assessment-question`, data, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 200) {
          alert('success')
          window.location.href=`/admin/assessment-questions-list`;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setShowButton(true);
        setIsLoading(false);
      }
    }


  };
  const handleSampleDownload = () => {
    // Define the column headers for the Excel file
    const sampleData = [
      { question: "", option1: "", option2: "", option3: "", option4: "", answer: "", level: "" }
    ];

    // Create a new worksheet and add the sample data
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Data");

    // Create and download the Excel file
    XLSX.writeFile(workbook, "sample_data.xlsx");
  };

  return (
    <div>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <AvForm className="needs-validation">

                <>
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
                        <Label>Select Type</Label>
                        <Select
                          value={selectedTypeGroup}
                          onChange={handleSelectTypeGroup}
                          options={optionTypeGroup}
                          classNamePrefix="select2-selection"
                        />
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Select Tag</Label>
                        <Select
                          value={selectedTagGroup}
                          onChange={handleTagGroup}
                          options={tagGroup}
                          classNamePrefix="select2-selection"
                        />
                      </div>
                    </Col>

                  </Row>
                  <Row>
                    {selectedTypeGroup && selectedTypeGroup.label === 'Single' && (
                      <Col md="6">
                        <div className="mb-3">
                          <Label>Select Level</Label>
                          <Select
                            value={selectedLevelGroup}
                            onChange={handleLevelGroup}
                            options={levelGroup}
                            classNamePrefix="select2-selection"
                          />
                        </div>
                      </Col>)}
                  </Row>
                  {selectedTypeGroup && selectedTypeGroup.label === 'Bulk' && (
                    <Row>
                      <Col md="6">
                        <div className="mb-3">
                          <div className="mb-3">
                            <label className="form-label">Upload Data</label>
                            <br />
                            <input
                              type="file"
                              className="form-control form-control-file"
                              data-buttonname="btn-secondary"
                              onChange={handleFileChange}
                            />
                          </div>
                        </div>
                        <Button color="secondary" onClick={handleSampleDownload}>
                          Download Sample
                        </Button>
                      </Col>
                    </Row>
                  )}<br />
                  {selectedTypeGroup && selectedTypeGroup.label === 'Single' && (
                    <>
                      <Option
                        label="Question"
                        isChecked={false} // No checkbox for question
                        onCheckChange={() => { }}
                        editorState={editorStates.question}
                        onEditorStateChange={handleEditorStateChange('question')}
                      />
                      <Option
                        label="Option 1"
                        isChecked={selectedOption === 'option1'}
                        onCheckChange={handleOptionChange('option1')}
                        editorState={editorStates.option1}
                        onEditorStateChange={handleEditorStateChange('option1')}
                        isDisabled={selectedOption !== null && selectedOption !== 'option1'}
                      />
                      <Option
                        label="Option 2"
                        isChecked={selectedOption === 'option2'}
                        onCheckChange={handleOptionChange('option2')}
                        editorState={editorStates.option2}
                        onEditorStateChange={handleEditorStateChange('option2')}
                        isDisabled={selectedOption !== null && selectedOption !== 'option2'}
                      />
                      <Option
                        label="Option 3"
                        isChecked={selectedOption === 'option3'}
                        onCheckChange={handleOptionChange('option3')}
                        editorState={editorStates.option3}
                        onEditorStateChange={handleEditorStateChange('option3')}
                        isDisabled={selectedOption !== null && selectedOption !== 'option3'}
                      />
                      <Option
                        label="Option 4"
                        isChecked={selectedOption === 'option4'}
                        onCheckChange={handleOptionChange('option4')}
                        editorState={editorStates.option4}
                        onEditorStateChange={handleEditorStateChange('option4')}
                        isDisabled={selectedOption !== null && selectedOption !== 'option4'}
                      />
                    </>
                  )}
                </>

                {showButton && (
                  <Button color="primary" type="button" onClick={handleSubmit}>
                    Submit
                  </Button>
                )}
                {isLoading && (
                  <div className="text-center mt-4">
                    <MutatingDots
                      height={100}
                      width={100}
                      color="#2B3A4A"
                      secondaryColor="#2B3A4A"
                      radius={12.5}
                      ariaLabel="mutating-dots-loading"
                    />
                  </div>
                )}
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default connect(null, { setBreadcrumbItems })(UploadCodingQuestions);
