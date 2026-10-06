import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select";

import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../../store/actions";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import Switch from "react-switch";
const EditAssessment = (props) => {
  document.title = "Technical Hub | Edit Assessment";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Reasoning Mandatory Tests", link: "/reasoning-mandatory-tests" },
    { title: "Edit Assessment", link: "/add-mandatory-test" },
  ];
  const [data, setData] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [switch3, setSwitch3] = useState(true);
  const navigate = useNavigate();
  let assessment = useParams();

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

  useEffect(() => {
    props.setBreadcrumbItems("Edit Assessment", breadcrumbItems);
    fetchAssessmentData();
  }, []);

  const fetchAssessmentData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(
        backendUrl + "get-reasoning-mandatory-test-by-id/" + assessment.testId
      );
      if (response.status === 200) {
        setData(response.data[0]);
        setSwitch3(response.data[0].status === 1);
      }
    } catch (error) {
      console.log("Error fetching assessment data:", error);
    }
  };


  const levelOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];

  

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleLevelSelect = (selectedLevel) => {
    setSelectedLevel(selectedLevel);
  };

  useEffect(() => {
    if (data.level) {
      const initialSelectedGroup = levelOptions.find((ele) => ele.value === data.level);
      setSelectedLevel(initialSelectedGroup);
    }
  }, [data.level]);

  const Offsymbol = (props) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
          paddingRight: 2
        }}
      >
        No
      </div>
    );
  };

  const OnSymbol = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
          paddingRight: 2
        }}
      >
        Yes
      </div>
    );
  };
  const editAssessment = async () => {
    const newStatus = switch3 ? 1 : 0;
    const data_values = {
      level: selectedLevel.value,
      questions_count: data.questions_count,
      test_name: data.test_name,
      test_description: data.test_description,
      status: newStatus,
    }
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'update-reasoning-mandatory-test/' + assessment.testId, data_values);
      if (response.status == 409) {
        alert("assessment name already exist")
      }
      if (response.status == 200) {
        alert("success");
        navigate(`/reasoning-mandatory-tests`)
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("Assessment name already exists");
      } else {
        console.error('Error fetching data:', error);
      }
    }
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Row>
            <Col xl="6">
              <Card>
                <CardBody>
                  <AvForm className="needs-validation" onSubmit={editAssessment}>
                    <Row>
                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom01">Test Name</Label>
                          <AvField
                            name="test_name"
                            placeholder="Enter Test name"
                            type="text"
                            errorMessage="Enter test name"
                            className="form-control"
                            validate={{ required: { value: true } }}
                            id="validationCustom01"
                            value={data.test_name}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom01">Test Description</Label>
                          <AvField
                            name="test_description"
                            placeholder="Test Description"
                            type="text"
                            errorMessage="Enter test description"
                            className="form-control"
                            validate={{ required: { value: true } }}
                            id="validationCustom01"
                            value={data.test_description}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                      
                    </Row>
                    <Row>
                      
                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom03">Level</Label>
                          <Select
                            name="level"
                            placeholder="Select Level" 
                            classNamePrefix="select2-selection"
                            value={selectedLevel}
                            onChange={handleLevelSelect}
                            options={levelOptions}
                          />
                        </FormGroup>
                      </Col>
                      <Col mb="3">
                        <FormGroup>
                          <Label htmlFor="validationCustom01">No Of Questions</Label>
                          <AvField
                            name="questions_count"
                            placeholder="Enter Number Of Questions"
                            type="number"
                            errorMessage="Enter Number Of Questions"
                            className="form-control"
                            validate={{ required: { value: true } }}
                            id="validationCustom01"
                            value={data.questions_count}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>

                      <Col md="6">
                        <div className="mb-3">
                          <Label htmlFor="validationCustom01">Status</Label>&nbsp;&nbsp;&nbsp;&nbsp;<br />
                          <Switch
                            uncheckedIcon={<Offsymbol />}
                            checkedIcon={<OnSymbol />}
                            onColor="#02a499"
                            onChange={() => {
                              setSwitch3(!switch3)
                            }}
                            checked={switch3}
                          />
                          &nbsp;
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Button type="submit" color="primary" className="mr-1">Update Assessment</Button>
                        </FormGroup>
                      </Col>
                    </Row>
                  </AvForm>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditAssessment);
