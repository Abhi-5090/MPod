import PropTypes from 'prop-types';
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Spinner
} from "reactstrap";
import { withTranslation } from "react-i18next";
import axios from 'axios'; // For API requests

const Dashboard = (props) => {
  // State to store fetched coders data
  const [coders, setCoders] = useState([]);
  const [loading, setLoading] = useState(false); // State to manage loading status

  const { selectedCollege, selectedBranch } = props;

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
  

  // Effect hook to call API when selectedBranch and selectedCollege are available
  useEffect(() => {
    if (selectedBranch && selectedCollege) {
      const branchValue = selectedBranch.value;
      const collegeValue = selectedCollege.value;

      // Fetch coding ranks when branch and college are set
      fetchCodingRanks(branchValue, collegeValue);
    }
  }, [selectedBranch, selectedCollege]);

  // Function to fetch coding rank data
  const fetchCodingRanks = async (branchValue, collegeValue) => {
    setLoading(true); // Start loading when API is called
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    
    try {
      const response = await axios.post(backendUrl + 'codingRankByCollegeAndBranch', {
        branches: [branchValue], // Pass branch as an array
        college: collegeValue    // Pass college
      });

      // Sort by score in descending order and select top 10 coders
      const sortedCoders = response.data[0].allCoders.sort((a, b) => b.score - a.score).slice(0, 10);
      setCoders(sortedCoders); // Update coders state with top 10 coders
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Stop loading when API call is complete
    }
  };

  return (
    <React.Fragment>
      <div>
        <Container fluid>
          <Row className="mt-5">
            <Col xl={12}>
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">Top 10 Coders</h4>
                  <div className="table-responsive">
                    <Table hover centered className="table-nowrap mb-0">
                      <thead>
                        <tr>
                          <th scope="col">Sno</th>
                          <th scope="col">Roll No</th>
                          <th scope="col">Name</th>
                          <th scope="col">College</th>
                          <th scope="col">Branch</th>
                          <th scope="col">Easy</th>
                          <th scope="col">Medium</th>
                          <th scope="col">Hard</th>
                          <th scope="col">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coders.length > 0 ? (
                          coders.map((coder, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td> {/* Sno */}
                              <td>{coder.roll_no}</td>
                              <td>{coder.first_name}</td>
                              <td>{coder.college}</td>
                              <td>{coder.branch.join(", ")}</td> {/* Branch array */}
                              <td>{coder.problems_count.easy}</td>
                              <td>{coder.problems_count.medium}</td>
                              <td>{coder.problems_count.hard}</td>
                              <td>{coder.score}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9" className="text-center">
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  t: PropTypes.any
};

export default withTranslation()(Dashboard);
