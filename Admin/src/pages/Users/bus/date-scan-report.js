import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import { MutatingDots } from "react-loader-spinner";
import axios from "axios";
import { MDBDataTable } from "mdbreact";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import Active from "./images/active.png";
import INActive from "./images/inactive.png";

const UsersList = () => {
  document.title = "Date Users list | Technical Hub - All the list of Users";

  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [responseCount, setResponseCount] = useState({ active: 0, inactive: 0 });

  // specific date
  const fetchDateCount = async (filter = "") => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    console.log(filter)
    try {
      const response = await axios.post(`${backendUrl}get-date-count`, { date: filter });
      if (response.status === 200) {
        console.log("API Response (Date Count):", response.data); 


        console.log("Active Count:", response.data[0].active); 
        console.log("Inactive Count:", response.data.inactive); 
        setResponseCount(response.data); 
      }
    } catch (error) {
      console.error("Error fetching date count:", error);
    }
  };
  

  // Function to fetch user data based on the selected date
  const fetchData = async (filter = "") => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}get-date-status`, { date: filter });
      if (response.status === 200) {
        setUserData(response.data);  
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // On filter change (Date selected)
  const handleFilterChange = (e) => {
    const selectedDate = e.target.value;
    setSelectedDate(selectedDate); 
    fetchData(selectedDate);
    fetchDateCount(selectedDate); 
  };

  // Export to Excel functionality
  const handleExportToExcel = () => {
    const exportData = userData.map((user, index) => ({
      "S.No": index + 1,
      "Date Time": user.date,
      "Active": user.active,
      "Inactive": user.inactive,
      "Total": user.total,
      "Scan by": user.Added,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const excelFile = new Blob([excelBuffer], { type: "application/octet-stream" });
    const filename = userData.length > 0 && userData[0].Added
      ? `bus_scanner_report_${userData[0].date}.xlsx`
      : 'user_data_unknown.xlsx';

    saveAs(excelFile, filename);
  };

  
  useEffect(() => {
    fetchData(); // Fetch data initially
    fetchDateCount(); // Fetch active/inactive count initially
  }, []);

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 30 },
      { label: "Date", field: "datetime", sort: "asc", width: 50 },
      { label: "Active", field: "active", sort: "asc", width: 50 },
      { label: "Inactive", field: "inactive", sort: "asc", width: 50 },
      { label: "Total", field: "total", sort: "asc", width: 50 },
      { label: "Scan by", field: "added_by", sort: "asc", width: 50 },
    ],
    rows: userData.length > 0 ? userData.map((user, index) => ({
      sno: index + 1,
      datetime: user.date,
      active: user.active,
      inactive: user.inactive,
      total: user.total,
      added_by: user.Added,
    })) : [],
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody>
              <div className="d-flex mb-3">
                <div>
                  <input
                    className="form-control"
                    type="date"
                    value={selectedDate} 
                    onChange={handleFilterChange} 
                  />
                </div>
                <div className="d-flex mb-3" style={{ marginLeft: "20px" }}>
                  <Button color="primary" onClick={handleExportToExcel} style={{ marginBottom: "15px" }}>
                    Download Excel
                  </Button>
                </div>
              </div>
              { responseCount[0] &&

              <Row>
                <Col xl={4} md={4}>
                  <Card>
                    <CardBody>
                      <h4 className="card-title mb-4">
                        <b style={{ color: 'blue' }}>Active</b>
                      </h4>
                      <Row>
                        <Col md="6">
                          <div>
                           
                            {
                              responseCount[0] &&  <h1>{responseCount[0].active}</h1>  
                            }
                          </div>
                        </Col>
                        <Col md="6">
                          <div>
                            <img src={Active} alt="Active" style={{ width: '90px', height: '90px' }} />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>

                <Col xl={4} md={4}>
                  <Card>
                    <CardBody>
                      <h4 className="card-title mb-4">
                        <b style={{ color: 'red' }}>Inactive</b>
                      </h4>
                      <Row>
                        <Col md="6">
                          <div>
                           {
                              responseCount[0] &&  <h1>{responseCount[0].inactive}</h1>  
                            }
                          </div>
                        </Col>
                        <Col md="6">
                          <div>
                            <img src={INActive} alt="Inactive" style={{ width: '90px', height: '90px' }} />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
             }             

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

export default UsersList;
