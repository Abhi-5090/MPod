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
import LastMonth  from "../../assets/images/student-explore-images/owl solved 1-1.png"
import Points  from "../../assets/images/student-explore-images/Growth_00000010275924046360497000000003376154519618690215_.png"
import Easy  from "../../assets/images/student-explore-images/Frame 1171275419.png"
import Medium  from "../../assets/images/student-explore-images/Frame 1171275420.png"
import Hard  from "../../assets/images/student-explore-images/Frame 1171275421.png"
import Problems  from "../../assets/images/student-explore-images/Teamwork.png"
import TotalTime  from "../../assets/images/student-explore-images/alarm clock.png"





const StudentExplore = (props) => {
  document.title = "Student Explore";

  const roll_no = props.searchTerm;

  const sectionTitleStyle = {
    color: '#008738',
  }; 

  const dashboardContainerStyle = {
    padding: '10px',
    width: '100%',
    borderRadius: '10px',
    border: '1px solid #008738',
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

  // console.log("roll_no" + roll_no)

  const [data, setData] = useState();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;


  useEffect(()=> {
    fetchData(); //fetching Data
  },[])


  const fetchData = async() => {
    try{
      const response = await axios.post(backendUrl+"get-student-problems-count-dashboard",{roll_no : roll_no});
      if(response.status == 200){
        setData(response.data);
      }
    }
    catch(err){
      console.log(err);
    }
  }

  // console.log(data)


  return (
      <React.Fragment>
          <Row className="Programming hoot-dark-test" style={dashboardContainerStyle}>
              <Row className='mt-2'>
                <h3 style={sectionTitleStyle}>Owl Coder</h3>
              </Row>
              <Row className="mt-2">
                <Col Col md="4" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Rank</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={4}><img src={Rank} alt="trophy"/></Col>
                        {/* <Col></Col> */}
                        <Col md={8} style={textAlign}>{data?data.rank:0}</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col Col md="4" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Problems</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Problems} alt="Problems"/></Col>
                        {/* <Col></Col> */}
                        <Col md={6} style={textAlign}>{data?data.total:0}</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col Col md="4" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Points</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Points} alt="trophy"/></Col>
                        {/* <Col></Col> */}
                        <Col md={6} style={textAlign}>{data?data.score:0}</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col Col md="4" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Easy</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Easy} alt="Easy"/></Col>
                        {/* <Col></Col> */}
                        <Col md={6} style={textAlign}>{data?data.easy:0}</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col Col md="4" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Medium</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Medium} alt="Medium"/></Col>
                        {/* <Col></Col> */}
                        <Col md={6} style={textAlign}>{data?data.medium:0}</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col Col md="4" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Hard</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Hard} alt="Hard"/></Col>
                        {/* <Col></Col> */}
                        <Col md={6} style={textAlign}>{data?data.hard:0}</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col Col md="4" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Total Time</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={2}><img src={TotalTime} alt="TotalTime"/></Col>
                        {/* <Col></Col> */}
                        <Col md={10} style={textAlign}>{data?data.totalTimer:0}</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col Col md="4" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Last Month</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={LastMonth} alt="LastMonth"/></Col>
                        {/* <Col></Col> */}
                        <Col md={6} style={textAlign}>{data?data.per_last_month:0}</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col Col md="4" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Last Week</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={LastMonth} alt="LastMonth"/></Col>
                        {/* <Col></Col> */}
                        <Col md={6} style={textAlign}>{data?data.per_last_week:0}</Col>
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


