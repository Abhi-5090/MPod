import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge, Label } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import * as XLSX from "xlsx"; // Import the xlsx library
import "./datatables.scss";
import moment from 'moment'
import { saveAs } from 'file-saver';
import Flatpickr from "react-flatpickr"

const MandatoryList = (props) => {
  document.title = "Mandatory Tests list | Technical Hub - Mandatory Tests";
  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Mandatory Tests", link: "#" },
    { title: "Mandatory Tests List", link: "#" },
  ];

  const [mandatoryData, setMandatoryData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [user, setUser] = useState('');
  const [testCounts, setTestCounts] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [technologies, setTechnologies] = useState([]);
  const [AptInactiveCount, setAptInactiveCount] = useState();
  const [ReasInactiveCount, setReasInactiveCount] = useState();
  const [verbInactiveCount, setVerbInactiveCount] = useState();
  const [totalInactiveCount, setTotalInactiveCount] = useState();
  const [totalBelowSeventyFivePercentage, setTotalBelowSeventyFivePercentage] = useState();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  useEffect(() => {
    props.setBreadcrumbItems('Mandatory Tests', breadcrumbItems);
  }, [user]);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    // console.log(authUser);
    setUser(authUser);
    if (authUser) {
      const branches = authUser.branch.map((ele) => {
        return { value: ele, label: ele }
      })
      setSelectedCollege(authUser.college)
      setBranches(branches);
      // console.log(branches);
    }

    const getTechnologies = async () => {
      try {
        const response = await axios.get(backendUrl + "get-technologies");
        if (response.status === 200) {
          let filteredTechnnolgies = response.data.filter(ele => ele.technology_category == "aptlogic")
          setTechnologies(filteredTechnnolgies);
          // console.log(response.data);
        }
      }
      catch (error) {
        console.log(error);
      }
    }
    getTechnologies();
  }, []);
  useEffect(() => {
    let aptitudeInactive = 0, reasoningInactive = 0, verbalInactive = 0, totalInactive = 0;
    filteredData.forEach(ele => {
      if (ele.aptitude_count === 0) aptitudeInactive++;
      if (ele.reasoning_count === 0) reasoningInactive++;
      if (ele.verbal_count === 0) verbalInactive++;
      if (ele.aptitude_count === 0 && ele.reasoning_count === 0 && ele.verbal_count === 0) totalInactive++;
    });
    setAptInactiveCount(aptitudeInactive);
    setReasInactiveCount(reasoningInactive);
    setVerbInactiveCount(verbalInactive);
    setTotalInactiveCount(totalInactive);
    const belowSeventyFivePercentage = filteredData.filter((mandatory) => {
      const aptitudeScorePercentage = mandatory.aptitude_count
        ? mandatory.aptitude_percentage / (mandatory.aptitude_count || 1).toFixed(2)
        : 0;
      const reasoningScorePercentage = mandatory.reasoning_count
        ? mandatory.reasoning_percentage / (mandatory.reasoning_count || 1).toFixed(2)
        : 0;
      const verbalScorePercentage = mandatory.verbal_count
        ? mandatory.verbal_percentage / (mandatory.verbal_count || 1).toFixed(2)
        : 0;

      // Check if all percentages are below 75
      return (
        aptitudeScorePercentage < 75 &&
        reasoningScorePercentage < 75 &&
        verbalScorePercentage < 75
      );
    }).length;

    // Update state with filtered data
    setTotalBelowSeventyFivePercentage(belowSeventyFivePercentage);
  }, [filteredData]);
  const levels = technologies?.map((ele) => {
    return { value: ele._id, label: ele.technology_name }
  });
  const fetchTotalTests = async () => {
    try {
      // console.log(selectedLevel)
      const response = await axios.post(backendUrl + "get-mandatory-tests-stats",
        { technology_id: selectedLevel.value });
      if (response.status === 200) {
        // console.log(response.data);
        setTestCounts(response.data);
        console.log(response);

      }
    }
    catch (error) {
      console.log(error);
    }
  }
  const fetchData = async () => {
    setLoading(true);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    // let finalBranches = branches.map(ele=>ele.value)
    try {
      // console.log(selectedBranch.value, selectedCollege, selectedLevel)
      const response = await axios.post(backendUrl + "mandatory-test-stats-for-hod",
        {
          branches: [selectedBranch.value],
          college: selectedCollege,
          technology_id: selectedLevel.value
        }
     
       
        
      )
      if (response.status === 200) {
        // console.log(response.data);
        setLoading(false)
        setMandatoryData(response.data);
        setFilteredData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const handleSelectBranch = (selectedOption) => {
    setSelectedBranch(selectedOption);
  };
  const handleSelectLevel = (selectedOption) => {
    setSelectedLevel(selectedOption);
  };

  const data = {
    columns: [
      {
        label: "Name", field: "name", sort: "asc", width: 150, attributes: {
          style: { backgroundColor: "#DCDCEE", color: "#000" }, // Change background color here
        },
      },
      {
        label: "Roll No", field: "roll_no", sort: "asc", width: 100, attributes: {
          style: { backgroundColor: "#DCDCEE", color: "#000" }, // Change background color here
        },
      },
      {
        label: "College", field: "college", sort: "asc", width: 100, attributes: {
          style: { backgroundColor: "#DCDCEE", color: "#000" }, // Change background color here
        },
      },
      {
        label: "Branch", field: "branch", sort: "asc", width: 50, attributes: {
          style: { backgroundColor: "#DCDCEE", color: "#000" }, // Change background color here
        },
      },
      {
        label: "Passout", field: "passout_year", sort: "asc", width: 50, attributes: {
          style: { backgroundColor: "#DCDCEE", color: "#000" }, // Change background color here
        },
      },
      {
        label: "Aptitude Attempted Tests", field: "aptitude_count", sort: "asc", width: 150, attributes: {
          style: { backgroundColor: "#FFBB00", color: "#000", textAlign: "center" }, // Change background color here
        },
      },
      {
        label: "Attempted Percentage", field: "aptitude_percentage", sort: "asc", width: 100, attributes: {
          style: { backgroundColor: "#FFBB00", color: "#000", textAlign: "center" },
        },
      },
      {
        label: " Score Percentage", field: "aptitude_score_percentage", sort: "asc", width: 100, attributes: {
          style: { backgroundColor: "#FFBB00", color: "#000", textAlign: "center" },
        },
      },
      {
        label: "Reasoning Attempted Tests", field: "reasoning_count", sort: "asc", width: 100, attributes: {
          style: { backgroundColor: "#72BD20", color: "#000", textAlign: "center" }, // Change background color here
        },
      },
      {
        label: " Attempted Percentage", field: "reasoning_percentage", sort: "asc", width: 100, attributes: {
          style: { backgroundColor: "#72BD20", color: "#000", textAlign: "center" },
        },
      },
      {
        label: "Score Percentage", field: "reasoning_score_percentage", sort: "asc", width: 100, attributes: {
          style: { backgroundColor: "#72BD20", color: "#000", textAlign: "center" }, // Change background color here
        },
      },
      {
        label: "Verbal Attempted Tests", field: "verbal_count", sort: "asc", width: 100, attributes: {
          style: { backgroundColor: "#008738", color: "#000", textAlign: "center" }, // Change background color here
        },
      },
      {
        label: " Attempted Percentage", field: "verbal_percentage", sort: "asc", width: 100, attributes: {
          style: { backgroundColor: "#008738", color: "#000", textAlign: "center" },
        },
      },
      {
        label: "Score Percentage", field: "verbal_score_percentage", sort: "asc", width: 100, attributes: {
          style: { backgroundColor: "#008738", color: "#000", textAlign: "center" }, // Change background color here
        },
      },
    ],
    rows: filteredData.map(attendance => {
      const aptitude_percentage = attendance.aptitude_count
        ? ((attendance.aptitude_count || 0) / testCounts.aptitude_tests?.[0]?.count * 100).toFixed(2) + "%"
        : "0%";

      const reasoning_percentage = attendance.reasoning_count
        ? ((attendance.reasoning_count || 0) / testCounts.reasoning_tests?.[0]?.count * 100).toFixed(2) + "%"
        : "0%";

      const verbal_percentage = attendance.verbal_count
        ? ((attendance.verbal_count || 0) / testCounts.verbal_tests?.[0]?.count * 100).toFixed(2) + "%"
        : "0%";

      const aptitude_score_percentage = attendance.aptitude_count
        ? (attendance.aptitude_percentage / (attendance.aptitude_count || 0)).toFixed(2)
        : "0";

      const reasoning_score_percentage = attendance.reasoning_count
        ? (attendance.reasoning_percentage / (attendance.reasoning_count || 0)).toFixed(2)
        : "0";

      const verbal_score_percentage = attendance.verbal_count
        ? (attendance.verbal_percentage / (attendance.verbal_count || 0)).toFixed(2)
        : "0";

      return {
        name: attendance.name,
        roll_no: attendance.roll_no,
        college: attendance.college,
        branch: attendance.branch,
        passout_year: attendance.passout_year,
        aptitude_count: (
          <div
            style={{
              backgroundColor: "#",
              color: "#000",
              padding: "10px", // Adjust padding for better alignment
              borderRadius: "4px",
              height: "100%", // Ensure it spans the full cell height
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {attendance.aptitude_count || 0}
          </div>
        ),
        aptitude_percentage: (
          <div
            style={{
              backgroundColor: "#",
              color: "#000",
              padding: "10px", // Adjust padding for better alignment
              borderRadius: "4px",
              height: "100%", // Ensure it spans the full cell height
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {aptitude_percentage || 0}
          </div>
        ),

        aptitude_score_percentage: (
          <div
            style={{
              backgroundColor: !isNaN(parseFloat(aptitude_score_percentage)) && parseFloat(aptitude_score_percentage) < 75 ? "#FFC50A" : "transparent",
              color: "#000",
              padding: "10px",
              borderRadius: "4px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {aptitude_score_percentage || "0"}%
          </div>
        ),
        reasoning_count: (
          <div
            style={{
              backgroundColor: "#",
              color: "#000",
              padding: "10px", // Adjust padding for better alignment
              borderRadius: "4px",
              height: "100%", // Ensure it spans the full cell height
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {attendance.reasoning_count || 0}
          </div>
        ),
        reasoning_percentage: (
          <div
            style={{
              backgroundColor: "#",
              color: "#000",
              padding: "10px", // Adjust padding for better alignment
              borderRadius: "4px",
              height: "100%", // Ensure it spans the full cell height
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {reasoning_percentage || 0}
          </div>
        ),
        reasoning_score_percentage: (
          <div
            style={{
              backgroundColor: !isNaN(parseFloat(reasoning_score_percentage)) && parseFloat(reasoning_score_percentage) < 75 ? "#7CC72A" : "transparent",
              color: "#000",
              padding: "10px", // Adjust padding for better alignment
              borderRadius: "4px",
              height: "100%", // Ensure it spans the full cell height
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {reasoning_score_percentage || 0}%
          </div>
        ),
        verbal_count: (
          <div
            style={{
              backgroundColor: "#",
              color: "#000",
              padding: "10px", // Adjust padding for better alignment
              borderRadius: "4px",
              height: "100%", // Ensure it spans the full cell height
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {attendance.verbal_count || 0}
          </div>
        ),
        verbal_percentage: (
          <div
            style={{
              backgroundColor: "#",
              color: "#000",
              padding: "10px", // Adjust padding for better alignment
              borderRadius: "4px",
              height: "100%", // Ensure it spans the full cell height
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {verbal_percentage || 0}
          </div>
        ),
        verbal_score_percentage: (
          <div
            style={{
              backgroundColor: !isNaN(parseFloat(verbal_score_percentage)) && (parseFloat(verbal_score_percentage)) < 75 ? "#0A9142" : "transparent",
              color: "#000",
              padding: "10px", // Adjust padding for better alignment
              borderRadius: "4px",
              height: "100%", // Ensure it spans the full cell height
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {verbal_score_percentage || 0}%
          </div>
        )
      };
    }),
  };
  console.log(technologies);
  
  const exportToExcel = () => {
    const headers = [
      { header: "Name", key: "name" },
      { header: "Roll No", key: "roll_no" },
      { header: "Branch", key: "branch" },
      { header: "College", key: "college" },
      { header: "Passout Year", key: "passout_year" },
      { header: "Aptitude Attempted", key: "aptitude_count" },
      { header: "Aptitude Percentage", key: "aptitude_percentage" },
      { header: "Aptitude Score Percentage", key: "aptitude_score_percentage" },
      { header: "Reasoning Attempted", key: "reasoning_count" },
      { header: "Reasoning Percentage", key: "reasoning_percentage" },
      { header: "Reasoning Score Percentage", key: "reasoning_score_percentage" },
      { header: "Verbal Attempted", key: "verbal_count" },
      { header: "Verbal Percentage", key: "verbal_percentage" },
      { header: "Verbal Score Percentage", key: "verbal_score_percentage" }
    ];

    let excel_data = filteredData.map(mandatory => ({
      name: mandatory.name,
      roll_no: mandatory.roll_no,
      branch: selectedBranch.value,
      college: mandatory.college,
      passout_year: mandatory.passout_year,
      aptitude_count: mandatory.aptitude_count || 0,
      aptitude_percentage: mandatory.aptitude_count ? ((mandatory.aptitude_count || 0) / testCounts.aptitude_tests?.[0]?.count * 100).toFixed(2) + "%" : "0%",
      aptitude_score_percentage: mandatory.aptitude_count ? (mandatory.aptitude_percentage / (mandatory.aptitude_count || 0)).toFixed(2) + "%" : "0%",
      reasoning_count: mandatory.reasoning_count || 0,
      reasoning_percentage: mandatory.reasoning_count ? ((mandatory.reasoning_count || 0) / testCounts.reasoning_tests?.[0]?.count * 100).toFixed(2) + "%" : "0%",
      reasoning_score_percentage: mandatory.reasoning_count ? (mandatory.reasoning_percentage / (mandatory.reasoning_count || 0)).toFixed(2) + "%" : "0%",
      verbal_count: mandatory.verbal_count || 0,
      verbal_percentage: mandatory.verbal_count ? ((mandatory.verbal_count || 0) / testCounts.verbal_tests?.[0]?.count * 100).toFixed(2) + "%" : "0%",
      verbal_score_percentage: mandatory.verbal_count ? (mandatory.verbal_percentage / (mandatory.verbal_count || 0)).toFixed(2) + "%" : "0%",
    }
    ))
    const worksheet = XLSX.utils.json_to_sheet(excel_data, { header: headers.map(h => h.key) });
    XLSX.utils.sheet_add_aoa(worksheet, [headers.map(h => h.header)], { origin: 'A1' });

    const columnWidths = [
      { wch: 30 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];

    // Assign widths to the columns
    worksheet['!cols'] = columnWidths;

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mandatory Tests Data");

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `mandatory_tests_data${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  const copyDataToClipboard = () => {
    const table = document.querySelector("table");  // Assuming MDBDataTable is rendering a <table> element
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    alert("Data copied to clipboard!");
  };


  const handleSubmit = () => {
    setVisible(true);
    setLoading(true);
    fetchData();
    fetchTotalTests();
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="">
              <Row className="mb-3">
                <Col md={6}>
                  <Label>Select Branch</Label>
                  <Select
                    options={branches}
                    value={selectedBranch}
                    onChange={handleSelectBranch}
                    placeholder="Select Branch"
                  />
                </Col>
                <Col md={6}>
                  <Label>Select Level</Label>
                  <Select
                    options={levels}
                    value={selectedLevel}
                    onChange={handleSelectLevel}
                    placeholder="Select Level"
                  />
                </Col>
              </Row>
              <div className="d-flex justify-content-between">
                <Button
                  type="button"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={!selectedLevel || !selectedBranch}
                >
                  Submit
                </Button>
              </div>
            </CardBody>
            <CardBody>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <div>
            {visible ?
              (
                <Row>
                  <Row>
                    <Col xl={4} md={6}>
                      <Card style={{ backgroundColor: "#DCDCEE" }}>
                        <CardBody>
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="fw-bold" style={{ textAlign: 'center' }}>Total Students</h6>
                              <div className="d-flex justify-content-center">
                                <h6 className="fw-bold">{filteredData ? filteredData.length : 0}</h6>
                              </div>
                            </div>
                            <div>
                              <h6 className="fw-bold" style={{ textAlign: 'center' }}>Below 75% Score</h6>
                              <div className="d-flex justify-content-center">
                                <h6 className="fw-bold">{totalBelowSeventyFivePercentage ? totalBelowSeventyFivePercentage : 0}</h6>
                              </div>
                            </div>
                            <div>
                              <h6 className="fw-bold" style={{ textAlign: 'center' }}>InActive Count</h6>
                              <div className="d-flex justify-content-center">
                                <h6 className="fw-bold">{totalInactiveCount ? totalInactiveCount : 0}</h6>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col xl={8} md={6}>
                      <Row>
                        <Col xl={4} md={6}>
                          <Card style={{ backgroundColor: "#FFBB00", color: "#008738" }}>
                            <CardBody>
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h6 className="fw-bold" style={{ textAlign: 'center' }}>Aptitude Total Tests</h6>
                                  <div className="d-flex justify-content-center">
                                    <h6 className="fw-bold">{testCounts.aptitude_tests?.[0]?.count || 0}</h6>
                                  </div>
                                </div>
                                <div>
                                  <h6 className="fw-bold" style={{ textAlign: 'center' }}>InActive Count</h6>
                                  <div className="d-flex justify-content-center">
                                    <h6 className="fw-bold">{AptInactiveCount ? AptInactiveCount : 0}</h6>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col xl={4} md={6}>
                          <Card style={{ backgroundColor: "#72BD20" }}>
                            <CardBody>
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h6 style={{ textAlign: 'center' }}>Reasoning Total Tests</h6>
                                  <div className="d-flex justify-content-center">
                                    <h6> {testCounts.reasoning_tests?.[0]?.count || 0}</h6>
                                  </div>
                                </div>
                                <div>
                                  <h6 style={{ textAlign: 'center' }}>InActive Count</h6>
                                  <div className="d-flex justify-content-center">
                                    <h6> {ReasInactiveCount ? ReasInactiveCount : 0}</h6>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col xl={4} md={6}>
                          <Card style={{ backgroundColor: "#008738", color: "#fff" }}>
                            <CardBody>
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h6 style={{ textAlign: 'center' }}>Verbal Total Tests</h6>
                                  <div className='d-flex justify-content-center'>
                                    <h6>{testCounts.verbal_tests?.[0]?.count || 0}</h6>
                                  </div>
                                </div>
                                <div>
                                  <h6 style={{ textAlign: 'center' }}>InActive Count</h6>
                                  <div className='d-flex justify-content-center'>
                                    <h6>{verbInactiveCount ? verbInactiveCount : 0}</h6>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  {loading ? (
                    <div
                      className="d-flex justify-content-center"
                    >
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

                  ) :
                    (
                      <>
                        <div style={{ textAlign: 'right' }}>
                          <Button type="button" color="primary" onClick={exportToExcel} disabled={!visible}>
                            Download Excel
                          </Button>
                          {/* <Button type="button" color="secondary" onClick={copyDataToClipboard} disabled={!visible} style={{ marginLeft: '10px' }}>
                        Copy Data
                      </Button> */}
                        </div>
                        <MDBDataTable responsive bordered data={data} noBottomColumns searching={false} />
                      </>
                    )
                  }
                </Row>
              ) : (
                <>
                  <div style={{ marginTop: "150px" }}>
                  </div>
                </>
              )
            }
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(MandatoryList);
