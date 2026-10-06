import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Button } from "reactstrap";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

import Profile from "./Profile.js";
import Programming from "./Programming.js";
import Owlcoder from "./Owlcoder.js";
import Aptlogic from "./Aptlogic.js";
import Hoot from "./Hoot.js";

const StudentExplore = (props) => {
  document.title = "Student Explore";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Student Explore", link: "#" },
    { title: "Explore", link: "#" },
  ];

  useEffect(() => {
    props.setBreadcrumbItems('Student Explore', breadcrumbItems);
  }, []);

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

  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentId , setStudentId] = useState();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleSearch = async () => {
    if (searchTerm) {
      try {
        const response = await axios.post(`${backendUrl}get-student-id-by-rollno`, { roll_no: searchTerm });
        if (response.status === 200) {
          // console.log(response.data)
          setStudentId(response.data.objectId)
          setDashboardVisible(true); 
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          toast.error("Roll number not found!", { transition: Bounce });
        } else {
          console.error("An error occurred:", error);
        }
      }
    } else {
      toast.warning("Please enter a search term", { transition: Bounce });
    }
  };

  return (
    <React.Fragment>
      <ToastContainer />
      {!dashboardVisible ? (
        <Row className="mt-4 d-flex justify-content-center">
          <Col className="col-3 d-flex justify-content-center">
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '4px', fontSize: '16px', marginRight: '10px' }}
              />
              <Button onClick={handleSearch} type="button" color="primary" className="waves-effect waves-light" style={{ padding: '2px 16px', fontSize: '16px' }}>Find</Button>
            </div>
          </Col>
        </Row>
      ) : (
        <>
          <Profile searchTerm={searchTerm} />
          <Programming searchTerm={searchTerm} />
          <Row className='mt-4'>
            <Col lg={5} sm={6}>
              <Owlcoder searchTerm={searchTerm} />
            </Col>
            <Col lg={4} sm={6}>
              <Aptlogic searchTerm={searchTerm} studentId = {studentId} />
            </Col>
            {/* <Col lg={3} sm={6}>
              <Hoot searchTerm={searchTerm} />
            </Col> */}
          </Row>
        </>
      )}
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(StudentExplore);
