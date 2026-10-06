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

const levelOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
  { label: "Any", value: "any" },
];
const platformOptions = [
  { label: "Web", value: "web" },
  { label: "MPOD", value: "mpod" },
];

const EditInterview = (props) => {
  document.title = "Edit Interview | Mpod";

  const { user } = useAuth();
  const [data, setData] = useState({});
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [selectedModuleGroup, setselectedModuleGroup] = useState(null)
  const [selectedTopicGroup, setselectedTopicGroup] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [technologyData, setTechnologyData] = useState([])
  const [topicData, setTopicData] = useState([])
  const [moduleData, setModuleData] = useState([])
  const [startDate, setStartDate] = useState(null);
  const [rollNo, setRollNo] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    props.setBreadcrumbItems('Edit Interview', [
      { title: "Mpod", link: "#" },
      { title: "Interviews List", link: "/ai-interviews-list" },
      { title: "Edit Interview", link: "#" },
    ]);
    fetchTechnologyData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTechnologyGroup) fetchModuleData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTechnologyGroup]);

  useEffect(() => {
    if (selectedModuleGroup && selectedModuleGroup.length) {
      fetchTopicsData()
    } else {
      setTopicData([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModuleGroup]);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(apiUrl(`get-interviewee-details/${id}`));
      const interviewDetails = response.data || {};
      setRollNo(interviewDetails.roll_no || "");

      setselectedTechnologyGroup({
        label: interviewDetails.technology_name,
        value: interviewDetails.technology
      });

      // Label modules/topics by id. Newer backends send module_details/topic_details
      // ([{_id, module_name}] / [{_id, topic_name}]); older ones only send parallel name arrays.
      const toOptions = (ids, details, nameKey, legacyNames) => {
        if (!Array.isArray(ids)) return null;
        const byId = new Map(
          (Array.isArray(details) ? details : []).map((d) => [String(d._id), d[nameKey]])
        );
        const legacy = Array.isArray(legacyNames) && legacyNames.length === ids.length ? legacyNames : null;
        return ids.map((rawId, index) => {
          const value = rawId && typeof rawId === "object" ? rawId._id : rawId;
          const label = byId.get(String(value)) || (byId.size === 0 && legacy ? legacy[index] : null) || String(value);
          return { label, value };
        });
      };

      const moduleOptions = toOptions(
        interviewDetails.module,
        interviewDetails.module_details,
        "module_name",
        interviewDetails.module_name
      );
      if (moduleOptions) setselectedModuleGroup(moduleOptions);

      const topicOptions = toOptions(
        interviewDetails.topic,
        interviewDetails.topic_details,
        "topic_name",
        interviewDetails.topic_name
      );
      if (topicOptions) setselectedTopicGroup(topicOptions);

      setSelectedLevel(
        levelOptions.find(option => option.value === interviewDetails.level) || null
      );
      setSelectedPlatform(
        platformOptions.find(option => option.value === interviewDetails.platform) || null
      );
      setStartDate(interviewDetails.start_date_time || null);

      setData({ no_of_questions: interviewDetails.questions_count || "" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load interview details."));
    }
  };

  const fetchTechnologyData = async () => {
    try {
      const response = await axios.get(apiUrl('get-technologies'));
      setTechnologyData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load technologies."));
    }
  };

  const fetchModuleData = async () => {
    try {
      const response = await axios.post(apiUrl('get-modules-by-technology'), { technology_id: selectedTechnologyGroup.value });
      setModuleData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load modules."));
    }
  }

  const fetchTopicsData = async () => {
    try {
      const moduleIds = selectedModuleGroup.map(group => group.value);
      const response = await axios.post(apiUrl('get-topics-by-multi-modules'), { module_ids: moduleIds });
      setTopicData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load topics."));
    }
  };

  const technologyOptionGroup = technologyData.map((ele) => ({
    options: [
      { label: ele.technology_name, value: ele._id }
    ]
  }));

  const optionModuleGroup = moduleData.map((ele) => ({
    label: ele.module_name,
    value: ele._id
  }));

  const topicOptionGroup = topicData.map((ele) => ({
    options: [
      { label: ele.topic_name, value: ele._id }
    ]
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

  function handleTechnologySelectGroup(selectedGroup) {
    setselectedTechnologyGroup(selectedGroup)
    // Modules/topics belong to the previous technology
    setselectedModuleGroup(null)
    setselectedTopicGroup(null)
    setModuleData([])
  }
  function handleSelectModuleGroup(selectedGroup) {
    setselectedModuleGroup(selectedGroup)
  }

  function handleTopicGroup(selectedGroup) {
    setselectedTopicGroup(selectedGroup)
  }

  const handleLevelSelect = (selectedLevel) => {
    setSelectedLevel(selectedLevel);
  };

  const handleSubmit = async () => {
    if (
      !selectedPlatform ||
      !rollNo ||
      !selectedTechnologyGroup ||
      !selectedModuleGroup?.length ||
      !selectedTopicGroup?.length ||
      !selectedLevel ||
      !data.no_of_questions ||
      !startDate
    ) {
      toast.warn("Please fill all required fields");
      return;
    }
    const dataList = {
      'platform': selectedPlatform.value,
      'roll_no': rollNo.trim(),
      'technology': selectedTechnologyGroup.value,
      'module': selectedModuleGroup.map(group => group.value),
      'topic': selectedTopicGroup.map(group => group.value),
      'start_date_time': new Date(startDate).toISOString(),
      'level': selectedLevel.value,
      "questions_count": data.no_of_questions,
      "created_by": user.roll_no
    }
    setIsSaving(true);
    try {
      await axios.put(apiUrl('edit-interviewee-details/' + id), dataList);
      toast.success("Interview updated successfully!");
      navigate(`/ai-interviews-list`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update interview."));
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
              <h4 className="card-title">Edit Interview</h4>

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
                    <div className="mb-3">
                      <Label>Select Technology</Label>
                      <Select
                        value={selectedTechnologyGroup}
                        onChange={handleTechnologySelectGroup}
                        options={technologyOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Module</Label>
                      <Select
                        isMulti
                        value={selectedModuleGroup}
                        onChange={handleSelectModuleGroup}
                        options={optionModuleGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col lg="6">
                    <div className="mb-3">
                      <label className="control-label">
                        Topic
                      </label>
                      <Select
                        isMulti
                        value={selectedTopicGroup}
                        onChange={handleTopicGroup}
                        options={topicOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>


                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Complexity</Label>
                      <Select
                        value={selectedLevel}
                        onChange={handleLevelSelect}
                        options={levelOptions}
                        classNamePrefix="select2-selection"
                      />
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
                        max="10"
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

export default connect(null, { setBreadcrumbItems })(EditInterview);