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
// import { withTranslation } from "react-i18next";

const Dashboard = (props) => {
  const { selectedCollege, selectedBranch } = props;
  
  

  const [loading, setLoading] = useState(true); // Loading state
  const [aptitudeCount, setAptitudeCount] = useState(0); // Default to 0
  const [reasoningCount, setReasoningCount] = useState(0); // Default to 0
  const [verbalCount, setVerbalCount] = useState(0); // Default to 0

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
    if (selectedBranch && selectedCollege) {
      const branchValue = selectedBranch.value;
      const collegeValue = selectedCollege.value;

      fetchStatistics(branchValue, collegeValue);
    }
  }, [selectedBranch, selectedCollege]);

  // Function to fetch all statistics
  const fetchStatistics = async (branchValue, collegeValue) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    setLoading(true); // Start loading state

    try {
      // Use Promise.all to fetch all the data concurrently
      const [aptitudeResponse, reasoningResponse, verbalResponse] = await Promise.all([
        axios.post(backendUrl + 'apt-total-results', { branches: [branchValue], college: collegeValue }),
        axios.post(backendUrl + 'reasoning-total-results', { branches: [branchValue], college: collegeValue }),
        axios.post(backendUrl + 'verbal-total-results', { branches: [branchValue], college: collegeValue })
      ]);

      // Update state with API responses
      setAptitudeCount(aptitudeResponse.data[0].total_count || 0); // Set to 0 if no data
      setReasoningCount(reasoningResponse.data.total_count || 0); // Set to 0 if no data
      setVerbalCount(verbalResponse.data.count || 0); // Set to 0 if no data

    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Error fetching statistics");
    } finally {
      setLoading(false); // End loading state once all requests are complete
    }
  };

  const totalCount = aptitudeCount + reasoningCount + verbalCount;

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

export default(Dashboard);
