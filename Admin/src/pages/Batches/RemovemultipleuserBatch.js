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
import "react-datepicker/dist/react-datepicker.css";

const FindStudentInBatch = (props) => {
  document.title = "Technical Hub | Find Student in Batch";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Search Student In Batch", link: "/sessions-list" },
  ];

  const [courseData, setCourseData] = useState([]);
  const [technologyData, setTechnologyData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [rollNumber, setRollNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "superadmin")) {
      alert("You are not authorized");
      localStorage.clear();
      window.location.href = "/admin/login";
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems("Remove Multiple Users From the Batch", breadcrumbItems);
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchTechnologies();
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedTechnology) fetchBatches();
  }, [selectedTechnology]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}get-courses`);
      setCourseData(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchTechnologies = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}get-technology-by-course-id`, {
        course_id: selectedCourse.value,
      });
      setTechnologyData(response.data);
    } catch (error) {
      console.error("Error fetching technology data:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}get-batch-by-technology`, {
        technology_id: selectedTechnology.value,
      });
      setBatchData(response.data);
    } catch (error) {
      console.error("Error fetching batch data:", error);
    }
  };

  const handleRemoveStudents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://node.technicalhub.io:4001/api/removestudentnumber", {
        batch_name: selectedBatch?.label || "",
        student_numbers: rollNumber,
        // student_numbers :"4321,321"
        
        
      });
      
      if (response.status === 200) {
        alert("Selected roll numbers have been successfully removed from the batch.");
        setRollNumber("");
      } else {
        alert("Failed to remove roll numbers. Please try again.");
      }
    } catch (error) {
      console.error("Error removing students:", error);
      alert("Failed to remove roll numbers. Please try again.");
    }
    setIsLoading(false);
  };

  // console.log(selectedBatch);
  // console.log(rollNumber);
  
  
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
                      value={selectedCourse}
                      onChange={setSelectedCourse}
                      options={courseData.map(ele => ({ label: ele.course_name, value: ele._id }))}
                      classNamePrefix="select2-selection"
                    />
                  </Col>
                  <Col md="6">
                    <Label>Select Technology</Label>
                    <Select
                      value={selectedTechnology}
                      onChange={setSelectedTechnology}
                      options={technologyData.map(ele => ({ label: ele.technology_name, value: ele._id }))}
                      classNamePrefix="select2-selection"
                    />
                  </Col>
                </Row>
                <br/>
                <Row>
                  <Col lg="6">
                    <Label>Select Batch</Label>
                    <Select
                      value={selectedBatch}
                      onChange={setSelectedBatch}
                      options={batchData.map(ele => ({ label: ele.batch_name, value: ele._id }))}
                      classNamePrefix="select2-selection"
                    />
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label>Roll Number</Label>
                      <Input
                        type="text"
                        name="rollNumber"
                        placeholder="Enter Roll Numbers (comma separated)"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                {rollNumber && selectedBatch && (
                  <Button type="button" onClick={handleRemoveStudents} disabled={isLoading} className="ml-2 ms-3">
                    Remove Students
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
  setBreadcrumbItems: (title, items) => dispatch(setBreadcrumbItems(title, items)),
});

export default connect(null, mapDispatchToProps)(FindStudentInBatch);
