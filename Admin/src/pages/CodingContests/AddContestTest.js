import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  InputGroup,
  Label,
  Input,
  Button,
  FormGroup
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Flatpickr from "react-flatpickr";
import { MDBDataTable } from "mdbreact";
import axios from "axios";
import Select from "react-select";

const AddContest = (props) => {
  document.title = "Technical Hub | Add Contest";

  const [data, setData] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedNegativeMarks, setSelectedNegativeMarks] = useState(null);
  const [problemsData, setProblemsData] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, rowsPerPage: 10 });
  const [selectedEligible, setSelectedEligible] = useState()
  const [selectedYear, setSelectedYear] = useState();
  const [selectedType, setSelectedType] = useState(null);
  const [contestStartDate, setContestStartDate] = useState(null)
  const [contestEndDate, setContestEndDate] = useState(null)
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedRegistrationType, setSelectedRegistrationType] = useState(null);
  const [file, setFile] = useState(null);
  const [contestFile, setContestFile] = useState(null);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  const timeOptionGroup = [
    { value: 90, label: '90 minutes' },
    { value: 120, label: '120 minutes' },
    { value: 180, label: '180 minutes' },
    { value: 240, label: '240 minutes' },
  ];

  const negativeMarksOptionGroup = [
    { value: 0.25, label: '25%' },
    { value: 0.5, label: '50%' },
    { value: 0.75, label: '75%' },
    { value: 1.0, label: '100%' },
  ];
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 9 }, (_, index) => ({
      label: (currentYear + index).toString(),
      value: (currentYear + index).toString(),
    }));
  };
  const yearOptionGroup = getYearOptions();
  const optionTypeGroup = [
    { label: "Nano", value: "nano" },
    { label: "Minor", value: "minor" },
    { label: "Major", value: "major" },
  ];
  const optionRegistrationTypeGroup = [
    { label: "Open", value: "open" },
    { label: "Closed", value: "closed" },
  ];
  const optionEligibleGroup = [
    { label: "Thub", value: "thub" },
    { label: "Non-Thub", value: "nonthub" },
    { label: "All", value: "all" },
  ];
  useEffect(() => {
    const fetchProblemsDataByTags = async () => {
      let tags = { "tags": ["66c4d37ebc34038ca1d09e7b"] };
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.post(backendUrl + 'get-problems-by-tags', tags);
        setProblemsData(response.data);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    fetchProblemsDataByTags();
  }, []);

  const handleCheckboxChange = (problemId) => {
    setSelectedProblems(prev => {
      const isSelected = prev.includes(problemId);
      if (isSelected) {
        // Remove from array
        return prev.filter(id => id !== problemId);
      } else {
        // Add to array
        return [...prev, problemId];
      }
    });
  };
  console.log(selectedProblems)
  function handleSelectType(selectedGroup) {
    setSelectedType(selectedGroup)
  }
  function handleSelectRegistrationType(selectedGroup) {
    setSelectedRegistrationType(selectedGroup)
  }
  function handleSelectYear(selectedGroup) {
    setSelectedYear(selectedGroup)
  }
  function handleSelectEligible(selectedGroup) {
    console.log(selectedGroup)
    setSelectedEligible(selectedGroup)
  }
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleRowsPerPageChange = (rowsPerPage) => {
    setPagination(prev => ({ ...prev, rowsPerPage }));
  };
  const handleLanguageChange = (e) => {
    const language = e.target.name;
    const isChecked = e.target.checked;

    if (isChecked) {
      setSelectedLanguages((prev) => [...prev, language]);
    } else {
      setSelectedLanguages((prev) =>
        prev.filter((lang) => lang !== language)
      );
    }
  };
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  
  const handleContestFileChange = (event) => {
    setContestFile(event.target.files[0]);
  };
  const totalPages = Math.ceil(problemsData.length / pagination.rowsPerPage);

  const paginatedRows = () => {
    const { page, rowsPerPage } = pagination;
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return problemsData.slice(startIndex, endIndex).map(problem => ({
      checkbox: (
        <Input
          type="checkbox"
          checked={selectedProblems.includes(problem._id)}
          onChange={() => handleCheckboxChange(problem._id)}
        />
      ),
      problem_name: problem.problem_name || 'Unknown',
      complexity: problem.problem_complexity || 'Unknown'
    }));
  };

  const rowdata = {
    columns: [
      { label: 'Select', field: 'checkbox', sort: 'disabled' },
      { label: 'Problem Name', field: 'problem_name', sort: 'asc' },
      { label: 'Complexity', field: 'complexity', sort: 'asc' }
    ],
    rows: paginatedRows()
  };
  const addContest = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    console.log(file)
    console.log(contestFile)
    if (file || contestFile) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contestFile', contestFile);
      formData.append('title', data.title);
      formData.append('type', selectedType.value);
      formData.append('reg_type', selectedRegistrationType.value);
      formData.append('eligible', selectedEligible.value);
      formData.append('year', selectedYear.value);
      formData.append('reg_start_date', startDate);
      formData.append('reg_end_date', endDate);
      formData.append('contest_start_date', contestStartDate);
      formData.append('contest_end_date', contestEndDate);
      formData.append('problems', selectedProblems);
      formData.append('languages', selectedLanguages);

      // setShowButton(false);
      // setIsLoading(true);
      console.log(selectedProblems)
      try {
        const response = await axios.post(`${backendUrl}add-coding-contest-test`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (response.status === 200) {
          // navigate(`/dashboard`)
          alert("success");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      // finally {
      //   setShowButton(true);
      //   setIsLoading(false);
      // }
    } else {
      console.log(selectedProblems)

      const apidata = {
        title: data.title,
        type: selectedType.value,
        reg_type: selectedRegistrationType.value,
        eligible: selectedEligible.value,
        year: selectedYear.value,
        reg_start_date: startDate,
        reg_end_date: endDate,
        contest_start_date: contestStartDate,
        contest_end_date: contestEndDate,
        problems: selectedProblems,
        languages: selectedLanguages
      }
      const response = await axios.post(`${backendUrl}add-coding-contest-test`, apidata)
      if (response.status = 200) {
        console.log("coding contest created successfully")
        alert("Contest created successfully")
      }
    }
  };
  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Contest</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Registration Type</Label>
                      <Select
                        value={selectedRegistrationType}
                        onChange={handleSelectRegistrationType}
                        options={optionRegistrationTypeGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Title</Label>
                      <AvField
                        name="title"
                        placeholder="Enter title "
                        type="text"
                        errorMessage="Enter Title of the contest test"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        onChange={e => setData({ ...data, [e.target.name]: e.target.value })}
                        value={data.title}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Type</Label>
                      <Select
                        value={selectedType}
                        onChange={handleSelectType}
                        options={optionTypeGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>

                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Eligible Group</Label>
                      <Select
                        value={selectedEligible}
                        onChange={handleSelectEligible}
                        options={optionEligibleGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Year</Label>
                      <Select
                        value={selectedYear}
                        onChange={handleSelectYear}
                        options={yearOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                {selectedRegistrationType?.value === "open" &&
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Start Date</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M, yyyy HH:mm"
                            onChange={date => setStartDate(date)}
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              altInput: true,
                              altFormat: "F j, Y h:i K",
                            }}
                          />
                        </InputGroup>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>End Date</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M, yyyy HH:mm"
                            onChange={date => setEndDate(date)}
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              altInput: true,
                              altFormat: "F j, Y h:i K",
                            }}
                          />
                        </InputGroup>
                      </div>
                    </Col>
                  </Row>
                }

                <Row>

                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>Contest start Date and Time</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M, yyyy HH:mm"
                            onChange={(e) => setContestStartDate(new Date(e))}
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              altInput: true,
                              altFormat: "F j, Y h:i K",
                              // onChange: function (selectedDates, dateStr, instance) {
                              //   const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y H:i");
                              //   setEndDate(formattedDate);
                              // }
                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>Contest End Date and Time</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M, yyyy HH:mm"
                            onChange={(e) => setContestEndDate(new Date(e))}
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              altInput: true,
                              altFormat: "F j, Y h:i K",
                              // onChange: function (selectedDates, dateStr, instance) {
                              //   const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y H:i");
                              //   setEndDate(formattedDate);
                              // }
                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                </Row>
                <Row>            
                  <Col md="6">
                    <div className="mb-3">
                      <div className="mb-3">
                        <label className="form-lable">Upload Contest Image</label><br />
                        <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleContestFileChange} />
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Select Languages</Label>
                      <div>
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            name="c"
                            // checked={selectedLanguages.includes("csharp")}
                            onChange={handleLanguageChange}
                          /> C
                        </label>
                      </div>
                      <div>
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            name="cpp"
                            // checked={selectedLanguages.includes("csharp")}
                            onChange={handleLanguageChange}
                          /> Cpp
                        </label>
                      </div>
                      <div>
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            name="java"
                            // checked={selectedLanguages.includes("java")}
                            onChange={handleLanguageChange}
                          /> Java
                        </label>
                      </div>
                      <div>
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            name="python"
                            // checked={selectedLanguages.includes("python")}
                            onChange={handleLanguageChange}
                          /> Python
                        </label>
                      </div>
                      <div>
                        <label className="form-check-label">
                          <input
                            type="checkbox"
                            name="all"
                            // checked={selectedLanguages.includes("python")}
                            onChange={handleLanguageChange}
                          /> All
                        </label>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
                {selectedRegistrationType?.value === "closed" && <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <div className="mb-3">
                        <label className="form-label">Upload Roll Numbers</label>
                        <br />
                        <input
                          type="file"
                          className="form-control form-control-file"
                          data-buttonname="btn-secondary"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>}
                <Button color="primary" type="button" onClick={addContest}>
                  Submit
                </Button>

              </AvForm>
            </CardBody>
          </Card>
        </Col>
        <Col md="6">
          <Card>
            <CardBody>
              <h5>Problems List</h5>
              <div className="mb-3">
                <MDBDataTable
                  responsive
                  bordered
                  striped
                  data={rowdata}
                  paging={false} // Disable MDBDataTable pagination
                  noBottomColumns
                />
                {/* Custom Pagination Controls */}
                <div className="pagination-controls d-flex justify-content-between">
                  <Button
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <div>
                    {[...Array(totalPages)].map((_, index) => (
                      <Button
                        key={index}
                        color={pagination.page === index + 1 ? 'primary' : 'secondary'}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    disabled={pagination.page === totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

    </React.Fragment>
  );
};

export default AddContest;
