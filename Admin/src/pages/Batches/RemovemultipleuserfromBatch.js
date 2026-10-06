import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  FormGroup,
  Input,
} from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import Select from "react-select";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

const FindStudentInBatch = (props) => {
  document.title = "Technical Hub | Find Student in Batch";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Search Student In Batch", link: "/sessions-list" },
    { title: "", link: "/add-session" },
  ];

  const [courseData, setCourseData] = useState([]);
  const [technologyData, setTechnologyData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTechnologyGroup, setSelectedTechnologyGroup] = useState(null);
  const [selectedBatchGroup, setSelectedBatchGroup] = useState(null);
  const [rollNumber, setRollNumber] = useState("");
  const [isRollNumberExist, setIsRollNumberExist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems("Find Student", breadcrumbItems);
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchTechnologyData();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedTechnologyGroup) {
      fetchBatchesData();
    }
  }, [selectedTechnologyGroup]);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-courses`);
      if (response.status === 200) {
        setCourseData(response.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchTechnologyData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(`${backendUrl}get-technology-by-course-id`, {
        course_id: selectedGroup.value,
      });
      if (response.status === 200) {
        setTechnologyData(response.data);
      }
    } catch (error) {
      console.error("Error fetching technology data:", error);
    }
  };

  const fetchBatchesData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(`${backendUrl}get-batch-by-technology`, {
        technology_id: selectedTechnologyGroup.value,
      });
      if (response.status === 200) {
        setBatchData(response.data);
      }
    } catch (error) {
      console.error("Error fetching batch data:", error);
    }
  };

  const handleRollNumberChange = (e) => {
    setRollNumber(e.target.value);
  };


  const handleAddOrDeleteStudent = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const endpoint = `${backendUrl}removestudentnumber`;
    try {
      const response = await axios.post(endpoint, {
        batch_id:selectedBatchGroup.value,
        technology_id:selectedTechnologyGroup.value,
        course_id:selectedGroup.value,
        batch_name: selectedBatchGroup.label,
        student_number: rollNumber,
      });
      alert(
        
           "Roll number has been successfully removed from the batch."
         
      );
      
    } catch (error) {
      console.error("Error in adding or deleting student:", error);
    }
  };

  const optionGroup = courseData.map((ele) => ({
    label: ele.course_name,
    value: ele._id,
  }));

  const technologyOptionGroup = technologyData.map((ele) => ({
    label: ele.technology_name,
    value: ele._id,
  }));

  const batchOptionGroup = batchData.map((ele) => ({
    label: ele.batch_name,
    value: ele._id,
  }));

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Search Student in Batch</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <Label>Select Course</Label>
                    <Select
                      value={selectedGroup}
                      onChange={setSelectedGroup}
                      options={optionGroup}
                      classNamePrefix="select2-selection"
                    />
                  </Col>
                  <Col md="6">
                    <Label>Select Technology</Label>
                    <Select
                      value={selectedTechnologyGroup}
                      onChange={setSelectedTechnologyGroup}
                      options={technologyOptionGroup}
                      classNamePrefix="select2-selection"
                    />
                  </Col>
                </Row>
  <br/>
                <Row>
                  <Col lg="6">
                    <Label>Select Batch</Label>
                    <Select
                      value={selectedBatchGroup}
                      onChange={setSelectedBatchGroup}
                      options={batchOptionGroup}
                      classNamePrefix="select2-selection"
                    />
                  </Col>
                
                  <Col md="6">
                    <FormGroup>
                      
                      <Label>Roll Number</Label>
                      <Input
                        type="text"
                        name="rollNumber"
                        id="rollNumber"
                        placeholder="Enter Roll Number"
                        value={rollNumber}
                        onChange={handleRollNumberChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* <Button type="button" color="primary" onClick={checkStudent}>
                  Check Roll Number
                </Button> */}

                {rollNumber && selectedBatchGroup && (
                  <Button
                    type="button"
                    color={isRollNumberExist ? "danger" : "success"}
                    onClick={handleAddOrDeleteStudent}
                    disabled={isLoading}
                    className="ml-2 ms-3"
                  >
                    {isRollNumberExist ? "Delete" : "Add"} Roll Number
                  </Button>
                )}
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setBreadcrumbItems: (title, items) =>
    dispatch(setBreadcrumbItems(title, items)),
});

export default connect(null, mapDispatchToProps)(FindStudentInBatch);
