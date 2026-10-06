import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, Button, Badge } from "reactstrap";
import { MutatingDots } from "react-loader-spinner";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setBreadcrumbItems } from "../../../store/actions";
import axios from "axios";
import * as XLSX from "xlsx"; // Import the xlsx library
import "./datatables.scss";


const UsersList = (props) => {
  document.title = "Users list | Technical Hub - All the list of Users";

  const breadcrumbItems = [
    { title: "Aditya University", link: "#" },
    { title: "Users", link: "#" },
    { title: "Users List", link: "#" },
  ];
  const [userData, setUserData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems("Users", breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "getbusUsersdata");
      console.log(response.data);
      if (response.status === 200) {
        setUserData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  // Prepare data for the MDBDataTable component
  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 30 },
      { label: "Name", field: "first_name", sort: "asc", width: 150 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "Gender", field: "gender", sort: "asc", width: 150 },
      { label: "College", field: "college", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 150 },
      { label: "Passout Year", field: "passout_year", sort: "asc", width: 150 },
      { label: "Town", field: "town", sort: "asc", width: 150 },
      { label: "Stage", field: "bus_stage", sort: "asc", width: 150 },
      { label: "status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 150 },
    ],
    rows: userData.map((user, index) => ({
      sno: index + 1,
      first_name: user.first_name,
      roll_no: user.roll_no,
      gender: user.gender,
      college: user.college,
      branch: user.branch[0],
      passout_year: user.passout_year,
      town: user.town,
      bus_stage: user.bus_stage,
      status:
        user.bus_status === 1 ? (
          <Badge
            color="success"
            className="bg-success"
          >
            Active
          </Badge>
        ) : (
          <Badge
            color="danger"
            className="bg-danger"
          >
            Inactive
          </Badge>
        ),
      actions: (
        <div>
          <Link
            to={`/bus-edit-user/${user._id}`}
            className="btn btn-info btn-sm me-2"
          >
            Edit
          </Link>
        </div>
      ),
      technology:
        user.technologyInfo &&
        user.technologyInfo.map((obj) => obj.technology_name).join(", "),
    })),
  };

  // Function to handle the Excel file download
  const downloadExcel = () => {
    const excelData = userData.map((user, index) => ({
      "S.No": index + 1,
      Name: user.first_name,
      "Roll No": user.roll_no,
      Gender: user.gender,
      College: user.college,
      Branch: user.branch[0],
      "Passout Year": user.passout_year,
      Town: user.town,
      Stage: user.bus_stage,
      Status: user.bus_status === 1 ? "Active" : "Inactive",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData); // Convert JSON data to sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users"); // Append the sheet to the workbook
    XLSX.writeFile(wb, "Users_List.xlsx"); // Trigger file download
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
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <h4>Users List</h4>
                <Button color="primary" onClick={downloadExcel}>
                  Download Excel
                </Button>
              </div>
              {/* <CardBody className="d-flex justify-content-between align-items-center">
             <CardTitle className="h4">Add User</CardTitle>               <a href="add-user">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD User</Button>
              </a> 
             </CardBody> */}
              {data.rows.length !== 0 ? (
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
                    />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(UsersList);
