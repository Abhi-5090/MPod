import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Label, Button } from "reactstrap";
import { MutatingDots } from "react-loader-spinner";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Select from "react-select";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const StudentInactiveProblemsList = (props) => {
  document.title = "Student Inactive Problems List";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Students Inactive Problems", link: "#" },
    { title: "Inactive Problems List", link: "#" },
  ];

  const [studentProblemsData, setStudentProblemsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // Track when submit is clicked

  const collegeOptions = [
    { value: "AEC", label: "AEC" },
    { value: "AUS", label: "AUS" },
    { value: "ACET", label: "ACET" },
  ];

  const branchOptions = {
    AEC: [
      { value: "CSE", label: "CSE" },
      { value: "ECE", label: "ECE" },
      { value: "IT", label: "IT" },
      { value: "CIV", label: "CIV" },
      { value: "EEE", label: "EEE" },
      { value: "AIML", label: "AIML" },
      { value: "DS", label: "DS" },
      { value: "AG", label: "AG" },
      { value: "MCA", label: "MCA" },
    ],
    AUS: [
      {value: "CIVIL", label: "CIVIL" },
      {value: "IT", label: "IT" },
      {value: "AG", label: "AG" },
      {value: "AIML1", label: "AIML1" },
      {value: "ECE1", label: "ECE1" },
      {value: "Civil", label: "Civil" },
      {value: "BBA", label: "BBA" },
      {value: "AIML", label: "AIML" },
      {value: "CM", label: "CM" },
      {value: "CE", label: "CE" },
      {value: "PET", label: "PET" },
      {value: "CIV", label: "CIV" },
      {value: "MEC", label: "MEC" },
      {value: "ME", label: "ME" },
      {value: "EEE", label: "EEE" },
      {value: "ECE", label:"ECE"  },
      {value: "PT", label:"PT"  },
      {value: "AIML2", label:"AIML2" },
      {value: "MECH", label:"MECH" },
      {value: "CIVIL ", label:"CIVL" },
      {value: "CSE2", label:"CSE2" },
      {value: "DS", label:"DS" },
      {value: "IOT", label:"IOT" },
      {value: "CSE", label:"CSE" },
      {value: "ECE2", label:"ECE2" },
    ],
    ACET: [
      { value: "CSE", label: "CSE" },
      { value: "CSE1", label: "CSE1" },
      { value: "CSE2", label: "CSE2" },
      {value: "EEE", label:"EEE" },
      {value: "ECE", label:"ECE" },
      {value: "ECE1", label:"ECE1" },
      {value: "ECE2", label:"ECE2" },
      { value: "AIML", label: "AIML" },
      { value: "AIML1", label: "AIML1" },
      { value: "AIML2", label: "AIML2" },
      { value: "CE", label: "CE" },
      { value: "CIV", label: "CIV" },
      { value: "CIVL", label: "CIVL" },
      { value: "IT", label: "IT" },
      {value: "IOT", label:"IOT" },
      { value: "DS", label: "DS" },
      { value: "MEC", label: "MEC" },
    ],
  };

useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding' ||authUser.role == 'Principal' ||authUser.role == 'faculty' ||authUser.role == 'hod') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);


  useEffect(() => {
    props.setBreadcrumbItems("Student Inactive Problems", breadcrumbItems);
  }, [props, breadcrumbItems]);

  const handleSelectCollege = (selectedOption) => {
    setSelectedCollege(selectedOption);
    setSelectedBranch(null); // Clear selected branch when college changes
  };

  const handleSelectBranch = (selectedOption) => {
    setSelectedBranch(selectedOption);
  };

  const handleSubmit = async () => {
    if (selectedCollege && selectedBranch) {
      setIsSubmitted(true); // Mark as submitted
      setLoading(true); // Start loading spinner
      await fetchStudentInactiveProblemsData(selectedBranch.value, selectedCollege.value);
    } else {
      toast.error("Please select both college and branch!");
    }
  };

  const fetchStudentInactiveProblemsData = async (branch, college) => {
    console.log(branch,college)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(`${backendUrl}codingInActiveStudentByCollegeandBranch`, {
        branches: [branch],
        college,
      });

      if (response.status === 200 && response.data.data) {
        setStudentProblemsData(response.data.data);
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      console.error("Error details:", error.response ? error.response.data : error.message);
      toast.error("Error fetching data. Please try again.");
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const exportToExcel = () => {
    const headers = ["Roll Number", "Name", "Branch", "College", "Passout Year"];
    const formattedData = studentProblemsData.map((item) => ({
      roll_no: item.roll_no,
      Name: item.first_name,
      branch: item.branch[0] || "",
      college: item.college,
      passout_year: item.passout_year,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Problems Data");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `student_problems_data_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 100 },
      { label: "Name", field: "first_name", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 100 },
      { label: "College", field: "college", sort: "asc", width: 100 },
      { label: "Passout Year", field: "passout_year", sort: "asc", width: 100 },
    ],
    rows: studentProblemsData.map((item, index) => ({
      sno: index + 1,
      roll_no: item.roll_no,
      first_name: item.first_name,
      branch: item.branch[0] || "",
      college: item.college,
      passout_year: item.passout_year,
    })),
  };

  return (
    <React.Fragment>
      <Row>
        <CardBody>
          <Row>
            <Col lg="3" className="mb-3">
              <Label>Select College</Label>
              <Select
                value={selectedCollege}
                onChange={handleSelectCollege}
                options={collegeOptions}
                // classNamePrefix="select2-selection"
                placeholder="Select College"
              />
            </Col>
            <Col lg="3" className="mb-3">
              <Label>Select Branch</Label>
              <Select
                value={selectedBranch}
                onChange={handleSelectBranch}
                options={selectedCollege ? branchOptions[selectedCollege.value] : []}
                // classNamePrefix="select2-selection"
                placeholder="Select Branch"
                isDisabled={!selectedCollege}
              />
            </Col>
            <Col lg="3" className="mt-4">
              <Button color="primary" onClick={handleSubmit}>Submit</Button>
            </Col>
          </Row>
        </CardBody>
    
        <ToastContainer transition={Bounce} />

        {isSubmitted ? (
  <>

    <Row>
    <Col className="col-12">
      <Card>
        <CardBody className="d-flex justify-content-between align-items-center">
          <CardTitle className="h4">Student Inactive Problems List</CardTitle>
          <button onClick={exportToExcel} className="btn btn-success">
            Download Excel
          </button>
        </CardBody>
        <CardBody>
          {loading ? (
            <div className="text-center">
              <MutatingDots height="100" width="100" color="#4fa94d" />
            </div>
          ) : (
            <MDBDataTable responsive bordered data={data} noBottomColumns />
          )}
        </CardBody>
      </Card>
    </Col>
    </Row>
  </>
):<><div className="text-center">
<div  style={{height: "20px", marginTop: "250px"}}>
    <h4>No data found</h4>
  </div></div></>}
    </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(StudentInactiveProblemsList);
