
import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Spinner
} from "reactstrap";
import { withTranslation } from "react-i18next";




const Dashboard = (props) => {
  const [user, setUser] = useState([]);
  const [branches, setBranches] = useState([]);
  const [college, setCollege] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const [aptitudeCount, setAptitudeCount] = useState(""); // State for Aptitude count
  const [reasoningCount, setReasoningCount] = useState(""); // State for Aptitude count
  const [verbalCount, setVerbalCount] = useState(""); // State for Aptitude count

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
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (authUser) {
      setUser(authUser);
      setBranches(authUser.branch); 
      setCollege(authUser.college);
    }
  }, []);


  useEffect(() => {
    if (branches.length > 0 && college) {
      fetchStatisticsAptitude(branches, college);
      fetchStatisticsReasoning(branches, college);
      fetchStatisticsVerbal(branches,college);
    }
  }, [branches, college]);

  // console.log(user)


  const fetchStatisticsAptitude = async (branches, college) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const payload = {
      branches: branches,
      college: college
    };

    try {
      const response = await axios.post(backendUrl + 'apt-total-results', 
        payload
      );
      // console.log(response.data)
      setAptitudeCount(response.data[0].total_count); // Assuming the API response has a count property
      setLoading(false);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Error fetching statistics");
      setLoading(false);
    }
  };


  const fetchStatisticsReasoning = async (branches, college) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const payload = {
      branches: branches,
      college: college
    };

    try {
      const response = await axios.post(backendUrl + 'reasoning-total-results', 
        payload
      );
      // console.log(response.data)
      setReasoningCount(response.data.total_count); // Assuming the API response has a count property
      setLoading(false);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Error fetching statistics");
      setLoading(false);
    }
  };


  const fetchStatisticsVerbal = async (branches, college) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const payload = {
      branches: branches,
      college: college
    };

    try {
      const response = await axios.post(backendUrl + 'verbal-total-results', 
        payload
      );
      // console.log(response.data)
      setVerbalCount(response.data.count); // Assuming the API response has a count property
      setLoading(false);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Error fetching statistics");
      setLoading(false);
    }
  };


  return (
    <React.Fragment>
      <div>  
        <Container fluid>
          <div className="breadcrumbs">
            <h5>Dashboard</h5>
          </div>
          <div style={{ backgroundColor: "white", padding: "15px", boxShadow: "1px 1px 3px 3px #d3d3d3", borderRadius: '10px' }}>
            {loading ? (
              <Row className="justify-content-center">
                <Spinner color="primary" /> {/* Loading Spinner */}
              </Row>
            ) : (
              <Row>
                <Col xl={2} md={6}>
                  <Card>
                    <CardBody>
                      <h3 className='d-flex justify-content-center'>Total Count</h3>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={2} md={6}>
                  <Card style={{ backgroundColor: "#384c60", borderRadius: "10px" }}>
                    <CardBody>
                      <h4 className='text-white'>Total</h4>
                      <div style={{ float: 'right' }}>
                      <h3 className="text-white mb-0 mt-1">{aptitudeCount && reasoningCount && verbalCount?aptitudeCount+reasoningCount+verbalCount:0}</h3>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={2} md={6}>
                  <Card style={{ backgroundColor: "#384c60", borderRadius: "10px" }}>
                    <CardBody>
                      <h4 className='text-white'>Aptitude</h4>
                      <div style={{ float: 'right' }}>
                      <h3 className="text-white mb-0 mt-1">{aptitudeCount?aptitudeCount:0}</h3> {/* Displaying the fetched count */}
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={2} md={6}>
                  <Card style={{ backgroundColor: "#384c60", borderRadius: "10px" }}>
                    <CardBody>
                      <h4 className='text-white'>Reasoning</h4>
                      <div style={{ float: 'right' }}>
                      <h3 className="text-white mb-0 mt-1">{reasoningCount?reasoningCount:0}</h3>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={2} md={6}>
                  <Card style={{ backgroundColor: "#384c60", borderRadius: "10px" }}>
                    <CardBody>
                      <h4 className='text-white'>Verbal</h4>
                      <div style={{ float: 'right' }}>
                      <h3 className="text-white mb-0 mt-1">{verbalCount?verbalCount:0}</h3>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}
          </div>
        </Container>
      </div>
      <ToastContainer transition={Bounce} />
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  t: PropTypes.any,
};

export default withTranslation()(Dashboard);
