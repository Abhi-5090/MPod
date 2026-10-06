import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
} from "reactstrap";
import Select from "react-select";
import { toast } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl, getErrorMessage } from "../../config/api";

const AddCompanyQuestion = (props) => {
  document.title = "Add Company Question | Mpod";

  const breadcrumbItems = [
    { title: "Mpod", link: "#" },
    { title: "Company Questions", link: "/companies-questions-list" },
    { title: "Add Company Questions", link: "#" },
  ];

  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    props.setBreadcrumbItems('Add Company Question', breadcrumbItems);
    fetchCompanies();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(apiUrl('companies-list'));
      setCompanies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load companies."));
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(apiUrl('tags-list'));
      setTags(response.data && Array.isArray(response.data.tags) ? response.data.tags : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load tags."));
    }
  };

  const typeOptions = [
    { label: "Service Based", value: "service_based" },
    { label: "Product Based", value: "product_based" }
  ];

  const roundOptions = [
    { label: "TR1", value: "TR1" },
    { label: "TR2", value: "TR2" },
    { label: "TR3", value: "TR3" },
    { label: "TR4", value: "TR4" },
    { label: "MR1", value: "MR1" },
    { label: "HR1", value: "HR1" },
  
  ];

  const yearOptions = Array.from({ length: new Date().getFullYear() - 2014 }, (_, index) => {
    const year = 2015 + index;
    return { label: year.toString(), value: year.toString() };
  });

  const companyOptions = companies.map(company => ({
    label: company.company_name,
    value: company._id
  }));

  const tagOptions = tags.map(tag => ({
    label: tag.tag_name,
    value: tag._id
  }));

  const handleFileChange = (event) => {
    setFile(event.target.files[0] || null);
  };

  const addQuestion = async () => {
    if (!selectedCompany || !selectedType || !selectedRound || !selectedYear || !selectedTag || !file) {
      toast.error("Please fill all fields", { autoClose: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('company', selectedCompany.value);
    formData.append('type', selectedType.value);
    formData.append('round', selectedRound.value);
    formData.append('year', selectedYear.value);
    formData.append('tag', selectedTag.value);

    setSubmitting(true);
    try {
      const response = await axios.post(apiUrl('add-company-question'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        toast.success("Question added successfully", { autoClose: 3000 });
        navigate(`/companies-questions-list`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add question"), { autoClose: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">ADD COMPANY QUESTION</h4>

              <Row>
                <Col md="6">
                  <Label>Select Company</Label>
                  <Select
                    value={selectedCompany}
                    onChange={setSelectedCompany}
                    options={companyOptions}
                    classNamePrefix="select2-selection"
                  />
                </Col>
                <Col md="6">
                  <Label>Select Type</Label>
                  <Select
                    value={selectedType}
                    onChange={setSelectedType}
                    options={typeOptions}
                    classNamePrefix="select2-selection"
                  />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md="6">
                  <Label>Select Round</Label>
                  <Select
                    value={selectedRound}
                    onChange={setSelectedRound}
                    options={roundOptions}
                    classNamePrefix="select2-selection"
                  />
                </Col>
                <Col md="6">
                  <Label>Select Year</Label>
                  <Select
                    value={selectedYear}
                    onChange={setSelectedYear}
                    options={yearOptions}
                    classNamePrefix="select2-selection"
                  />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md="6">
                  <Label>Select Tag</Label>
                  <Select
                    value={selectedTag}
                    onChange={setSelectedTag}
                    options={tagOptions}
                    classNamePrefix="select2-selection"
                  />
                </Col>
                <Col md="6">
                  <Label>Upload Questions</Label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                </Col>
              </Row>

              <Button color="primary" className="mt-3" onClick={addQuestion} disabled={submitting}>
                Submit
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddCompanyQuestion);
