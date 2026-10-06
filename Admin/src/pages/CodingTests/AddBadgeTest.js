import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  CardTitle,
  InputGroup,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import Flatpickr from "react-flatpickr"

import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx'; // Import everything as XLSX
const AddBadge = (props) => {
  document.title = "Technial Hub| Add Badge";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Badges", link: "/badges-list" },
    { title: "Add Badge", link: "/add-badge" },
  ];
  const [data, setData] = useState({});
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedOwlTechnologyGroup, setselectedOwlTechnologyGroup] = useState(null)

  const [courseData, setCourseData] = useState([])
  const [technologyData, setTechnologyData] = useState([])
  const [owlTechnologyData, setOwlTechnologyData] = useState([])

  const [moduleData, setModuleData] = useState([])
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [questionFile, setQuestionFile] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedNegativeMarks, setSelectedNegativeMarks] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState(['modules']);
  const [availableCount, setAvailableCount] = useState();
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
  useEffect(() => {
    props.setBreadcrumbItems('Add Badge', breadcrumbItems);
    fetchData()
    if (selectedGroup) {
      fetchTechnologyData()
      fetchOwlGroundTechnologyData()
    }
    if (selectedTechnologyGroup) {
      console.log(selectedTechnologyGroup)
      fetchModuleData()

    }

  }, [selectedGroup, selectedTechnologyGroup]);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-courses');
      if (response.status === 200) {
        setCourseData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const fetchTechnologyData = async () => {
    console.log(selectedGroup.value)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'get-technology-by-course-id', { course_id: selectedGroup.value });
      if (response.status === 200) {
        console.log(response.data)
        setTechnologyData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const fetchOwlGroundTechnologyData = async () => {
    console.log(selectedGroup.value)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-coding-badge-owl-ground-technologies');
      if (response.status === 200) {
        console.log(response.data)
        setOwlTechnologyData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const fetchModuleData = async () => {
    if (typeof (selectedTechnologyGroup) != 'undefined') {
      const technologyIds = selectedTechnologyGroup.map(group => group.value);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.post(backendUrl + 'get-modules-by-technologies', { technologies: technologyIds });
        if (response.status === 200) {
          console.log(response.data)
          setModuleData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
  }
  const fetchQuestionsCountData = async () => {
    if (typeof (selectedTechnologyGroup) != 'undefined') {
      const technologyIds = selectedTechnologyGroup.map(group => group.value);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.post(backendUrl + 'available-questions-count', { technologies: technologyIds, course: selectedGroup.value });
        if (response.status === 200) {
          setAvailableCount(response.data)
          console.log(response.data)
          // setModuleData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
  }
  useEffect(() => {
    if (selectedTechnologyGroup && selectedGroup) {
      fetchQuestionsCountData()
    }

  }, [selectedTechnologyGroup, selectedGroup])
  const optionTypeGroup = [
    { value: 'slot', label: 'Slot' },
    { value: 'bulk', label: 'Bulk' }
  ];
  const optionGroup = courseData.map((ele) => ({
    options: [
      { label: ele.course_name, value: ele._id }
    ]
  }));
  const technologyOptionGroup = technologyData.map((ele) => ({
    options: [
      { label: ele.technology_name, value: ele._id }
    ]
  }));
  const owlTechnologyOptionGroup = owlTechnologyData.map((ele) => ({
    options: [
      { label: ele.technology_name, value: ele._id }
    ]
  }));
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  function handleSelectGroup(selectedGroup) {
    setselectedGroup(selectedGroup)
  }
  function handleTechnologySelectGroup(selectedGroup) {
    setselectedTechnologyGroup(selectedGroup)
  }
  function handleOwlTechnologySelectGroup(selectedGroup) {
    setselectedOwlTechnologyGroup(selectedGroup)
  }
  function handleSelectType(selectedGroup) {
    console.log(selectedGroup)
    setSelectedType(selectedGroup)
  }

  const handleTimeGroup = (selectedOption) => {
    setSelectedTime(selectedOption);
  };

  const handleNegativeMarksGroup = (selectedOption) => {
    setSelectedNegativeMarks(selectedOption);
  };

  const addBadge = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const technologyArray = [];
    const owlTechnologyArray = [];

    selectedTechnologyGroup.forEach(technology => {
      technologyArray.push(technology.value);
    });
    selectedOwlTechnologyGroup.forEach(technology => {
      owlTechnologyArray.push(technology.value);
    });
    if (selectedType.value == 'slot') {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('course', selectedGroup.value);
      formData.append('technology', technologyArray);
      formData.append('owl_technology', owlTechnologyArray);

      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      formData.append('coding_easy', data.easy_coding_questions);
      formData.append('coding_medium', data.medium_coding_questions);
      formData.append('coding_hard', data.hard_coding_questions);
      // formData.append('objectives', data.objectives);
      formData.append('total_time', selectedTime.value);
      formData.append('negative_marks', selectedNegativeMarks.value);
      formData.append('seats', data.seats);
      formData.append('question_file', questionFile);
      formData.append('badge_type', selectedType.value)

      try {
        const response = await axios.post(`${backendUrl}add-coding-badge-test`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (response.status === 200) {
          // navigate(`/dashboard`);
          alert('success')
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else {
      console.log("this is form data")
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('course', selectedGroup.value);
      formData.append('technology', technologyArray);
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      formData.append('coding_easy', data.easy_coding_questions);
      formData.append('coding_medium', data.medium_coding_questions);
      formData.append('coding_hard', data.hard_coding_questions);
      // formData.append('objectives', data.objectives);
      formData.append('total_time', selectedTime.value);
      formData.append('negative_marks', selectedNegativeMarks.value);
      formData.append('file', file);
      formData.append('question_file', questionFile);
      formData.append('badge_type', selectedType.value)


      try {
        const response = await axios.post(`${backendUrl}add-coding-badge-test`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (response.status === 200) {
          // navigate(`/dashboard`);
          alert('success')
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

  };
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    console.log(event.target.files[0])
  };
  const handleQuestionsFileChange = (event) => {
    setQuestionFile(event.target.files[0]);
    console.log(event.target.files[0])
  };
  const handleSampleDownload = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      selectedOptions, // Header row
      ...moduleData.map(module => [module.module_name, ""]) // Dynamic rows based on module names
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Sample Data");

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // Convert the binary string to a Blob
    const s2ab = (s) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    };

    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

    // Trigger download
    saveAs(blob, "Sample_Modules_Questions.xlsx");
  };
  const handleCheckboxChange = (event) => {
    const value = event.target.value;
    setSelectedOptions(prevSelected =>
      prevSelected.includes(value)
        ? prevSelected.filter(option => option !== value)
        : [...prevSelected, value]
    );
  };
  console.log(selectedOptions)
  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Badge</h4>

              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Title</Label>
                      <AvField
                        name="title"
                        placeholder="Enter title "
                        type="text"
                        errorMessage="Enter Title of the badge test"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
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
                      <Label>Select Course</Label>
                      <Select
                        value={selectedGroup}
                        onChange={handleSelectGroup}
                        options={optionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Technology</Label>
                      <Select
                        value={selectedTechnologyGroup}
                        onChange={handleTechnologySelectGroup}
                        options={technologyOptionGroup}
                        classNamePrefix="select2-selection"
                        isMulti={true}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Owlground Technology</Label>
                      <Select
                        value={selectedOwlTechnologyGroup}
                        onChange={handleOwlTechnologySelectGroup}
                        options={owlTechnologyOptionGroup}
                        classNamePrefix="select2-selection"
                        isMulti={true}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>Start Date and Time</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M, yyyy HH:mm"
                            onChange={(e) => setStartDate(new Date(e))}
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              altInput: true,
                              altFormat: "F j, Y h:i K",
                              // onChange: function (selectedDates, dateStr, instance) {
                              //   console.log(selectedDates)
                              //   const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y H:i");
                              //   setStartDate(formattedDate);
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
                        <Label>End Date and Time</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M, yyyy HH:mm"
                            onChange={(e) => setEndDate(new Date(e))}
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
                      <Label>Total Time</Label>
                      <Select
                        value={selectedTime}
                        onChange={handleTimeGroup}
                        options={timeOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Negative marks</Label>
                      <Select
                        value={selectedNegativeMarks}
                        onChange={handleNegativeMarksGroup}
                        options={negativeMarksOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Label htmlFor="validationCustom01" style={{ marginRight: "15px" }}>Coding Section</Label>

                  <Col md="2">
                    <div className="mb-3">
                      <Label htmlFor="easyCodingQuestions" style={{ marginRight: "15px" }}>Easy</Label>
                      <AvField
                        name="easy_coding_questions"
                        placeholder="Easy Count"
                        type="number"
                        errorMessage="Enter no. of easy coding questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="easyCodingQuestions"
                        onChange={handleChange}
                        value={data.easy_coding_questions}
                      />
                    </div>
                  </Col>

                  <Col md="2">
                    <div className="mb-3">
                      <Label htmlFor="mediumCodingQuestions" style={{ marginRight: "15px" }}>Medium</Label>
                      <AvField
                        name="medium_coding_questions"
                        placeholder="No. of Medium Questions"
                        type="number"
                        errorMessage="Enter no. of medium coding questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="mediumCodingQuestions"
                        onChange={handleChange}
                        value={data.medium_coding_questions}
                      />
                    </div>
                  </Col>

                  <Col md="2">
                    <div className="mb-3">
                      <Label htmlFor="hardCodingQuestions" style={{ marginRight: "15px" }}>Hard</Label>
                      <AvField
                        name="hard_coding_questions"
                        placeholder="No. of Hard Questions"
                        type="number"
                        errorMessage="Enter no. of hard coding questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="hardCodingQuestions"
                        onChange={handleChange}
                        value={data.hard_coding_questions}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md="8">
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                      <Label htmlFor="validationCustom01" style={{ marginRight: "15px" }}>
                        MCQ Section
                      </Label>
                      <div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="mcqSection"
                            id="mcqOption"
                            value="mcq"
                            onChange={handleCheckboxChange}
                          />
                          <label className="form-check-label" htmlFor="mcqOption">
                            MCQ
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="mcqSection"
                            id="yesOrNoOption"
                            value="yes_or_no"
                            onChange={handleCheckboxChange}
                          />
                          <label className="form-check-label" htmlFor="yesOrNoOption">
                            Yes or No
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="mcqSection"
                            id="codeDebugOption"
                            value="code_debug"
                            onChange={handleCheckboxChange}
                          />
                          <label className="form-check-label" htmlFor="codeDebugOption">
                            Code Debug
                          </label>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                {selectedTechnologyGroup && selectedOptions.length > 1 &&
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <div className="mb-3">
                          <label className="form-label">Upload No. of Questions by Technology</label><br />
                          <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleQuestionsFileChange} />
                        </div>

                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-3">
                        <label className="form-label"></label><br />
                        <Button color="primary" onClick={handleSampleDownload}>
                          Download Sample Excel
                        </Button>
                      </div>
                    </Col>
                  </Row>

                }

                {/* <Row>
                  
                  <Col md="6">
                    <div className="mb-3 d-flex justify-content-between">
                      <Label htmlFor="validationCustom01" style={{ marginRight: "15px" }}>Code Segment </Label>
                      <AvField
                        name="code_segment"
                        placeholder="No.of Questions "
                        type="number"
                        errorMessage="Enter no. of code segment questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.no_of_questions}
                      />
                    </div>
                  </Col>
                </Row> */}


                {selectedType && selectedType.value == 'slot' &&
                  <Row>
                    <Col md="6">
                      <div className="mb-3 d-flex justify-content-between">
                        <Label htmlFor="validationCustom01" style={{ marginRight: "15px" }}>No. Of Seats</Label>
                        <AvField
                          name="seats"
                          placeholder="No.of Seats "
                          type="number"
                          errorMessage="Enter no. of no.of seats"
                          className="form-control"
                          validate={{ required: { value: true } }}
                          id="validationCustom01"
                          onChange={handleChange}
                          value={data.seats}
                        />
                      </div>
                    </Col>
                  </Row>}
                {selectedType && selectedType.value == 'bulk' &&
                  <Row>

                    <Col md="6">
                      <div className="mb-3">
                        <div className="mb-3">
                          <label className="form-lable">Upload eligible roll numbers</label><br />
                          <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                        </div>
                      </div>
                    </Col>
                  </Row>}
                <Button color="primary" type="button" onClick={addBadge}>
                  Submit
                </Button>

              </AvForm>
            </CardBody>
          </Card>
        </Col>
        <Col xl="6">
          <h5>Available Questions Count</h5>
          <Row>
            <Col xl="6">
              {/* Display MCQ Count */}
              {availableCount && availableCount.mcqCount && (
                <div>
                  <h5>MCQ Questions</h5>
                  <h6>Technology: {availableCount.mcqCount[0]?.technology_name}</h6>
                  {availableCount.mcqCount.map((item, index) => (
                    <p key={index}>
                      {item.module_name}: {item.count}
                    </p>
                  ))}
                </div>
              )}
            </Col>

            <Col xl="6">
              {/* Display Code Debug Count */}
              {availableCount && availableCount.codeDebugCount && (
                <div>
                  <h5>Code Debug Questions</h5>
                  <h6>Technology: {availableCount.codeDebugCount[0]?.technology_name}</h6>
                  {availableCount.codeDebugCount.map((item, index) => (
                    <p key={index}>
                      {item.module_name}: {item.count}
                    </p>
                  ))}
                </div>
              )}
            </Col>


          </Row>
          <Row>
            <Col xl="6">
              {/* Display Yes/No Count */}
              {availableCount && availableCount.yesornoCount && (
                <div>
                  <h5>Yes/No Questions</h5>
                  <h6>Technology: {availableCount.yesornoCount[0]?.technology_name}</h6>
                  {availableCount.yesornoCount.map((item, index) => (
                    <p key={index}>
                      {item.module_name}: {item.count}
                    </p>
                  ))}
                </div>
              )}
            </Col>
            <Col xl="6">
              {/* Display Yes/No Count */}
              {availableCount && availableCount.codingCount && (
                <div>
                  <h5>Coding Questions</h5>
                  {Object.entries(availableCount.codingCount).map(([technologyName, modules]) => (
                    <div key={technologyName}>
                      <h6>Technology: {technologyName}</h6>
                      {Object.entries(modules).map(([moduleName, counts]) => (
                        <div key={moduleName}>
                          <h6>Module: {moduleName}</h6>
                          <p>
                            Easy: {counts.easy || 0}
                            <span style={{ margin: '0 20px' }}></span>
                            Medium: {counts.medium || 0}
                            <span style={{ margin: '0 20px' }}></span>
                            Hard: {counts.hard || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </Col>



          </Row>
        </Col>

      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddBadge);
