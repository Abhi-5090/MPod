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
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify";
import { apiUrl, getErrorMessage } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

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

const EditCompanyInterview = (props) => {
  document.title = "Edit Company Interview | Mpod";

  const { user } = useAuth();
  const [data, setData] = useState({});
  const [companies, setCompanies] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    props.setBreadcrumbItems('Edit Company Interview', [
      { title: "Mpod", link: "#" },
      { title: "Company Interviews List", link: "/company-interviews-list" },
      { title: "Edit Company Interview", link: "#" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (id) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Companies list and interview details are loaded together so the selected
  // companies can be mapped to labels.
  const loadData = async () => {
    let companyList = [];
    try {
      const response = await axios.get(apiUrl('companies-list'));
      companyList = Array.isArray(response.data) ? response.data : [];
      setCompanies(companyList);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load companies."));
    }
    try {
      const response = await axios.get(apiUrl(`get-company-interview-by-id/${id}`));
      const interviewDetails = response.data || {};
      const company = interviewDetails.company || [];
      const type = interviewDetails.type || [];
      const round = interviewDetails.round || [];
      setRollNo(interviewDetails.roll_no || "");
      setSelectedCompany(
        companyList
          .filter(c => company.includes(c._id))
          .map(c => ({ label: c.company_name, value: c._id }))
      );
      setSelectedType(typeOptions.filter(option => type.includes(option.value)));
      setSelectedRound(roundOptions.filter(option => round.includes(option.value)));
      setSelectedPlatform(
        platformOptions.find(option => option.value === interviewDetails.platform) || null
      );
      setStartDate(interviewDetails.start_date_time || null);
      setData({ no_of_questions: interviewDetails.questions_count || "" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load interview details."));
    }
  };

  const companyOptions = companies.map(company => ({
    label: company.company_name,
    value: company._id
  }));

  const handleChange = (e) => {
    setData({ ...data, no_of_questions: e.target.value });
  };
  const handleRollNoChange = (e) => {
    setRollNo(e.target.value);
  };
  const handlePlatformSelect = (selectedplatform) => {
    setSelectedPlatform(selectedplatform);
  };

  const handleSubmit = async () => {
    if (
      !selectedPlatform ||
      !rollNo.trim() ||
      !selectedCompany?.length ||
      !selectedType?.length ||
      !selectedRound?.length ||
      !startDate ||
      !data.no_of_questions
    ) {
      toast.warn("Please fill all required fields");
      return;
    }

    const dataList = {
      platform: selectedPlatform.value,
      company: selectedCompany.map(item => item.value),
      roll_no: rollNo.trim(),
      round: selectedRound.map(item => item.value),
      start_date_time: new Date(startDate).toISOString(),
      type: selectedType.map(item => item.value),
      questions_count: data.no_of_questions,
      created_by: user.roll_no
    };

    setIsSaving(true);
    try {
      await axios.put(apiUrl(`update-company-interview/${id}`), dataList);
      toast.success("Interview updated successfully!");
      navigate(`/company-interviews-list`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update interview. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Edit Company Interview</h4>

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
                </Row>
                <Row>
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
                  <Col md="6">
                    <Label>Select Company</Label>
                    <Select value={selectedCompany} onChange={setSelectedCompany} options={companyOptions} classNamePrefix="select2-selection" isMulti />
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

                </Row>
                <Row style={{ marginTop: "20px" }}>
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
                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>Start Date and Time</Label>
                        <InputGroup>
                        <DateTimePicker value={startDate} onChange={(d) => setStartDate(d)} allowPast />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                </Row>

                <Button color="primary" type="button" onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? "Updating..." : "Update"}
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditCompanyInterview);