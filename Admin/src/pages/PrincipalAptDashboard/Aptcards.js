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
  const { selectedCollege, selectedBranch } = props;
  const [user, setUser] = useState([]);
 
  const [loading, setLoading] = useState(true); // Loading state
  const [aptitudeCountTo, setAptitudeCountTo] = useState(""); // State for Aptitude count
  const [reasoningCountTo, setReasoningCountTo] = useState(""); // State for Aptitude count
  const [verbalCountTo, setVerbalCountTo] = useState("");
  const [totalCountTo, setTotalCountTo] = useState(0);
  const [aptitudeCountYe, setAptitudeCountYe] = useState(""); // State for Aptitude count
  const [reasoningCountYe, setReasoningCountYe] = useState(""); // State for Aptitude count
  const [verbalCountYe, setVerbalCountYe] = useState("");
  const [totalCountYe, setTotalCountYe] = useState(0);

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


  // useEffect(() => {
  //   const authUser = JSON.parse(localStorage.getItem("authUser"));
  //   if (authUser) {
  //     setUser(authUser);
  //     setBranches(authUser.branch); 
  //     setCollege(authUser.college);
  //   }
  // }, []);


  // console.log(user)
  useEffect(() => {
    if (selectedBranch && selectedCollege) {
      // Extract the value from the selected branch and college
      const branchValue = selectedBranch.value;
      const collegeValue = selectedCollege.value;
      fetchStatisticsAptitudeTo(branchValue, collegeValue);
      fetchStatisticsReasoningTo(branchValue, collegeValue);
      fetchStatisticsVerbalTo(branchValue,collegeValue);
      fetchStatisticsAptitudeYe(branchValue, collegeValue);
      fetchStatisticsReasoningYe(branchValue, collegeValue);
      fetchStatisticsVerbalYe(branchValue,collegeValue);
    }
  }, [selectedBranch, selectedCollege]);
  // console.log(branches,college)



  const fetchStatisticsAptitudeTo = async (branchValue, collegeValue) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const payload = {
      branches: [branchValue],  // Send selectedBranch as an array of value
        college: collegeValue   
    };
    try{
      const response = await axios.post(backendUrl + 'apititude-today-results', 
        payload
      );
      if(response.status == 200){
        // console.log(response.data)
        setAptitudeCountTo(response.data[0].count); // Assuming the API response has a count property
        setLoading(false);
      }
    }catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Error fetching statistics");
      setLoading(false);
    }
  };


  const fetchStatisticsReasoningTo = async (branchValue, collegeValue) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const payload = {
      branches: [branchValue],  // Send selectedBranch as an array of value
        college: collegeValue   
    };

    try {
      const response = await axios.post(backendUrl + 'reasoning-today-results', 
        payload
      );
      if(response.status == 200){
      // console.log(response.data)
      setReasoningCountTo(response.data.count); // Assuming the API response has a count property
      setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Error fetching statistics");
      setLoading(false);
    }
  };

  const fetchStatisticsVerbalTo = async (branchValue, collegeValue) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const payload = {
      branches: [branchValue],  // Send selectedBranch as an array of value
      college: collegeValue
    };

    try {
      const response = await axios.post(backendUrl + 'verbal-today-results', 
        payload
      );
      if(response.status == 200){
      // console.log(response.data)
      setVerbalCountTo(response.data.count); // Assuming the API response has a count property
      setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Error fetching statistics");
      setLoading(false);
    }
  };






  const fetchStatisticsAptitudeYe = async (branchValue, collegeValue) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const payload = {
      branches: [branchValue],  // Send selectedBranch as an array of value
      college: collegeValue
    };
    try{
      const response = await axios.post(backendUrl + 'apititude-yesterday-results', 
        payload
      );
      if(response.status == 200){
        // console.log(response.data)
        setAptitudeCountYe(response.data.count); // Assuming the API response has a count property
        setLoading(false);
      }
    }catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Error fetching statistics");
      setLoading(false);
    }
  };


  const fetchStatisticsReasoningYe = async (branchValue, collegeValue) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const payload = {
      branches: [branchValue],  // Send selectedBranch as an array of value
      college: collegeValue
    };

    try {
      const response = await axios.post(backendUrl + 'reasoning-yesterday-results', 
        payload
      );
      if(response.status == 200){
      // console.log(response.data)
      setReasoningCountYe(response.data.count); // Assuming the API response has a count property
      setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Error fetching statistics");
      setLoading(false);
    }
  };

  const fetchStatisticsVerbalYe = async (branchValue, collegeValue) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const payload = {
      branches: [branchValue],  // Send selectedBranch as an array of value
        college: collegeValue
    };

    try {
      const response = await axios.post(backendUrl + 'verbal-yesterday-results', 
        payload
      );
      if(response.status == 200){
      // console.log(response.data)
      setVerbalCountYe(response.data.count); // Assuming the API response has a count property
      setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Error fetching statistics");
      setLoading(false);
    }
  };

  useEffect(() => {
    setTotalCountTo(aptitudeCountTo+reasoningCountTo+verbalCountTo);
  },[aptitudeCountTo,reasoningCountTo,verbalCountTo])


  useEffect(() => {
    setTotalCountYe(aptitudeCountYe+reasoningCountYe+verbalCountYe);
  },[aptitudeCountYe,reasoningCountYe,verbalCountYe])

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
                          <h3 className="text-white mb-0 mt-1">{totalCountTo}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        {/* <h4 className='text-white'><img height={50} width={50} src={C}/></h4> */}
                        <h4 className='text-white'>Aptitude</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{aptitudeCountTo?aptitudeCountTo:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Reasoning</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{reasoningCountTo?reasoningCountTo:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Verbal</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{verbalCountTo?verbalCountTo:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  {/* <Col xl={2} md={6}>
                    <Card style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Python</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{codingStatistics.pythonCount?codingStatistics.pythonCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col> */}
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
                          <h3 className="text-white mb-0 mt-1">{totalCountYe}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Aptitude</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{aptitudeCountYe?aptitudeCountYe:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Reasoning</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{reasoningCountYe?reasoningCountYe:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Verbal</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{verbalCountYe?verbalCountYe:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  {/* <Col xl={2} md={6}>
                    <Card  style={{backgroundColor:"#384c60", borderRadius:"10px"}}>
                      <CardBody>
                        <h4 className='text-white'>Python</h4>
                        <div style={{ float: 'right' }}>
                          <h3 className="text-white mb-0 mt-1">{yesterdayStatistics.pythonCount?yesterdayStatistics.pythonCount:0}</h3>
                        </div>
                      </CardBody>
                    </Card>
                  </Col> */}
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
