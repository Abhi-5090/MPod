import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";

const ProblemsList = (props) => {
  document.title = "Problem list | Technical Hub - Problem";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Problem", link: "#" },
    { title: "Problem List", link: "#" },
  ];

  const [problemData, setProblemData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Number of rows to display per page
  const [goToPage, setGoToPage] = useState(""); // State to store input for "Go to Page"

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'intern' ||authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems("Problem", breadcrumbItems);

    // Restore current page from localStorage
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-problems`);
      if (response.status === 200) {
        setProblemData(response.data);
        setFilteredData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    if (searchValue) {
      setFilteredData(
        problemData.filter((item) =>
          Object.values(item).some((val) =>
            val.toString().toLowerCase().includes(searchValue)
          )
        )
      );
    } else {
      setFilteredData(problemData);
    }

    // Reset to the first page after searching
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    localStorage.setItem("currentPage", newPage);
  };

  const handleGoToPage = () => {
    const pageNumber = Number(goToPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      localStorage.setItem("currentPage", pageNumber);
    } else {
      alert("Invalid page number");
    }
  };

  const paginateData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Problem List</CardTitle>
              <Link to="/add-problem" className="btn btn-primary">
                Add Problem
              </Link>
            </CardBody>

            <CardBody>
              {/* Go to Page Input and Search Input */}
              <div className="d-flex justify-content-between mb-3">
                {/* Go to Page */}
                <div className="d-flex align-items-center">
                  <input
                    type="number"
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    placeholder="Enter page number"
                    min={1}
                    max={totalPages}
                    className="form-control w-50 me-5"
                  />
                  <Button color="success" onClick={handleGoToPage}>
                    Go
                  </Button>
                </div>

                {/* Search Input */}
                <div className="d-flex align-items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={handleSearch}
                    className="form-control w-50"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Problem Name</th>
                      <th>Review Status</th>
                      <th>Complexity</th>
                      <th>Author</th>
                      <th>Tags</th>
                      <th>Companies</th>
                      <th>Python Code</th>
                      <th>Java Code</th>
                      <th>CPP Code</th>
                      <th>C Code</th>
                      <th>Verilog Code</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateData().map((problem, index) => (
                      <tr key={index}>
                        <td>{problem.problem_name}</td>
                        <td>
                          {problem.updated_by.length > 0 ? (
                            <i
                              className="ion ion-md-cloud-done"
                              style={{ fontSize: "2rem", color: "#008735" }}
                            ></i>
                          ) : (
                            "Not Reviewed"
                          )}
                        </td>
                        <td>
                          <Badge
                            color={
                              problem.complexity === "easy"
                                ? "success"
                                : problem.complexity === "medium"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {problem.complexity}
                          </Badge>
                        </td>
                        <td>{problem.author}</td>
                        <td>{problem.tags.join(", ")}</td>
                        <td>{problem.companies.join(", ")}</td>
                        <td>
                          {problem.python_editor_data.python_code ? (
                            <i
                              className="ion ion-md-checkmark-circle"
                              style={{ fontSize: "2rem", color: "#008735" }}
                            ></i>
                          ) : (
                            <i
                              className="ion ion-md-close-circle"
                              style={{ fontSize: "2rem", color: "#EC536C" }}
                            ></i>
                          )}
                        </td>
                        <td>
                          {problem.java_editor_data.java_code ? (
                            <i
                              className="ion ion-md-checkmark-circle"
                              style={{ fontSize: "2rem", color: "#008735" }}
                            ></i>
                          ) : (
                            <i
                              className="ion ion-md-close-circle"
                              style={{ fontSize: "2rem", color: "#EC536C" }}
                            ></i>
                          )}
                        </td>
                        <td>
                          {problem.cpp_editor_data.cpp_code ? (
                            <i
                              className="ion ion-md-checkmark-circle"
                              style={{ fontSize: "2rem", color: "#008735" }}
                            ></i>
                          ) : (
                            <i
                              className="ion ion-md-close-circle"
                              style={{ fontSize: "2rem", color: "#EC536C" }}
                            ></i>
                          )}
                        </td>
                        <td>
                          {problem.c_editor_data.c_code ? (
                            <i
                              className="ion ion-md-checkmark-circle"
                              style={{ fontSize: "2rem", color: "#008735" }}
                            ></i>
                          ) : (
                            <i
                              className="ion ion-md-close-circle"
                              style={{ fontSize: "2rem", color: "#EC536C" }}
                            ></i>
                          )}
                        </td>
                        <td>
                          {problem.verilog_editor_data &&
                          problem.verilog_editor_data.verilog_code ? (
                            <i
                              className="ion ion-md-checkmark-circle"
                              style={{ fontSize: "2rem", color: "#008735" }}
                            ></i>
                          ) : (
                            <i
                              className="ion ion-md-close-circle"
                              style={{ fontSize: "2rem", color: "#EC536C" }}
                            ></i>
                          )}
                        </td>
                        <td>
                          <Link
                            to={`/edit-problem/${problem._id}`}
                            className="btn btn-info btn-sm me-2"
                          >
                            Edit
                          </Link>
                          <Button color="danger" size="sm">
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button
                  color="primary"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  color="primary"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(ProblemsList);
