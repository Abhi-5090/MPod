import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Label } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import * as XLSX from 'xlsx'; 
import { saveAs } from 'file-saver';
import Flatpickr from "react-flatpickr";
import Select from "react-select";

const StudentProblemsList = (props) => {
  document.title = "Student Problems List";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Students Problems", link: "#" },
    { title: "Problems List", link: "#" },
  ];

  const [studentProblemsData, setStudentProblemsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null); 
  const [selectedBranch, setSelectedBranch] = useState(null);

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
    props.setBreadcrumbItems('Student Problems', breadcrumbItems);
  }, [props]);

  const handleSelectCollege = (selectedOption) => {
    setSelectedCollege(selectedOption);
    setSelectedBranch(null);  // Reset branch when college changes
  };

  const handleSelectBranch = (selectedOption) => {
    setSelectedBranch(selectedOption);
  };

  const isSelectionComplete = selectedCollege && selectedBranch;

  useEffect(() => {
    if (selectedBranch && selectedCollege) {
      const branchValue = selectedBranch.value;
      const collegeValue = selectedCollege.value;
      fetchStudentProblemsData(branchValue, collegeValue);
    }
  }, [selectedBranch, selectedCollege]);

  const fetchStudentProblemsData = async (branchValue, collegeValue) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-students-problems-data-hod', {
        branch: [branchValue], 
        college: collegeValue
      });
      if (response.status === 200) {
        setStudentProblemsData(response.data);
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

  const handleDateFilter = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!fromDate && !toDate) {
      toast.error("Please select at least one date.");
      return;
    }

    if (!selectedCollege || !selectedBranch) {
      toast.error("Please select both College and Branch before applying the filter.");
      return;
    }

    setLoading(true);

    const branchValue = selectedBranch.value;
    const collegeValue = selectedCollege.value;

    try {
      const response = await axios.post(backendUrl + 'get-students-problems-data-by-date-hod', {
        fromDate: fromDate, 
        toDate: toDate,
        branch: [branchValue],
        college: collegeValue,
      });

      if (response.status === 200) {
        setFilteredData(response.data);
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      toast.error("No Data found in the selected date range.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setFilteredData(studentProblemsData);
    setFromDate('');
    setToDate('');
  };

  const exportToExcel = () => {
    const headers = [
      { header: "Roll Number", key: "roll_no" },
      { header: "Name", key: "Name" },
      { header: "Gender", key: "gender" },
      { header: "Branch", key: "branch" },
      { header: "College", key: "college" },
      { header: "Passout Year", key: "passout_year" },
      { header: "C", key: "c" },
      { header: "C++", key: "cpp" },
      { header: "Java", key: "java" },
      { header: "Python", key: "python" },
    ];

    const formattedData = filteredData.map((item) => ({
      c: item.c,
      cpp: item.cpp,
      java: item.java,
      python: item.python,
      roll_no: item.roll_no,
      Name: item.Name,
      branch: item.branch[0],
      gender: item.gender,
      college: item.college,
      passout_year: item.passout_year,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers.map(h => h.key) });
    XLSX.utils.sheet_add_aoa(worksheet, [headers.map(h => h.header)], { origin: 'A1' });
    worksheet['!cols'] = [
      { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Problems Data");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `student_problems_data_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 50 },
      { label: "Name", field: "Name", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 100 },
      { label: "Gender", field: "gender", sort: "asc", width: 100 },
      { label: "College", field: "college", sort: "asc", width: 100 },
      { label: "Passout Year", field: "passout_year", sort: "asc", width: 100 },
      { label: "C", field: "c", sort: "asc", width: 150 },
      { label: "CPP", field: "cpp", sort: "asc", width: 150 },
      { label: "JAVA", field: "java", sort: "asc", width: 200 },
      { label: "PYTHON", field: "python", sort: "asc", width: 200 },
    ],
    rows: filteredData.map((item, index) => ({
      sno: index + 1,
      roll_no: item.roll_no,
      Name: item.Name,
      branch: item.branch,
      gender: item.gender,
      college: item.college,
      passout_year: item.passout_year,
      c: item.c,
      cpp: item.cpp,
      java: item.java,
      python: item.python,
    })),
  };

  return (
    <React.Fragment>
      <CardBody className="justify-content-between align-items-center">
        <Row>
          <Col lg="3" className="mb-3">
            <Label>Select College</Label>
            <Select
              value={selectedCollege}
              onChange={handleSelectCollege}
              options={collegeOptions}
              classNamePrefix="select2-selection"
              placeholder="Select College"
            />
          </Col>
          <Col lg="3" className="mb-3">
            <Label>Select Branch</Label>
            <Select
              value={selectedBranch}
              onChange={handleSelectBranch}
              options={selectedCollege ? branchOptions[selectedCollege.value] : []}
              classNamePrefix="select2-selection"
              placeholder="Select Branch"
              isDisabled={!selectedCollege}
            />
          </Col>
        </Row>
      </CardBody>

      <Row>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Student Problems List</CardTitle>
            </CardBody>
            <CardBody>
              <Row className="mb-3">
                <Col lg="3" className="mb-3">
                  <Label>Select Date Range</Label>
                  <Row>
                    <Col lg="6">
                      <Flatpickr
                        value={fromDate}
                        onChange={(date) => setFromDate(date[0])}
                        placeholder="From Date"
                        className="form-control"
                      />
                    </Col>
                    <Col lg="6">
                      <Flatpickr
                        value={toDate}
                        onChange={(date) => setToDate(date[0])}
                        placeholder="To Date"
                        className="form-control"
                      />
                    </Col>
                  </Row>
                </Col>
                <Col lg="3" className="d-flex justify-content-start align-items-center">
                  <button
                    className="btn btn-primary button-spacing m-1"
                    onClick={handleDateFilter}
                    disabled={!isSelectionComplete}
                  >
                    Filter
                  </button>
                  <button
                    className="btn btn-secondary button-spacing m-1"
                    onClick={handleResetFilter}
                    disabled={loading}
                  >
                    Reset Filter
                  </button>
                </Col>
                <Col lg="3" className="d-flex justify-content-end align-items-center">
                  <button
                    className="btn btn-success button-spacing"
                    onClick={exportToExcel}
                    disabled={filteredData.length === 0}
                  >
                    Export to Excel
                  </button>
                </Col>
              </Row>

              {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                  <MutatingDots color="#00BFFF" height={100} width={100} />
                </div>
              ) : (
                <MDBDataTable
                  striped
                  bordered
                  hover
                  data={data}
                  responsive
                  searching={false}
                  paging={false}
                  noBottomColumns />
              )}
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

export default connect(null, mapDispatchToProps)(StudentProblemsList);