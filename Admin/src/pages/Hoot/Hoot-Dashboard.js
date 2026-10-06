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


const HootDashboard = (props) => {
  document.title = "Hoot Dashboard";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Hoot Dashboard", link: "#" },
    { title: "Dashboard", link: "#" },
  ];

  const [readingParagraphsCount, setReadingParagraphsCount] = useState([]);
  const [storyRetellingsCount, setStoryRetellingsCount] = useState([]);
  const [listenAndRepeatCount, setListenAndRepeatCount] = useState([]);
  const [questionnaireCount, setQuestionnaireCount] = useState([]);
  const [landaCount, setLandaCount] = useState([]);
  const [speakoutCount, setSpeakoutCount] = useState([]);

  useEffect(() => {
    props.setBreadcrumbItems('Hoot Dashboard', breadcrumbItems);
    fetchReadingParagraphsCount();
    fetchStoryRetellingsCount();
    fetchListenAndRepeatCount();
    fetchQuestionnaireCount();
    fetchLanda();
    fetchSpeakout();
  }, []);

  const fetchReadingParagraphsCount = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl+'get-ReadingParagraphs-hoot-count');
      if (response.status === 200) {
         setReadingParagraphsCount(response.data); 
        //  console.log(response.data)
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      toast.error("Error fetching data. Please try again.");
    }
  };

  const fetchStoryRetellingsCount = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl+'get-storyRetellings-hoot-count');
      if (response.status === 200) {
        setStoryRetellingsCount(response.data); 
        //  console.log(response.data)
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      toast.error("Error fetching data. Please try again.");
    }
  };

  const fetchListenAndRepeatCount = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl+'get-EnglishSentence-hoot-count');
      if (response.status === 200) {
        setListenAndRepeatCount(response.data); 
        //  console.log(response.data)
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      toast.error("Error fetching data. Please try again.");
    }
  };
  
  const fetchQuestionnaireCount = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl+'get-questionnaire-hoot-count');
      if (response.status === 200) {
        setQuestionnaireCount(response.data); 
        //  console.log(response.data)
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      toast.error("Error fetching data. Please try again.");
    }
  };
  
  const fetchLanda = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl+'get-landa-hoot-count');
      if (response.status === 200) {
        setLandaCount(response.data); 
        //  console.log(response.data)
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      toast.error("Error fetching data. Please try again.");
    }
  };
  
  const fetchSpeakout = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl+'get-speak-out-hoot-count');
      if (response.status === 200) {
        setSpeakoutCount(response.data); 
        //  console.log(response.data)
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      toast.error("Error fetching data. Please try again.");
    }
  };

  return (
      <React.Fragment>
        <Row className="mt-4">
          <Col className="col-12">
            <Card className="shadow-sm">
              <CardBody className="d-flex justify-content-between align-items-center">
                <CardTitle className="h4 mb-0">Hoot Dashboard</CardTitle>
              </CardBody>
              <CardBody>
                <Row>
                  <Col md="4" className="mb-4">
                    <Card className="h-100 shadow-md">
                      <CardBody>
                        <CardTitle tag="h5" className="mb-3 text-center">Reading Paragraphs</CardTitle>
                        <div className="text-center">
                          <h6>Total Submissions: <strong>{readingParagraphsCount.totalCount}</strong></h6>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <div className="text-center">
                            <h6>Yesterday</h6>
                            <p className="mb-0">{readingParagraphsCount.yesterdayCount}</p>
                          </div>
                          <div className="text-center">
                            <h6>Today</h6>
                            <p className="mb-0">{readingParagraphsCount.todayCount}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
  
                  <Col md="4" className="mb-4">
                    <Card className="h-100 shadow-md">
                      <CardBody>
                        <CardTitle tag="h5" className="mb-3 text-center">Story Retellings</CardTitle>
                        <div className="text-center">
                          <h6>Total Submissions: <strong>{storyRetellingsCount.totalCount}</strong></h6>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <div className="text-center">
                            <h6>Yesterday</h6>
                            <p className="mb-0">{storyRetellingsCount.yesterdayCount}</p>
                          </div>
                          <div className="text-center">
                            <h6>Today</h6>
                            <p className="mb-0">{storyRetellingsCount.todayCount}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
  
                  <Col md="4" className="mb-4">
                    <Card className="h-100 shadow-md">
                      <CardBody>
                        <CardTitle tag="h5" className="mb-3 text-center">Listen And Repeat</CardTitle>
                        <div className="text-center">
                          <h6>Total Submissions: <strong>{listenAndRepeatCount.totalCount}</strong></h6>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <div className="text-center">
                            <h6>Yesterday</h6>
                            <p className="mb-0">{listenAndRepeatCount.yesterdayCount}</p>
                          </div>
                          <div className="text-center">
                            <h6>Today</h6>
                            <p className="mb-0">{listenAndRepeatCount.todayCount}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col md="4" className="mb-4">
                    <Card className="h-100 shadow-md">
                      <CardBody>
                        <CardTitle tag="h5" className="mb-3 text-center">Questionnaire</CardTitle>
                        <div className="text-center">
                          <h6>Total Submissions: <strong>{questionnaireCount.totalCount}</strong></h6>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <div className="text-center">
                            <h6>Yesterday</h6>
                            <p className="mb-0">{questionnaireCount.yesterdayCount}</p>
                          </div>
                          <div className="text-center">
                            <h6>Today</h6>
                            <p className="mb-0">{questionnaireCount.todayCount}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
  
                  <Col md="4" className="mb-4">
                    <Card className="h-100 shadow-md">
                      <CardBody>
                        <CardTitle tag="h5" className="mb-3 text-center">Listen and Answer</CardTitle>
                        <div className="text-center">
                          <h6>Total Submissions: <strong>{landaCount.totalCount}</strong></h6>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <div className="text-center">
                            <h6>Yesterday</h6>
                            <p className="mb-0">{landaCount.yesterdayCount}</p>
                          </div>
                          <div className="text-center">
                            <h6>Today</h6>
                            <p className="mb-0">{landaCount.todayCount}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
  
                  <Col md="4" className="mb-4">
                    <Card className="h-100 shadow-md">
                      <CardBody>
                        <CardTitle tag="h5" className="mb-3 text-center">Speak out</CardTitle>
                        <div className="text-center">
                          <h6>Total Submissions: <strong>{speakoutCount.totalCount}</strong></h6>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <div className="text-center">
                            <h6>Yesterday</h6>
                            <p className="mb-0">{speakoutCount.yesterdayCount}</p>
                          </div>
                          <div className="text-center">
                            <h6>Today</h6>
                            <p className="mb-0">{speakoutCount.todayCount}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(HootDashboard);


