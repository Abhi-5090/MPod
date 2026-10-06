import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Label, Button, Input } from "reactstrap";
import { connect } from "react-redux";
import axios from "axios";
import { MDBDataTable } from "mdbreact";
import "./datatables.scss";
import { MutatingDots } from 'react-loader-spinner';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setBreadcrumbItems } from "../../store/actions";
import Select from "react-select"

const CodingReports = (props) => {
  document.title = "Assessments Report | Technical Hub - All the Reports of Assessments";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Assessment", link: "#" },
    { title: "Assessments Report", link: "#" },
  ];

  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [technologyData, setTechnologyData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [moduleData, setModuleData] = useState([])
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null)

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
    props.setBreadcrumbItems("Assessment", breadcrumbItems);
    fetchCourses();
    if (selectedCourse) {
      fetchTechnologyData()
    }
    if (selectedTechnologyGroup) {
      fetchModuleData()
    }
    if (selectedModuleGroup) {
      fetchTopicsData()
    }
  }, [selectedCourse, selectedTechnologyGroup, selectedModuleGroup]);

  const fetchCourses = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "get-courses");
      if (response.status === 200) {
        setCourses(response.data);
      }
    } catch (error) {
      console.log("Error fetching courses:", error);
    }
  };

  const fetchAssessmentsReportData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const data = {
      technology: selectedTechnologyGroup.value,
      module: selectedModuleGroup.value,
      topic: selectedTopicGroup.value,
      course: selectedGroup
    }
    try {
      const response = await axios.post(backendUrl + "get-assessments-list-by-topic", data);

      if (response.status === 200) {
        setReportData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const fetchTechnologyData = async () => {
    console.log(selectedCourse)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-technology-by-course-id', { course_id: selectedCourse });
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
  useEffect(() => {
    if (selectedTopicGroup) {
      fetchAssessmentsReportData();
    }
  }, [selectedTopicGroup]);
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
  }))
  function handleTechnologySelectGroup(selectedGroup) {
    setselectedTechnologyGroup(selectedGroup)
  }
  function handleSelectModuleGroup(selectedGroup) {
    setselectedModuleGroup(selectedGroup)
  }

  function handleTopicGroup(selectedGroup) {
    console.log(selectedGroup)
    setselectedTopicGroup(selectedGroup)
  }
  const handleDownloadExcel = async (id) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-student-assessment-details', { assessment:id });
      const wsData = response.data.map((report) => ({
        "Roll Number": report.roll_no,
        "Total Score": report.total_score,
        "Total Time": report.total_time,
        "Correct": report.correct_answer_count,
        "Wrong": report.wrong_answer_count,
  
      }));
  
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Assessment Report");
  
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
      saveAs(data, "assessment_report.xlsx");
    } catch (error) {
      console.log("Error fetching data:", error);
    }
    
  };

  const data = {
    columns: [
      { label: "Start Date", field: "start_date_time", sort: "asc", width: 150 },
      { label: "End Date", field: "end_date_time", sort: "asc", width: 150 },
      { label: "Level", field: "level", sort: "asc", width: 150 },
      { label: "Questions Count", field: "questions_count", sort: "asc", width: 150 },
      { label: "Test Type", field: "test_type", sort: "asc", width: 150 },
      { label: "Action", field: "action", sort: "asc", width: 150 },
    ],
    rows: reportData.map((report) => ({
      start_date_time: report.start_date_time,
      end_date_time: report.end_date_time,
      level: report.level,
      questions_count: report.questions_count,
      test_type: report.test_type,
      action: (
        <button
          onClick={() => handleDownloadExcel(report._id)}
          style={{
            padding: "5px 10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Download
        </button>
      ),
    })),
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="justify-content-between align-items-center">
              <Row>
                <Col className="col-3">
                  <Label for="courseSelect">Sect Course:</Label>
                  <Input
                    type="select"
                    id="courseSelect"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.course_name}
                      </option>
                    ))}
                  </Input> <br />
                </Col>
                <Col className="col-3">
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
                <Col className="col-3">
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
                <Col className="col-3">
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

              {reportData.length !== 0 ? (
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              ) : (
                <div className="row">
                  <div className="col-md-2 offset-5">
                    <MutatingDots
                      visible={true}
                      height="100"
                      width="100"
                      color="#2B3A4A"
                      secondaryColor="#2B3A4A"
                      radius="12.5"
                      ariaLabel="mutating-dots-loading"
                    />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(CodingReports);
