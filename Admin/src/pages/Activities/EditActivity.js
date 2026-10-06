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
import Select from "react-select";
import Flatpickr from "react-flatpickr";

import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import Switch from "react-switch";
import { format } from 'date-fns';
import { Editor } from "react-draft-wysiwyg"
import {
  EditorState,
  convertToRaw,
  ContentState,
  convertFromHTML,
  convertFromRaw,
} from "draft-js";
import draftToHtml from "draftjs-to-html";
const EditActivity = (props) => {
  document.title = "Technical Hub | Edit Activity";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Activities", link: "/activities-list" },
    { title: "Edit Activity", link: "/add-activity" },
  ];
  const [data, setData] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTechnologyGroup, setSelectedTechnologyGroup] = useState(null);
  const [selectedModuleGroup, setSelectedModuleGroup] = useState(null);
  const [selectedTopicGroup, setSelectedTopicGroup] = useState(null);
  const [selectedBatchGroup, setSelectedBatchGroup] = useState(null);
  const [selectedActivityGroup, setSelectedActivityGroup] = useState(null);
  const [selectList, setSelectList] = useState(null);
  const [courseData, setCourseData] = useState([]);
  const [technologyData, setTechnologyData] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [moduleData, setModuleData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [switch3, setSwitch3] = useState(true);
  // const [switch3, setswitch3] = useState(true);
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [plainText, setPlainText] = useState("");

  const navigate = useNavigate();
  let activity = useParams();


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
    props.setBreadcrumbItems("Edit Activity", breadcrumbItems);
    fetchData();
    fetchActivityData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchTechnologyData();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedTechnologyGroup) {
      fetchModuleData();
      fetchBatchesData();
    }
    if (selectedModuleGroup) {
      fetchTopicsData();
    }
  }, [selectedTechnologyGroup, selectedModuleGroup]);

  const fetchActivityData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(
        backendUrl + "get-activity-by-id/" + activity.activityId
      );
      if (response.status === 200) {
        console.log(response.data)
        setData(response.data);
        setPlainText(response.data.activity_content)
        if (response.data.start_date_time) {
          const [day, month, yearAndTime] = response.data.start_date_time.split('-');
          const [year, time] = yearAndTime.split(' ');
          const startDate = new Date(`${year}-${month}-${day}T${time}:00`);
          console.log('Parsed start date:', startDate);
          setStartDate(startDate);
        }
        if (response.data.end_date_time) {
          const [day, month, yearAndTime] = response.data.end_date_time.split('-');
          const [year, time] = yearAndTime.split(' ');
          const endDate = new Date(`${year}-${month}-${day}T${time}:00`);
          console.log('Parsed end date:', endDate);
          setEndDate(endDate);
        }
        setSelectList(response.data.student_list);
        setSwitch3(response.data.status === 1);
      }
    } catch (error) {
      console.log("Error fetching activity data:", error);
    }
  };
  // console.log(startDate)
  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "get-courses");
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
      const response = await axios.post(backendUrl + "get-technology-by-course-id", { course_id: data.course });
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
      const response = await axios.post(backendUrl + "get-modules-by-technology", { technology_id: data.technology });
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
      const response = await axios.post(backendUrl + "get-topics-by-module", { module_id: data.module });
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
      const response = await axios.post(backendUrl + "get-batch-by-technology", { technology_id: data.technology });
      if (response.status === 200) {
        setBatchData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const optionModuleGroup = moduleData.map((ele) => ({
    label: ele.module_name,
    value: ele._id,
  }));

  const topicOptionGroup = topicData.map((ele) => ({
    label: ele.topic_name,
    value: ele._id,
  }));

  const optionGroup = courseData.map((ele) => ({
    label: ele.course_name,
    value: ele._id,
  }));

  const technologyOptionGroup = technologyData.map((ele) => ({
    label: ele.technology_name,
    value: ele._id,
  }));

  const activityOptions = [
    { label: "AI", value: "ai" },
    { label: "General", value: "general" },
  ];

  const levelOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
    { label: "Any", value: "any" },
  ];

  const batchOptionGroup = batchData.map((ele) => ({
    label: ele.batch_name,
    value: ele._id,
  }));
  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    setPlainText(draftToHtml(convertToRaw(editorState.getCurrentContent())));

  };
  const handleChange = (e) => {
    console.log(e.target.value)
    setData({ ...data, no_of_questions: e.target.value });
  };
  const handleSelectGroup = (selectedGroup) => {
    setSelectedGroup(selectedGroup);
  };

  const handleTechnologySelectGroup = (selectedGroup) => {
    setSelectedTechnologyGroup(selectedGroup);
  };

  const handleSelectModuleGroup = (selectedGroup) => {
    setSelectedModuleGroup(selectedGroup);
  };

  const handleTopicGroup = (selectedGroup) => {
    setSelectedTopicGroup(selectedGroup);
  };

  const handleSelectBatchGroup = (selectedGroup) => {
    setSelectedBatchGroup(selectedGroup);
  };

  const handleActivitySelectGroup = (selectedGroup) => {
    setSelectedActivityGroup(selectedGroup);
  };

  const handleLevelSelect = (selectedLevel) => {
    setSelectedLevel(selectedLevel);
  };
  useEffect(() => {
    if (data.activity_content) {
      const defaultContent = data.activity_content;
      const contentBlock = convertFromHTML(defaultContent);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks,
        contentBlock.entityMap
      );
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [data.activity_content])
  useEffect(() => {
    if (courseData.length > 0 && data.course) {
      const initialSelectedGroup = courseData.find((ele) => ele._id === data.course);
      setSelectedGroup({ label: initialSelectedGroup.course_name, value: initialSelectedGroup._id });
    }
  }, [courseData, data.course]);

  useEffect(() => {
    if (technologyData.length > 0 && data.technology) {
      const initialSelectedGroup = technologyData.find((ele) => ele._id === data.technology);
      setSelectedTechnologyGroup({ label: initialSelectedGroup.technology_name, value: initialSelectedGroup._id });
    }
  }, [technologyData, data.technology]);

  useEffect(() => {
    if (moduleData.length > 0 && data.module) {
      const initialSelectedGroup = moduleData.find((ele) => ele._id === data.module);
      setSelectedModuleGroup({ label: initialSelectedGroup.module_name, value: initialSelectedGroup._id });
    }
  }, [moduleData, data.module]);

  useEffect(() => {
    if (topicData.length > 0 && data.topic) {
      const initialSelectedGroup = topicData.find((ele) => ele._id === data.topic);
      setSelectedTopicGroup({ label: initialSelectedGroup.topic_name, value: initialSelectedGroup._id });
    }
  }, [topicData, data.topic]);

  useEffect(() => {
    if (batchData.length > 0 && data.batch) {
      const initialSelectedGroup = batchData.find((ele) => ele._id === data.batch);
      setSelectedBatchGroup({ label: initialSelectedGroup.batch_name, value: initialSelectedGroup._id });
    }
  }, [batchData, data.batch]);

  useEffect(() => {
    if (data.activity_type) {
      const initialSelectedGroup = activityOptions.find((ele) => ele.value === data.activity_type);
      setSelectedActivityGroup(initialSelectedGroup);
    }
  }, [data.activity_type]);

  useEffect(() => {
    if (data.level) {
      const initialSelectedGroup = levelOptions.find((ele) => ele.value === data.level);
      setSelectedLevel(initialSelectedGroup);
    }
  }, [data.level]);

  const Offsymbol = (props) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
          paddingRight: 2
        }}
      >
        No
      </div>
    );
  };

  const OnSymbol = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
          paddingRight: 2
        }}
      >
        Yes
      </div>
    );
  };
  const editActivity = async () => {
    let new_start_date, new_end_date

    if (startDate && startDateTime == null) {
      new_start_date = format(startDate, "dd-MM-yyyy HH:mm");
    }
    if (endDate && endDateTime == null) {
      new_end_date = format(endDate, "dd-MM-yyyy HH:mm");
    }
    const newStatus = switch3 ? 1 : 0;
    const data_values = {
      course: selectedGroup.value,
      technology: selectedTechnologyGroup.value,
      module: selectedModuleGroup.value,
      topic: selectedTopicGroup.value,
      batch: selectedBatchGroup.value,
      level: selectedLevel.value,
      start_date: startDateTime ? startDateTime : new_start_date,
      end_date: endDateTime ? endDateTime : new_end_date,
      no_of_questions: data.no_of_questions ? data.no_of_questions : data.questions_count,
      activity_type: selectedActivityGroup.value,
      title: data.title,
      activity_content: plainText,
      status: newStatus,
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'update-activity/' + activity.activityId, data_values);
      if (response.status == 409) {
        alert("activity name already exist")
      }
      if (response.status == 200) {
        alert("success");
        navigate(`/activities-list`)
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("Activity name already exists");
      } else {
        console.error('Error fetching data:', error);
      }
    }
  };
  // console.log(startDate)
  // Define a custom block renderer for images
  const blockRendererFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === 'atomic') {
      return {
        component: ImageComponent,
        editable: false,
      };
    }
    return null;
  };

  // ImageComponent to render images
  const ImageComponent = (props) => {
    const { contentState, block } = props;
    const { src } = contentState.getEntity(block.getEntityAt(0)).getData();
    return <img src={src} />;
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Row>
            <Col xl="6">
              <Card>
                <CardBody>
                  <AvForm className="needs-validation" onSubmit={editActivity}>
                    <Row>


                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom01">Course</Label>
                          <Select
                            name="course"
                            placeholder="Select Course"
                            classNamePrefix="select2-selection"
                            value={selectedGroup}
                            onChange={handleSelectGroup}
                            options={optionGroup}
                          />
                        </FormGroup>
                      </Col>
                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom02">Technology</Label>
                          <Select
                            name="technology"
                            placeholder="Select Technology"
                            classNamePrefix="select2-selection"
                            value={selectedTechnologyGroup}
                            onChange={handleTechnologySelectGroup}
                            options={technologyOptionGroup}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>

                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom03">Module</Label>
                          <Select
                            name="module"
                            placeholder="Select Module"
                            classNamePrefix="select2-selection"
                            value={selectedModuleGroup}
                            onChange={handleSelectModuleGroup}
                            options={optionModuleGroup}
                          />
                        </FormGroup>
                      </Col>
                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom04">Topic</Label>
                          <Select
                            name="topic"
                            placeholder="Select Topic"
                            classNamePrefix="select2-selection"
                            value={selectedTopicGroup}
                            onChange={handleTopicGroup}
                            options={topicOptionGroup}
                          />
                        </FormGroup>
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
                                value={startDate}
                                options={{
                                  enableTime: true,
                                  dateFormat: "Y-m-d H:i",
                                  altInput: true,
                                  altFormat: "F j, Y h:i K",
                                  onChange: function (selectedDates, dateStr, instance) {
                                    alert("date changing");
                                    console.log(selectedDates);
                                    const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y H:i");
                                    console.log(formattedDate);
                                    setStartDateTime(formattedDate);
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
                                value={endDate}
                                options={{
                                  enableTime: true,
                                  dateFormat: "Y-m-d H:i",
                                  altInput: true,
                                  altFormat: "F j, Y h:i K",
                                  onChange: function (selectedDates, dateStr, instance) {
                                    alert("date changing");
                                    console.log(selectedDates);
                                    const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y H:i");
                                    console.log(formattedDate);
                                    setEndDateTime(formattedDate);
                                  }
                                }}
                              />
                            </InputGroup>
                          </FormGroup>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom05">Batch</Label>
                          <Select
                            name="batch"
                            placeholder="Select Batch"
                            classNamePrefix="select2-selection"
                            value={selectedBatchGroup}
                            onChange={handleSelectBatchGroup}
                            options={batchOptionGroup}
                          />
                        </FormGroup>
                      </Col>
                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom03">Activity Type</Label>
                          <Select
                            name="type"
                            placeholder="Select Activity Type"
                            classNamePrefix="select2-selection"
                            value={selectedActivityGroup}
                            onChange={handleActivitySelectGroup}
                            options={activityOptions}
                          />
                        </FormGroup>
                      </Col>

                    </Row>
                    <Row>

                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom03">Level</Label>
                          <Select
                            name="level"
                            placeholder="Select Level"
                            classNamePrefix="select2-selection"
                            value={selectedLevel}
                            onChange={handleLevelSelect}
                            options={levelOptions}
                          />
                        </FormGroup>
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
                    {data && data.activity_type == 'general' && (
                      <Row>
                        <Col >
                          <Card>
                            <CardBody>
                              <CardTitle>Activity</CardTitle>

                              <Form method="post">
                                <Editor
                                  name="activity_content"
                                  blockRendererFn={blockRendererFn}
                                  defaultEditorState={editorState}
                                  onEditorStateChange={(
                                    editorState
                                  ) => {
                                    setEditorState(editorState);
                                    onEditorStateChange(editorState);
                                  }}
                                  editorState={editorState}
                                  toolbarClassName="toolbarClassName"
                                  wrapperClassName="wrapperClassName"
                                  editorClassName="editorClassName"
                                // onEditorStateChange={onEditorStateChange}
                                // toolbar={{
                                //   image: {
                                //     uploadCallback: uploadImageCallback,
                                //     previewImage: true,
                                //     alt: { present: true, mandatory: false }
                                //   }
                                // }}
                                />
                                <textarea
                                  hidden={true}
                                  name="activity_content"
                                  className="text-area "
                                  value={draftToHtml(
                                    convertToRaw(
                                      editorState.getCurrentContent()
                                    )
                                  )}
                                  onChange={handleChange}
                                />

                              </Form>
                            </CardBody>
                          </Card>
                        </Col>

                      </Row>
                    )}

                    <Row>

                      <Col md="6">
                        <div className="mb-3">
                          <Label htmlFor="validationCustom01">Status</Label>&nbsp;&nbsp;&nbsp;&nbsp;<br />
                          <Switch
                            uncheckedIcon={<Offsymbol />}
                            checkedIcon={<OnSymbol />}
                            onColor="#02a499"
                            onChange={() => {
                              setSwitch3(!switch3)
                            }}
                            checked={switch3}
                          />
                          &nbsp;
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Button type="submit" color="primary" className="mr-1">Update Activity</Button>
                        </FormGroup>
                      </Col>
                    </Row>
                  </AvForm>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditActivity);
