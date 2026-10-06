import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../../store/actions";
import { MutatingDots } from 'react-loader-spinner';
import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";

import { decode } from 'html-entities';
import DOMPurify from 'dompurify';

const QuestionsList = (props) => {
  document.title = "Reasoning Questions list | Technical Hub";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Reasoning", link: "#" },
    { title: "Reasoning Questions List", link: "#" },
  ]
  const [testsData, setTestsData] = useState([]);
  const [testDetails, setTestDetails] = useState([]);
  const [testLoader, setTestLoader] = useState(true);
  const [questionsLoader, setQuestionsLoader] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isView, setIsView] = useState(false)
  const [currViewTest, setCurrViewTest] = useState();


  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
  useEffect(() => {
    props.setBreadcrumbItems('Reasoning Questions', breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-reasoning-questions');
      if (response.status === 200) {
        console.log(response.data)
        setTestsData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const getTestById = async (test_id, test_name) => {
    setCurrViewTest(test_name);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      setIsView(true)
      setQuestionsLoader(true)
      const response = await axios.post(backendUrl + 'get-reasoning-practise-test-by-id', { test_id: test_id });
      if (response.status === 200) {
        setTestDetails(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setQuestionsLoader(false)
    }
  }

  const handleDelete = async (assessment) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-reasoning-question/${questionToDelete._id}`);
    if (response.status == 200) {
      console.log("Question deleted:", questionToDelete);
    }
    const updatedAssessmentData = testsData.filter(assessment => assessment._id !== questionToDelete._id);
    setTestsData(updatedAssessmentData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (assessment) => {
    setQuestionToDelete(assessment);
    setShowDeleteModal(!showDeleteModal);
  };


  const data = {
    columns: [
      { label: "Question", field: "question", sort: "asc", width: "250px" },
      { label: "reference_no", field: "reference_no", sort: "asc", width: "150px" },
      { label: "Topic", field: "topic_name", sort: "asc", width: 200 },
      { label: "option1", field: "option1", sort: "asc", width: 50 },
      { label: "option2", field: "option2", sort: "asc", width: 50 },
      { label: "option3", field: "option3", sort: "asc", width: 50 },
      { label: "option4", field: "option4", sort: "asc", width: 50 },
      { label: "answer", field: "answer", sort: "asc", width: 50 },
      { label: "added_by", field: "added_by", sort: "asc", width: 50 },
      { label: "Actions", field: "actions", sort: "asc", width: 200 },
    ],
    rows: testsData.map(test => {

      let complexity = '';
      if (test.level == "easy") {
        complexity = <Badge color="info" className="bg-info">Easy</Badge>;
      } else if (test.level == "medium") {
        complexity = <Badge color="warning" className="bg-warning">Medium</Badge>;
      } else if (test.level == "hard") {
        complexity = <Badge color="danger" className="bg-danger">Hard</Badge>;
      }

      return {
        question: test.question,
        reference_no: test.reference_no,
        topic_name: test.topic_name,
        option1: test.option1,
        option2: test.option2,
        option3: test.option3,
        option4: test.option4,
        answer: test.answer,
        added_by: test.added_by,

        actions: (
          <div>
            <Link to={`/edit-reasoning-question/${test._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
            <Button color="danger" size="sm" onClick={() => toggleDeleteModal(test)}>Delete</Button>
          </div>
        ),
      };
    }),
  };



  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Reasoning Questions List</CardTitle>
              <a href="/admin/upload-reasoning-questions">
                <Button type="button" color="primary" className="waves-effect waves-light">Add Question</Button>
              </a>
            </CardBody>
            <CardBody>
              {
                data.rows.length !== 0 ? (
                  <MDBDataTable responsive bordered data={data} noBottomColumns />
                ) : (
                  <div className="row">
                    <div className="col-md-2 offset-5">
                      <MutatingDots
                        visible={true}
                        height="100"
                        width="100"
                        color="#2B3A4A"
                        secondaryColor="#2B3A4A"
                        radius="12.5"
                        ariaLabel="mutating-dots-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                      />
                    </div>
                  </div>
                )
              }
            </CardBody>
          </Card>
        </Col>
        <Col className="col-6">
          <Card>
            {isView ? (<CardBody>
              <CardTitle className="h4">
                <Row>
                  <Col className="col-10">
                    <span><h4>{currViewTest}</h4></span>
                  </Col>
                  <Col className="col-1">

                    <Badge className={testDetails.length > 0 && testDetails[0].level == "easy" ? "bg-info text-right" : testDetails.length > 0 && testDetails[0].level == "medium" ? "bg-warning text-right" : "bg-danger text-right"}>{testDetails.length > 0 && testDetails.length > 0 ? testDetails && testDetails[0].level : ""}</Badge>
                  </Col>
                </Row>
              </CardTitle>

              <div>
                <h3></h3>
              </div>
              {
                !questionsLoader && testDetails && testDetails.length > 0 ? (testDetails.map((ele, index) =>
                  <div key={index}>
                    <p className="card-title-desc">
                      {/* {index +". " + ele.question} */}

                      <span style={{ fontWeight: "bold" }}>{index + 1}. </span>
                      <span style={{ background: "#ffeebf", padding: "3px 10px", borderRadius: "5px" }} dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(decode(ele.question
                          .replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\/g, '')
                          .replace(/u003C/g, '<')   // <
                          .replace(/u003E/g, '>')   // >
                          .replace(/u0022/g, '"')   // "
                          .replace(/u0026/g, '&')   // &
                          .replace(/u002D/g, '-')   // - (if needed)
                          .replace(/u002B/g, '+')  // + (if needed)
                          .replace(/\n/g, '<br />') // Convert newlines to <br /> tags

                        ))
                      }} >

                      </span>
                    </p>
                    <ol className="" type="A">
                      <li className="" dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(decode(ele.option1
                          .replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\/g, '')
                          .replace(/u003C/g, '<')   // <
                          .replace(/u003E/g, '>')   // >
                          .replace(/u0022/g, '"')   // "
                          .replace(/u0026/g, '&')   // &
                          .replace(/u002D/g, '-')   // - (if needed)
                          .replace(/u002B/g, '+')  // + (if needed)
                          .replace(/\n/g, '<br />') // Convert newlines to <br /> tags

                        ))
                      }}></li>
                      <li className="" dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(decode(ele.option2
                          .replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\/g, '')
                          .replace(/u003C/g, '<')   // <
                          .replace(/u003E/g, '>')   // >
                          .replace(/u0022/g, '"')   // "
                          .replace(/u0026/g, '&')   // &
                          .replace(/u002D/g, '-')   // - (if needed)
                          .replace(/u002B/g, '+')  // + (if needed)
                        ))
                      }}></li>
                      <li className="" dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(decode(ele.option3
                          .replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\/g, '')
                          .replace(/u003C/g, '<')   // <
                          .replace(/u003E/g, '>')   // >
                          .replace(/u0022/g, '"')   // "
                          .replace(/u0026/g, '&')   // &
                          .replace(/u002D/g, '-')   // - (if needed)
                          .replace(/u002B/g, '+')  // + (if needed)
                        ))
                      }}></li>
                      <li className="" dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(decode(ele.option4
                          .replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\/g, '')
                          .replace(/u003C/g, '<')   // <
                          .replace(/u003E/g, '>')   // >
                          .replace(/u0022/g, '"')   // "
                          .replace(/u0026/g, '&')   // &
                          .replace(/u002D/g, '-')   // - (if needed)
                          .replace(/u002B/g, '+')  // + (if needed)
                        ))
                      }}></li>
                    </ol>
                    <div style={{ marginBottom: "25px" }}><span style={{ background: "#b0ffd1", padding: "3px 10px", borderRadius: "5px" }} dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(decode("<b>Answer: </b>" + ele.answer
                        .replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\/g, '')
                        .replace(/u003C/g, '<')   // <
                        .replace(/u003E/g, '>')   // >
                        .replace(/u0022/g, '"')   // "
                        .replace(/u0026/g, '&')   // &
                        .replace(/u002D/g, '-')   // - (if needed)
                        .replace(/u002B/g, '+')  // + (if needed)
                        .replace(/\n/g, '<br />') // Convert newlines to <br /> tags
                      ))
                    }}></span></div>
                  </div>

                )) : questionsLoader ? <MutatingDots
                  visible={true}
                  height="100"
                  width="100"
                  color="#2B3A4A"
                  secondaryColor="#2B3A4A"
                  radius="12.5"
                  ariaLabel="mutating-dots-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                /> : <></>
              }
            </CardBody>) : <></>}

          </Card>
        </Col>
      </Row>
      <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(QuestionsList);