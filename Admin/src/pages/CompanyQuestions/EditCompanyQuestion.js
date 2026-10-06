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
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditCompanyQuestion = (props) => {
  document.title = "Technical Hub | Edit Company Question";

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
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    props.setBreadcrumbItems('Edit Company Question', [
      { title: "TechnicalHub", link: "#" },
      { title: "Company Questions", link: "/companies-questions-list" },
      { title: "Edit Company Question", link: "/edit-company-question" },
    ]);

    fetchCompanies();
    fetchTags();
  }, []);

  useEffect(() => {
    if (companies.length > 0 && tags.length > 0 && !isDataLoaded) {
      fetchQuestionDetails();
    }
  }, [companies, tags]);

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

  const fetchQuestionDetails = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_MPOD_BACKEND_URL}get-company-question-by-id/${questionId}`);
      if (response.status === 200) {
        const data = response.data;

        const company = companies.find(c => c._id === data.company);
        const tag = tags.find(t => t._id === data.tag);

        setSelectedCompany(company ? { label: company.company_name, value: company._id } : null);
        setSelectedType({ label: data.type, value: data.type });
        setSelectedRound({ label: data.round, value: data.round });
        setSelectedYear({ label: data.year.toString(), value: data.year.toString() });
        setSelectedTag(tag ? { label: tag.tag_name, value: tag._id } : null);
        setQuestion(data.question);
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching question details:", error);
    }
  };

  const typeOptions = [
    { label: "Service Based", value: "service_based" },
    { label: "Product Based", value: "product_based" }
  ];

  const roundOptions = [
    { label: "TR1", value: "TR1" },
    { label: "TR2", value: "TR2" },
    { label: "MR1", value: "MR1" }
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

    try {
      const response = await axios.put(`${process.env.REACT_APP_MPOD_BACKEND_URL}update-company-question/${questionId}`, {
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
      console.error("Error updating question:", error);
      toast.error("Failed to update question", { autoClose: 3000 });
    }
  };

  return (
    <React.Fragment>
      <ToastContainer position="top-right" autoClose={5000} transition={Bounce} />
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

              <Button color="primary" className="mt-3" onClick={updateQuestion}>Update</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditCompanyQuestion);
