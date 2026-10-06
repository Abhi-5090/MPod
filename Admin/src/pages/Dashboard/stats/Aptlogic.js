import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Label } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../../store/actions";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import * as XLSX from 'xlsx'; 
import { saveAs } from 'file-saver';
import Flatpickr from "react-flatpickr";
import Rank  from "../../../assets/images/student-explore-images/Trophy.png"
import Assessment  from "../../../assets/images/student-explore-images/Group.png"
import PracticeTests  from "../../../assets/images/student-explore-images/04-Exam.png"
import TotalTime  from "../../../assets/images/student-explore-images/alarm clock.png"
import Attendance  from "../../../assets/images/student-explore-images/Attendance 1.png"
import LastMonth  from "../../../assets/images/student-explore-images/owl solved 1-1.png"
import Shorts  from "../../../assets/images/student-explore-images/exam A+ score.png"



const StudentExplore = (props) => {
  document.title = "Student Explore";


const roll_no = props.roll_no;
const student_id = props.studentId;
 

  const sectionTitleStyle = {
    color: '#008738',
  }; 

  const dashboardContainerStyle = {
    padding: '10px',
    width: '100%',
    // borderRadius: '10px',
    // border: '1px solid #008738',
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

  const [practiceTestsData, setPracticeTestsData] = useState();
  const [assessmentTestsData, setAssessmentTestsData] = useState();
  const [weeklyMonthlyTests, setWeeklyMonthlyTests] = useState({});
  const [overallTrainingDuration,setOverallTrainingDuration] = useState();
  const [userCollection, setUserCollection] = useState();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;



  //fetch practice tests data
  useEffect(() => {
    const fetchPracticeTests = async() => {
      try{
      const response = await axios.post(backendUrl+'get-apt-practise-totalstats-by-studentid',{student_id: student_id});
      if(response.status == 200){
        // console.log(response.data);
        setPracticeTestsData(response.data);
        }
      }
      catch(error){ 
        console.log(error);
      }
    }
    fetchPracticeTests();

    //fetching assessment Tests
    const fetchAssessmentTests = async() => {
      try{
      const response = await axios.post(backendUrl+'get-apt-mandatory-totalstats-by-studentid',{student_id: student_id});
      if(response.status == 200){
        // console.log(response.data);
        setAssessmentTestsData(response.data);
        }
      }
      catch(error){ 
        console.log(error);
      }
    }
    fetchAssessmentTests();


    //fetch weeklymonthly tests count
    const getWeeklyMonthlyTests = async () => {
      try {
          let counts = await axios.post(backendUrl + "get-week-month-yearly-practise-test-counts", { student_id: student_id })

          if (counts.status === 200) {
              setWeeklyMonthlyTests(counts.data)
              // console.log(counts.data)
          }
      } catch (err) {
          console.log(err)
      }
  }

  getWeeklyMonthlyTests()


  //fetching technologyid, courseid and batch id by student id
  const fetchingUserCollection = async() => {
    try{
      const user = await axios.get(backendUrl+"get-user-technology-by-id/"+student_id)
      if(user.status === 200){
        setUserCollection(user.data);
        // console.log(user.data)
      //fetching total duration
      let training_attendance = await axios.post(backendUrl + "get-total-attended-hours-by-technology", 
        { 
          batch_id : user.data.batch, 
          course_id : user.data.course,
          technology_id : user.data.technology,
          student_id : student_id
        }
      )
      if (training_attendance.status === 200) {
        setOverallTrainingDuration({
            duration: training_attendance.data.duration
        })
        console.log(training_attendance.data)
      }
        }
    }
    catch(error){
      console.log(error);
    }
  }
  fetchingUserCollection();
},[student_id])


  return (
      <React.Fragment>
          <Row className="Programming hoot-dark-test" style={dashboardContainerStyle}>
              <Row className="mt-2">
                <h3 style={sectionTitleStyle}>Apt Logic</h3>
              </Row>
              <Row className="mt-2">
                <Col md="6" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Total Submissions</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Attendance} alt="Attendance"/></Col>
                        {/* <Col></Col> */}
                        <Col md={6} style={textAlign}>1000000</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col md="6" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Total Time</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={4}><img src={TotalTime} height="30px" alt="trophy"/></Col>
                        <Col md={8} style={textAlign}>
                          <span>
                          <span className="app_topic_title_name_ladder master">
                                    {
                                        String(Math.floor(((practiceTestsData?.duration || 0) + (assessmentTestsData?.duration || 0) + (overallTrainingDuration?.duration || 0)) / 3600)).padStart(2, '0') + ":" +
                                        String(Math.floor((((practiceTestsData?.duration || 0) + (assessmentTestsData?.duration || 0) + (overallTrainingDuration?.duration || 0)) % 3600) / 60)).padStart(2, '0') + ":" +
                                        String(Math.floor(((practiceTestsData?.duration || 0) + (assessmentTestsData?.duration || 0) + (overallTrainingDuration?.duration || 0)) % 60)).padStart(2, '0')
                                    }
                                </span>
                          </span>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row> 
                <Col md="6" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Mandatory Tests</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={Assessment} alt="Assessment"/></Col>
                        <Col md={6} style={textAlign}>{assessmentTestsData?assessmentTestsData.total_attempts:0}</Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>  
                <Col md="6" sm="6">
                  <Card style={cardStyle}>
                    <CardBody>
                      <Row><p style={para}>Practice Tests</p></Row>
                      <Row className="d-flex justify-content-center align-items-center">
                        <Col md={6}><img src={PracticeTests} alt="PracticeTests"/></Col>
                        <Col md={6} style={textAlign}>{practiceTestsData?practiceTestsData.total_attempts:0}</Col>
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


