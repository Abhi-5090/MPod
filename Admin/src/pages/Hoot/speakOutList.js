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

const SpeakOutList = (props) => {
  // Set page title
  document.title = "Speak Out List";

  // Breadcrumb data
  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Speak Out", link: "#" },
    { title: "Speak Out List", link: "#" },
  ];

  // State variables
  const [speakOutData, setSpeakOutData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(null); // Initialize to null
  const [toDate, setToDate] = useState(null); // Initialize to null
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    props.setBreadcrumbItems('Speak Out', breadcrumbItems);
    fetchSpeakOutData();
  }, []);

  // Fetch all Speak Out data
  const fetchSpeakOutData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl+'get-speak-out-data');
      if (response.status === 200) {
        setSpeakOutData(response.data.speakout);
        setFilteredData(response.data.speakout); 
        setTotalCount(response.data.totalCount); 
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

  // Handle date filter
  const handleDateFilter = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!fromDate && !toDate) {
      toast.error("Please select at least one date.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(backendUrl+'get-speak-out-filteredDate-data', {
        fromDate, 
        toDate
      });
      if (response.status === 200) {
        setFilteredData(response.data.speakout);
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      toast.error("No Submissions found for the selected date range.");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilter = () => {
    setFilteredData(speakOutData);
    setFromDate(null); 
    setToDate(null);
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Speak Out Data");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `filtered_listen_and_repeat_data_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  
  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "Topic Name", field: "topic_name", sort: "asc", width: 150 },
      { label: "Confidence", field: "confidence", sort: "asc", width: 150 },
      { label: "timer", field: "timer", sort: "asc", width: 150 },
      { label: "Accuracy (%)", field: "accuracy", sort: "asc", width: 100 },
      { label: "Words", field: "words", sort: "asc", width: 150 },
      { label: "Grammar", field: "grammar", sort: "asc", width: 150 },
      { label: "Overall Score", field: "overall_score", sort: "asc", width: 150 },
      { label: "Sentiment", field: "sentiment", sort: "asc", width: 150 },
      { label: "Submitted Date & Time", field: "createdAt", sort: "asc", width: 200 },
    ],
    rows: filteredData.map((item, index) => ({
      sno: index + 1,
      roll_no: item.roll_no,
      topic_name: item.topic_name,
      confidence: item.confidence,
      timer: item.timer,
      accuracy: `${item.accuracy}%`,
      words: item.words,
      grammar: item.grammar,
      overall_score: item.overall_score,
      sentiment: item.sentiment,
      createdAt: new Date(item.createdAt).toLocaleString(),
    })),
  };
 console.log(data);
 
 
  return (
    <React.Fragment>
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
              <CardTitle className="h4">Speak Out List</CardTitle>
              <CardTitle className="h4">Submissions {totalCount}</CardTitle>
            </CardBody>
            <CardBody>
              <div className="mb-4 d-flex justify-content-between">
                <div className="d-flex">
                  <Label htmlFor="fromDate"></Label>
                  <Flatpickr
                    className="form-control"
                    placeholder="From Date"
                    options={{ dateFormat: "Y-m-d" }}
                    value={fromDate}
                    onChange={(date) => setFromDate(date[0].toLocaleDateString('en-CA'))}
                  />&nbsp;&nbsp;&nbsp;&nbsp;
                  <Label htmlFor="toDate" className="ml-3"></Label>
                  <Flatpickr
                    className="form-control"
                    placeholder="To Date"
                    options={{ dateFormat: "Y-m-d" }}
                    value={toDate}
                    onChange={(date) => setToDate(date[0].toLocaleDateString('en-CA'))}
                  />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <button onClick={handleDateFilter} className="btn btn-primary ml-3">Filter</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <button onClick={handleResetFilter} className="btn btn-primary ml-3">Reset</button>
                </div>
                <div>
                  <button onClick={exportToExcel} className="btn btn-primary ml-3">Download Excel</button>
                </div>
              </div>

              {loading ? (
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
              ) : (
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(SpeakOutList);
