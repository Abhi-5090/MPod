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
    { title: "Active Users List", link: "#" },
  ];

  const [userData, setUserData] = useState([]);

  useEffect(() => {
    props.setBreadcrumbItems("Users", breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "get_busactive");
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
      { label: "Date Time", field: "datetime", sort: "asc", width: 200 },
      { label: "AM/PM", field: "ampm", sort: "asc", width: 50 }, // New AM/PM column
      { label: "Name", field: "first_name", sort: "asc", width: 150 },
      { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
      { label: "Gender", field: "gender", sort: "asc", width: 150 },
      { label: "College", field: "college", sort: "asc", width: 150 },
      { label: "Branch", field: "branch", sort: "asc", width: 150 },
      { label: "Added User", field: "added_by", sort: "asc", width: 150 },
      { label: "Status", field: "bus_status", sort: "asc", width: 30 },
    ],
    rows: userData.map((user, index) => {
      // Convert 24-hour time to 12-hour format with AM/PM
      const [hour, minute, second] = user.time.split(":");
      const hourInt = parseInt(hour, 10);
      const ampm = hourInt >= 12 ? "PM" : "AM";
      const formattedHour = hourInt % 12 || 12; // Convert hour to 12-hour format, treating 0 as 12

      return {
        sno: index + 1,
        datetime: `${user.date} ${formattedHour}:${minute}:${second}`, 
        ampm: ampm, 
        first_name: user.first_name,
        roll_no: user.roll_no,
        gender: user.gender,
        college: user.college,
        branch: user.branch,
        added_by: user.added_by,
        bus_status:
          user.bus_status === 0 ? (
            <Badge color="danger" className="bg-danger">
              Inactive
            </Badge>
          ) : (
            <Badge color="success" className="bg-success">
              Active
            </Badge>
          ),
      };
    }),
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      userData.map((user, index) => ({
        "S.No": index + 1,
        "Date": user.date,
        "Time": user.time,
        "AM/PM": parseInt(user.time.split(":")[0], 10) >= 12 ? "PM" : "AM",
        "Name": user.first_name,
        "Roll No": user.roll_no,
        "Gender": user.gender,
        "College": user.college,
        "Branch": user.branch,
        "Status": user.bus_status === 0 ? "Inactive" : "Active",
        "Added User": user.added_by,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Users");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xff;
    }
    const file = new Blob([buf], { type: "application/octet-stream" });
    saveAs(file, "Active_Users_List.xlsx");
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
                <Button color="primary" onClick={handleDownloadExcel}>
                  Download Excel
                </Button>
              </div>
              {data.rows.length !== 0 ? (
                <MDBDataTable
                  responsive
                  bordered
                  data={data}
                  noBottomColumns
                />
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