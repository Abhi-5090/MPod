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
import { MutatingDots } from 'react-loader-spinner';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx"; // Import the xlsx library

const TechnologyWiseAttendance = (props) => {
  document.title = "Technial Hub| Technology wise attendance";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Attendance", link: "/technology-attendance" },
    { title: "Technology Attendance", link: "/technology-attendance" },
  ];

  const [data, setData] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTechnologyGroup, setSelectedTechnologyGroup] = useState(null);
  const [selectedTechnologies, setSelectedTechnologies] = useState(null);
  const [selectedPassoutYears, setSelectedPassoutYears] = useState(null);
  const [selectedModules, setSelectedModules] = useState(null);
  const [selectedModuleGroup, setSelectedModuleGroup] = useState(null);
  const [selectedPassoutYearGroup, setSelectedPassoutYearGroup] = useState(null);


  const [courseData, setCourseData] = useState([]);
  const [technologyData, setTechnologyData] = useState([]);
  const [moduleData, setModuleData] = useState([]);
  const [loading, setLoading] = useState(false);
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
    props.setBreadcrumbItems('Practise Test Reports', breadcrumbItems);
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchTechnologyData();
    }
    if (selectedTechnologyGroup) {
      fetchModuleData();
    }
  }, [selectedGroup, selectedTechnologyGroup]);


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
        setTechnologyData(response.data.filter(ele => ele.technology_category === "aptlogic"));
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchModuleData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-modules-by-technology', { technology_id: selectedTechnologyGroup.value });
      if (response.status === 200) {
        const modifiedModules = [...new Set(response.data)];
        setModuleData(modifiedModules);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const passoutYearData = ["2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032"]



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

  const moduleOptionGroup = moduleData.map((ele) => ({

    options: [
      { label: ele.module_name, name: ele.module_name, value: ele._id }
    ]
  }));

  const passoutYearOptionGroup = passoutYearData.map((ele) => ({
    options: [
      { label: ele, value: ele }
    ]
  }));



  const handleSelectGroup = (selectedGroup) => {
    setSelectedGroup(selectedGroup);
  };

  const handleSelectTechnologyGroup = (selectedGroup) => {
    // let selectedTechnologies = selectedGroup.map(ele => ele.value)
    // setSelectedTechnologies(selectedTechnologies)
    setSelectedTechnologyGroup(selectedGroup);

  };

  const handleSelectModuleGroup = (selectedGroup) => {
    let selectedModules = selectedGroup.map(ele => {
      return { "_id": ele.value, "module_name": ele.name }
    })
    setSelectedModules(selectedModules)
    setSelectedModuleGroup(selectedGroup);
  };

  const handleSelectPassoutYearGroup = (selectedGroup) => {
    setSelectedPassoutYearGroup(selectedGroup);
  };




  const validation = () => {
    let errors = {};
    if (selectedGroup?.value == null) {
      errors.group = "Select Course";
      alert("Select Course");
    }
    // if (selectedTechnologyGroup?.value == null) {
    //   errors.technology = "Select Technology";
    //   alert("Select Technology");
    // }
    return Object.keys(errors).length > 0 ? errors : null;
  }

  const addSession = async () => {

    const validate = validation();
    if (validate == null) {
      setLoading(true);
      const selectedYears = parseInt(selectedPassoutYearGroup.value)
      const requestData = {
        technologies: selectedTechnologyGroup.value, modules: selectedModules, passout_years: selectedYears
      };


      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.post(backendUrl + 'get-aptlogic-practise-tests-reports', requestData, {
          

          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log(response.data)
        if (response.status === 200) {
          let excel_data = response.data.map(reports => ({
            // first_name: reports.first_name,
            RollNo: reports._id.roll_no,
            College: reports._id.college,
            Branch: reports._id.branch[0],
            Module: reports._id.module_name,
            Topic: reports._id.topic,
            Count: reports.count,
            TotalAttempts: reports.total_attempts,
          }))
          const worksheet = XLSX.utils.json_to_sheet(excel_data, {
            header: [
              "RollNo", "College", "Branch", "Module", "Topic", "Count", "TotalAttempts"]
          });
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
          XLSX.writeFile(workbook, "PractiseTestReports.xlsx");
          setLoading(false)
          navigate(`/dashboard`);
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
              <h4 className="card-title">Practice test reports</h4>
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
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Technology</Label>
                      <Select
                        // isMulti={true}
                        value={selectedTechnologyGroup}
                        onChange={handleSelectTechnologyGroup}
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
                        isMulti={true}
                        value={selectedModuleGroup}
                        onChange={handleSelectModuleGroup}
                        options={moduleOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>

                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Year</Label>
                      <Select
                        // isMulti={true}
                        value={selectedPassoutYearGroup}
                        onChange={handleSelectPassoutYearGroup}
                        options={passoutYearOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                {
                  loading ? (<MutatingDots
                    visible={true}
                    height="100"
                    width="100"
                    color="#2B3A4A"
                    secondaryColor="#2B3A4A"
                    radius="12.5"
                    ariaLabel="mutating-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                  />) : (<Button
                    type="button"
                    color="primary"
                    onClick={addSession}
                  >
                    Download Attendance
                  </Button>)
                }

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

export default connect(null, mapDispatchToProps)(TechnologyWiseAttendance);
