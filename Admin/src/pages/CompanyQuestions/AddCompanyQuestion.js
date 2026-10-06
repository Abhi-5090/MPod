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
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddCompanyQuestion = (props) => {
  document.title = "Technical Hub | Add Company Question";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Company Questions", link: "/companies-questions-list" },
    { title: "Add Company Questions", link: "/add-company-question" },
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

  useEffect(() => {
    props.setBreadcrumbItems('Add Company Question', breadcrumbItems);
    fetchCompanies();
    fetchTags();
  }, []);

  // useEffect(() => {
  //   let authUser = JSON.parse(localStorage.getItem('authUser'));
  //   if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'superadmin')) {
  //     alert("You are not authorized");
  //     localStorage.clear();
  //     window.location.href = '/admin/login';
  //   }
  // }, []);

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
    setFile(event.target.files[0]);
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

    try {
      const response = await axios.post(process.env.REACT_APP_MPOD_BACKEND_URL + 'add-company-question', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        toast.success("Question added successfully", { autoClose: 3000 });
        navigate(`/companies-questions-list`);
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question", { autoClose: 3000 });
    }
  };

  return (
    <React.Fragment>
      <ToastContainer position="top-right" autoClose={5000} transition={Bounce} />
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

              <Button color="primary" className="mt-3" onClick={addQuestion}>
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
