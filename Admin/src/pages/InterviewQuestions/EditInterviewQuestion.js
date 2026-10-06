import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import Switch from "react-switch";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";

const EditTopic = (props) => {
  document.title = "Technical Hub | Edit Interview Question";

  const [data, setData] = useState({});
  const [switch3, setswitch3] = useState(true);
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null);
  const [selectedCompanyGroup, setselectedCompanyGroup] = useState(null);
  const [technologyData, setTechnologyData] = useState([]);
  const [companyData, setCompanyData] = useState([]);

  const navigate = useNavigate();
  const { questionId } = useParams();
  const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

  useEffect(() => {
    props.setBreadcrumbItems('Edit Interview Question', [
      { title: "TechnicalHub", link: "#" },
      { title: "Interview Questions", link: "#" },
      { title: "Edit Interview Question", link: "#" },
    ]);
    fetchTechnologyData();
    fetchCompaniesData();

  }, []);
  useEffect(() => {
    if (technologyData.length > 0 && companyData.length > 0) {
      fetchTopicData();
    }
  }, [technologyData, companyData]);
  const fetchTechnologyData = async () => {
    try {
      const res = await axios.get(`${backendUrl}get-technologies`);
      if (res.status === 200) setTechnologyData(res.data);
    } catch (err) {
      console.error("Error fetching technologies", err);
    }
  };

  const fetchCompaniesData = async () => {
    try {
      const res = await axios.get(`${backendUrl}companies-list`);
      if (res.status === 200) setCompanyData(res.data);
    } catch (err) {
      console.error("Error fetching companies", err);
    }
  };

  const fetchTopicData = async () => {
    try {
      const res = await axios.get(`${backendUrl}get-interview-question-by-id/${questionId}`);
      if (res.status === 200) {
        const topic = res.data;
        console.log(topic.technology)
        console.log(technologyData)
        setData(topic);
        setswitch3(topic.previous_asked_status === 1);

        const tech = technologyData.find(t => t._id === topic.technology);
        console.log(tech)
        if (tech) setselectedTechnologyGroup({ label: tech.technology_name, value: tech._id });

        const company = companyData.find(c => c._id === topic.company);
        if (company) setselectedCompanyGroup({ label: company.company_name, value: company._id });
      }
    } catch (err) {
      console.error("Error fetching topic data", err);
    }
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const updateTopic = async () => {
    const newStatus = switch3 ? 1 : 0;
    const payload = {
      id: questionId,
      question: data.question,
      answer: data.answer,
      company: selectedCompanyGroup?.value || "",
      technology: selectedTechnologyGroup?.value || "",
      status: newStatus,
    };
    console.log(payload)
    try {
      const res = await axios.post(`${backendUrl}update-interview-question`, payload);
      if (res.status === 200) {
        alert("Updated Successfully");
        navigate("/interview-questions-list");
      }
    } catch (err) {
      console.error("Error updating topic", err);
    }
  };

  const Offsymbol = () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", fontSize: 12, color: "#fff", paddingRight: 2 }}>
      No
    </div>
  );

  const OnSymbol = () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", fontSize: 12, color: "#fff", paddingRight: 2 }}>
      Yes
    </div>
  );

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Edit Interview Question</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select technology</Label>
                      <Select
                        value={selectedTechnologyGroup}
                        onChange={setselectedTechnologyGroup}
                        options={technologyData.map(ele => ({ label: ele.technology_name, value: ele._id }))}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select company</Label>
                      <Select
                        value={selectedCompanyGroup}
                        onChange={setselectedCompanyGroup}
                        options={companyData.map(ele => ({ label: ele.company_name, value: ele._id }))}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <div className="mb-3">
                      <Label>Question</Label>
                      <AvField
                        name="question"
                        placeholder="Enter question"
                        type="textarea"
                        rows="4"
                        value={data.question || ""}
                        onChange={handleChange}
                        validate={{ required: { value: true } }}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <div className="mb-3">
                      <Label>Answer</Label>
                      <AvField
                        name="answer"
                        placeholder="Enter answer"
                        type="textarea"
                        rows="4"
                        value={data.answer || ""}
                        onChange={handleChange}
                        validate={{ required: { value: true } }}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <Label>Status</Label>&nbsp;&nbsp;&nbsp;
                    <Switch
                      uncheckedIcon={<Offsymbol />}
                      checkedIcon={<OnSymbol />}
                      onColor="#02a499"
                      onChange={() => setswitch3(!switch3)}
                      checked={switch3}
                    />
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={updateTopic}>
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

export default connect(null, { setBreadcrumbItems })(EditTopic);
