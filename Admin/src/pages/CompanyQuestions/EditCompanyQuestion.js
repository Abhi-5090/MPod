import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
} from "reactstrap";
import Select from "react-select";
import { toast } from 'react-toastify';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl, getErrorMessage } from "../../config/api";

const typeOptions = [
  { label: "Service Based", value: "service_based" },
  { label: "Product Based", value: "product_based" }
];

const EditCompanyQuestion = (props) => {
  document.title = "Edit Company Question | Mpod";

  const { questionId } = useParams();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    props.setBreadcrumbItems('Edit Company Question', [
      { title: "Mpod", link: "#" },
      { title: "Company Questions", link: "/companies-questions-list" },
      { title: "Edit Company Question", link: "#" },
    ]);
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // Load lookups and the question together so the question loads even if a lookup list is empty.
  const loadAll = async () => {
    const [companiesRes, tagsRes, questionRes] = await Promise.allSettled([
      axios.get(apiUrl('companies-list')),
      axios.get(apiUrl('tags-list')),
      axios.get(apiUrl(`get-company-question-by-id/${questionId}`)),
    ]);

    const companyList = companiesRes.status === "fulfilled" && Array.isArray(companiesRes.value.data) ? companiesRes.value.data : [];
    const tagList = tagsRes.status === "fulfilled" && tagsRes.value.data && Array.isArray(tagsRes.value.data.tags) ? tagsRes.value.data.tags : [];
    setCompanies(companyList);
    setTags(tagList);
    if (companiesRes.status === "rejected") toast.error(getErrorMessage(companiesRes.reason, "Failed to load companies."));
    if (tagsRes.status === "rejected") toast.error(getErrorMessage(tagsRes.reason, "Failed to load tags."));

    if (questionRes.status === "rejected") {
      toast.error(getErrorMessage(questionRes.reason, "Failed to load question."));
      return;
    }
    const data = questionRes.value.data || {};
    const company = companyList.find(c => c._id === data.company);
    const tag = tagList.find(t => t._id === data.tag);
    const type = typeOptions.find(t => t.value === data.type);

    setSelectedCompany(company ? { label: company.company_name, value: company._id } : null);
    setSelectedType(type || (data.type ? { label: data.type, value: data.type } : null));
    setSelectedRound(data.round ? { label: data.round, value: data.round } : null);
    setSelectedYear(data.year != null ? { label: String(data.year), value: String(data.year) } : null);
    setSelectedTag(tag ? { label: tag.tag_name, value: tag._id } : null);
    setQuestion(data.question || "");
  };

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

  const updateQuestion = async () => {
    if (!selectedCompany || !selectedType || !selectedRound || !selectedYear || !selectedTag || !question.trim()) {
      toast.error("Please fill all fields", { autoClose: 3000 });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.put(apiUrl(`update-company-question/${questionId}`), {
        company: selectedCompany.value,
        type: selectedType.value,
        round: selectedRound.value,
        year: selectedYear.value,
        tag: selectedTag.value,
        question: question
      });

      if (response.status === 200) {
        toast.success("Question updated successfully", { autoClose: 3000 });
        navigate(`/companies-questions-list`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update question"), { autoClose: 3000 });
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
              <h4 className="card-title">EDIT COMPANY QUESTION</h4>

              <Row>
                <Col md="6">
                  <Label>Select Company</Label>
                  <Select value={selectedCompany} onChange={setSelectedCompany} options={companyOptions} classNamePrefix="select2-selection" />
                </Col>
                <Col md="6">
                  <Label>Select Type</Label>
                  <Select value={selectedType} onChange={setSelectedType} options={typeOptions} classNamePrefix="select2-selection" />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md="6">
                  <Label>Select Round</Label>
                  <Select value={selectedRound} onChange={setSelectedRound} options={roundOptions} classNamePrefix="select2-selection" />
                </Col>
                <Col md="6">
                  <Label>Select Year</Label>
                  <Select value={selectedYear} onChange={setSelectedYear} options={yearOptions} classNamePrefix="select2-selection" />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md="6">
                  <Label>Select Tag</Label>
                  <Select value={selectedTag} onChange={setSelectedTag} options={tagOptions} classNamePrefix="select2-selection" />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md="12">
                  <Label>Question</Label>
                  <Input type="textarea" value={question} onChange={(e) => setQuestion(e.target.value)} />
                </Col>
              </Row>

              <Button color="primary" className="mt-3" onClick={updateQuestion} disabled={submitting}>Update</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditCompanyQuestion);
