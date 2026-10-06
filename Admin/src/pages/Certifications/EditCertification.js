import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, FormGroup, Button, Label } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import data from "./data.json"; // Import the data.json file
import Switch from "react-switch"

const EditCertification = (props) => {
  document.title = "Technical Hub | Edit Certification";
  const { id } = useParams(); // Get the certification ID from the URL
  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Certifications", link: "/certifications-list" },
    { title: "Edit Certification", link: "/edit-certification" }
  ];

  const [formData, setFormData] = useState({
    certification_name: "",
    code: "",
    vendor: "",
    cost: "",
    duration: "",
    validity: "",
    association: ""
  });
  const [switch3, setSwitch3] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedLevelGroup, setSelectedLevelGroup] = useState(null);
  const [selectedProctorGroup, setSelectedProctorGroup] = useState(null);
  const [selectedTestingGroup, setSelectedTestingGroup] = useState([]);
  const [selectedScoreCardGroup, setSelectedScoreCardGroup] = useState(null);
  const [selectedOfferingGroup, setSelectedOfferingGroup] = useState(null);
  const [selectedTechnologyGroup, setSelectedTechnologyGroup] = useState(null);
  const [technologyData, setTechnologyData] = useState([])
  const [file, setFile] = useState(null);
  const [sample, setSample] = useState(null);
  const [scoreCard, setScoreCard] = useState(null)
  const [dataList, setDataList] = useState([]);

  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState("");
  const [samplePreviewUrl, setSamplePreviewUrl] = useState("");
  const [scoreCardPreviewUrl, setScoreCardPreviewUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [certificationImageUrl, setCertificationImageUrl] = useState("")
  const [scoreCardImageUrl, setScoreCardImageUrl] = useState("")

  const [selectedTechnology, setSelectedTechnology] = useState(null)
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL

  let certification = useParams();
  useEffect(() => {
    props.setBreadcrumbItems("Edit Certification", breadcrumbItems);
    fetchTechnologyData()
    if (certification.certificationId) {
      fetchCertification(certification.certificationId);
    }
  }, [certification.certificationId]);

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
  
  const fetchTechnologyData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-technologies');
      if (response.status === 200) {
        setTechnologyData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const fetchCertification = async (certificationId) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      console.log("heloooo")
      const response = await axios.get(`${backendUrl}get-certification-by-id/${certificationId}`);
      const certification = response.data;
      setDataList(response.data.testing_platform)
      console.log(typeof (dataList))
      setSwitch3(response.data.status === 1);
      setFormData({
        certification_name: certification.certification_name,
        code: certification.code,
        vendor: certification.vendor,
        cost: certification.cost,
        duration: certification.duration,
        validity: certification.validity,
        association: certification.association,
        technology: certification.technology
      });
      setSelectedGroup({ label: certification.category_name, value: certification.category });
      setSelectedLevelGroup({ label: certification.level_name, value: certification.level });
      setSelectedProctorGroup({ label: certification.proctor_name, value: certification.proctor });
      setSelectedTestingGroup({ label: certification.testing_platform, value: certification.testing_platform });
      setSelectedScoreCardGroup({ label: certification.score_card_name, value: certification.score_card });
      setSelectedOfferingGroup({ label: certification.offering, value: certification.offering });
      // setSelectedTechnologyGroup({ label: certification.technology_name, value: certification.technology });
      // setSelectedTechnology(certification.technology)
      setImageUrl(certification.certification_icon);
      setCertificationImageUrl(certification.certification_sample);
      setScoreCardImageUrl(certification.score_card_sample)

      // setSelectedTestingGroup(certification.testing_platform)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    if (data.categoryData.length > 0 && selectedGroup) {
      const initialSelectedGroup = data.categoryData.find((ele) => ele.value === selectedGroup.value);
      if (initialSelectedGroup) {
        setSelectedGroup({ label: initialSelectedGroup.category_name, value: initialSelectedGroup.value });
      }
    }
  }, [data.categoryData, selectedGroup]);

  useEffect(() => {
    if (data.levelData.length > 0 && selectedLevelGroup) {
      const initialSelectedLevelGroup = data.levelData.find((ele) => ele.value === selectedLevelGroup.value);
      if (initialSelectedLevelGroup) {
        setSelectedLevelGroup({ label: initialSelectedLevelGroup.level_name, value: initialSelectedLevelGroup.value });
      }
    }
  }, [data.levelData, selectedLevelGroup]);

  useEffect(() => {
    if (data.proctorData.length > 0 && selectedProctorGroup) {
      const initialSelectedProctorGroup = data.proctorData.find((ele) => ele.value === selectedProctorGroup.value);
      if (initialSelectedProctorGroup) {
        setSelectedProctorGroup({ label: initialSelectedProctorGroup.proctor_name, value: initialSelectedProctorGroup.value });
      }
    }
  }, [data.proctorData, selectedProctorGroup]);

  useEffect(() => {
    if (Array.isArray(data.testPlatformData) && data.testPlatformData.length > 0 && Array.isArray(dataList) && dataList.length > 0) {
      const initialSelectedSecondaryTrainers = data.testPlatformData.map(selected => {
        const platform = dataList.find((ele) => ele === selected.value);
        if (platform) {
          return { label: platform, value: platform };
        }
        return null;
      }).filter(platform => platform !== null);

      setSelectedTestingGroup(initialSelectedSecondaryTrainers);
    }
  }, [data.testPlatformData, dataList]);

  useEffect(() => {
    if (data.scoreCardData.length > 0 && selectedScoreCardGroup) {
      const initialSelectedScoreCardGroup = data.scoreCardData.find((ele) => ele.value === selectedScoreCardGroup.value);
      if (initialSelectedScoreCardGroup) {
        setSelectedScoreCardGroup({ label: initialSelectedScoreCardGroup.score_card_name, value: initialSelectedScoreCardGroup.value });
      }
    }
  }, [data.scoreCardData, selectedScoreCardGroup]);

  useEffect(() => {
    if (data.offeringData.length > 0 && selectedOfferingGroup) {
      const initialSelectedOfferingGroup = data.offeringData.find((ele) => ele.value === selectedOfferingGroup.value);
      if (initialSelectedOfferingGroup) {
        setSelectedOfferingGroup({ label: initialSelectedOfferingGroup.offering_name, value: initialSelectedOfferingGroup.value });
      }
    }
  }, [data.offeringData, selectedOfferingGroup]);


  useEffect(() => {

    if (technologyData.length > 0 && selectedTechnology) {
      const initialSelectedTechnologyGroup = technologyData.find((ele) => ele._id === selectedTechnology);

      if (initialSelectedTechnologyGroup) {
        setSelectedTechnologyGroup({ label: initialSelectedTechnologyGroup.technology_name, value: initialSelectedTechnologyGroup.value });
      }
    }
  }, [technologyData, selectedTechnology]);
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
  // const optionTechnologyGroup = technologyData.map((ele) => ({
  //   label: ele.technology_name, value: ele._id
  // }));

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
  // function handleTechnologySelectGroup(selectedGroup) {
  //   console.log(selectedGroup)
  //   setSelectedTechnologyGroup(selectedGroup)
  // }
  function handleTestingChange(selectedGroup) {
    setSelectedTestingGroup(selectedGroup)
  }
  const updateCertification = async () => {
    const TestingPlatformArray = [];
    selectedTestingGroup.forEach(testing => {
      TestingPlatformArray.push(testing.value);
    });
    console.log(scoreCard)
    const newStatus = switch3 ? 1 : 0;
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('file', file);
    formDataToSubmit.append('sample', sample)
    // formDataToSubmit.append('score_card_sample', scoreCard)
    formDataToSubmit.append('certification_name', formData.certification_name);
    formDataToSubmit.append('code', formData.code);
    formDataToSubmit.append('vendor', formData.vendor);
    formDataToSubmit.append('cost', formData.cost);
    formDataToSubmit.append('duration', formData.duration);
    formDataToSubmit.append('validity', formData.validity);
    formDataToSubmit.append('association', formData.association);
    formDataToSubmit.append('technology', formData.technology);
    if (selectedTestingGroup) formDataToSubmit.append('testing_platform', TestingPlatformArray);
    formDataToSubmit.append('status', newStatus)
    if (scoreCard) formDataToSubmit.append('score_card_sample', scoreCard);
    if (selectedGroup) formDataToSubmit.append('category', selectedGroup.value);
    if (selectedLevelGroup) formDataToSubmit.append('level', selectedLevelGroup.value);
    if (selectedProctorGroup) formDataToSubmit.append('proctor', selectedProctorGroup.value);
    if (selectedScoreCardGroup) formDataToSubmit.append('score_card', selectedScoreCardGroup.value);
    if (selectedOfferingGroup) formDataToSubmit.append('offering', selectedOfferingGroup.value);
    // if (selectedTechnologyGroup) formDataToSubmit.append('technology', selectedTechnologyGroup.value);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await axios.post(`${backendUrl}update-certification/${certification.certificationId}`, formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        alert("Certification updated successfully");
        navigate(`/certifications-list`);
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const Offsymbol = (props) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
          paddingRight: 2
        }}
      >
        No
      </div>
    );
  };

  const OnSymbol = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: 12,
          color: "#fff",
          paddingRight: 2
        }}
      >
        Yes
      </div>
    );
  };
  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">EDIT Certification</h4>

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
                  {/* <Col md="6">
                    <FormGroup>
                      <Label>Select Technology</Label>
                      <Select
                        value={selectedTechnologyGroup}
                        onChange={handleTechnologySelectGroup}
                        options={optionTechnologyGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col> */}
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="certificationName">Technology Name</Label>
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
                        onChange={setSelectedScoreCardGroup}
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

                      {!samplePreviewUrl && certificationImageUrl && <img src={backendImageUrl + "certification-samples/" + certificationImageUrl} alt="Certificaiton Sample" width="70px" />}
                      <input type="file" className="form-control" id="fileInput" onChange={handleSampleFileChange} />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="fileInput">Upload Score Card Sample</Label><br />

                      {scoreCardPreviewUrl && <img src={scoreCardPreviewUrl} alt="Certification Sample" width="50px" />}

                      {!scoreCardPreviewUrl && scoreCardImageUrl && <img src={backendImageUrl + "certification-score-cards/" + scoreCardImageUrl} alt="Certificaiton Sample" width="70px" />}
                      <input type="file" className="form-control" id="fileInput" onChange={handleScoreCardFileChange} />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>


                  <Col md="6">
                    <FormGroup>
                      <Label htmlFor="fileInput">Select Certification Icon</Label><br />

                      {previewUrl && <img src={previewUrl} alt="Certification Icon" width="50px" />}

                      {!previewUrl && imageUrl && <img src={backendImageUrl + "certification-icons/" + imageUrl} alt="Technology Icon" width="50px" />}
                      <input type="file" className="form-control" id="fileInput" onChange={handleFileChange} />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Status</Label><br />
                      <Switch
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                        onColor="#02a499"
                        onChange={() => {
                          setSwitch3(!switch3)
                        }}
                        checked={switch3}
                      />
                      &nbsp;
                    </div>
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={updateCertification}>
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

export default connect(null, { setBreadcrumbItems })(EditCertification);
