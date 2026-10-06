import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  CardTitle,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"

const AddTopic = (props) => {
  document.title = "Technial Hub | Add Interview Question";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Interview Questions", link: "/topics-list" },
    { title: "Add Interview Question", link: "/add-topic" },
  ];

  const [data, setData] = useState({});
  const [technologyData, setTechnologyData] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const [companyData, setCompanyData] = useState([]);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    props.setBreadcrumbItems('Add Interview Question', breadcrumbItems);
    fetchTechnologyData();
    fetchCompaniesData();
  }, []);

  const fetchCompaniesData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'companies-list');
      if (response.status === 200) {
        setCompanyData(response.data);
      }
    } catch (error) {
      console.log("Error fetching company data:", error);
    }
  };

  const fetchTechnologyData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-technologies');
      if (response.status === 200) {
        setTechnologyData(response.data);
      }
    } catch (error) {
      console.log("Error fetching technology data:", error);
    }
  };

  const technologyOptions = technologyData.map((tech) => ({
    label: tech.technology_name,
    value: tech._id
  }));

  const companyOptions = companyData.map((comp) => ({
    label: comp.company_name,
    value: comp._id
  }));

  const addTopic = async () => {
    if (!selectedTechnology) {
      toast.error("Please select a technology");
      return;
    }

    if (!file) {
      toast.error("Please upload a topic file");
      return;
    }

    const previous_asked_status = selectedCompanies.length > 0 ? 1 : 0;
    const companyIds = selectedCompanies.map(company => company.value);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('company', JSON.stringify(companyIds));
    formData.append('technology', selectedTechnology.value);
    formData.append('previous_asked_status', previous_asked_status);

    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

    try {
      const response = await axios.post(backendUrl + 'add-interview-questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        toast.success('Topic created successfully');
        setTimeout(() => navigate(`/topics-list`), 2000);
      }
    } catch (error) {
      console.error('Error adding topic:', error);
      toast.error("Something went wrong while adding the topic");
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <React.Fragment>
      <Row>
        <ToastContainer transition={Bounce} />
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Interview Question</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Select Technology</Label>
                      <Select
                        value={selectedTechnology}
                        onChange={setSelectedTechnology}
                        options={technologyOptions}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Select Companies (Multi-select)</Label>
                      <Select
                        isMulti
                        value={selectedCompanies}
                        onChange={setSelectedCompanies}
                        options={companyOptions}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Upload questions File</Label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={handleFileChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Button color="primary" type="button" onClick={addTopic}>
                  Submit
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(AddTopic);
