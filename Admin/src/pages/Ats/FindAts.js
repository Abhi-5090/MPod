import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Progress,
  Spinner
} from "reactstrap";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { connect } from "react-redux";

import { setBreadcrumbItems } from "../../store/actions";

const FindAts = (props) => {
  document.title = "Technical Hub | Find ATS";
  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "ATS", link: "#" },
    { title: "Find ATS", link: "#" },
  ]
  useEffect(() => {
    props.setBreadcrumbItems('ATS', breadcrumbItems);
  }, []);
  const [jdFile, setJdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleJdFileChange = (event) => {
    setJdFile(event.target.files[0]);
  };

  const handleResumeFileChange = (event) => {
    setResumeFile(event.target.files[0]);
  };

  const findAts = async () => {
    setLoading(true);
    setResponseData(null);
    const formData = new FormData();
    formData.append('job_description', jdFile);
    formData.append('resume', resumeFile);

    try {
      const response = await axios.post('http://34.27.225.19:5003/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        setResponseData(response.data);
      }
    } catch (error) {
      console.error('Error fetching ATS data:', error);
      toast.error("Failed to fetch ATS data", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <ToastContainer />
        <div style={{background:"#7a6fbe", color:"white", textAlign:"center", fontSize:"25px", padding:"10px", marginBottom:"20px"}}>
          JD vs CV
        </div>
        <Col xl="6">
          <Card>
          <CardBody>
              <h4 className="card-title">Find ATS Score</h4>
              <div className="mb-3 d-flex justify-content-between">
                <div className="me-4">
                  <Label>Upload Job Description</Label>
                  <input type="file" className="form-control" onChange={handleJdFileChange} />
                </div>
                <div>
                  <Label>Upload Resume</Label>
                  <input type="file" className="form-control" onChange={handleResumeFileChange} />
                </div>
              </div>
              <Button color="primary" onClick={findAts} disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Find"}
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
      {loading && (
        <Row className="mt-4 text-center">
          <Col>
          <p>AI is analyzing the job description and resume. This may take a few moments. Please wait... </p>
            <Spinner color="primary" />
          </Col>
        </Row>
      )}
      {responseData && (
        <Row className="mt-4">
          <Col xl="11">
            <Card>
              <CardBody>
                <h5>ATS Score: {responseData.ats_score}%</h5>
                <Progress value={responseData.ats_score} color={responseData.ats_score > 50 ? "success" : "danger"} />
                <h6 className="mt-3">Job Description Match</h6>
                <div className="p-2 bg-light border rounded text-center">
                  <h4 className="text-primary">{responseData.job_description_match_percentage}% Match</h4>
                </div>
                <Row className="mt-4">
                <Col md="5">
                    <h5 className="text-success">Positives</h5>
                    <ul>
                      {responseData.positives.map((positive, index) => (
                        <li key={index} style={{textAlign:"justify"}}>{positive}</li>
                      ))}
                    </ul>
                  </Col>
                  
                  <Col md="1" className="d-flex justify-content-center align-items-center">
                    <div className="border-end" style={{ height: '100%', width: '2px', backgroundColor: '#ccc' }}></div>
                  </Col>
                  <Col md="6">
                    <h5 className="text-danger">Improvements Needed</h5>
                    <ul>
                      {responseData.improvements.map((improvement, index) => (
                        <li key={index} style={{marginRight:"20px",textAlign:"justify"}}>{improvement}</li>
                      ))}
                    </ul>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
};
export default connect(null, { setBreadcrumbItems })(FindAts);
