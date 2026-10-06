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
  Input,
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
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";


const AddInterview = (props) => {
  document.title = "Technial Hub| Add Interview";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Interviews List", link: "/ai-interviews-list" },
    { title: "Add Interview", link: "/add-ai-interview" },
  ];
  const [data, setData] = useState({});
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedType, setSelectedType] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const [selectedStatus, setSelectedStatus] = useState([])
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [user, setUser] = useState()
  const [selectedPlatform, setSelectedPlatform] = useState();
  const [availableQuestions, setAvailableQuestions] = useState();
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [file, setFile] = useState(null);


  const navigate = useNavigate();
  useEffect(() => {
    props.setBreadcrumbItems('Add Company Interview', breadcrumbItems);
    fetchCompanies();


  }, []);
  useEffect(() => {
    fetchCurrentUserData();
    fetchTags()
  }, []);
  const fetchTags = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_MPOD_BACKEND_URL + 'tags-list');
      if (response.status === 200) {
        setTags(response.data.tags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };
  const fetchCurrentUserData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

      const response = await axios.get(backendUrl + "get-admin-current-user");
      if (response.data) {
        setUser(response.data);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };
  const companyOptions = companies.map(company => ({
    label: company.company_name,
    value: company._id
  }));
  const statusOptions = [
    { label: "Active", value: "1" },
    { label: "not Active", value: "0" },
  ];

  const roundOptions = [
    { label: "TR1", value: "TR1" },
    { label: "TR2", value: "TR2" },
    { label: "TR3", value: "TR3" },
    { label: "TR4", value: "TR4" },
    { label: "MR1", value: "MR1" },
    { label: "HR1", value: "HR1" },

  ];
  const typeOptions = [
    { label: "Service Based", value: "service_based" },
    { label: "Product Based", value: "product_based" }
  ];
  const platformOptions = [
    { label: "Web", value: "web" },
    { label: "MPOD", value: "mpod" },

  ];
  const tagOptions = tags.map(tag => ({
    label: tag.tag_name,
    value: tag._id
  }));

  const interviewTypeOptions = [
    { label: "Single", value: "single" },
    { label: "Bulk", value: "bulk" },
  ];
  const handleInterviewTypeSelect = (selectedInterviewType) => {
    setSelectedInterviewType(selectedInterviewType);
    // Reset rollNo and file when switching types
    setRollNo("");
    setFile(null);
  };

  const handleChange = (e) => {
    setData({ ...data, no_of_questions: e.target.value });
  };
  const handleRollNoChange = (e) => {
    const { value } = e.target;
    setRollNo(value);
  };
  const handlePlatformSelect = (selectedplatform) => {
    console.log(selectedplatform)
    setSelectedPlatform(selectedplatform);
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const fetchCompanies = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_MPOD_BACKEND_URL + 'companies-list');
      if (response.status === 200) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  const fetchAvailableQuestionsData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

      const data = {
        company: selectedCompany.map((c) => c.value),
        type: selectedType.map((t) => t.value),
        round: selectedRound.map((r) => r.value),
        tag: selectedTag?.value
      };

      const response = await axios.post(
        backendUrl + "available-company-questions",
        data
      );
      if (response.data) {
        setAvailableQuestions(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching available questions:", error);
    }
  };

  useEffect(() => {

    if (
      selectedCompany && selectedCompany.length > 0 &&
      selectedType && selectedType.length > 0 &&
      selectedRound && selectedRound.length > 0
    ) {
      fetchAvailableQuestionsData();
    }
  }, [selectedCompany, selectedType, selectedRound]);


  const handlestatusSelect = (selectedLevel) => {
    setSelectedStatus(selectedLevel);
  };
  const AddInterview = async () => {
    if (
      !selectedPlatform ||
      !rollNo.trim() && selectedInterviewType?.value === "single" ||
      !file && selectedInterviewType?.value === "bulk" ||
      !selectedCompany?.length ||
      !selectedType?.length ||
      !selectedRound?.length ||
      !startDate ||
      !data.no_of_questions ||
      !selectedStatus
    ) {
      toast.warn("Please fill all required fields");
      return;
    }

    if (selectedInterviewType.value === "single" && !rollNo) {
      toast.warn("Please enter a Roll No");
      return;
    }

    if (selectedInterviewType.value === "bulk" && !file) {
      toast.warn("Please upload a file");
      return;
    }


    const dataList = {
      platform: selectedPlatform.value,
      company: selectedCompany.map(c => c.value),
      roll_no: rollNo.trim(),
      type: selectedType.map(t => t.value),
      round: selectedRound.map(r => r.value),
      tag: selectedTag?.value,
      start_date_time: startDate,
      questions_count: data.no_of_questions,
      status: selectedStatus.value,
      created_by: user ? user.roll_no : "",
      tenant_id: user ? user.t_id : "null",
    };

    if (selectedInterviewType.value === "single") {
      try {
        console.log(dataList);
        const response = await axios.post(process.env.REACT_APP_MPOD_BACKEND_URL + 'add-company-interview', dataList);
        if (response.status === 200) {
          toast.success("Interview added successfully!");
          setTimeout(() => {
            navigate(`/company-interviews-list`);
          }, 1000);
        }
      } catch (error) {
        if (error.response?.status === 400) {
          toast.error(`❌ ${error.response.data.message}`);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        console.error("Error adding interview:", error);
      }
    }
    else if (selectedInterviewType.value === "bulk") {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('platform', dataList.platform);
        formData.append('company', JSON.stringify(dataList.company));
        formData.append('type', JSON.stringify(dataList.type));
        formData.append('round', JSON.stringify(dataList.round));
        formData.append('tag', dataList.tag);
        formData.append('start_date_time', dataList.start_date_time);
        formData.append('questions_count', dataList.questions_count);
        formData.append('status', dataList.status);
        formData.append('created_by', dataList.created_by);
        formData.append('tenant_id', dataList.tenant_id);
        const response = await axios.post(process.env.REACT_APP_MPOD_BACKEND_URL + 'bulk-add-company-interviews', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(response);
        if (response.status === 207) {
          toast.success("Bulk interviews added successfully!");
          setTimeout(() => {
            navigate(`/company-interviews-list`);
          }, 1000);
        }
      }
      catch (error) {
        if (error.response?.status === 400) {
          toast.error(`❌ ${error.response.data.message}`);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        console.error("Error adding bulk interviews:", error);
      }
    }
  };

  const handleSampleDownload = () => {
    const sampleData = [
      { roll_no: "" }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Data");

    XLSX.writeFile(workbook, "sample_data.xlsx");
  };
  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Company Interview</h4>
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Platform</Label>
                      <Select
                        value={selectedPlatform}
                        onChange={handlePlatformSelect}
                        options={platformOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Interview Type</Label>
                      <Select
                        value={selectedInterviewType}
                        onChange={handleInterviewTypeSelect}
                        options={interviewTypeOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  {selectedInterviewType?.value === "single" ? (
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Enter Roll No</Label>
                        <Input
                          type="text"
                          name="roll_no"
                          placeholder="Enter Roll No"
                          value={rollNo}
                          onChange={handleRollNoChange}
                          required
                        />
                      </div>
                    </Col>
                  ) : selectedInterviewType?.value === "bulk" ? (
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Upload File</Label>
                        <Input
                          type="file"
                          name="file"
                          onChange={handleFileChange}
                          accept=".csv,.xlsx"
                          required
                        />
                        <Button color="secondary" onClick={handleSampleDownload}>
                          Download Sample
                        </Button>
                      </div>
                    </Col>
                  ) : null}
                </Row>
                <Row>
                  <Col md="6">
                    <Label>Select Company</Label>
                    <Select
                      value={selectedCompany}
                      onChange={setSelectedCompany}
                      options={companyOptions}
                      classNamePrefix="select2-selection"
                      isMulti
                    />
                  </Col>

                </Row>
                <Row>
                  <Col md="6">
                    <Label>Select Type</Label>
                    <Select
                      value={selectedType}
                      onChange={setSelectedType}
                      options={typeOptions}
                      classNamePrefix="select2-selection"
                      isMulti
                    />
                  </Col>
                  <Col md="6">
                    <Label>Select Round</Label>
                    <Select
                      value={selectedRound}
                      onChange={setSelectedRound}
                      options={roundOptions}
                      classNamePrefix="select2-selection"
                      isMulti
                    />
                  </Col>
                  <Col md="6">
                    <Label>Select Tag</Label>
                    <Select
                      value={selectedTag}
                      onChange={setSelectedTag}
                      options={tagOptions}
                      classNamePrefix="select2-selection"
                    />
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
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              altInput: true,
                              altFormat: "F j, Y h:i K",
                              onChange: function (selectedDates) {
                                if (selectedDates.length > 0) {
                                  const isoDate = selectedDates[0].toISOString();
                                  setStartDate(isoDate);
                                }
                              }
                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">No. of Questions</Label>
                      <AvField
                        name="no_of_questions"
                        placeholder="No.of Questions "
                        type="number"
                        errorMessage="Enter no. of questions"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.no_of_questions}
                      />
                    </div>
                  </Col>

                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Status</Label>
                      <Select
                        value={selectedStatus}
                        onChange={handlestatusSelect}
                        options={statusOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>

                <Button color="primary" type="button" onClick={AddInterview}>
                  Submit
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
        <Col xl="6">
          <h3>Available Questions: {availableQuestions}</h3>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddInterview);
