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
import { useParams, useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"
import Switch from "react-switch"

const EditBatch = (props) => {
  document.title = "Technial Hub| Edit Batch";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Batches", link: "/batches-list" },
    { title: "Edit Batch", link: "/add-batch" },
  ];
  const [data, setData] = useState({});
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedPrimaryGroup, setselectedPrimaryGroup] = useState(null)
  const [selectedSecondaryMulti, setselectedSecondaryMulti] = useState(null)
  const [selectedCertificationMulti, setselectedCertificationMulti] = useState(null)
  const [selectedInternGroup, setselectedInternGroup] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectList, setSelectList] = useState(null)
  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [userData, setUserData] = useState([])
  const [internData, setInternData] = useState([])
  const [selectedYear, setSelectedYear] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [switch3, setswitch3] = useState(true);
  const [certificationData, setCertificationData] = useState([]);
  const navigate = useNavigate();
  let batch = useParams();
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
    props.setBreadcrumbItems('Edit Batch', breadcrumbItems);
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchTechnologyData();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedTechnologyGroup) {
      fetchUsersData();
    }
  }, [selectedTechnologyGroup]);

  useEffect(() => {
    fetchBatchData();
  }, []);

  useEffect(() => {
    fetchCertificationsData();
  }, [])
  const fetchBatchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "get-batch-by-id/" + batch.batchId);
      if (response.status === 200) {
        console.log(response.data)
        setData(response.data);
        setStartDate(response.data.start_date)
        setEndDate(response.data.end_date)
        setSelectList(response.data.student_list)
        if (response.data.status == 1) {
          setswitch3(true)
        } else {
          setswitch3(false)
        }
      }
    } catch (error) {
      console.log("Error fetching technology data:", error);
    }
  };
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
  
        // console.log(curr_interns);
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
  const modeOptions = [
    { label: "Light Mode", value: "lightmode" },
    { label: "Bright Mode", value: "brightmode" },
    { label: "Shine Mode", value: "shinemode" },
    { label: "Dark Mode", value: "darkmode" },

  ];
  const certificationOptionGroup = certificationData.map((ele) => ({
    options: [
      { label: ele.certification_name, value: ele._id }
    ]
  }))
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 2;
  const yearOptions = Array.from({ length: 7 }, (_, index) => ({
    label: `${prevYear + index}`,
    value: `${prevYear + index}`
  }));
  const handleChange = (e) => {
    setData({ ...data, batch_name: e.target.value });
  };
  function handleSelectGroup(selectedGroup) {
    setselectedGroup(selectedGroup)
  }
  function handleTechnologySelectGroup(selectedGroup) {
    setselectedTechnologyGroup(selectedGroup)
  }
  function handleSelectPrimaryGroup(selectedGroup) {
    console.log(selectedGroup)
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
  const handleListChange = (e) => {
    setSelectList(e.target.value)
  }
  function handleCertificationMulti(selectedGroup) {
    setselectedCertificationMulti(selectedGroup)
  }
  useEffect(() => {
    if (courseData.length > 0 && data.course) {
      const initialSelectedGroup = courseData.find((ele) => ele._id === data.course);
      setselectedGroup({ label: initialSelectedGroup.course_name, value: initialSelectedGroup._id });
    }

  }, [courseData, data.course]);
  // useEffect(() => {
  //   if (technologyData.length > 0 && data.technology) {
  //     const initialSelectedGroup = technologyData.find((ele) => ele._id === data.technology);
  //     setselectedTechnologyGroup({ label: initialSelectedGroup.technology_name, value: initialSelectedGroup._id });
  //   }

  // }, [technologyData, data.technology]);

  useEffect(() => {
    if (technologyData.length > 0 && data.technology && data.technology.length > 0) {
      const initialSelectedSecondaryTrainers = data.technology.map(technologyId => {
        const technology = technologyData.find(technology => technology._id === technologyId);
        if (technology) {
          return { label: technology.technology_name, value: technology._id };
        }
        return null;
      }).filter(technology => technology !== null);

      setselectedTechnologyGroup(initialSelectedSecondaryTrainers);
    }
  }, [technologyData, data.technology]);
  useEffect(() => {
    if (userData.length > 0 && data.primary_trainer) {
      const initialSelectedGroup = userData.find((ele) => ele._id === data.primary_trainer);
      // console.log(initialSelectedGroup)
      if (typeof (initialSelectedGroup) != 'undefined') {
        setselectedPrimaryGroup({ label: initialSelectedGroup.first_name, value: initialSelectedGroup._id });
      }
    }

  }, [userData, data.primary_trainer]);

  useEffect(() => {
    if (userData.length > 0 && data.secondary_trainers && data.secondary_trainers.length > 0) {
      const initialSelectedSecondaryTrainers = data.secondary_trainers.map(trainerId => {
        const trainer = userData.find(user => user._id === trainerId);
        if (trainer) {
          return { label: trainer.first_name, value: trainer._id };
        }
        return null;
      }).filter(trainer => trainer !== null);

      setselectedSecondaryMulti(initialSelectedSecondaryTrainers);
    }
  }, [userData, data.secondary_trainers]);

  useEffect(() => {
    if (internData.length > 0 && data.interns && data.interns.length > 0) {
      const initialSelectedInterns = data.interns.map(internId => {
        const intern = internData.find(intern => intern._id === internId);
        if (intern) {
          return { label: intern.first_name, value: intern._id };
        }
        return null;
      }).filter(intern => intern !== null);

      setselectedInternGroup(initialSelectedInterns);
    }
  }, [internData, data.interns]);



  useEffect(() => {
    if (certificationData.length > 0 && data.certification && data.certification.length > 0) {
      const initialSelectedCertification = data.certification.map(certificationId => {
        const certification = certificationData.find(certification => certification._id === certificationId);
        if (certification) {
          return { label: certification.certification_name, value: certification._id };
        }
        return null;
      }).filter(certification => certification !== null);
      setselectedCertificationMulti(initialSelectedCertification);
    }
  }, [certificationData, data.certification]);

  useEffect(() => {
    if (yearOptions.length > 0 && data.year) {
      const initialSelectedGroup = yearOptions.find((ele) => ele.value === data.year);
      setSelectedYear(initialSelectedGroup);

    }
  }, [data.year]);
  useEffect(() => {
    if (modeOptions.length > 0 && data.mode) {
      const initialSelectedGroup = modeOptions.find((ele) => ele.value === data.mode);
      setSelectedMode(initialSelectedGroup);

    }
  }, [data.mode]);
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
  const editBatch = async () => {
    const secondaryArray = [];
    const certificationArray = [];
    const internsArray = []
    let studentsArray = []
    const technologyArray =[];
    if (selectedInternGroup) {
      selectedInternGroup.forEach(intern => {
        internsArray.push(intern.value);
      })
    }

    selectedSecondaryMulti.forEach(trainer => {
      secondaryArray.push(trainer.value);
    });
    selectedTechnologyGroup.forEach(technology => {
      technologyArray.push(technology.value);
    });
    if (selectedCertificationMulti && selectedCertificationMulti.length > 0) {
      selectedCertificationMulti.forEach(certification => {
        certificationArray.push(certification.value);
      });
    }

    console.log(typeof (selectList))
    if (typeof (selectList) != "string") {
      studentsArray = selectList;
    } else {
      studentsArray = selectList.split(',');
    }
    console.log(technologyArray)

    const newStatus = switch3 ? 1 : 0;
    const data_values = {
      batch_name: data.batch_name,
      course: selectedGroup.value,
      technology: technologyArray,
      primary_trainer: selectedPrimaryGroup.value,
      secondary_trainers: secondaryArray,
      certification: certificationArray,
      start_date: startDate,
      end_date: endDate,
      interns: internsArray,
      year: selectedYear.value,
      // mode: selectedMode.value,
      status: newStatus,
      student_list: studentsArray
    }
    console.log(studentsArray)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'update-batch/' + batch.batchId, data_values);
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
  function convertDateFormat(dateString) {
    if (dateString && typeof dateString === 'string') {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dateString;
  }

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Edit Batch</h4>

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
                  {/* <Col md="6">
                    <div className="mb-3">
                      <Label>Select Technology</Label>
                      <Select
                        value={selectedTechnologyGroup}
                        onChange={handleTechnologySelectGroup}
                        options={technologyOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col> */}
                  <Col lg="6">
                    <div className="mb-3">
                      <label className="control-label">
                        Select Technology
                      </label>
                      <Select
                        value={selectedTechnologyGroup}
                        isMulti={true}
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
                            value={convertDateFormat(data.start_date)}
                            options={{
                              altInput: true,
                              altFormat: "F j, Y",
                              dateFormat: "Y-m-d",
                              defaultDate: convertDateFormat(data.start_date),
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
                            value={convertDateFormat(data.end_date)}
                            options={{
                              altInput: true,
                              altFormat: "F j, Y",
                              dateFormat: "Y-m-d",
                              defaultDate: convertDateFormat(data.end_date),
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
                        value={selectedCertificationMulti}
                        isMulti={true}
                        onChange={(selectedGroup) => {
                          handleCertificationMulti(selectedGroup);
                        }}


                        options={certificationOptionGroup}
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
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <div className="mb-3">
                        <label className="form-lable">List of student roll numbers</label><br />
                        <textarea className="form-control form-control-file" defaultValue={data.student_list} onChange={handleListChange} />
                      </div>
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Status</Label>&nbsp;&nbsp;&nbsp;&nbsp;<br />
                      <Switch
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                        onColor="#02a499"
                        onChange={() => {
                          setswitch3(!switch3)
                        }}
                        checked={switch3}
                      />
                      &nbsp;
                    </div>
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={editBatch}>
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

export default connect(null, { setBreadcrumbItems })(EditBatch);
