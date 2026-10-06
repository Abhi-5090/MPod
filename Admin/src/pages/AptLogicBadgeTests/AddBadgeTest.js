import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  CardTitle,
  Input,
  InputGroup,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import "./datatables.scss"
import { useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"
import { MDBDataTable } from "mdbreact";
import { decode } from 'html-entities';
import DOMPurify from 'dompurify';
import Flatpickr from "react-flatpickr"
import 'flatpickr/dist/themes/material_blue.css'; // Ensure you import Flatpickr CSS

const AddBadgeTest = (props) => {


  document.title = "Technial Hub| Add Assessment";
  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Tests", link: "/aptlogic-tests-list" },
    { title: "Add Test", link: "/add-aptlogic-test" },
  ];
  const [data, setData] = useState({});
  const [user, setUser] = useState()
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)

  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])


  const [selectedEndDate, setSelectedEndDate] = useState([])
  const [selectedStartDate, setSelectedStartDate] = useState([])


  const navigate = useNavigate();
  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem('authUser'))
    setUser(authUser)
    props.setBreadcrumbItems('Add Test', breadcrumbItems);
    fetchData()
    if (selectedGroup) {
      fetchTechnologyData()
    }

  }, [selectedGroup, selectedTechnologyGroup]);


useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);


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

  const fetchTechnologyData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-technology-by-course-id', { course_id: selectedGroup.value });
      if (response.status === 200) {
        setTechnologyData(response.data);
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

  const technologyOptionGroup = technologyData.map((ele) => ({
    options: [
      { label: ele.technology_name, value: ele._id }
    ]
  }));

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  function handleSelectGroup(selectedGroup) {
    setselectedGroup(selectedGroup)
  }
  function handleTechnologySelectGroup(selectedGroup) {
    setselectedTechnologyGroup(selectedGroup)
  }

  const addAssessment = async () => {

    const dataList = {
      'course': selectedGroup.value,
      'technology': selectedTechnologyGroup.value,
      "start_time": selectedStartDate,
      "end_time": selectedEndDate,
      "test_name": data.test_name,
      "users_count": data.users_count,
      "questions_count": 150,
      created_by: user.student_id
    }
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'add-aptlogic-badge-test', dataList);

      if (response.status == 200) {
        alert(response.data.message)
        navigate(`/aptlogic-badgetests-list`)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const StartDateChange = (e) => {
    const date = new Date(e);
    // Ensure the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['01', '02', '03', '04', '05', '06',
      '07', '08', '09', '10', '11', '12'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const final_dates = `${day}-${month}-${year} ${hours}:${minutes}`
    setSelectedStartDate(date)
  }

  const EndDateChange = (e) => {
    const date = new Date(e);
    // Ensure the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['01', '02', '03', '04', '05', '06',
      '07', '08', '09', '10', '11', '12'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const final_dates = `${day}-${month}-${year} ${hours}:${minutes}`
    setSelectedEndDate(date)
  }

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Create Test</h4>

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
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Technology</Label>
                      <Select
                        value={selectedTechnologyGroup}
                        onChange={handleTechnologySelectGroup}
                        options={technologyOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>




                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Test Name</Label>
                      <AvField
                        name="test_name"
                        placeholder="Test name"
                        type="text"
                        errorMessage="Enter Test anem"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.test_name}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">No of Users</Label>
                      <AvField
                        name="users_count"
                        placeholder="Users Count"
                        type="number"
                        errorMessage="Enter No of Users"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.user_count}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <div className="form-group mb-3">
                      <Label>Start Time</Label>
                      <InputGroup>
                        <Flatpickr
                          className="form-control d-block"
                          placeholder="dd M,yyyy HH:mm"
                          onChange={StartDateChange}
                          errorMessage="Select Start time"
                          id="validationCustom01"
                          value={data.start_time}
                          options={{
                            altInput: true,
                            altFormat: "F j, Y H:i",
                            dateFormat: "d-m-Y H:i",
                            enableTime: true,
                            time_24hr: true, // If you prefer 24-hour format
                          }}
                        />
                      </InputGroup>
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="form-group mb-3">
                      <Label>End Time</Label>
                      <InputGroup>
                        <Flatpickr
                          className="form-control d-block"
                          placeholder="dd M,yyyy HH:mm"
                          onChange={EndDateChange}
                          errorMessage="Select Start time"
                          id="validationCustom01"
                          value={data.start_time}
                          options={{
                            altInput: true,
                            altFormat: "F j, Y H:i",
                            dateFormat: "d-m-Y H:i",
                            enableTime: true,
                            time_24hr: true, // If you prefer 24-hour format
                          }}
                        />
                      </InputGroup>
                    </div>
                  </Col>
                </Row>

                <Button color="primary" type="button" onClick={addAssessment}>
                  Create Test
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddBadgeTest);