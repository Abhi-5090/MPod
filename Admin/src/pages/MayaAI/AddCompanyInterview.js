import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  InputGroup,
  Input,
  Label,
} from "reactstrap";
import { AvForm } from "availity-reactstrap-validation";
import Select from "react-select"
import DateTimePicker from "./DateTimePicker";
import StudentSelect from "./StudentSelect";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { apiUrl, getErrorMessage } from "../../config/api";
import useTenantSelection, { TenantSelect } from "./useTenantSelection";

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
const interviewTypeOptions = [
  { label: "Single", value: "single" },
  { label: "Bulk", value: "bulk" },
];

const AddCompanyInterview = (props) => {
  document.title = "Add Company Interview | Mpod";

  const tenantSelection = useTenantSelection();
  const { user, tenantId } = tenantSelection;
  const [data, setData] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState();
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedResults, setFailedResults] = useState([]);
  const [bulkTotal, setBulkTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    props.setBreadcrumbItems('Add Company Interview', [
      { title: "Mpod", link: "#" },
      { title: "Company Interviews List", link: "/company-interviews-list" },
      { title: "Add Company Interview", link: "#" },
    ]);
    fetchCompanies();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get(apiUrl('tags-list'));
      setTags(Array.isArray(response.data?.tags) ? response.data.tags : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load tags."));
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(apiUrl('companies-list'));
      setCompanies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load companies."));
    }
  };

  const companyOptions = companies.map(company => ({
    label: company.company_name,
    value: company._id
  }));
  const tagOptions = tags.map(tag => ({
    label: tag.tag_name,
    value: tag._id
  }));

  const handleInterviewTypeSelect = (selectedInterviewType) => {
    setSelectedInterviewType(selectedInterviewType);
    // Reset rollNo and file when switching types
    setRollNo("");
    setFile(null);
  };

  const handleChange = (e) => {
    setData({ ...data, no_of_questions: e.target.value });
  };
  const handlePlatformSelect = (selectedplatform) => {
    setSelectedPlatform(selectedplatform);
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const fetchAvailableQuestionsData = async () => {
    try {
      const payload = {
        company: selectedCompany.map((c) => c.value),
        type: selectedType.map((t) => t.value),
        round: selectedRound.map((r) => r.value),
        tag: selectedTag?.value
      };
      const response = await axios.post(apiUrl("available-company-questions"), payload);
      setAvailableQuestions(response.data?.count);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load available questions count."));
    }
  };

  useEffect(() => {
    if (
      selectedCompany && selectedCompany.length > 0 &&
      selectedType && selectedType.length > 0 &&
      selectedRound && selectedRound.length > 0
    ) {
      fetchAvailableQuestionsData();
    } else {
      setAvailableQuestions(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany, selectedType, selectedRound, selectedTag]);

  const handlestatusSelect = (selectedLevel) => {
    setSelectedStatus(selectedLevel);
  };

  const AddInterview = async () => {
    if (!tenantId) {
      toast.warn("Select a college");
      return;
    }
    if (
      !selectedPlatform ||
      !selectedInterviewType ||
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

    if (selectedInterviewType.value === "single" && !rollNo.trim()) {
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
      created_by: user.roll_no,
      tenant_id: tenantId,
    };

    setIsLoading(true);
    setFailedResults([]);
    try {
      if (selectedInterviewType.value === "single") {
        await axios.post(apiUrl('add-company-interview'), dataList);
        toast.success("Interview added successfully!");
        navigate(`/company-interviews-list`);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('platform', dataList.platform);
        formData.append('company', JSON.stringify(dataList.company));
        formData.append('type', JSON.stringify(dataList.type));
        formData.append('round', JSON.stringify(dataList.round));
        if (dataList.tag) formData.append('tag', dataList.tag);
        formData.append('start_date_time', dataList.start_date_time);
        formData.append('questions_count', dataList.questions_count);
        formData.append('status', dataList.status);
        formData.append('created_by', dataList.created_by);
        formData.append('tenant_id', dataList.tenant_id);
        const response = await axios.post(apiUrl('bulk-add-company-interviews'), formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const result = response.data || {};
        if (typeof result.total === "number" && typeof result.success === "number") {
          toast.success(`Bulk interviews: ${result.success} of ${result.total} scheduled`);
        } else {
          toast.success("Bulk interviews added successfully!");
        }
        const failed = Array.isArray(result.results)
          ? result.results.filter((r) => r.status === "failed")
          : [];
        if (result.failed > 0 || failed.length) {
          // Stay on the page and list the rows that could not be scheduled.
          setFailedResults(failed);
          setBulkTotal(result.total || (Array.isArray(result.results) ? result.results.length : 0));
          toast.warn(`${result.failed || failed.length} interview(s) could not be scheduled`);
        } else {
          navigate(`/company-interviews-list`);
        }
      }
    } catch (error) {
      // e.g. 400 insufficient credits
      toast.error(getErrorMessage(error, "Something went wrong. Please try again."));
    } finally {
      setIsLoading(false);
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
              <AvForm className="needs-validation">
                <TenantSelect {...tenantSelection} id="interviewTenant" className="mb-3" />
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
                        <Label>Student</Label>
                        <StudentSelect tenantId={tenantId} value={rollNo} onChange={setRollNo} />
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
                          <DateTimePicker value={startDate} onChange={(d) => setStartDate(d ? d.toISOString() : "")} />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">No. of Questions</Label>
                      <Input
                        name="no_of_questions"
                        placeholder="No. of Questions"
                        type="number"
                        min="1"
                        max="30"
                        className="form-control"
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.no_of_questions ?? ""}
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

                <Button color="primary" type="button" onClick={AddInterview} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Submit"}
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
        <Col xl="6">
          <h3>Available Questions: {availableQuestions ?? "-"}</h3>
          {failedResults.length > 0 && (
            <div className="mt-4">
              <div className="card border-danger shadow-sm">
                <div className="card-header bg-danger text-white">
                  <h5 className="mb-0">Failed Interview Creations</h5>
                  <small>{failedResults.length} out of {bulkTotal} interviews failed</small>
                </div>
                <ul className="list-group list-group-flush">
                  {failedResults.map((item, index) => (
                    <li className="list-group-item d-flex align-items-start" key={index}>
                      <div className="me-3">
                        <span className="badge bg-danger rounded-pill">{item.roll_no || "No roll no"}</span>
                      </div>
                      <div>
                        <strong>Reason:</strong> {item.reason || item.message}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddCompanyInterview);
