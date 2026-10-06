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
  document.title = "Activities Report | Technical Hub - All the Reports of Activities";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Activities", link: "#" }, 
    { title: "Activities Report", link: "#" },
  ];

  const [reportData, setReportData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding' || authUser.role == 'trainer') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems("Activity", breadcrumbItems);
    fetchCourses(); // Fetch courses on component mount
  }, []);

  const fetchCourses = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-courses`);
      if (response.status === 200) {
        setCourses(response.data);
      }
    } catch (error) {
      console.log("Error fetching courses:", error);
    }
  };

  const fetchCodingReportData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await axios.get(`${backendUrl}activities-count`, {
        params: { course_id: selectedCourse }
      });

      if (response.status === 200) {
        setReportData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchCodingReportData();
    }
  }, [selectedCourse]);

  const handleDownloadExcel = () => {
    const wsData = reportData.map((report) => ({
      "Technology": report.technology_name,
      "Count": report.count,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assessment Report");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    saveAs(data, "assessment_report.xlsx");
  };

  const data = {
    columns: [
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      { label: "Count", field: "count", sort: "asc", width: 150 },
    ],
    rows: reportData.map((report) => ({
      technology_name: report.technology_name,
      count: report.count,
    })),
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="justify-content-between align-items-center">
              <Col className="col-3">
                <Label for="courseSelect">Select Course:</Label>
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
                </Input><br/>
              </Col>


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
