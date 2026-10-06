import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label
} from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../../store/actions";
import Select from "react-select"
import axios from "axios";
import { useNavigate } from "react-router-dom"
const UploadAptitudeQuestions = (props) => {
  document.title = "Technical Hub| Upload Coding Profiles";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Aptitude Questions Upload", link: "/upload-aptitude-questions" },
    { title: "Aptitude Questions Upload", link: "/upload-aptitude-questions" },
  ];
  const [user,setUser] = useState();
  const [file, setFile] = useState(null);
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null)

  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [moduleData, setModuleData] = useState([])


  const [showButton, setShowButton] = useState(true); // State for button visibility
  const [isLoading, setIsLoading] = useState(false); // State for loading animation visibility
  
  const navigate = useNavigate();


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
    const authUser = JSON.parse(localStorage.getItem('authUser'))
    setUser(authUser);

    props.setBreadcrumbItems('Add Question', breadcrumbItems);
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


  const addData = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('course',selectedGroup.value);        // Seleted course value
    formData.append('technology',selectedTechnologyGroup.value);  // Selected Technology Value
    formData.append('module',selectedModuleGroup.value);          // Selected Module value
    formData.append('topic',selectedTopicGroup.value);          // Selected Topic value
    formData.append('added_by', user.first_name)                       // added_by
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    setShowButton(false); // Hide the button
    setIsLoading(true); // Show loading animation

    try {
      let dynamicModule = selectedModuleGroup.label.toLowerCase()

      if(selectedModuleGroup.label=="Verbal Ability"){
        dynamicModule = "verbal"
      }

      const response = await axios.post(backendUrl + `bulk-${dynamicModule}-questions-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status == 200) {
        navigate(`/dashboard`)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setShowButton(true); // Show the button
      setIsLoading(false); // Hide loading animation
    }
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
  function handleTopicGroup(selectedGroup) {
    setselectedTopicGroup(selectedGroup)
  }



  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };



  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Upload {selectedModuleGroup && selectedModuleGroup.label} Questions</h4>

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

                {selectedTopicGroup && selectedTopicGroup.label ? (<Row>
                  <Col md="6">
                    <div className="mb-3">
                      <div className="mb-3">
                        <label className="form-lable">Upload Data</label><br />
                        <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                      </div>
                    </div>
                  </Col>
                </Row>) : <></>}

                {showButton && (
                  <Button color="primary" type="button" onClick={addData}>
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
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(UploadAptitudeQuestions);
