import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Label, Button } from "reactstrap";
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
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [reportData, setReportData] = useState([]);
  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  useEffect(() => {
    props.setBreadcrumbItems("Assessment", breadcrumbItems);
  }, []);
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

    fetchData()
    if (selectedGroup) {
      fetchTechnologyData()
    }

  }, [selectedGroup]);
  function handleSelectGroup(selectedGroup) {
    setselectedGroup(selectedGroup)
  }
  function handleTechnologySelectGroup(selectedGroup) {
    setselectedTechnologyGroup(selectedGroup)
  }
  const fetchCodingReportData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

    try {
      const response = await axios.post(backendUrl + "total-topics-report", {
        course: selectedGroup.value,
        technology: selectedTechnologyGroup.value
      });

      if (response.status === 200) {
        console.log(response.data);
        setReportData(response.data); // Set the fetched report data
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
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
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
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
  useEffect(() => {
    if (selectedGroup && selectedTechnologyGroup) {

      fetchCodingReportData();
    }
  }, [selectedGroup, selectedTechnologyGroup]);

  const handleDownloadExcel = () => {
    const wsData = reportData.map((report) => ({
      "Course": report.course_name,
      "Technology": report.technology_name,
      "Module": report.module_name,
      "Topic": report.topic_name,
    }));
  
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Total Topics Report");
  
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
    saveAs(data, "total_topics_report.xlsx");
  };
  
  const data = {
    columns: [
      { label: "Course", field: "course_name", sort: "asc", width: 150 },
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      { label: "Module", field: "module_name", sort: "asc", width: 150 },
      { label: "Topic", field: "topic_name", sort: "asc", width: 150 },
    ],
    rows: reportData.map((report) => ({
      course_name: report.course_name,
      technology_name: report.technology_name,
      module_name: report.module_name,
      topic_name: report.topic_name,
    })),
  };
  

  return (
    <React.Fragment>
      <Row>
        <Col md="3">
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
        <Col md="3">
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
        <Col className="col-12">
          <Card>
            <CardBody className="justify-content-between align-items-center">
              {/* <CardTitle className="h4">Assessment Questions </CardTitle> */}
              <Button color="primary" className="mb-3" onClick={handleDownloadExcel}>
                Download Excel
              </Button>

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
