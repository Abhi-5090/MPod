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
import Rank  from "../../assets/images/student-explore-images/Trophy.png"
import Reading  from "../../assets/images/student-explore-images/08 Read.png"
import Speaking  from "../../assets/images/student-explore-images/18-volume_1.png"
import Writing  from "../../assets/images/student-explore-images/36-typewriter 1 6.png"
import Listening  from "../../assets/images/student-explore-images/47-podcast_1.png"





const StudentExplore = (props) => {
  document.title = "Student Explore";

 
  // console.log(props.searchTerm)

  const sectionTitleStyle = {
    color: '#008738',
  }; 

  const dashboardContainerStyle = {
    padding: '10px',
    width: '100%',
    borderRadius: '10px',
    border: '1px solid #f8b81f ',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  };
  const cardStyle = {
    borderRadius: '10px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.3)',
    fontSize : '0.7rem'
  };

  const cardTitleStyle = {
    color: '#333',
    fontWeight: 'bold',
  };

  const textAlign = {
    textAlign:'right',
    color:"#008738",
    fontSize: '0.9rem',
    fontWeight:'500'
  }
  
  const para = {
    fontWeight:'bold'
  }


  return (
      <React.Fragment>
          <Row className="Programming hoot-dark-test" style={dashboardContainerStyle}>
              <Row className="mt-2">
                <h3 style={sectionTitleStyle}>Hoot</h3>
              </Row>
              <Row className="mt-2">
                <Col md="6" >
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Listening</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Listening} alt="Listening "/></Col>
                        <Col md={6} style={textAlign}>82%</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col md="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Speaking</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Speaking} alt="Speaking"/></Col>
                        <Col md={6} style={textAlign}>85%</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col md="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Reading</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Reading} alt="Reading"/></Col>
                        <Col md={6} style={textAlign}>82%</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col md="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Writing</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Writing} alt="Writing"/></Col>
                        <Col md={6} style={textAlign}>85%</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
          </Row>
      </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(StudentExplore);


