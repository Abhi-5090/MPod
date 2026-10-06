import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, CardTitle, Button } from "reactstrap";
import Select from "react-select";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { MDBDataTable } from "mdbreact";
import { MutatingDots } from 'react-loader-spinner';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CodingReports = (props) => {
  document.title = "Coding Reports | Technical Hub - All the Reports of Coding";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Coding", link: "#" },
    { title: "Coding Contest Reports", link: "#" },
  ];

  const [contestData, setContestData] = useState([]);
  const [selectedContestGroup, setSelectedContestGroup] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems("Coding", breadcrumbItems);
  }, []);

  useEffect(() => {
    const fetchContestsData = async () => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.get(backendUrl + "get-coding-contests");
        if (response.status === 200) {
          setContestData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    fetchContestsData();
  }, []);

  const fetchCodingReportData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await axios.post(backendUrl + "final-standings", {
        contest_id: selectedContestGroup.value,
      });

      if (response.status === 200 && response.data.standings) {
        // Process standings data
        const standings = response.data.standings.map((entry) => {
          const questionsDetails = entry.questions || {};
          const questionsColumns = Object.keys(questionsDetails).map((qKey) => ({
            [`${qKey} Run Hits`]: questionsDetails[qKey].run_hits || 0,
            [`${qKey} Submitted Time`]: questionsDetails[qKey].submitted_time || "-",
            [`${qKey} Penalty Time`]: questionsDetails[qKey].penalty_time || 0,
          })).reduce((acc, curr) => ({ ...acc, ...curr }), {});

          return {
            rank: entry.rank,
            roll_no: entry.roll_no,
            total_score: entry.total_score,
            total_penalty_time: entry.total_penalty_time,
            total_submissions: entry.total_submissions,
            ...questionsColumns,
          };
        });
        setReportData(standings);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (selectedContestGroup) {
      fetchCodingReportData();
    }
  }, [selectedContestGroup]);

  const contestOptionGroup = contestData.map((ele) => ({
    label: ele.title,
    value: ele._id,
  }));

  const handleSelectContestGroup = (selectedGroup) => {
    setSelectedContestGroup(selectedGroup);
  };

  const handleDownloadExcel = () => {
    const wsData = reportData.map((report) => {
      const row = {
        Rank: report.rank,
        "Roll No": report.roll_no,
        "Total Score": report.total_score,
        "Total Penalty Time": report.total_penalty_time,
        "Total Submissions": report.total_submissions,
      };

      // Add dynamic question details
      Object.keys(report).forEach((key) => {
        if (key.includes("Run Hits") || key.includes("Submitted Time") || key.includes("Penalty Time")) {
          row[key] = report[key];
        }
      });

      return row;
    });

    // Generate the worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Coding Report");

    // Write the workbook to a buffer and save it as an Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    saveAs(data, "coding_report.xlsx");
  };

  const data = {
    columns: [
      { label: "Rank", field: "rank", sort: "asc", width: 100 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "Total Score", field: "total_score", sort: "asc", width: 150 },
      { label: "Total Penalty Time", field: "total_penalty_time", sort: "asc", width: 150 },
      { label: "Total Submissions", field: "total_submissions", sort: "asc", width: 150 },
      // Dynamic columns for questions
      ...Object.keys(reportData[0] || {}).filter((key) =>
        key.includes("Run Hits") || key.includes("Submitted Time") || key.includes("Penalty Time")
      ).map((qKey) => ({
        label: qKey,
        field: qKey,
        sort: "asc",
        width: 150
      })),
    ],
    rows: reportData,
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="justify-content-between align-items-center">
              <CardTitle className="h4">Coding Contest List</CardTitle>
              <Col lg="3" className="mb-3">
                <Select
                  value={selectedContestGroup}
                  onChange={handleSelectContestGroup}
                  options={contestOptionGroup}
                  closeMenuOnSelect={true} 
                  classNamePrefix="select2-selection"
                />
              </Col>

              <Button color="primary" className="mb-3" onClick={handleDownloadExcel}>
                Download Excel
              </Button>

              {selectedContestGroup && reportData.length !== 0 ? (
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
