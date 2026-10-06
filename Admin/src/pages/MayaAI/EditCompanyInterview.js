import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  CardTitle,
  InputGroup,
  Input,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import Flatpickr from "react-flatpickr"
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"

const EditInterview = (props) => {
  document.title = "Technial Hub | Edit Interview";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Interviews List", link: "/ai-interviews-list" },
    { title: "Edit Interview", link: "/add-ai-interview" },
  ];

  const [data, setData] = useState({});

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [companies, setCompanies] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const [interviewDetails, setInterviewDetails] = useState();
  const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [user, setUser] = useState()
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState();

  useEffect(() => {
    props.setBreadcrumbItems('Edit Interview', breadcrumbItems);
    fetchCompanies();

  }, []);
  useEffect(() => {
    if (id && companies) {
      fetchDetails();
    }
  }, [id, companies]);
  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("authUser"))
    if (userDetails) {
      setUser(userDetails)
    }
  }, [])
  const fetchDetails = async () => {
    try {
      const response = await axios.get(`${backendUrl}get-company-interview-by-id/${id}`);
      if (response.status === 200) {
        const interviewDetails = response.data;
        setInterviewDetails(interviewDetails);
        setRollNo(interviewDetails.roll_no || "");
        const company = companies.find(c => interviewDetails.company.includes(c._id));
        setSelectedCompany(
          interviewDetails.company.length > 0
            ? companies
                .filter(c => interviewDetails.company.includes(c._id))
                .map(c => ({ label: c.company_name, value: c._id }))
            : []
        );
        
        setSelectedType(
          interviewDetails.type.length > 0
            ? typeOptions.filter(option => interviewDetails.type.includes(option.value))
            : []
        );
        
        setSelectedRound(
          interviewDetails.round.length > 0
            ? roundOptions.filter(option => interviewDetails.round.includes(option.value))
            : []
        );
        setSelectedPlatform(
          platformOptions.find(option => option.value === interviewDetails.platform) || null
        );
        setStartDate(interviewDetails.start_date_time || null);

        setData({ no_of_questions: interviewDetails.questions_count || "" });
      }
    } catch (err) {
      console.log("Error fetching interview details:", err);
    }
  };
  const fetchCompanies = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_MPOD_BACKEND_URL + 'companies-list');
      if (response.status === 200) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  const companyOptions = companies.map(company => ({
    label: company.company_name,
    value: company._id
  }));
  const levelOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
    { label: "Any", value: "any" },

  ];
  const roundOptions = [
    { label: "TR1", value: "TR1" },
    { label: "TR2", value: "TR2" },
    { label: "TR3", value: "TR3" },
    { label: "TR4", value: "TR4" },
    { label: "MR1", value: "MR1" },
    { label: "HR1", value: "HR1" },

  ];
  const typeOptions = [
    { label: "Service Based", value: "service_based" },
    { label: "Product Based", value: "product_based" }
  ];
  const platformOptions = [
    { label: "Web", value: "web" },
    { label: "MPOD", value: "mpod" },

  ];
  const handleChange = (e) => {
    setData({ ...data, no_of_questions: e.target.value });
  };
  const handleRollNoChange = (e) => {
    const { value } = e.target;
    setRollNo(value);
  };
  const handlePlatformSelect = (selectedplatform) => {
    console.log(selectedplatform)
    setSelectedPlatform(selectedplatform);
  };
  const handleSubmit = async () => {
    const utcDate = new Date(startDate).toISOString();

    const dataList = {
      platform: selectedPlatform.value,
      company: selectedCompany ? selectedCompany.map(item => item.value) : [], // Convert to array of IDs
      roll_no: rollNo,
      round: selectedRound ? selectedRound.map(item => item.value) : [], // Convert to array
      start_date_time: utcDate,
      type: selectedType ? selectedType.map(item => item.value) : [], // Convert to array
      questions_count: data.no_of_questions,
      created_by: user ? user.roll_no : "null"
    };
  
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    
    try {
      const response = await axios.put(`${backendUrl}update-company-interview/${id}`, dataList);
      
      if (response.status === 200) {
        console.log(response.data);
        alert("Interview updated successfully!");
        navigate(`/company-interviews-list`);
      }
    } catch (error) {
      console.error('Error updating interview:', error);
      alert("Failed to update interview. Please try again.");
    }
  };
  
  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Edit Company Interview</h4>

              <AvForm className="needs-validation">
              <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Platform</Label>
                      <Select
                        value={selectedPlatform}
                        onChange={handlePlatformSelect}
                        options={platformOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Enter Roll No</Label>
                      <Input
                        type="text"
                        name="roll_no"
                        placeholder="Enter Roll No"
                        value={rollNo}
                        onChange={handleRollNoChange}
                        required
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <Label>Select Company</Label>
                    <Select value={selectedCompany} onChange={setSelectedCompany} options={companyOptions} classNamePrefix="select2-selection" isMulti />
                  </Col>

                </Row>
                <Row>
                  <Col md="6">
                    <Label>Select Type</Label>
                    <Select
                      value={selectedType}
                      onChange={setSelectedType}
                      options={typeOptions}
                      classNamePrefix="select2-selection"
                      isMulti
                    />
                  </Col>
                  <Col md="6">
                    <Label>Select Round</Label>
                    <Select
                      value={selectedRound}
                      onChange={setSelectedRound}
                      options={roundOptions}
                      classNamePrefix="select2-selection"
                      isMulti
                    />
                  </Col>

                </Row>
                <Row style={{ marginTop: "20px" }}>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">No. of Questions</Label>
                      <AvField
                        name="no_of_questions"
                        placeholder="No.of Questions "
                        type="number"
                        errorMessage="Enter no. of questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.no_of_questions}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>Start Date and Time</Label>
                        <InputGroup>
                        <Flatpickr
                            value={startDate}
                            className="form-control d-block"
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              altInput: true,
                              altFormat: "F j, Y h:i K",
                              onChange: function (selectedDates) {
                                if (selectedDates.length > 0) {
                                  setStartDate(selectedDates[0]);
                                }
                              }
                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                </Row>

                <Button color="primary" type="button" onClick={handleSubmit}>
                  Update
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditInterview);