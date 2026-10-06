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

const AddBatch = (props) => {
  document.title = "Technial Hub| Add Batch";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Batches", link: "/batches-list" },
    { title: "Add Batch", link: "/add-batch" },
  ];
  const [data, setData] = useState({});
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedPrimaryGroup, setselectedPrimaryGroup] = useState(null)
  const [selectedSecondaryMulti, setselectedSecondaryMulti] = useState(null)
  const [selectedInternGroup, setselectedInternGroup] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null);
  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [userData, setUserData] = useState([])
  const [internData, setInternData] = useState([])
  const [certificationData, setCertificationData] = useState([])
  const [selectedCertificationGroup, setselectedCertificationGroup] = useState([])
  const [selectedYear, setSelectedYear] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems('Add Batch', breadcrumbItems);
    fetchData()
    if (selectedGroup) {
      fetchTechnologyData()
    }
    fetchCertificationsData()
    if (selectedTechnologyGroup) {
      fetchUsersData()
    }
  }, [selectedGroup, selectedTechnologyGroup]);
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
  const fetchUsersData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const technologyIds = selectedTechnologyGroup.map(group => group.value);
  
    try {
      const response = await axios.post(backendUrl + 'get-users-by-technology', { technology_ids: technologyIds });
  
      if (response.status === 200) {
        let total_users = response.data;
        setUserData(total_users);
  
        let curr_interns = total_users.filter((ele) => {
          return ele.role === "intern" && ele.status === 1;  // Filtering with role and user status
        });
  
        console.log(curr_interns);
        setInternData(curr_interns);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  
  const fetchCertificationsData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-offered-certifications');
      if (response.status === 200) {
        console.log(response.data)
        setCertificationData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const usersOptionGroup = userData.map((ele) => ({
    options: [
      { label: ele.first_name, value: ele._id }
    ]
  }));
  const internsOptionGroup = internData.map((ele) => ({
    options: [
      { label: ele.first_name, value: ele._id }
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
  const optionCertificationGroup = certificationData.map((ele) => ({
    options: [
      { label: ele.certification_name, value: ele._id }
    ]
  }))
  const modeOptions = [
    { label: "Light Mode", value: "lightmode" },
    { label: "Bright Mode", value: "brightmode" },
    { label: "Shine Mode", value: "shinemode" },
    { label: "Dark Mode", value: "darkmode" },

  ];
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 2;
  const yearOptions = Array.from({ length: 6 }, (_, index) => ({
    label: `${prevYear + index}`,
    value: `${prevYear + index}`
  }));
  const handleChange = (e) => {
    setData({ ...data, batch_name: e.target.value.toUpperCase() });
  };
  function handleSelectGroup(selectedGroup) {
    setselectedGroup(selectedGroup)
  }
  function handleTechnologySelectGroup(selectedGroup) {
    setselectedTechnologyGroup(selectedGroup)
  console.log(selectedGroup)
  }
  function handleSelectPrimaryGroup(selectedGroup) {
    setselectedPrimaryGroup(selectedGroup)
  }
  function handleSecondaryMulti(selectedGroup) {
    setselectedSecondaryMulti(selectedGroup)
  }

  function handleInternGroup(selectedGroup) {
    setselectedInternGroup(selectedGroup)
  }

  const handleModeSelect = (selectedMode) => {
    setSelectedMode(selectedMode);
  };
  const handleYearSelect = (selectedYear) => {
    setSelectedYear(selectedYear);
  };
  function handleCertificationSelectGroup(selectedGroup) {
    setselectedCertificationGroup(selectedGroup)
  }
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    console.log(event.target.files[0])
  };

  const addBatch = async () => {
    console.log(selectedSecondaryMulti)
    const secondaryArray = [];
    const certificationArray = [];
    const internsArray = [];
    const technologyArray = [];
    selectedSecondaryMulti.forEach(trainer => {
      secondaryArray.push(trainer.value);
    });
    selectedCertificationGroup.forEach(certification => {
      certificationArray.push(certification.value);
    });
    selectedTechnologyGroup.forEach(technology => {
      technologyArray.push(technology.value);
    });
    if (selectedInternGroup) {

      selectedInternGroup.forEach(intern => {
        internsArray.push(intern.value);
      });
    }
    console.log(technologyArray)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('batch_name', data.batch_name);
    formData.append('course', selectedGroup.value);
    formData.append('technology', technologyArray)
    formData.append('primary_trainer', selectedPrimaryGroup.value)
    formData.append('secondary_trainer', secondaryArray)
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('year', selectedYear.value);
    // formData.append('mode', selectedMode.value);
    formData.append('certification', certificationArray)
    formData.append('interns', internsArray)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'add-batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status == 409) {
        alert("batch name already exist")
      }
      if (response.status == 200) {
        alert("success");
        navigate(`/batches-list`)
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
              <h4 className="card-title">Add Batch</h4>

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
                        isMulti={true}
                        value={selectedTechnologyGroup}
                        onChange={(selectedGroup) => {
                          handleTechnologySelectGroup(selectedGroup);
                        }}
                        options={technologyOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                 
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>Start Date</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M,yyyy"
                            options={{
                              altInput: true,
                              altFormat: "F j, Y",
                              dateFormat: "Y-m-d",
                              onChange: function (selectedDates, dateStr, instance) {
                                const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y");
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
                        <Label>End Date</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M,yyyy"
                            options={{
                              altInput: true,
                              altFormat: "F j, Y",
                              dateFormat: "Y-m-d",
                              onChange: function (selectedDates, dateStr, instance) {
                                const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y");
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
                      <Label>Primary Trainer</Label>
                      <Select
                        value={selectedPrimaryGroup}
                        onChange={(selectedGroup) => {
                          handleSelectPrimaryGroup(selectedGroup)
                        }}
                        options={usersOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <label className="control-label">
                        Secondary Trainers
                      </label>
                      <Select
                        value={selectedSecondaryMulti}
                        isMulti={true}
                        onChange={(selectedGroup) => {
                          handleSecondaryMulti(selectedGroup);
                        }}
                        options={usersOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="6">
                    <div className="mb-3">
                      <label className="control-label">
                        Interns
                      </label>
                      <Select
                        value={selectedInternGroup}
                        isMulti={true}
                        onChange={(selectedGroup) => {
                          handleInternGroup(selectedGroup);
                        }}
                        options={internsOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  {/* <Col md="6">
                    <div className="mb-3">
                      <Label>Select Mode</Label>
                      <Select
                        value={selectedMode}
                        onChange={handleModeSelect}
                        options={modeOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col> */}
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Passout Year</Label>
                      <Select
                        value={selectedYear}
                        onChange={handleYearSelect}
                        options={yearOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>

                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Certification</Label>
                      <Select
                        isMulti={true}
                        value={selectedCertificationGroup}
                        onChange={handleCertificationSelectGroup}
                        options={optionCertificationGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Batch Name</Label>
                      <AvField
                        name="batch_name"
                        placeholder="Batch name"
                        type="text"
                        errorMessage="Enter Batch Name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.batch_name}
                      />
                    </div>
                    <div>
                      Note: Batch name Should be in the following format <span style={{ color: "red" }}>DR_2026_AWS_B0</span>
                    </div>
                  </Col>

                </Row>
                <Row>

                  <Col md="6">
                    <div className="mb-3">
                      <div className="mb-3">
                        <label className="form-lable">Upload student roll numbers</label><br />
                        <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                      </div>
                    </div>
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={addBatch}>
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

export default connect(null, { setBreadcrumbItems })(AddBatch);
