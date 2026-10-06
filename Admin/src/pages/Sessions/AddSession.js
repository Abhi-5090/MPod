import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

const AddSession = (props) => {
  document.title = "Technial Hub| Add Session";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Sessions", link: "/sessions-list" },
    { title: "Add Session", link: "/add-session" },
  ];

  const [data, setData] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTechnologyGroup, setSelectedTechnologyGroup] = useState(null);
  const [selectedModuleGroup, setSelectedModuleGroup] = useState(null);
  const [selectedTopicMulti, setSelectedTopicMulti] = useState(null);
  const [selectedBatchGroup, setSelectedBatchGroup] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [courseData, setCourseData] = useState([]);
  const [technologyData, setTechnologyData] = useState([]);
  const [moduleData, setModuleData] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [classLink, setClassLink] = useState('')
  const [sessionBy, setSessionBy] = useState('')

  const navigate = useNavigate();

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'trainer' || authUser.role == 'operations' || authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems('Add Session', breadcrumbItems);
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchTechnologyData();
      fetchUsers();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedTechnologyGroup) {
      fetchModulesData();
      fetchBatchesData();
    }
  }, [selectedTechnologyGroup]);

  useEffect(() => {
    if (selectedModuleGroup) {
      fetchTopicsData();
    }
  }, [selectedModuleGroup]);

  //Fetch Users Data
  const fetchUsers = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-users');
      if (response.status === 200) {
        let filteredUsers = response.data.filter(ele => ele.role == "trainer" || ele.role == "admin" || ele.role == "coding")
        // console.log(filteredUsers)

        setUsers(filteredUsers);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  //Fetch course data
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

  const fetchModulesData = async () => {
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

  const fetchBatchesData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-batch-by-technology', { technology_id: selectedTechnologyGroup.value });
      if (response.status === 200) {
        setBatchData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const modulesOptionGroup = moduleData.map((ele) => ({
    options: [
      { label: ele.module_name, value: ele._id }
    ]
  }));

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

  const topicOptionGroup = topicData.map((ele) => ({
    options: [
      { label: ele.topic_name, value: ele._id }
    ]
  }));

  const batchOptionGroup = batchData.map((ele) => ({
    options: [
      { label: ele.batch_name, value: ele._id }
    ]
  }));

  //created Users options group
  const userOptionGroup = users.map((ele) => ({
    options: [
      { label: ele.first_name, value: ele._id }
    ],
  }));



  const modeOptions = [
    { label: "Light Mode", value: "lightmode" },
    { label: "Bright Mode", value: "brightmode" },
    { label: "Shine Mode", value: "shinemode" },
    { label: "Dark Mode", value: "darkmode" },
    { label: "Moon Mode", value: "moonmode" },
  ];

  const sessionTypeOptions = [
    { label: "Online", value: "online" },
    { label: "Offline", value: "offline" },
  ];

  const durationOptions = [
    { label: "30 minutes", value: 30 },
    { label: "60 minutes", value: 60 },
    { label: "90 minutes", value: 90 },
    { label: "120 minutes", value: 120 },
    { label: "150 minutes", value: 150 },
    { label: "180 minutes", value: 180 },
  ];



  const handleChange = (e) => {
    setData({ ...data, session_name: e.target.value });
  };

  const handleClassLink = (e)=>{
    console.log(e.target.value)
    setClassLink(e.target.value)
  }

  const handleSelectGroup = (selectedGroup) => {
    setSelectedGroup(selectedGroup);
  };

  const handleTechnologySelectGroup = (selectedGroup) => {
    setSelectedTechnologyGroup(selectedGroup);
  };

  const handleSelectModuleGroup = (selectedGroup) => {
    setSelectedModuleGroup(selectedGroup);
  };

  const handleTopicMulti = (selectedGroup) => {
    setSelectedTopicMulti(selectedGroup);
  };

  const handleSelectBatchGroup = (selectedGroup) => {
    setSelectedBatchGroup(selectedGroup);
  };

  const handleModeSelect = (selectedMode) => {
    setSelectedMode(selectedMode);
  };

  const handleSessionTypeSelect = (selectedType) => {
    setSelectedSessionType(selectedType);
    // Clear duration if switching to offline
    if (selectedType.value === "offline") {
      setSelectedDuration(null);
    }
    if (selectedType.value === "offline") {
      setSelectedUser(null);
    }
  };

  const handleDurationSelect = (selectedDuration) => {
    setSelectedDuration(selectedDuration);
  };

  const handleUserSelect = (selectedUser) => {
    console.log(selectedUser)
    setSelectedUser(selectedUser);
  };
  const validation = () => {
    let errors = {}; 
  
    if (selectedGroup?.value == null) {
      errors.group = "Select Course";
      alert("Select Course");
    }
    if (selectedTechnologyGroup?.value == null) {
      errors.technology = "Select Technology";
      alert("Select Technology");
    }
    if (selectedModuleGroup?.value == null) {
      errors.module = "Select Module";
      alert("Select Module");
    }
    if (selectedTopicMulti?.value == null) {
      errors.topic = "Select Topic";
      alert("Select Topic");
    }
    if (selectedBatchGroup?.value == null) {
      errors.batch = "Select Batch";
      alert("Select Batch");
    }
    if (selectedMode?.value == null) {
      errors.mode = "Select Mode";
      alert("Select Mode");
    }
    if (selectedSessionType?.value == null) {
      errors.sessionType = "Select Session type";
      alert("Select Session type");
    }
  
    return Object.keys(errors).length > 0 ? errors : null;
  }
  
  const addSession = async () => {
   const validate = validation();
  //  console.log(validate)
   if(validate==null) {
    const requestData = {
      course: selectedGroup?.value,
      technology: selectedTechnologyGroup?.value,
      module: selectedModuleGroup?.value,
      topic: selectedTopicMulti?.value,
      batch: selectedBatchGroup?.value,
      mode: selectedMode?.value,
      session_type: selectedSessionType?.value,
      duration: selectedSessionType?.value === "online" ? selectedDuration?.value : undefined,
      class_link:classLink,
      session_by:selectedUser?.value
    };
    console.log(requestData)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'add-session', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        alert('Success');
        navigate(`/sessions-list`);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('Session already created for the given course and technology.');
      } else {
        console.error('Error fetching data:', error);
      }
    }
   }
   
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">ADD Session</h4>
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
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Module</Label>
                      <Select
                        value={selectedModuleGroup}
                        onChange={handleSelectModuleGroup}
                        options={modulesOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Topic</Label>
                      <Select
                        value={selectedTopicMulti}
                        onChange={handleTopicMulti}
                        options={topicOptionGroup}
                        classNamePrefix="select2-selection"
                      />
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
                        options={batchOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Select Mode</Label>
                      <Select
                        value={selectedMode}
                        onChange={handleModeSelect}
                        options={modeOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Session Type</Label>
                      <Select
                        value={selectedSessionType}
                        onChange={handleSessionTypeSelect}
                        options={sessionTypeOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  {selectedSessionType?.value === "online" && (
                    <Row>
                      <Col lg="6">
                        <div className="mb-3">
                          <Label>Duration</Label>
                          <Select
                            value={selectedDuration}
                            onChange={handleDurationSelect}
                            options={durationOptions}
                            classNamePrefix="select2-selection"
                            menuPlacement="auto"
                            maxMenuHeight={150}
                          />
                        </div>
                      </Col>

                      <Col lg="6">
                        <div className="mb-3">
                          <Label>Session By</Label>
                          <Select
                            value={selectedUser}
                            onChange={handleUserSelect}
                            options={userOptionGroup}
                            classNamePrefix="select2-selection"
                            menuPlacement="auto"
                            maxMenuHeight={150}
                          />
                        </div>
                      </Col>
                      <Col lg="6">
                        <div className="mb-3">
                          <Label htmlFor="validationCustom01">Class Link</Label>
                          <AvField
                            name="class_link"
                            placeholder="Paste Class Linke"
                            type="text"
                            errorMessage="Missing Classing Link"
                            className="form-control"
                            validate={{ required: { value: true } }}
                            id="validationCustom01"
                            onChange={handleClassLink}
                          />
                        </div>
                      </Col>
                    </Row>

                  )}
                </Row>
                <Button
                  type="button"
                  color="primary"
                  onClick={addSession}
                >
                  Add Session
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setBreadcrumbItems: (title, items) => dispatch(setBreadcrumbItems(title, items)),
});

export default connect(null, mapDispatchToProps)(AddSession);
