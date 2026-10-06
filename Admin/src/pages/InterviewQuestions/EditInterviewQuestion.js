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
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import Switch from "react-switch";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { apiUrl, getErrorMessage } from "../../config/api";

const EditInterviewQuestion = (props) => {
  document.title = "Edit Interview Question | Mpod";

  const [data, setData] = useState({});
  const [switch3, setswitch3] = useState(true);
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null);
  const [selectedCompanyGroup, setselectedCompanyGroup] = useState(null);
  const [technologyData, setTechnologyData] = useState([]);
  const [companyData, setCompanyData] = useState([]);

  const navigate = useNavigate();
  const { questionId } = useParams();

  useEffect(() => {
    props.setBreadcrumbItems('Edit Interview Question', [
      { title: "Mpod", link: "#" },
      { title: "Interview Questions", link: "/interview-questions-list" },
      { title: "Edit Interview Question", link: "#" },
    ]);
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // Load lookups and the question together so the question loads even if a lookup list is empty.
  const loadAll = async () => {
    const [techRes, compRes, questionRes] = await Promise.allSettled([
      axios.get(apiUrl("get-technologies")),
      axios.get(apiUrl("companies-list")),
      axios.get(apiUrl(`get-interview-question-by-id/${questionId}`)),
    ]);

    const technologies = techRes.status === "fulfilled" && Array.isArray(techRes.value.data) ? techRes.value.data : [];
    const companies = compRes.status === "fulfilled" && Array.isArray(compRes.value.data) ? compRes.value.data : [];
    setTechnologyData(technologies);
    setCompanyData(companies);
    if (techRes.status === "rejected") toast.error(getErrorMessage(techRes.reason, "Failed to load technologies."));
    if (compRes.status === "rejected") toast.error(getErrorMessage(compRes.reason, "Failed to load companies."));

    if (questionRes.status === "rejected") {
      toast.error(getErrorMessage(questionRes.reason, "Failed to load interview question."));
      return;
    }
    const topic = questionRes.value.data || {};
    setData(topic);
    setswitch3(topic.previous_asked_status === 1);

    const tech = technologies.find(t => t._id === topic.technology);
    if (tech) setselectedTechnologyGroup({ label: tech.technology_name, value: tech._id });

    const company = companies.find(c => c._id === topic.company);
    if (company) setselectedCompanyGroup({ label: company.company_name, value: company._id });
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
    try {
      const res = await axios.post(apiUrl("update-interview-question"), payload);
      if (res.status === 200) {
        toast.success("Updated Successfully");
        navigate("/interview-questions-list");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update interview question."));
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

export default connect(null, { setBreadcrumbItems })(EditInterviewQuestion);
