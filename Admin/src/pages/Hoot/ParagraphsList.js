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


const ParagraphsList = (props) => {
  document.title = "Reading Paragraphs List";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Paragraphs", link: "#" },
    { title: "Paragraphs List", link: "#" },
  ];

  const [paragraphsData, setParagraphsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [totalCount,setTotalCount] = useState(0);

  useEffect(() => {
    props.setBreadcrumbItems('Paragraphs', breadcrumbItems);
    fetchParagraphsData();
  }, []);

  const fetchParagraphsData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl+'get-ReadingParagraphs-data');
      if (response.status === 200) {
        setParagraphsData(response.data.readingParagraphs); 
        setFilteredData(response.data.readingParagraphs); 
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




  const handleDateFilter = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!fromDate && !toDate) {
      toast.error("Please select at least one date.");
      return;
    }
    setLoading(true);
   try{
    const response = await axios.post(backendUrl+'get-ReadingParagraphs-filteredDate-data',{
      fromDate: fromDate, 
      toDate: toDate 
    });
    if (response.status == 200){
      setLoading(true)
      setFilteredData(response.data); 
      console.log(response.data)
    } 
    else {
      toast.error("Failed to fetch data.");
      setLoading(false);
    }
   }
   catch(error){
    toast.error("No reading Paragraph found for the selected date range.");
    setLoading(false);
   }
   finally{
    setLoading(false)
   }
  };


  const handleResetFilter = () => {
    setFilteredData(paragraphsData);
    setFromDate(''); 
    setToDate('');
  };


  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData); // Export filteredData instead of paragraphsData
    const workbook = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Paragraphs Data"); // Append worksheet to workbook
    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `filtered_paragraphs_data_${new Date().toISOString().slice(0, 10)}.xlsx`); // Save file with current date in filename
  };

  console.log(filteredData);
  

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "Paragraph", field: "paragraph", sort: "asc", width: 200 },
      { label: "Timer", field: "timer", sort: "asc", width: 100 },
      { label: "Confidence", field: "confidence", sort: "asc", width: 100 },
      { label: "Accuracy (%)", field: "accuracy", sort: "asc", width: 100 },
      { label: "Missed Words", field: "missed_words_count", sort: "asc", width: 150 },
      { label: "Wrong Pronounced", field: "wrong_pronounced_count", sort: "asc", width: 150 },
      { label: "Submitted Date & Time", field: "createdAt", sort: "asc", width: 200 },
    ],
    rows: filteredData.map((item, index) => ({
      sno: index + 1,
      roll_no: item.roll_no,
      paragraph: item.paragraph,
      timer: item.timer,
      confidence: item.confidence,
      accuracy: `${item.accuracy}%`,
      missed_words_count: item.missed_words_count,
      wrong_pronounced_count: item.wrong_pronounced_count,
      createdAt: new Date(item.createdAt).toLocaleString(),
    })),
  };

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
              <CardTitle className="h4">Reading Paragraphs List</CardTitle>
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

export default connect(null, { setBreadcrumbItems })(ParagraphsList);


