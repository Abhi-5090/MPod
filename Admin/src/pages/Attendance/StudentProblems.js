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


const StudentProblemsList = (props) => {
  document.title = "Student Problems List";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Students Problems", link: "#" },
    { title: "Problems List", link: "#" },
  ];
 

  const [user, setUser] = useState({});
  const [branch, setBranch] = useState([]);
  const [college,setCollege] = useState('');
  const [studentProblemsData, setStudentProblemsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'trainer' || authUser.role == 'operations' || authUser.role == 'coding' || authUser.role == 'hod' || authUser.role == 'faculty' || authUser.role == 'Principal' || authUser.role == 'dean') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems('Student Problems', breadcrumbItems);
    
  }, [user]);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (authUser) {
      setUser(authUser);
      setBranch(authUser.branch); 
      setCollege(authUser.college);
      console.log(authUser)
    }
  }, []);

  

  useEffect(() => {
    if (branch.length > 0 && college.length > 0){
      fetchStudentProblemsData(branch,college);
    }
  }, [branch,college]);

 

  const fetchStudentProblemsData = async (branch,college) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl+'get-students-problems-data-hod', {
        branch,
        college,
      });
      if (response.status === 200) {
        // console.log(response.data)
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
    setLoading(true);
   try{
    const response = await axios.post(backendUrl+'get-students-problems-data-by-date-hod',{
      fromDate: fromDate, 
      toDate: toDate,
      branch: user.branch,
      college: user.college,
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
    toast.error("No Data found in the selected date range.");
    setLoading(false);
   }
   finally{
    setLoading(false)
   }
  };


  const handleResetFilter = () => {
    setFilteredData(studentProblemsData);
    setFromDate(''); 
    setToDate('');
  };


  // const exportToExcel = () => {
  //   const worksheet = XLSX.utils.json_to_sheet(filteredData); 
  //   const workbook = XLSX.utils.book_new(); 
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Student problems Data"); 
  //   const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //   const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  //   saveAs(data, `student_problems_data_${new Date().toISOString().slice(0, 10)}.xlsx`); 
  // };


  const exportToExcel = () => {
    // Define your custom headers
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
  
    // Prepare data with the new headers
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
      passout_year: item.passout_year, // Ensure this field is included in your data
    }));
  
    // Create a worksheet and append the data
    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers.map(h => h.key) });
  
    // Add headers to the worksheet
    XLSX.utils.sheet_add_aoa(worksheet, [headers.map(h => h.header)], { origin: 'A1' });
  
    // Set column widths
    const columnWidths = [
      { wch: 15 }, 
      { wch: 30 }, 
      { wch: 10 }, 
      { wch: 10 }, 
      { wch: 10 }, 
      { wch: 10 }, 
      { wch: 5 }, 
      { wch: 5 }, 
      { wch: 5 }, 
      { wch: 5 }, 
    ];
  
    // Assign widths to the columns
    worksheet['!cols'] = columnWidths;
  
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Problems Data");
  
    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `student_problems_data_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Roll No", field: "roll_no", sort: "asc", width:50 },
      { label: "Name", field: "Name", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 100 },
      { label: "Gender", field: "gender", sort: "asc", width: 100 },
      { label: "College", field: "college", sort: "asc", width: 100 },
      { label: "Passout Year", field: "passout_year", sort: "asc", width: 100 },
      { label: "C", field: "c", sort: "asc", width: 150 },
      { label: "CPP", field: "cpp", sort: "asc", width: 150 },
      { label: "JAVA", field: "java", sort: "asc", width: 200 },
      { label: "PYTHON", field: "python", sort: "asc", width: 200 },
      { label: "Date", field: "date", sort: "asc", width: 200 },
    ],
    rows: filteredData.map((item, index) => ({
      sno: index + 1,
      roll_no: item.roll_no,
      Name: item.Name,
      branch: item.branch,
      gender: item.gender,
      college: item.college,
      passout_year : item.passout_year,
      c : item.c,
      cpp: item.cpp,
      java: item.java,
      python : item.python,
      date : item.date
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
              <CardTitle className="h4">Student Problems List</CardTitle>
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

export default connect(null, { setBreadcrumbItems })(StudentProblemsList);


