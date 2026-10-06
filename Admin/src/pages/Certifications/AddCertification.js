import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, FormGroup, Button, CardTitle, Label } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import data from "./data.json"; // Import the data.json file

const AddCertification = (props) => {
  document.title = "Technical Hub | Add Certification";
  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Certifications", link: "/certifications-list" },
    { title: "Add Certification", link: "/add-certification" }
  ];

  const [formData, setFormData] = useState({
    certification_name: "",
    code: "",
    vendor: "",
    cost: "",
    duration: "",
    validity: "",
    association: "",
  });

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedLevelGroup, setSelectedLevelGroup] = useState(null);
  const [selectedProctorGroup, setSelectedProctorGroup] = useState(null);
  const [selectedTestingGroup, setSelectedTestingGroup] = useState(null);
  const [selectedScoreCardGroup, setSelectedScoreCardGroup] = useState(null);
  const [selectedOfferingGroup, setSelectedOfferingGroup] = useState(null);
  const [sample, setSample] = useState(null);
  const [scoreCard, setScoreCard] = useState(null)
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState("");
  const [samplePreviewUrl, setSamplePreviewUrl] = useState("");
  const [scoreCardPreviewUrl, setScoreCardPreviewUrl] = useState("");
  const [certificationImageUrl, setCertificationImageUrl] = useState("")
  const [scoreCardImageUrl, setScoreCardImageUrl] = useState("")
  const [isScoreCard, setIsScoreCard] = useState(false)

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
  useEffect(() => {
    props.setBreadcrumbItems("Add Certification", breadcrumbItems);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const optionGroup = data.categoryData.map((ele) => ({
    label: ele.category_name,
    value: ele.value
  }));
  const optionLevelGroup = data.levelData.map((ele) => ({
    label: ele.level_name,
    value: ele.value
  }));
  const optionProctorGroup = data.proctorData.map((ele) => ({
    label: ele.proctor_name,
    value: ele.value
  }));
  const optionTestingPlatformGroup = data.testPlatformData.map((ele) => ({
    label: ele.test_platform_name,
    value: ele.value
  }));
  const optionScoreCardGroup = data.scoreCardData.map((ele) => ({
    label: ele.score_card_name,
    value: ele.value
  }));
  const optionOfferingGroup = data.offeringData.map((ele) => ({
    label: ele.offering_name,
    value: ele.value
  }));

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };
  const handleSampleFileChange = (event) => {
    setSample(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setSamplePreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };
  const handleScoreCardFileChange = (event) => {
    setScoreCard(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setScoreCardPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };
  const addCertification = async () => {
    const TestingPlatformArray = [];
    console.log(selectedTestingGroup)
    selectedTestingGroup.forEach(testing => {
      TestingPlatformArray.push(testing.value);
    });

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('file', file);
    formDataToSubmit.append('sample', sample);
    formDataToSubmit.append('certification_name', formData.certification_name);
    formDataToSubmit.append('code', formData.code);
    formDataToSubmit.append('vendor', formData.vendor);
    formDataToSubmit.append('cost', formData.cost);
    formDataToSubmit.append('duration', formData.duration);
    formDataToSubmit.append('validity', formData.validity);
    formDataToSubmit.append('association', formData.association);
    formDataToSubmit.append('technology', formData.technology);
    if (selectedTestingGroup) formDataToSubmit.append('testing_platform', TestingPlatformArray);
    if (scoreCard) formDataToSubmit.append('score_card_sample', scoreCard);
    if (selectedGroup) formDataToSubmit.append('category', selectedGroup.value);
    if (selectedLevelGroup) formDataToSubmit.append('level', selectedLevelGroup.value);
    if (selectedProctorGroup) formDataToSubmit.append('proctor', selectedProctorGroup.value);
    if (selectedScoreCardGroup) formDataToSubmit.append('score_card', selectedScoreCardGroup.value);
    if (selectedOfferingGroup) formDataToSubmit.append('offering', selectedOfferingGroup.value);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await axios.post(backendUrl + 'add-certification', formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        alert("success");
        navigate(`/certifications-list`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  function handleTestingChange(selectedGroup) {
    console.log(selectedGroup)
    setSelectedTestingGroup(selectedGroup)
  }
  function handleSelectScoreCardChange(selectedGroup) {
    console.log(selectedGroup)
    setSelectedScoreCardGroup(selectedGroup)
    if (selectedGroup.value == "available") {
      setIsScoreCard(true)
    } else {
      setIsScoreCard(false)
    }
  }
  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">ADD Certification</h4>

              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Select Category</Label>
                      <Select
                        value={selectedGroup}
                        onChange={setSelectedGroup}
                        options={optionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="certificationName">Technology</Label>
                      <AvField
                        name="technology"
                        id="technology"
                        placeholder="Technology Name"
                        type="text"
                        value={formData.technology}
                        onChange={handleInputChange}
                        errorMessage="Enter Technology Name"
                        validate={{ required: { value: true } }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="certificationName">Certification Name</Label>
                      <AvField
                        name="certification_name"
                        id="certificationName"
                        placeholder="Certification Name"
                        type="text"
                        value={formData.certification_name}
                        onChange={handleInputChange}
                        errorMessage="Enter Certification Name"
                        validate={{ required: { value: true } }}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="certificationCode">Certification Code</Label>
                      <AvField
                        name="code"
                        id="certificationCode"
                        placeholder="Certification Code"
                        type="text"
                        value={formData.code}
                        onChange={handleInputChange}
                        errorMessage="Enter Certification Code"
                        validate={{ required: { value: true } }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="vendorName">Vendor</Label>
                      <AvField
                        name="vendor"
                        id="vendorName"
                        placeholder="Vendor Name"
                        type="text"
                        value={formData.vendor}
                        onChange={handleInputChange}
                        errorMessage="Enter Vendor Name"
                        validate={{ required: { value: true } }}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label>Select Level</Label>
                      <Select
                        value={selectedLevelGroup}
                        onChange={setSelectedLevelGroup}
                        options={optionLevelGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Select Proctoring</Label>
                      <Select
                        value={selectedProctorGroup}
                        onChange={setSelectedProctorGroup}
                        options={optionProctorGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label>Select Testing Platform</Label>
                      <Select
                        isMulti={true}
                        value={selectedTestingGroup}
                        onChange={handleTestingChange}
                        options={optionTestingPlatformGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>

                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="cost">Cost</Label>
                      <AvField
                        name="cost"
                        id="cost"
                        placeholder="Cost"
                        type="text"
                        value={formData.cost}
                        onChange={handleInputChange}
                        errorMessage="Enter Cost"
                        validate={{ required: { value: true } }}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="duration">Exam Duration</Label>
                      <AvField
                        name="duration"
                        id="duration"
                        placeholder="Exam Duration"
                        type="text"
                        value={formData.duration}
                        onChange={handleInputChange}
                        errorMessage="Enter Exam Duration"
                        validate={{ required: { value: true } }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Select Score Card</Label>
                      <Select
                        value={selectedScoreCardGroup}
                        onChange={handleSelectScoreCardChange}
                        options={optionScoreCardGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="validity">Validity</Label>
                      <AvField
                        name="validity"
                        id="validity"
                        placeholder="Validity"
                        type="text"
                        value={formData.validity}
                        onChange={handleInputChange}
                        errorMessage="Enter Validity"
                        validate={{ required: { value: true } }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="association">Association</Label>
                      <AvField
                        name="association"
                        id="association"
                        placeholder="Association"
                        type="text"
                        value={formData.association}
                        onChange={handleInputChange}
                        errorMessage="Enter Association"
                        validate={{ required: { value: true } }}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label>Select Offering or Not</Label>
                      <Select
                        value={selectedOfferingGroup}
                        onChange={setSelectedOfferingGroup}
                        options={optionOfferingGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="fileInput">Upload Certification Sample</Label><br />

                      {samplePreviewUrl && <img src={samplePreviewUrl} alt="Certification Sample" width="50px" />}

                      <input type="file" className="form-control" id="fileInput" onChange={handleSampleFileChange} />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    {previewUrl && <img src={previewUrl} alt="Certification Icon" width="50px" />}
                    <FormGroup>
                      <Label htmlFor="fileInput">Select Certification Icon</Label>
                      <input type="file" className="form-control" id="fileInput" onChange={handleFileChange} />
                    </FormGroup>
                  </Col>

                </Row>
                <Row>
                  {isScoreCard && <Col md="6">
                    <FormGroup>
                      <Label htmlFor="fileInput">Upload Score Card Sample</Label><br />

                      {scoreCardPreviewUrl && <img src={scoreCardPreviewUrl} alt="Certification Sample" width="50px" />}

                      <input type="file" className="form-control" id="fileInput" onChange={handleScoreCardFileChange} />
                    </FormGroup>
                  </Col>}
                </Row>
                <Button color="primary" type="button" onClick={addCertification}>
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

export default connect(null, { setBreadcrumbItems })(AddCertification);
