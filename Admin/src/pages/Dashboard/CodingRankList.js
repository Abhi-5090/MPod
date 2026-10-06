import PropTypes from 'prop-types';
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table
} from "reactstrap";
import { withTranslation } from "react-i18next";
import axios from 'axios'; // For API requests

const Dashboard = props => {
  // State to store fetched data
  const [coders, setCoders] = useState([]);
  const [user, setUser] = useState(null);  // Store user data
  const [branch, setBranch] = useState("");  // Store branch
  const [college, setCollege] = useState("");  // Store college

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (authUser) {
      setUser(authUser);
      setBranch(authUser.branch);  // Set branch from user data
      setCollege(authUser.college);  // Set college from user data
      // console.log(authUser);
    }
  }, []);

  // Call codingRanks when branch and college are set
  useEffect(() => {
    if (branch.length > 0 && college.length > 0) {
      codingRanks(branch, college);
    }
  }, [branch, college]);

  // Function to fetch coding rank data
  const codingRanks = async (branch, college) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl+'codingRankByCollegeAndBranch', {
        branches: [branch],  // Use dynamic branch
        college: college      // Use dynamic college
      });
      
      // Sort by score and take top 10
      const sortedCoders = response.data[0].allCoders.sort((a, b) => b.score - a.score).slice(0, 10);
      setCoders(sortedCoders); // Update state with top 10 coders
    } catch (error) {
      console.error("Error fetching data:", error);
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
