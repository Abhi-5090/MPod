import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, Badge, Button } from "reactstrap";
import { MutatingDots } from "react-loader-spinner";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../../store/actions";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./datatables.scss";

const UsersList = (props) => {
  document.title = "Users list | Technical Hub - All the list of Users";

  const breadcrumbItems = [
    { title: "Aditya University", link: "#" },
    { title: "Users", link: "#" },
    { title: "Inactive Users List", link: "#" },
  ];

  const [userData, setUserData] = useState([]);

  useEffect(() => {
    props.setBreadcrumbItems("Users", breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "get_businactive");
      if (response.status === 200) {
        setUserData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 30 },
      { label: "Date Time", field: "datetime", sort: "asc", width: 50 },
      { label: "AM/PM", field: "ampm", sort: "asc", width: 30 },
      { label: "Name", field: "first_name", sort: "asc", width: 150 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "Gender", field: "gender", sort: "asc", width: 150 },
      { label: "College", field: "college", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 150 },
      { label: "Added User", field: "added_by", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
    ],
    rows: userData.map((user, index) => {
      const [hour, minute, second] = user.time.split(":");
      const hourInt = parseInt(hour, 10);
      const ampm = hourInt >= 12 ? "PM" : " AM"; // Determine AM/PM

      return {
        sno: index + 1,
        datetime: `${user.date} ${hourInt % 12 || 12}:${minute}:${second}`, // Format time to 12-hour clock
        ampm: ampm, // Add AM/PM value
        first_name: user.first_name,
        roll_no: user.roll_no,
        gender: user.gender,
        college: user.college,
        branch: user.branch,
        added_by: user.added_by,
        status:
          user.status === 1 ? (
            <Badge color="success" className="bg-success">
              Active
            </Badge>
          ) : (
            <Badge color="danger" className="bg-danger">
              Inactive
            </Badge>
          ),
      };
    }),
  };

  const handleExportToExcel = () => {
    const exportData = userData.map((user, index) => {
      const [hour, minute, second] = user.time.split(":");
      const hourInt = parseInt(hour, 10);
      const ampm = hourInt >= 12 ? "PM" : "AM";

      return {
        "S.No": index + 1,
        "Date Time": `${user.date} ${hourInt % 12 || 12}:${minute}:${second}`,
        "AM/PM": ampm,
        Name: user.first_name,
        "Roll No": user.roll_no,
        Gender: user.gender,
        College: user.college,
        Branch: user.branch,
        "Added User": user.added_by,
        Status: user.status === 1 ? "Active" : "Inactive",
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const excelFile = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(excelFile, "Inactive-users-list.xlsx");
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody>
              <div
                style={{ paddingLeft: "50px" }}
                className="d-flex justify-content-end mb-3"
              >
                <Button
                  color="primary"
                  onClick={handleExportToExcel}
                  style={{ marginBottom: "15px" }}
                >
                  Download Excel
                </Button>
              </div>

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
