import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Label, Button } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import Select from "react-select";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const StudentProblemsList = (props) => {
  document.title = "Student Problems List";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Verbal", link: "#" },
    { title: "Verbal List", link: "#" },
  ];

  const [user, setUser] = useState({});
  const [branch, setBranch] = useState('');
  const [college, setCollege] = useState('');
  const [role, setRole] = useState('');
  const [Aptitude, setAptitude] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false); // Track form submission

  const collegeOptions = [
    { value: "AEC", label: "AEC" },
    { value: "AUS", label: "AUS" },
    { value: "ACET", label: "ACET" },
  ];

  const collegeBranchMapping = {
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
    props.setBreadcrumbItems('Verbal List', breadcrumbItems);
  }, []);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (authUser) {
      setUser(authUser);
      setBranch(authUser.branch);
      setCollege(authUser.college);
      setRole(authUser.role);

      if (authUser.role === "hod") {
        fetchStudentProblemsData(authUser.branch, authUser.college);
      }
    }
  }, []);

  const handleSelectCollege = (selectedOption) => {
    setSelectedCollege(selectedOption);
    setSelectedBranch(null); // Reset branch selection
    if (selectedOption) {
      setBranchOptions(collegeBranchMapping[selectedOption.value] || []);
    }
  };

  const handleSelectBranch = (selectedOption) => {
    setSelectedBranch(selectedOption);
  };

  useEffect(() => {
    if (role === "Principal" && selectedBranch && selectedCollege) {
      fetchStudentProblemsData(selectedBranch.value, selectedCollege.value);
    }
  }, [selectedBranch, selectedCollege]);

  const handleSubmit = () => {
    if (selectedCollege && selectedBranch) {
      setFormSubmitted(true); // Set form submission state to true
    } else {
      alert("Please select both college and branch before submitting.");
    }
  };

  const fetchStudentProblemsData = async (branchValue, collegeValue) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}verbal-results-level-college-branch`, {
        branches: [branchValue],
        college: collegeValue
      });
      if (response.status === 200) {
        setAptitude(response.data);
        setFilteredData(response.data);
        setLoading(false);
      } else {
        toast.error("Failed to fetch data.");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Error fetching data. Please try again.");
      setLoading(false);
    }
  };

  const exportToExcel = () => {
  const title = [["Verbal Statistics"]]; // Title row
  const headers = ["Roll Number", "Name", "Branch", "College", "Passout Year", "Easy", "Medium", "Hard"]; // Column headers
  const formattedData = Aptitude.map((item) => ({
    roll_no: item.roll_no,
    Name: item.first_name,
    branch: item.branch[0] || "",
    college: item.college,
    passout_year: item.passout_year,
    easy: item.easy,
    medium: item.medium,
    hard: item.hard,
  }));

  const worksheet = XLSX.utils.json_to_sheet([]);
  XLSX.utils.sheet_add_aoa(worksheet, title, { origin: "A1" }); // Add title
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A2" }); // Add headers
  XLSX.utils.sheet_add_json(worksheet, formattedData, { origin: "A3", skipHeader: true }); // Add data starting from A3

  // Set title row styling (optional, for better visual appeal)
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]; // Merge title row across columns
  worksheet["A1"].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" } };

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
      { label: "Easy", field: "easy", sort: "asc", width: 80 },
      { label: "Medium", field: "medium", sort: "asc", width: 80 },
      { label: "Hard", field: "hard", sort: "asc", width: 80 },
    ],
    rows: filteredData.map((item, index) => ({
      sno: index + 1,
      roll_no: item.roll_no,
      first_name: item.first_name,
      branch: item.branch[0],
      college: item.college,
      passout_year: item.passout_year,
      easy: item.easy,
      medium: item.medium,
      hard: item.hard,
    })),
  };

  return (
    <>
      <div>
        <Row>
          <Col sm={6}>
            <Card>
              <CardBody>
                <CardTitle className="h4">Student Problems List</CardTitle>
                <Row className="mb-3">
                  <Col md={6}>
                    <Label>College</Label>
                    <Select
                      options={collegeOptions}
                      value={selectedCollege}
                      onChange={handleSelectCollege}
                      placeholder="Select College"
                    />
                  </Col>
                  <Col md={6}>
                    <Label>Branch</Label>
                    <Select
                      options={branchOptions}
                      value={selectedBranch}
                      onChange={handleSelectBranch}
                      placeholder="Select Branch"
                      isDisabled={!selectedCollege}
                    />
                  </Col>
                </Row>
                <Button
                  color="primary"
                  onClick={handleSubmit}
                  disabled={!selectedCollege || !selectedBranch}
                >
                  Submit
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {formSubmitted ? (
          <Row>
            <Col sm={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">Verbal Data</CardTitle>
                  <div className="d-flex justify-content-end">
                  <Button
                  style={{ backgroundColor: "rgb(122,111,190)", color: "white" }}
                    onClick={exportToExcel}
                    disabled={loading}
                  >
                    Download Excel
                  </Button>
                  </div>
                  <br/>
                  {loading ? (
                    <div className="d-flex justify-content-center">
                      <MutatingDots color="#00BFFF" height={100} width={100} />
                    </div>
                  ) : (
                    <MDBDataTable
                    responsive bordered data={data}
                    noBottomColumns  />
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        ):<>
          <div className="text-center">
                <div  style={{height: "20px", marginTop: "150px"}}>
                <h4>No data found</h4>
              </div>
          </div>
        </>
        }

        <ToastContainer transition={Bounce} />
      </div>
    </>
  );
};

export default connect(null, { setBreadcrumbItems })(StudentProblemsList);
