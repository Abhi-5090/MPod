import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import * as XLSX from "xlsx"; // Import the xlsx library
import "./datatables.scss";
import moment from 'moment'
import Flatpickr from "react-flatpickr"

const AttendanceList = (props) => {
  document.title = "Attendance list | Technical Hub - Attendance";
  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Attendance", link: "#" },
    { title: "Attendance List", link: "#" },
  ];

  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [user, setUser] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props.setBreadcrumbItems('Attendance', breadcrumbItems);
    fetchData();
  }, [user]);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'trainer' || authUser.role == 'operations' || authUser.role == 'coding' || authUser.role == 'hod' || authUser.role == 'Principal' ) {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    setUser(authUser);

    let curr_date = [moment().utcOffset('+05:30').format('DD-MM-YYYY')]
    // curr_date = JSON.stringify(curr_date)
    console.log(typeof(curr_date))
    setSelectedDate(curr_date)

  }, []);

  const fetchData = async (sel_date) => {
    setLoading(true);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    let response
    try {
      if (selectedDate != undefined) {

        if (user && user.role == "admin" || user.role == "superadmin" || user.role == "operations") {

          response = await axios.post(backendUrl + 'get-attendance', { date: sel_date != undefined ? sel_date : selectedDate });
          // console.log(response.data)
        } else if (user && user.role == "trainer") {

          response = await axios.post(backendUrl + 'get-attendance-by-technology', { "technologies": user.technology, date: sel_date != undefined ? sel_date : selectedDate });
        } else if (user && user.role == "hod") {
          console.log('testing')
          response = await axios.post(backendUrl + 'get-attendance-by-college-and-branches', { "college": user.college, "branches": user.branch, date: sel_date != undefined ? sel_date : selectedDate });
          console.log(response.data)
        }
        if (response.status === 200) {
          setLoading(false)
          setAttendanceData(response.data);
          setFilteredData(response.data);
          // console.log(sel_date,user.college,user.branch);
        }
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  //for excel download
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);
    if (searchValue) {
      setFilteredData(attendanceData.filter(item =>
        Object.values(item).some(val => val.toString().toLowerCase().includes(searchValue))
      ));
    } else {
      setFilteredData(attendanceData);
    }
  };

  const data = {
    columns: [
      { label: "First name", field: "first_name", sort: "asc", width: 150 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "College", field: "college", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 150 },
      { label: "Batch", field: "batch", sort: "asc", width: 150 },
      { label: "Lightmode", field: "lightmode", sort: "asc", width: 150 },
      { label: "Brightmode", field: "brightmode", sort: "asc", width: 150 },
      { label: "Shinemode", field: "shinemode", sort: "asc", width: 150 },
      { label: "Darkmode", field: "darkmode", sort: "asc", width: 150 },
      { label: "Moonmode", field: "moonmode", sort: "asc", width: 150 },
      { label: "Date", field: "date", sort: "asc", width: 150 },
    ],
    rows: filteredData.map(attendance => ({
      first_name: attendance.first_name,
      roll_no: attendance.roll_no,
      college: attendance.college,
      branch: attendance.branch[0],
      batch: attendance.batch_name,
      lightmode: attendance.lightmode !== "" ? attendance.lightmode : "-",
      brightmode: attendance.brightmode !== "" ? attendance.brightmode : "-",
      shinemode: attendance.shinemode !== "" ? attendance.shinemode : "-",
      darkmode: attendance.darkmode !== "" ? attendance.darkmode : "-",
      moonmode: attendance.moonmode !== "" ? attendance.moonmode : "-",
      date: attendance.date,
    })),
  };

  const exportToExcel = () => {
    let excel_data = filteredData.map(attendance => ({
      first_name: attendance.first_name,
      roll_no: attendance.roll_no,
      college: attendance.college,
      branch: attendance.branch[0],
      batch: attendance.batch_name,
      lightmode: attendance.lightmode !== "" ? attendance.lightmode : "-",
      brightmode: attendance.brightmode !== "" ? attendance.brightmode : "-",
      shinemode: attendance.shinemode !== "" ? attendance.shinemode : "-",
      darkmode: attendance.darkmode !== "" ? attendance.darkmode : "-",
      moonmode: attendance.moonmode !== "" ? attendance.moonmode : "-",
      date: attendance.date,
    }))
    console.log("Filtered Data:", excel_data); // Log data for debugging
    const worksheet = XLSX.utils.json_to_sheet(excel_data,{
      header: [
        'first_name', 'roll_no', 'college', 'branch', 'batch', 
        'lightmode', 'brightmode', 'shinemode', 'darkmode', 'moonmode', 'date'
      ]
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance.xlsx");
  };

  const DateChange = (e) => {
    
    const final_dates = e.map((ele) => {
      const date = new Date(ele);

      // Ensure the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ['01', '02', '03', '04', '05', '06',
        '07', '08', '09', '10', '11', '12'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    })

    setSelectedDate(final_dates)
    console.log(final_dates)
    fetchData(final_dates);
  }

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Attendance</CardTitle>
              {/* <span>Select Date</span> <span><input onChange={DateChange} type="date" /></span> */}
              <div className="form-group mb-4">
                <label>Select Dates to search</label>
                <div className="input-group">
                  <Flatpickr
                    className="form-control d-block"
                    placeholder="dd-MM-yyyy"
                    onChange={DateChange}
                    options={{
                      mode: "multiple",
                      dateFormat: "D-M-Y"
                    }}
                  />
                </div>
              </div>
              <Button type="button" color="primary" onClick={exportToExcel}>
                Download Excel
              </Button>
            </CardBody>
            <CardBody>
              <div style={{ textAlign: "right", height: "40px" }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={handleSearch}
                  className="mb-3"
                />
              </div>
              {filteredData.length !== 0 && !loading ? ( // Check if there are filtered records
                <MDBDataTable responsive bordered data={data} noBottomColumns searching={false} />
              ) : (
                <div className="row">
                  <div className="col-md-2 offset-5">
                    {attendanceData.length !== 0 && !loading ? ( // Check if data is being fetched
                      <p>No records found</p>
                    ) : (

                      <MutatingDots
                        visible={true}
                        height="100"
                        width="100"
                        color="#2B3A4A"
                        secondaryColor="#2B3A4A"
                        radius="12.5"
                        ariaLabel="mutating-dots-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                      />
                    )}
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

export default connect(null, { setBreadcrumbItems })(AttendanceList);
