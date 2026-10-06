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

const CodingReports = (props) => {
  document.title = "Assessment Questions Report | Technical Hub - All the Reports of Assessment Questions";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Assessment", link: "#" },
    { title: "Assessment Questions Report", link: "#" },
  ];

  const [reportData, setReportData] = useState([]);
  const [courses, setCourses] = useState([]); // Store course list
  const [selectedCourse, setSelectedCourse] = useState(""); // Store selected course ID

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
    fetchCourses(); // Fetch the list of courses on component mount
  }, []);

  const fetchCourses = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await axios.get(backendUrl + "get-courses");

      if (response.status === 200) {
        setCourses(response.data); // Set the list of courses
      }
    } catch (error) {
      console.log("Error fetching courses:", error);
    }
  };

  const fetchQuestionsReportData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const courseId = selectedCourse;
    try {
      const response = await axios.get(backendUrl + "assessment-questions-count", {
        params: { courseId }, // Send the selected course ID as a query parameter
      });

      if (response.status === 200) {
        console.log(response.data);
        setReportData(response.data); // Set the fetched report data
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchQuestionsReportData(); // Fetch data when a course is selected
    } else {
      setReportData([]); // Clear report data when no course is selected
    }
  }, [selectedCourse]);

  const handleDownloadExcel = () => {
    const wsData = reportData.map((report) => {
      const row = {
        "Technology": report.technology_name,
        "Module": report.module_name,
        "Count": report.count,
      };

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assessment Questions Report");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    saveAs(data, "assessment_questions_report.xlsx");
  };

  const data = {
    columns: [
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      { label: "Module", field: "module_name", sort: "asc", width: 150 },
      { label: "Count", field: "count", sort: "asc", width: 150 },
    ],
    rows: reportData.map((report) => ({
      technology_name: report.technology_name,
      module_name: report.module_name,
      count: report.count,
    })),
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">

          <Card>
            <CardBody className="justify-content-between align-items-center">
              {/* Dropdown to select course */}
              <Col className="col-3">
                <Label for="courseSelect">Select Course</Label>
                <Input
                  type="select"
                  id="courseSelect"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">--Select Course--</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.course_name}
                    </option>
                  ))}
                </Input><br />

                <Button color="primary" className="mb-3" onClick={handleDownloadExcel}>
                  Download Excel
                </Button>
              </Col>
            </CardBody>
          </Card>

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

        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(CodingReports);
