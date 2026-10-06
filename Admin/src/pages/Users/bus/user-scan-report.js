import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Button, Input } from "reactstrap";
import { MutatingDots } from "react-loader-spinner";
import axios from "axios";
import { MDBDataTable } from "mdbreact";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const UsersList = () => {
  document.title = "Users list | Technical Hub - All the list of Users";

  const [userData, setUserData] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]); // State for filter options
  const [filterOption, setFilterOption] = useState(""); // State for selected filter
  const [loading, setLoading] = useState(false);

  // Fetch the filter options
  const fetchFilterOptions = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-filter-options`); // Adjust the endpoint
      if (response.status === 200) {
        setFilterOptions(response.data); // Assuming the response contains an array of filter options
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  // Fetch the user data based on the selected filter
  const fetchData = async (filter = "") => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}get-total-status-client`, {
        added_by: filter,
        // Sending the filter option to the backend
      });
      if (response.status === 200) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // On filter change
  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setFilterOption(selectedFilter);
    fetchData(selectedFilter); // Fetch data as soon as filter is selected
  };

  // Export to Excel functionality
  const handleExportToExcel = () => {
    const exportData = userData.map((user, index) => ({
      "S.No": index + 1,
      "Date Time": user.Date,
      "Active": user.active,
      "Inactive": user.inactive,
      "Total": user.total,
      "Scan by": user.Added,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const excelFile = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    const filename = userData.length > 0 && userData[0].Added
    ? `bus scanner report.${userData[0].Added}.xlsx`
    : 'user_data.Unknown.xlsx';

  saveAs(excelFile, filename);
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchFilterOptions(); // Fetch filter options
    fetchData(); // Fetch data initially
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
    rows: userData.map((user, index) => {
      const formattedDate = new Date(user.Date).toLocaleDateString("en-GB");
      return {
        sno: index + 1,
        datetime: user.cuurentdate,
        active: user.active,
        inactive: user.inactive,
        total: user.total,
        added_by: user.Added,
      };
    }),
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody>
              <div className="d-flex mb-3">
                <div>
                  <select
                    className="form-control"
                    value={filterOption}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select Filter</option>
                    {filterOptions.length > 0 ? (
                      filterOptions.map((option, index) => (
                        <option key={index} value={option.Name}> 
                          {option.Name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading options...</option>
                    )}
                  </select>
                </div>
                <div className="d-flex mb-3" style={{ marginLeft: "20px" }}>
                  <Button
                    color="primary"
                    onClick={handleExportToExcel}
                    style={{ marginBottom: "15px" }}
                  >
                    Download Excel
                  </Button>
                </div>
              </div>

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
