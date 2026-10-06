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
  document.title = "Coding Mandatory Reports | Technical Hub - All the Reports of Coding Mandatory Tests";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Coding", link: "#" },
    { title: "Coding Mandatory Tests Reports", link: "#" },
  ];

  const [batchData, setBatchData] = useState([]);
  const [selectedBatchGroup, setSelectedBatchGroup] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [reportData, setReportData] = useState([]);

  const [isDataLoaded, setIsDataLoaded] = useState(false);


  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' || authUser.role == 'coding' || authUser.role == 'trainer' || authUser.role == 'faculty' || authUser.role == 'hod' || authUser.role == 'Principal') {
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
    const fetchBatchesData = async () => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.get(backendUrl + "get-coding-batches");
        if (response.status === 200) {
          setBatchData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    fetchBatchesData();
  }, []);

  const fetchCodingReportData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const batchNames = selectedBatchGroup.map((batch) => batch.label);
    const technologyIds = selectedTechnologies.map((tech) => tech.value);

    try {
      const response = await axios.post(backendUrl + "get-batch-wise-coding-mandatory-reports", {
        batch_names: batchNames,
        technology_ids: technologyIds,

      });

      if (response.status === 200) {
        setReportData(response.data);
        setIsDataLoaded(true);
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
    const uniqueTopics = new Set();
  
    // Collect unique topics from reportData
    reportData.forEach((report) => {
      report.topics.forEach((submission) => {
        uniqueTopics.add(submission.topic_name);
      });
    });
  
    const topicNames = Array.from(uniqueTopics);
  
    const wsData = reportData.map((report) => {
      const row = {
        "First Name": report.first_name,
        "Batch Name": report.batch_name,
        "Roll No": report.roll_no,
        "College": report.college,
        "Branch": report.branch.join(", "),
        "Gender": report.gender,
      };
  
      // Add topic-wise data in the same format as displayed in the table
      topicNames.forEach((topic) => {
        const topicDetail = report.topics.find(
          (submission) => submission.topic_name === topic
        );
  
        if (topicDetail) {
          row[topic] = `Success: ${topicDetail.success}, Fail: ${topicDetail.fail}, Total: ${topicDetail.total}, Required: ${topicDetail.required}`;
        } else {
          row[topic] = `Success: 0, Fail: 0, Total: 0, Required: 0`;
        }
      });
  
      return row;
    });
  
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Coding Report");
  
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  
    saveAs(data, "coding_report.xlsx");
  };
  

  const data = (() => {
    const uniqueTopics = new Set();

    // Collect unique topics
    reportData.forEach((report) => {
      report.topics.forEach((submission) => {
        uniqueTopics.add(submission.topic_name);
      });
    });

    const topicNames = Array.from(uniqueTopics);

    const columns = [
      { label: "First Name", field: "first_name", sort: "asc", width: 150 },
      { label: "Batch Name", field: "batch_name", sort: "asc", width: 150 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "College", field: "college", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 150 },
      { label: "Gender", field: "gender", sort: "asc", width: 100 },
      ...topicNames.map((topic) => ({
        label: topic,
        field: topic,
        sort: false,
        width: 200,
      })),
    ];

    const rows = reportData.map((report) => {
      const row = {
        first_name: report.first_name,
        batch_name: report.batch_name,
        roll_no: report.roll_no,
        college: report.college,
        branch: report.branch.join(", "),
        gender: report.gender,
      };

      // Fill each topic's cell
      topicNames.forEach((topic) => {
        const topicDetail = report.topics.find(
          (submission) => submission.topic_name === topic
        );

        if (topicDetail) {
          row[topic] = `✅${topicDetail.success} 
          ❌${topicDetail.fail} 
          🔢${topicDetail.total} 
          🎯${topicDetail.required}`;
        } else {
          row[topic] = `✅0 ❌0 🔢0 🎯0`;
        }
      });

      return row;
    });

    return { columns, rows };
  })();



  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="justify-content-between align-items-center mt-5 mb-5">
              <CardTitle className="h4">Coding Mandatory Tests Reports</CardTitle>
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

              <Button color="primary" className="mb-3" onClick={fetchCodingReportData}>
                Submit
              </Button>


              {/* Add the Download Excel Button */}
              {isDataLoaded && reportData.length !== 0 && (
                <Button color="success" className="mb-3 mx-5
                " onClick={handleDownloadExcel}>
                  Download Excel
                </Button>
              )}

              {isDataLoaded && reportData.length !== 0 && (
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              )}

            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(CodingReports);
