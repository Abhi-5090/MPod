import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const StudentInactiveProblemsList = (props) => {
  document.title = "Student Inactive Problems List";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Students Inactive Problems", link: "#" },
    { title: "Inactive Problems List", link: "#" },
  ];

  const [user, setUser] = useState({});
  const [branch, setBranch] = useState([]);
  const [college, setCollege] = useState('');
  const [studentProblemsData, setStudentProblemsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props.setBreadcrumbItems('Student Inactive Problems', breadcrumbItems);
  }, [props]);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'trainer' || authUser.role == 'operations' || authUser.role == 'coding' || authUser.role == 'hod' || authUser.role == 'faculty' || authUser.role == 'Principal' || authUser.role == 'dean') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (authUser) {
      setUser(authUser);
      setBranch(authUser.branch);
      setCollege(authUser.college);
    }
  }, []);

  console.log(branch,college);
  
  useEffect(() => {
    if (branch.length > 0 && college) {
      console.log("college");
      
      fetchStudentInactiveProblemsData(branch, college);
    }else{
      console.log("getting error");
      
    }
  }, [branch, college]);

  const fetchStudentInactiveProblemsData = async (branches, college) => {
    
    
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      console.log(branch,college);

      
      
      const response = await axios.post(`${backendUrl}codingInActiveStudentByCollegeandBranch`, {
        // branch: Array.isArray(branch) ? branch : [branch],
        branches,
        college,
      });
      
      
      
      

      if (response.status === 200) {
        setStudentProblemsData(response.data.data); // Access the data property
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      console.error("Error details:", error.response ? error.response.data : error.message);
      toast.error("Error fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 50 },
      { label: "Name", field: "first_name", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 100 },
      { label: "College", field: "college", sort: "asc", width: 100 },
        // { label: "Easy", field: "easy", sort: "asc", width: 150 },
        // { label: "Medium", field: "medium", sort: "asc", width: 150 },
        // { label: "Hard", field: "hard", sort: "asc", width: 200 },
    ],
    rows: studentProblemsData.map((item, index) => ({
      sno: index + 1,
      roll_no: item.roll_no,
      first_name: item.first_name,
      branch: item.branch[0] || "", // Ensure branch has a default value
      college: item.college,
      easy: item.problems_count.easy, // Access easy from problems_count
      medium: item.problems_count.medium, // Access medium from problems_count
      hard: item.problems_count.hard, // Access hard from problems_count
    })),
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
          transition={Bounce}
        />
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Student Inactive Problems List</CardTitle>
            </CardBody>
            <CardBody>
              {loading ? (
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
                    />
                  </div>
                </div>
              ) : (
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(StudentInactiveProblemsList);
