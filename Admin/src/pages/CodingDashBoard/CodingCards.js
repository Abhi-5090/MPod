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
  const [codingStatistics, setCodingStatistics] = useState({
    totalCount: 0,
    cCount: 0,
    cppCount: 0,
    javaCount: 0,
    pythonCount: 0
  });
  const [yesterdayStatistics, setYesterdayStatistics] = useState({
    totalCount: 0,
    cCount: 0,
    cppCount: 0,
    javaCount: 0,
    pythonCount: 0
  });
  const [loading, setLoading] = useState(true); // Loading state

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


  // console.log(user)
  useEffect(() => {
    if (branches && college) {
      fetchTodayCount(branches, college);
      fetchYesterdayCount(branches, college);
    }
  }, [branches, college]);

  const fetchTodayCount = async (branches, college) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'codingStatisticsToday', {
        branches,
        college,
      });
      if (response.status === 200) {
        const data = response.data; // Assuming you're receiving an array with one object
        // console.log(data);
        setCodingStatistics({
          totalCount: data.total_count,
          cCount: data.languages_c,
          cppCount: data.languages_cpp,
          javaCount: data.languages_java,
          pythonCount: data.languages_python
        });
      } else {
        toast.error("Failed to fetch today's data.");
      }
    } catch (error) {
      toast.error("Error fetching today's data. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const fetchYesterdayCount = async (branches, college) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'codingStatisticsYesterday', {
        branches,
        college,
      });
      if (response.status === 200) {
        const data = response.data; // Assuming you're receiving an object
        setYesterdayStatistics({
          totalCount: data.total_count,
          cCount: data.languages_c,
          cppCount: data.languages_cpp,
          javaCount: data.languages_java,
          pythonCount: data.languages_python
        });
      } else {
        toast.error("Failed to fetch yesterday's data.");
      }
    } catch (error) {
      toast.error("Error fetching yesterday's data. Please try again.");
    }
  };

  return (
    <React.Fragment>
      <div>  
        <Container fluid>
          <div className="breadcrumbs">
            {/* <h5>Dashboard</h5> */}
          </div>
          <div style={{ backgroundColor: "white", padding: "15px", boxShadow: "1px 1px 3px 3px #d3d3d3", borderRadius:'10px' }}>
            {loading ? (
              <Row className="justify-content-center">
                <Spinner color="primary" /> {/* Loading Spinner */}
              </Row>
            ) : (
              <>
                <Row>
                  <Col xl={2} md={6}>
                  <Card>
                      <CardBody>
                        <h3 className='d-flex justify-content-center'>Today</h3>
                        <div style={{ float: 'right' }}>
                          <h5 className="text-white mb-0 mt-1"></h5>
                        </div>
                      </CardBody>
                  </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Total</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{codingStatistics.totalCount?codingStatistics.totalCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        {/* <h4 className='text-white'><img height={50} width={50} src={C}/></h4> */}
                        <h4 className='text-white'>C</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{codingStatistics.cCount?codingStatistics.cCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Cpp</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{codingStatistics.cppCount?codingStatistics.cppCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Java</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{codingStatistics.javaCount?codingStatistics.javaCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Python</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{codingStatistics.pythonCount?codingStatistics.pythonCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  {/* <Col xl={1} md={6}></Col> */}
                </Row>
                <Row>
                <Col xl={2} md={6}>
                  <Card>
                      <CardBody>
                        <h3 className='d-flex justify-content-center'>Yesterday</h3>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1"></h3>
                        </div>
                      </CardBody>
                  </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Total</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{yesterdayStatistics.totalCount?yesterdayStatistics.totalCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>C</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{yesterdayStatistics.cCount?yesterdayStatistics.cCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Cpp</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{yesterdayStatistics.cppCount?yesterdayStatistics.cppCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Java</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{yesterdayStatistics.javaCount?yesterdayStatistics.javaCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Python</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{yesterdayStatistics.pythonCount?yesterdayStatistics.pythonCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}></Col>
                </Row>
              </>
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
