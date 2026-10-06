import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from 'react-loader-spinner';
import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";

import { decode } from 'html-entities';
import DOMPurify from 'dompurify';

const AssessmentsList = (props) => {
  document.title = "Aptitude Tests list | Technical Hub";
  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Badge Test", link: "#" },
    { title: "Badge Tests List", link: "#" },
  ]
  const [testsData, setTestsData] = useState([]);             // Usestate to store the created tests data
  const [testDetails, setTestDetails] = useState([]);
  const [testLoader, setTestLoader] = useState(true);
  const [questionsLoader, setQuestionsLoader] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);
  const [isView, setIsView] = useState(false)
  const [currViewTest, setCurrViewTest] = useState();
  const [testUser, setTestUser] = useState();
  // Track isGenerate and generated count per test
  const [generatingStatus, setGeneratingStatus] = useState({});
  const [generatedCounts, setGeneratedCounts] = useState({});
  let generated = 0;
  let isGenerate = false;
  useEffect(() => {
    props.setBreadcrumbItems('Aptitude Tests', breadcrumbItems);
    fetchData();
  }, []);

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

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      //getting apt logic tests
      const response = await axios.get(backendUrl + 'get-aptlogic-badge-tests');
      // const response = await axios.get(backendUrl + 'get-assessments');

      if (response.status === 200) {
        setTestsData(response.data);
        console.log(response.data)

      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  //function to generate the badge test papers to registered trainees
  const GeneratePapers = async (test_id, test_name) => {
    // Set isGenerate to true for the specific test
    setGeneratingStatus((prevStatus) => ({
      ...prevStatus,
      [test_id]: true,
    }));

    setCurrViewTest(test_name);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      setIsView(true);
      setQuestionsLoader(true);

      // Getting aptlogic test by id
      const response = await axios.post(`${backendUrl}get-aptlogic-badge-test-by-id`, { test_id });

      if (response.status === 200) {
        setTestDetails(response.data);
        let generated = response.data.generated_to;

        // Create an array of promises
        const promises = response.data.users.map(async (ele) => {
          try {
            const res = await axios.post(`${backendUrl}generate-badge-test-paper`, { test_id, roll_no: ele });
            if (res.status === 201) {
              // Incrementing the generated counts for that particular test
              setGeneratedCounts((prevCounts) => ({
                ...prevCounts,
                [test_id]: (prevCounts[test_id] || 0) + 1,
              }));
              generated++;
            }
          } catch (err) {
            console.error("An error occurred:", err);
            if (err.response && err.response.status === 409) {
              // Handle duplicate test creation
              // alert(err.response.data.message); // Display the alert with the error message
            }
          }
        });

        // Wait for all promises to complete
        await Promise.all(promises);

        // Update test generation status
        const generation_status = await axios.post(`${backendUrl}update-test-generation-status`, { test_id, generated_to: generated });
        if (generation_status.status === 200) {
          alert(`${generated - response.data.generated_to} test paper has been generated...!!!`);
          window.location.reload();
        }
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setGeneratingStatus((prevStatus) => ({
        ...prevStatus,
        [test_id]: false,
      }));
      setQuestionsLoader(false);
    }
  }
  
  const data = {
    columns: [
      { label: "Course", field: "course", sort: "asc", width: "250px" },
      { label: "Technology", field: "technology", sort: "asc", width: "250px" },
      { label: "Test name", field: "test_name", sort: "asc", width: "250px" },
      { label: "Start Time", field: "start_time", sort: "asc", width: "150px" },
      { label: "End Time", field: "end_time", sort: "asc", width: 200 },
      { label: "User count", field: "user_count", sort: "asc", width: 50 },
      { label: "No of Questions", field: "questions_count", sort: "asc", width: 50 },
      { label: "Generated to", field: "generated_to", sort: "asc", width: 50 },
      { label: "Generate", field: "generate", sort: "asc", width: 50 },

      // { label: "Action", field: "actions", sort: "asc", width: 150 }
    ],
    rows: testsData.map(test => {
      const isGenerating = generatingStatus[test._id] || false;
      const generatedCount = generatedCounts[test._id] || 0;
      return {
        course: test.course,
        technology: test.technology,
        test_name: test.test_name,
        start_time: test.start_time,
        end_time: test.end_time,
        user_count: test.users.length + "/" + test.users_count,
        questions_count: test.questions_count,
        generated_to: test.generated_to,
        generate: test.generated_to == test.users.length || test.generated_to >= 0 ? (
          <Button
            className="btn bg-primary"
            onClick={() => GeneratePapers(test._id, test.test_name)}
            disabled={isGenerating ? true : test.generated_to > 0 && test.generated_to + generatedCount === test.users.length ? true : false} // Disable button while generating
          >

            {isGenerating && generatedCount == 0
              ? "Preparing..."
              : generatedCount > 0 && generatedCount < test.users_count
                ? `Generated ${generatedCount} Papers`
                : generatedCount === test.users_count
                  ? "All Papers Generated"
                  : test.generated_to == test.users.length && test.users.length==0 ? "No users to generate" : test.generated_to == test.users.length && test.users.length>0?"Already Generated":"Generate Papers"}
          </Button>) : <Button
            className="btn bg-primary"
          >
          No Users to generate
        </Button>,
        actions: (
          <div>
            {/* <Link to={`/edit-assessment/${test._id}`} className="btn btn-info btn-sm me-2">Edit</Link> */}
            {/* <Button color="danger" size="sm" onClick={() => toggleDeleteModal(test)}>Delete</Button> */}
          </div>
        ),
      };
    }),
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-8">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Badge Tests List</CardTitle>
              <a href="/admin/add-aptlogic-badge-test">
                <Button type="button" color="primary" className="waves-effect waves-light">Add Test</Button>
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
      </Row>
      {/* <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} /> */}
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AssessmentsList);