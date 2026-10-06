import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from 'react-loader-spinner';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx"; // Import the xlsx library

const BatchWiseAttendance = (props) => {
  document.title = "Technial Hub| Batch wise attendance";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Attendance", link: "/batch-attendance" },
    { title: "Batch Attendance", link: "/batch-attendance" },
  ];

  const [data, setData] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedBatchGroup, setSelectedBatchGroup] = useState(null);
  const [courseData, setCourseData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    props.setBreadcrumbItems('Batch wise attendance', breadcrumbItems);
    fetchData();
  }, []);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'trainer' || authUser.role == 'operations' || authUser.role == 'coding' || authUser.role == 'hod'|| authUser.role == 'Principal') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchBatchesData()
    }
  }, [selectedGroup]);


  //Fetch course data
  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-courses');
      if (response.status === 200) {
        setCourseData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };



  const fetchBatchesData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-batches-by-course', { course_id: selectedGroup.value });
      if (response.status === 200) {
        setBatchData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };


  const optionGroup = courseData.map((ele) => ({
    options: [
      { label: ele.course_name, value: ele._id }
    ]
  }));



  const batchOptionGroup = batchData.map((ele) => ({
    options: [
      { label: ele.batch_name, value: ele._id }
    ]
  }));



  const handleSelectGroup = (selectedGroup) => {
    setSelectedGroup(selectedGroup);
  };

  const handleSelectBatchGroup = (selectedGroup) => {
    setSelectedBatchGroup(selectedGroup);

  };


  const validation = () => {
    let errors = {};
    if (selectedGroup?.value == null) {
      errors.group = "Select Course";
      alert("Select Course");
    }
    if (selectedBatchGroup?.value == null) {
      errors.batch = "Select Batch";
      alert("Select Batch");
    }
    return Object.keys(errors).length > 0 ? errors : null;
  }

  const addSession = async () => {

    const validate = validation();
    //  console.log(validate)
    if (validate == null) {
    setLoading(true);

      const requestData = {
        batch_id: selectedBatchGroup?.value,
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.post(backendUrl + 'get-attendance-percentage-by-batch', requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });


        if (response.status === 200) {
          let excel_data = response.data.map(attendance => ({
            first_name: attendance.first_name,
            roll_no: attendance.roll_no,
            gender: attendance.gender,
            college: attendance.college,
            branch:  Array.isArray(attendance.branch) ? attendance.branch[0] : attendance.branch,
            batch: selectedBatchGroup.label,
            attended_sessions: attendance.attended_sessions,
            total_sessions: attendance.total_sessions,
            lightmodeSessionCount:attendance.lightmodeSessionCount,
            brightmodeSessionCount:attendance.brightmodeSessionCount,
            shinemodeSessionCount:attendance.shinemodeSessionCount,
            darkmodeSessionCount:attendance.darkmodeSessionCount,
            moonmodeSessionCount:attendance.moonmodeSessionCount,
            percentage: ((attendance.attended_sessions / attendance.total_sessions) * 100).toFixed(2)
          }))
          const worksheet = XLSX.utils.json_to_sheet(excel_data, {
            header: [
              'first_name', 'roll_no', 'gender', 'college', 'branch', 'batch',
              'attended_sessions', 'total_sessions'
            ]
          });
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
          XLSX.writeFile(workbook, selectedBatchGroup.label + ".xlsx");

          setLoading(false)

          navigate(`/batch-wise-attendance`);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          alert('Session already created for the given course and technology.');
        } else {
          console.error('Error fetching data:', error);
        }
      }
    }

  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Get Batch wise Attendance</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Course</Label>
                      <Select
                        value={selectedGroup}
                        onChange={handleSelectGroup}
                        options={optionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <Label>Batch</Label>
                      <Select
                        value={selectedBatchGroup}
                        onChange={handleSelectBatchGroup}
                        options={batchOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                {
                  loading ? (<MutatingDots
                    visible={true}
                    height="100"
                    width="100"
                    color="#2B3A4A"
                    secondaryColor="#2B3A4A"
                    radius="12.5"
                    ariaLabel="mutating-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                  />) : (<Button
                    type="button"
                    color="primary"
                    onClick={addSession}
                  >
                    Download Attendance
                  </Button>)
                }

              </AvForm>
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

export default connect(null, mapDispatchToProps)(BatchWiseAttendance);
