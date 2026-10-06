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
  

  const driveReadyBadge = {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#FFCC00', /* A bright yellow to stand out */
    color: '#333', /* Dark text for contrast */
    fontWeight: 'bold',
    fontSize: '1rem',
    borderRadius: '20px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  }


  const profile = {
    borderRadius : "100px",
    border : 'solid 1px black',
    width : '100px',
    height : '100px',
  }


  const profileContainer = {
    borderRadius: "50%",
    border: "solid 1px black",
    width: "150px",
    height: "150px",
    overflow: "hidden", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  
  const profileImage = {
    width: "100%",
    height: "auto", // Ensures the image maintains its aspect ratio
    objectFit: "cover", // Ensures the image covers the container properly
  };
  

  const [violationsCount, setViolationsCount] = useState();
  const [currentStreak, setCurrentStreak] = useState();
  const [data, setData] = useState({})
  const [name,setName] = useState();
  const [college,setCollege] = useState();
  const [branch, setBranch] = useState();
  const [passoutYear, setPassoutYear] = useState();
  const [coursesCount,setCoursesCount] = useState();
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [status, setStatus] = useState();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [imageIndex, setImageIndex] = useState(0);

  // List of URLs to try in order
  const imageUrls = [
    `https://mobile.technicalhub.io:5010/uploads/students-images/${roll_no}.png`,
    `https://thecodemind.io/app/studentpics/${roll_no}.jpg`,
    `https://thecodemind.io/app/studentpics/${roll_no}.png`,
    `https://info.aec.edu.in/adityacentral/studentphotos/${roll_no}.jpg`
 
  ];




  useEffect(()=>{
  
    const fetchStudentDetails = async() => {
      try{
        const response = await axios.post(backendUrl+"get-student-by-rollno", {roll_no:roll_no});
        if(response.status == 200){
          console.log(response.data);
          console.log(response.data.current_courses);
          setData(response.data)
          setBranch(response.data.branch[0]);
          setCoursesCount(response.data.current_courses.length);
          setCourses(response.data.current_courses)
          console.log(response.data.current_courses)
        }
      }
      catch(error){
        console.log(error)
      }
    }
    fetchStudentDetails();


  //fetch current streak Count
    const fetchCurrentStreak= async() => {
      try{
        const response = await axios.get(backendUrl+"get-overall-streak-and-attendnace-percentage",{roll_no:roll_no});
        if(response.status == 200){
          setCurrentStreak(response.data.cur_streak);
            // console.log(response.data.cur_streak);
        }
      }
      catch(error){
        if(error.status == 404){
          console.error("Error fetching current Streak count:", error);
        }
      }
    }
    fetchCurrentStreak();


    const fetchViolationsCount= async() => {
      try{
        const response = await axios.get(backendUrl+"violations-count/"+roll_no);
        if(response.status == 200){
            setViolationsCount(response.data.count);
            // console.log(response.data.count)
        }
      }
      catch(error){
        if(error.status == 404){
          console.error("Error fetching violations count:", error);
         }
      }
    }
    fetchViolationsCount();


  },[])

  const handleError = () => {
    if (imageIndex < imageUrls.length - 1) {
      setImageIndex(imageIndex + 1);
    }
  };
  

  return (
      <React.Fragment>
          <Row className="Programming hoot-dark-test" style={dashboardContainerStyle}>
              <Row className="mt-2 align-items-center">
                <Col md={2} className="d-flex justify-content-center">
                  <div style={profileContainer}>
                    <img
                      src={imageUrls[imageIndex]}
                      alt="Profile_pic"
                      style={profileImage}
                      onError={handleError}
                  />
                  </div>
                </Col>
                <Col md={10}>
                  <Row className="d-flex align-items-center">
                     <Col md={3}>
                        <h3 style={sectionTitleStyle}>Hi, {data.first_name}</h3>
                     </Col>
                     <Col md={9}>
                      {courses.map((course, index) => (
                        <Col md={12} key={index}>
                           <p style={driveReadyBadge}><span>{course.course_name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{course.technology_name}</span></p>
                        </Col>
                      ))}
                     </Col>
                  </Row>
                  
                  <Row className="mt-3">
                      <Col md={2}>
                        <span style={{fontSize : '1rem'}}>College</span><br/>
                        <h5 className="mt-1">{data.college}</h5>
                      </Col>
                      <Col md={1}>
                        <span style={{fontSize : '1rem'}}>Branch</span><br/>
                        <h5 className="mt-1">{branch}</h5>
                      </Col>
                      <Col md={1}>
                        <span style={{fontSize : '1rem'}}>Pass out</span><br/>
                        <h5 className="mt-1">{data.passout_year}</h5>
                      </Col>
                      <Col md={1}>
                        <span style={{fontSize : '1rem'}}>Status</span><br/>
                        <h5 className="mt-1">{(data.status==1)?"Active":"InActive"}</h5>
                      </Col>
                      <Col md={1}>
                        <span style={{fontSize : '1rem'}}>Courses</span><br/>
                        <h5 className="mt-1">{coursesCount}</h5>
                      </Col>
                      <Col md={1}>
                        <span style={{fontSize : '1rem'}}>Desk</span><br/>
                        <h5 className="mt-1">{data?.venue || " "}</h5>
                      </Col>
                      <Col md={1}>
                        <span style={{fontSize : '1rem'}}>Streak</span><br/>
                        <h5 className="mt-1">{currentStreak?currentStreak:0}</h5>
                      </Col>
                      <Col md={1}>
                        <span style={{fontSize : '1rem'}}>Violations</span><br/>
                        <h5 className="mt-1">{violationsCount?violationsCount:0}</h5>
                      </Col>
                  </Row>
                </Col>
              </Row>
          </Row>
      </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(StudentExplore);


