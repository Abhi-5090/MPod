import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Modal,
} from "reactstrap";
import { MutatingDots } from "react-loader-spinner";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported

const StudentProblemsList = (props) => {
  document.title = "Student Certifications List";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Student Certifications", link: "#" },
    { title: "Student Certifications List", link: "#" },
  ];

  // State Variables
  const [user, setUser] = useState({});
  const [branch, setBranch] = useState([]);
  const [college, setCollege] = useState("");
  const [studentProblemsData, setStudentProblemsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false); // Modal visibility state
  const [selectedFile, setSelectedFile] = useState(""); // For storing the selected image or PDF

  // Toggle modal function
  const toggleModal = () => setModal(!modal);

  // Open modal and set selected image or PDF
  const openModalWithFile = (filePath) => {
    setSelectedFile(filePath); // Set the file to display
    toggleModal(); // Open the modal
  };
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
  // Set breadcrumb items
  useEffect(() => {
    props.setBreadcrumbItems("Student Certifications List", breadcrumbItems);
  }, [props, breadcrumbItems]);

  // Retrieve user data from localStorage
  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (authUser) {
      setUser(authUser);
      setBranch(authUser.branch);
      setCollege(authUser.college);
      console.log(authUser);
    }
  }, []);

  // Fetch data when branch and college are available
  useEffect(() => {
    if (
      (Array.isArray(branch) && branch.length > 0) ||
      (typeof branch === "string" && branch)
    ) {
      if (college) {
        fetchStudentProblemsData(branch, college);
      }
    }
  }, [branch, college]);

  // Fetch student problems data from the API
  const fetchStudentProblemsData = async (branch, college) => {
    const backendUrl =
      "https://apps.technicalhub.io/old/techpanel2/api/certifications/data.php";
    try {
      const response = await axios.get(backendUrl, {
        params: {
          college: college,
          branch: Array.isArray(branch) ? branch.join(",") : branch, // Handle branch as array or string
        },
      });
      if (response.status === 200) {
        setStudentProblemsData(response.data);
        setLoading(false);
      } else {
        toast.error("Failed to fetch data.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching data. Please try again.");
      setLoading(false);
    }
  };

  // Export data to Excel
  const exportToExcel = () => {
    // Define your custom headers
    const headers = [
      { header: "S.No", key: "sno" },
      { header: "Roll Number", key: "roll_number" },
      { header: "Name", key: "name" },
      { header: "Branch", key: "branch" },
      { header: "College", key: "college" },
      { header: "Passout Year", key: "passout_year" },
      { header: "Certification", key: "certification" },
      { header: "Certification Logo", key: "certification_logo" },
      { header: "Certification Path", key: "certificate_path" },
    ];

    // Prepare data with the new headers
    const formattedData = studentProblemsData.map((item, index) => ({
      sno: index + 1,
      roll_number: item.roll_number,
      name: item.name,
      branch: Array.isArray(item.branch) ? item.branch.join(", ") : item.branch, // Convert array to string if needed
      college: item.college,
      passout_year: item["pass out"], // Correctly access 'pass out' field
      certification: item.certification,
      certification_logo: item.certification_logo,
      certificate_path: item.certificate_path,
    }));

    // Create a worksheet and append the data
    const worksheet = XLSX.utils.json_to_sheet(formattedData, {
      header: headers.map((h) => h.key),
    });

    // Add headers to the worksheet
    XLSX.utils.sheet_add_aoa(worksheet, [
      headers.map((h) => h.header),
    ], { origin: "A1" });

    // Set column widths (optional)
    const columnWidths = [
      { wch: 5 }, // S.No
      { wch: 15 }, // Roll Number
      { wch: 25 }, // Name
      { wch: 15 }, // Branch
      { wch: 20 }, // College
      { wch: 15 }, // Passout Year
      { wch: 25 }, // Certification
      { wch: 30 }, // Certification Logo
      { wch: 30 }, // Certification Path
    ];
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Problems Data");

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(
      dataBlob,
      `student_problems_data_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Define the data structure for MDBDataTable
  const dataTableData = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Roll No", field: "roll_number", sort: "asc", width: 100 },
      { label: "Name", field: "name", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 100 },
      { label: "College", field: "college", sort: "asc", width: 150 },
      { label: "Passout Year", field: "passout_year", sort: "asc", width: 100 },
      { label: "Certification", field: "certification", sort: "asc", width: 150 },
      { label: "Certification Logo", field: "certification_logo", sort: "asc", width: 150 },
      { label: "Certification Path", field: "certificate_path", sort: "asc", width: 200 },
    ],
    rows: studentProblemsData.map((item, index) => ({
      sno: index + 1,
      roll_number: item.roll_number,
      name: item.name,
      branch: Array.isArray(item.branch) ? item.branch.join(", ") : item.branch, // Convert array to string if needed
      college: item.college,
      passout_year: item["pass out"], // Correctly access 'pass out' field
      certification: item.certification,
      certification_logo: (
        <div className="text-center">
          <img
            src={item.certification_logo}
            alt="Certification Logo"
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        </div>
      ),
      certificate_path: (
        <div className="text-center">
          <Button
            color="primary"
            onClick={() => openModalWithFile(item.certificate_path)} // Open modal with image or PDF
          >
            View
          </Button>
        </div>
      ),
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
              <CardTitle className="h4">Student Problems List</CardTitle>
              <Button onClick={exportToExcel} color="primary">
                Download Excel
              </Button>
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
                      wrapperStyle={{}}
                      wrapperClass=""
                    />
                  </div>
                </div>
              ) : (
                <MDBDataTable
                  responsive
                  bordered
                  hover
                  data={dataTableData}
                  searching={true}
                  noBottomColumns
                  striped
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Modal for displaying the certificate */}
      <Modal isOpen={modal} toggle={toggleModal} size="xl" centered>
        <div className="modal-header">
          <h5 className="modal-title mt-0" id="myModalLabel">
            Certificate
          </h5>
          <button type="button" className="close" onClick={toggleModal}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body" style={{ textAlign: "center" }}>
          {selectedFile && selectedFile.toLowerCase().endsWith(".pdf") ? (
            <iframe
              src={selectedFile}
              title="Certificate PDF"
              style={{ width: "100%", height: "80vh" }}
            />
          ) : selectedFile ? (
            <img
              src={selectedFile}
              alt="Certificate"
              style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
            />
          ) : (
            <p>No Certificate Available.</p>
          )}
        </div>
        <div className="modal-footer">
          <Button type="button" color="secondary" onClick={toggleModal}>
            Close
          </Button>
        </div>
      </Modal>
    </React.Fragment>
  );
};

const mapStatetoProps = (state) => {
  return {};
};

export default connect(mapStatetoProps, { setBreadcrumbItems })(StudentProblemsList);
