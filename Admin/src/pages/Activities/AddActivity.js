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
  CardSubtitle,
  Form,

} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import Flatpickr from "react-flatpickr"

import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"
import { Editor } from "react-draft-wysiwyg"
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from "draftjs-to-html";

const AddActivity = (props) => {
  document.title = "Technial Hub| Add Activity";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Activities", link: "/activities-list" },
    { title: "Add Activity", link: "/add-activity" },
  ];
  const [data, setData] = useState({});
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null)
  const [selectedBatchGroup, setselectedBatchGroup] = useState(null)
  const [selectedActivityGroup, setselectedActivityGroup] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [batchData, setBatchData] = useState([])
  const [plainText, setPlainText] = useState("");

  const [moduleData, setModuleData] = useState([])

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const navigate = useNavigate();


  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems('Add Activity', breadcrumbItems);
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
  const activityOptions = [
    { label: "AI", value: "ai" },
    { label: "General", value: "general" }
  ]
  const batchOptionGroup = batchData.map((ele) => ({
    options: [
      { label: ele.batch_name, value: ele._id }
    ]
  }));
  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    setPlainText(draftToHtml(convertToRaw(editorState.getCurrentContent())));

  };
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    // console.log(e.target.value)
  };
  const handleEditorChange = (state) => {
    setEditorState(state);
    onEditorStateChange(state)
    const content = convertToRaw(state.getCurrentContent());
    console.log(JSON.stringify(content.blocks[0].text));
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


  function handleActivitySelectGroup(selectedGroup) {
    setselectedActivityGroup(selectedGroup)
  }

  const handleLevelSelect = (selectedLevel) => {
    setSelectedLevel(selectedLevel);
  };

  function handleSelectBatchGroup(selectedGroup) {
    setselectedBatchGroup(selectedGroup)
  }
  // const uploadImageCallback = (file) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const base64String = reader.result.split(',')[1]; // Get the base64 part of the data URL
  //       const imageUrl = `data:${file.type};base64,${base64String}`;
  //       // Save imageUrl to localStorage
  //       const storedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
  //       storedImages.push(imageUrl);
  //       localStorage.setItem('uploadedImages', JSON.stringify(storedImages));
  //       resolve({ data: { link: imageUrl } });
  //     };
  //     reader.onerror = () => {
  //       reject(new Error('Failed to upload image'));
  //     };
  //     reader.readAsDataURL(file);
  //   });
  // };

  const addActivity = async () => {

    const dataList = {
      'course': selectedGroup.value,
      'technology': selectedTechnologyGroup.value,
      'module': selectedModuleGroup.value,
      'topic': selectedTopicGroup.value,
      'batch': selectedBatchGroup.value,
      'start_date': startDate,
      'end_date': endDate,
      'level': selectedLevel.value,
      "title": data.title,
      "activity_type": selectedActivityGroup.value,
      "activity_content":plainText
    }
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'add-activity', dataList);
      if (response.status == 409) {
        alert("batch name already exist")
      }
      if (response.status == 200) {
        alert("success");
        navigate(`/activities-list`)
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("Batch name already exists");
      } else {
        console.error('Error fetching data:', error);
      }
    }
  };
  // const getContent = () => {
  //   const content = convertToRaw(editorState.getCurrentContent());
  //   console.log(JSON.stringify(content, null, 2)); // Pretty-print the JSON
  // };
  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Activity</h4>

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
                      <Label>Select Type of Activity</Label>
                      <Select
                        // isMulti={true}
                        value={selectedActivityGroup}
                        onChange={handleActivitySelectGroup}
                        options={activityOptions}
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
                      <Label htmlFor="validationCustom01">Title</Label>
                      <AvField
                        name="title"
                        placeholder="Enter title "
                        type="text"
                        errorMessage="Enter title"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.title}
                      />
                    </div>

                  </Col>

                </Row>
                {selectedActivityGroup && selectedActivityGroup.value === "general" && (
                  <Row>
                    <Col lg="12">
                      <FormGroup className="mb-3">
                        <Label>Content</Label>
                        <Editor
                          editorState={editorState}
                          toolbarClassName="toolbarClassName"
                          wrapperClassName="wrapperClassName"
                          editorClassName="editorClassName"
                          onEditorStateChange={handleEditorChange}
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
                )}
                <Button color="primary" type="button" onClick={addActivity}>
                  Submit
                </Button>

              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddActivity);
