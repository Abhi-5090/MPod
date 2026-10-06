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

  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (authUser) {
      setUser(authUser);
      setBranches(authUser.branch); 
      setCollege(authUser.college);
    }
  }, []);

  useEffect(() => {
    if (branches && college) {
      fetchTotalCount(branches, college);
    }
  }, [branches, college]);

  const fetchTotalCount = async (branches, college) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'codingStatisticsData', {
        branches,
        college,
      });
      if (response.status === 200) {
        const data = response.data[0]; // Assuming you're receiving an array with one object
        setCodingStatistics({
          totalCount: data.totalCount,
          cCount: data.cCount,
          cppCount: data.cppCount,
          javaCount: data.javaCount,
          pythonCount: data.pythonCount
        });
      } else {
        toast.error("Failed to fetch total Count data.");
      }
    } catch (error) {
      toast.error("Error fetching total Count data. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };


  return (
    <React.Fragment>
      <div>  
        <Container fluid>
          <div className="breadcrumbs">
            <h5>Dashboard</h5>
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
                        <h3 className='d-flex justify-content-center'>Total Count</h3>
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
