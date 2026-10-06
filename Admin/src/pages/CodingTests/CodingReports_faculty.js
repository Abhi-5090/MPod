import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, CardTitle, Label, Button } from "reactstrap";
import Select from "react-select";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { MDBDataTable } from "mdbreact";
import "./datatables.scss";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

const CodingReports = (props) => {
  document.title = "Coding Reports | Technical Hub - All the Reports of Coding";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Coding", link: "#" },
    { title: "Coding Reports", link: "#" },
  ];

  const [batchData, setBatchData] = useState([]);
  const [selectedBatchGroup, setSelectedBatchGroup] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [section, setSection] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);  // New state for handling submission

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
    props.setBreadcrumbItems("Coding", breadcrumbItems);
  }, []);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (authUser) {
      setSection(authUser.section || []);
    }
  }, []);

  useEffect(() => {
    const fetchBatchesData = async () => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.get(backendUrl + "get-coding-batches");
        if (response.status === 200) {
          // Filter batches based on the section array
          const filteredBatches = response.data.filter(batch =>
            section.some(sec => batch.batch_name.includes(sec)) // Match any batch name with section array
          );
          setBatchData(filteredBatches);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    fetchBatchesData();
  }, [section]);

  const fetchCodingReportData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const batchNames = selectedBatchGroup.map((batch) => batch.label);
    const technologyIds = selectedTechnologies.map((tech) => tech.value);

    try {
      const response = await axios.post(backendUrl + "get-batch-wise-coding-reports", {
        batch_names: batchNames,
        technology_ids: technologyIds,
        start_date: startDate ? format(startDate, "dd/MM/yyyy") : null,
        end_date: endDate ? format(endDate, "dd/MM/yyyy") : null,
      });

      if (response.status === 200) {
        setReportData(response.data);
        setIsSubmitted(true);  // Set submission state to true after fetching the data
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const batchOptionGroup = batchData.map((ele) => ({
    label: ele.batch_name,
    value: ele._id,
    technologies: ele.technologyDetails,
  }));

  const handleSelectBatchGroup = (selectedGroups) => {
    setSelectedBatchGroup(selectedGroups);

    const allTechnologies = selectedGroups.flatMap((group) => group.technologies);
    const uniqueTechnologies = Array.from(new Set(allTechnologies.map((tech) => tech.technology_id)))
      .map((id) => allTechnologies.find((tech) => tech.technology_id === id));

    setTechnologies(
      uniqueTechnologies.map((tech) => ({
        label: tech.technology_name,
        value: tech.technology_id,
      }))
    );
  };

  const handleSelectTechnologies = (selectedOptions) => {
    setSelectedTechnologies(selectedOptions);
  };

  const handleDownloadExcel = () => {
    const wsData = reportData.map((report) => {
      const row = {
        "First Name": report.first_name,
        "Batch Name": report.batch_name,
        "Roll No": report.roll_no,
        "College": report.college,
        "Branch": report.branch.join(", "),
        "Gender": report.gender,
        "Total Time (min)": report.total_time_spent_minutes,
      };

      selectedTechnologies.forEach((tech) => {
        const techDetail = report.technology_details.find((detail) => detail.technology_name === tech.label);
        if (techDetail) {
          row[`${tech.label} Easy`] = techDetail.easy_count || 0;
          row[`${tech.label} Medium`] = techDetail.medium_count || 0;
          row[`${tech.label} Hard`] = techDetail.hard_count || 0;
        } else {
          row[`${tech.label} Easy`] = 0;
          row[`${tech.label} Medium`] = 0;
          row[`${tech.label} Hard`] = 0;
        }
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Coding Report");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    saveAs(data, "coding_report.xlsx");
  };

  const data = {
    columns: [
      { label: "First Name", field: "first_name", sort: "asc", width: 150 },
      // { label: "Batch Name", field: "batch_name", sort: "asc", width: 150 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "College", field: "college", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 150 },
      { label: "Gender", field: "gender", sort: "asc", width: 100 },
      { label: "Total Time (hrs)", field: "total_time_spent_hours", sort: "asc", width: 150 },
      { label: "Total Reading Time (hrs)", field: "total_problem_spent_hours", sort: "asc", width: 150 },

      ...selectedTechnologies.flatMap((tech) => [
        { label: `${tech.label} Easy`, field: `${tech.value}_easy`, sort: "asc", width: 150 },
        { label: `${tech.label} Medium`, field: `${tech.value}_medium`, sort: "asc", width: 150 },
        { label: `${tech.label} Hard`, field: `${tech.value}_hard`, sort: "asc", width: 150 },
      ]),
    ],
    rows: reportData.map((report) => {
      const row = {
        first_name: report.first_name,
        batch_name: report.batch_name,
        roll_no: report.roll_no,
        college: report.college,
        branch: report.branch.join(", "),
        gender: report.gender,
        total_time_spent_hours: (report.total_time_spent_minutes / 60).toFixed(2),
        total_problem_spent_hours: (report.total_problem_spent_time / 60).toFixed(2),
      };

      selectedTechnologies.forEach((tech) => {
        const techDetail = report.technology_details.find((detail) => detail.technology_name === tech.label);
        row[`${tech.value}_easy`] = techDetail ? techDetail.easy_count : 0;
        row[`${tech.value}_medium`] = techDetail ? techDetail.medium_count : 0;
        row[`${tech.value}_hard`] = techDetail ? techDetail.hard_count : 0;
      });

      return row;
    }),
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="justify-content-between align-items-center">
              <CardTitle className="h4">Coding Activities List</CardTitle>
              <Col lg="3" className="mb-3">
                <Label>Select Batches</Label>
                <Select
                  isMulti
                  value={selectedBatchGroup}
                  onChange={handleSelectBatchGroup}
                  options={batchOptionGroup}
                  closeMenuOnSelect={false}
                  classNamePrefix="select2-selection"
                />
              </Col>

              {selectedBatchGroup.length > 0 && (
                <Row className="mb-3">
                  <Col lg="3">
                    <Label>Start Date</Label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      className="form-control"
                      placeholderText="Select Start Date"
                      dateFormat="dd/MM/yyyy"
                    />
                  </Col>
                  <Col lg="3">
                    <Label>End Date</Label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      className="form-control"
                      placeholderText="Select End Date"
                      dateFormat="dd/MM/yyyy"
                    />
                  </Col>
                </Row>
              )}

              {technologies.length > 0 && (
                <Col lg="3" className="mb-3">
                  <Label>Select Technologies</Label>
                  <Select
                    isMulti
                    value={selectedTechnologies}
                    onChange={handleSelectTechnologies}
                    options={technologies}
                    classNamePrefix="select2-selection"
                  />
                </Col>
              )}

              <Button color="primary" className="m-2" onClick={fetchCodingReportData}>
                Submit
              </Button>

              {isSubmitted && reportData.length > 0 && (
                <>
                  <Button color="primary" className="m-2" onClick={handleDownloadExcel}>
                    Download Excel
                  </Button>
                  <MDBDataTable className="mt-5" responsive bordered data={data} noBottomColumns />
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(CodingReports);
