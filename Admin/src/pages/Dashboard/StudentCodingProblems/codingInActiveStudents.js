import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle,Button  } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../../store/actions";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  const exportToExcel = () => {
    const headers = ["Roll Number", "Name", "Branch", "College", "Passout Year"];
    const formattedData = studentProblemsData.map((item) => ({
      roll_no: item.roll_no,
      Name: item.first_name,
      branch: item.branch[0] || "",
      college: item.college,
      passout_year: item.passout_year,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Problems Data");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `student_problems_data_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 50 },
      { label: "Name", field: "first_name", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 100 },
      { label: "College", field: "college", sort: "asc", width: 100 },
      { label: "Passout Year", field: "passout_year", sort: "asc", width: 100 },
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
      passout_year: item.passout_year,

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
              <div className="d-flex justify-content-end">
                  <Button
                  style={{ backgroundColor: "rgb(122,111,190)", color: "white" }}
                    onClick={exportToExcel}
                    disabled={loading}
                  >
                    Export to Excel
                  </Button>
                  </div>            </CardBody>
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
