import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ViewCodingQuestionModal from "./ViewCodingQuestionModal";

const CodingQuestionsList = (props) => {
  document.title = "Coding Questions list | Technical Hub - All the list of Coding Questions";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Coding", link: "#" },
    { title: "Coding Questions List", link: "#" },
  ]
  const [questionData, setQuestionData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  useEffect(() => {
    props.setBreadcrumbItems('Coding Questions', breadcrumbItems);
    fetchData();
  }, []);
  // useEffect(() => {
  //   let authUser = JSON.parse(localStorage.getItem('authUser'));
  //   if (authUser.role == 'admin' || authUser.role == 'superadmin') {
  //   }
  //   else {
  //     alert("your not autherized")
  //     localStorage.clear();
  //     window.location.href = '/admin/login';
  //   }
  // }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-coding-questions');
      console.log(response.data)
      if (response.status === 200) {
        setQuestionData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (topic) => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-question/${questionToDelete._id}`);
    if (response.status == 200) {
      toast.success('Topic deleted successfully', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
    const updatedQuestionData = questionData.filter(question => question._id !== questionToDelete._id);
    setQuestionData(updatedQuestionData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(!showDeleteModal);
  };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
  const data = {
    columns: [
      { label: "Problem", field: "problem_name", sort: "asc", width: 150 },
      { label: "Complexity", field: "complexity", sort: "asc", width: 150 },
      { label: "Time", field: "time", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: questionData.map(question => ({
      problem_name: question.problem_name,
      complexity: question.complexity,
      time: question.time,
      status: question.status === 1 ? <Badge color="success" className="bg-success">Active</Badge> : <Badge color="danger" className="bg-danger">Inactive</Badge>,
      actions: (
        <div>
          <Link to={`/edit-coding-question/${question._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="success" className="btn btn-sm bg-success" onClick={() => handleView(question)}>View</Button>

          {/* <Button color="danger" className="d-none" size="sm" onClick={() => toggleDeleteModal(question)}>Delete</Button> */}
        </div>
      ),
    })),
  };
  const handleView = (question) => {
    setSelectedQuestion(question);
    setViewModalOpen(true);
  };
  
  return (
    <React.Fragment>
      <Row>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}  // Corrected this line
        />

        {/* Same as */}
        <ToastContainer />
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Coding Questions List</CardTitle>
              <a href="add-coding-question">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD CODING QUESTIONS</Button>
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
      <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} />
      <ViewCodingQuestionModal
  isOpen={viewModalOpen}
  toggle={() => setViewModalOpen(!viewModalOpen)}
  question={selectedQuestion}
/>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(CodingQuestionsList);