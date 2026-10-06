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
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import Switch from "react-switch"
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";

const EditTechnology = (props) => {
  document.title = "Technical Hub | Edit technology";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Technologies", link: "#" },
    { title: "Edit Technology", link: "#" },
  ];
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL

  const [data, setData] = useState({});
  const [switch3, setswitch3] = useState(true);
  const [selectedGroup, setselectedGroup] = useState(null);
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  let technology = useParams();

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'trainer' || authUser.role == 'operations' || authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
  useEffect(() => {
    props.setBreadcrumbItems('Edit Course', breadcrumbItems);
    fetchData();
    fetchTechnologyData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-courses');
      if (response.status === 200) {
        setCourseData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchTechnologyData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "get-technology-by-id/" + technology.technologyId);
      if (response.status === 200) {
        console.log(response.data)
        setData(response.data);
        setswitch3(response.data.status === 1);
      }
    } catch (error) {
      console.log("Error fetching technology data:", error);
    }
  };

  const handleSelectGroup = (selectedGroup) => {
    setselectedGroup(selectedGroup);
  };

  const handleChange = (e) => {
    setData({ ...data, technology_name: e.target.value });
  };
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };
  const updateTechnology = async () => {
    const newStatus = switch3 ? 1 : 0;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('technology_name', data.technology_name);
    formData.append('course', selectedGroup.value);
    formData.append('status',newStatus)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'update-technology/' + technology.technologyId, formData);
      if (response.status === 200) {
        navigate(`/technologies-list`);
        alert("Success");
      }
    } catch (error) {
      console.error('Error updating technology:', error);
    }
  };

  useEffect(() => {
    if (courseData.length > 0 && data.course) {
      const initialSelectedGroup = courseData.find((ele) => ele._id === data.course);
      setselectedGroup({ label: initialSelectedGroup.course_name, value: initialSelectedGroup._id });
    }
  }, [courseData, data.course]);

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
              <h4 className="card-title">EDIT Technology</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Course</Label>
                      <Select
                        value={selectedGroup}
                        onChange={handleSelectGroup}
                        options={courseData.map((ele) => ({ label: ele.course_name, value: ele._id }))}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Technology Name</Label>
                      <AvField
                        name="technology_name"
                        placeholder="Technology name"
                        type="text"
                        errorMessage="Enter Technology Name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.technology_name}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">

                      <div className="mb-3">
                        <label className="form-lable">Default file input</label><br />
                        {previewUrl && <img src={previewUrl} alt="Technology Icon" width="50px" />}
                        {!previewUrl && data.technology_icon && <img src={backendImageUrl+"technology-icons/"+data.technology_icon} alt="Technology Icon" width="50px" />}
                        <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                      </div>

                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Status</Label>&nbsp;&nbsp;&nbsp;&nbsp;
                      <Switch
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                        onColor="#02a499"
                        onChange={() => {
                          setswitch3(!switch3)
                        }}
                        checked={switch3}
                      />
                      &nbsp;
                    </div>
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={updateTechnology}>
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

export default connect(null, { setBreadcrumbItems })(EditTechnology);


