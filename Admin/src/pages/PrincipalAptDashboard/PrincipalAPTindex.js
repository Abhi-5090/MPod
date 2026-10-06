import React, { useEffect, useState } from 'react';

import { connect } from "react-redux";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Label,
  Button
} from "reactstrap"

import Select from "react-select";

import APTcards from "./Aptcards"
import TotalAPTCountCards from "./TotalAPTCountCards"
import { setBreadcrumbItems } from "../../store/actions";

const Dashboard = (props) => {

  const [user, setUser] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null); // Changed to null to check for initial state
  const [selectedBranch, setSelectedBranch] = useState(null); //
  const [branchOptions, setBranchOptions] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false); // New state to track form submission

  const collegeOptions = [
    { value: "AEC", label: "AEC" },
    { value: "AUS", label: "AUS" },
    { value: "ACET", label: "ACET" },
  ];

  const collegeBranchMapping = {
    AEC: [
      { value: "CSE", label: "CSE" },
      { value: "ECE", label: "ECE" },
      { value: "IT", label: "IT" },
      { value: "CIV", label: "CIV" },
      { value: "EEE", label: "EEE" },
      { value: "AIML", label: "AIML" },
      { value: "DS", label: "DS" },
      { value: "AG", label: "AG" },
      { value: "MCA", label: "MCA" },
    ],
    AUS: [
      {value: "CIVIL", label: "CIVIL" },
      {value: "IT", label: "IT" },
      {value: "AG", label: "AG" },
      {value: "AIML1", label: "AIML1" },
    
      {value: "ECE1", label: "ECE1" },
      {value: "Civil", label: "Civil" },
      {value: "BBA", label: "BBA" },
      {value: "AIML", label: "AIML" },
      {value: "CM", label: "CM" },
      {value: "CE", label: "CE" },
      {value: "PET", label: "PET" },
      {value: "CIV", label: "CIV" },
      {value: "MEC", label: "MEC" },
      {value: "ME", label: "ME" },
      {value: "EEE", label: "EEE" },
      {value: "ECE", label:"ECE"  },
      {value: "PT", label:"PT"  },
      {value: "AIML2", label:"AIML2" },
      {value: "MECH", label:"MECH" },
      {value: "CIVIL ", label:"CIVL" },
      {value: "CSE2", label:"CSE2" },
      {value: "DS", label:"DS" },
      {value: "IOT", label:"IOT" },
      {value: "CSE", label:"CSE" },
      {value: "ECE2", label:"ECE2" },
    ],
    ACET: [
      { value: "CSE", label: "CSE" },
      { value: "CSE1", label: "CSE1" },
      { value: "CSE2", label: "CSE2" },
      {value: "EEE", label: "EEE" },
      {value: "ECE", label: "ECE" },
      {value: "ECE1", label:"ECE1" },
      {value: "ECE2", label:"ECE2" },
      { value: "AIML", label: "AIML" },
      { value: "AIML1", label: "AIML1" },
      { value: "AIML2", label: "AIML2" },
      { value: "CE", label: "CE" },
      { value: "CIV", label: "CIV" },
      { value: "CIVL", label: "CIVL" },
      { value: "IT", label: "IT" },
      {value: "IOT", label:"IOT" },
      { value: "DS", label: "DS" },
      { value: "MECH", label: "MECH" },
    ],
  };

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding' ||authUser.role == 'Principal' ||authUser.role == 'faculty' ||authUser.role == 'hod') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    setUser(authUser)

  }, [])



  document.title = "Dashboard | Technical Hub";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "APT LOGIC Dashboard", link: "#" }
  ]

  useEffect(() => {
    props.setBreadcrumbItems('APT LOGIC Dashboard', breadcrumbItems)
  },)

  const handleSelectCollege = (selectedOption) => {
    setSelectedCollege(selectedOption);
    setSelectedBranch(null); // Reset branch selection
    if (selectedOption) {
      setBranchOptions(collegeBranchMapping[selectedOption.value] || []);
    }
  };

  const handleSelectBranch = (selectedOption) => {
    setSelectedBranch(selectedOption);
  };

  // Ensure both college and branch are selected before showing content
  // const isSelectionComplete = selectedCollege && selectedBranch;

  const handleSubmit = () => {
    if (selectedCollege && selectedBranch) {
      setFormSubmitted(true);
    } else {
      alert("Please select both college and branch before submitting.");
    }
  };


  return (
    <React.Fragment>
      <CardBody className="justify-content-between align-items-center">
        <Row>
          <Col lg="3" className="mb-3">
            <Label>College</Label>
            <Select
              onChange={handleSelectCollege}
              options={collegeOptions}
            // classNamePrefix="select2-selection"
            />
          </Col>
          <Col lg="3" className="mb-3">
            <Label>Select Branch</Label>
            <Select
              onChange={handleSelectBranch}
              options={branchOptions}
              classNamePrefix="select2-selection"
            />
          </Col>
          <Col lg="3" className="mb-3 d-flex mt-4 align-items-center">
            <Button color="primary" type="button" onClick={handleSubmit}>
              Submit
            </Button>
          </Col>
        </Row>
      </CardBody>

      {/* Render content only if form is submitted */}
      {formSubmitted ? (
        <>
          <Row>
            <Col xl="12">
              <TotalAPTCountCards
                selectedCollege={selectedCollege}
                selectedBranch={selectedBranch}
              />
            </Col>
          </Row>
          <Row>
            <Col xl="12">
              <APTcards
                selectedCollege={selectedCollege}
                selectedBranch={selectedBranch}
              />
            </Col>
          </Row>

        </>
      ):(
        <><div className="text-center">
        <div  style={{height: "20px", marginTop: "250px"}}>
          <h4>No data found</h4>
        </div></div></>
      )}
    </React.Fragment>

  )
}

export default connect(null, { setBreadcrumbItems })(Dashboard);