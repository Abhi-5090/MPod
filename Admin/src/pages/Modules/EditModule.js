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

const EditModule = (props) => {
  document.title = "Technical Hub | Edit Module";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Modules", link: "#" },
    { title: "Edit Module", link: "#" },
  ];
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL

  const [data, setData] = useState({});
  const [switch3, setswitch3] = useState(true);
  const [selectedGroup, setselectedGroup] = useState(null);
  const navigate = useNavigate();
  const [technologyData, setTechnologyData] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  let module = useParams();
  useEffect(() => {
    props.setBreadcrumbItems('Edit Module', breadcrumbItems);
    fetchData();
    fetchModuleData();
  }, []);
  // useEffect(() => {
  //   let authUser = JSON.parse(localStorage.getItem('authUser'));
  //   if (authUser.role == 'admin' || authUser.role == 'superadmin') {
  //   }
  //   else {
  //     alert("your not autherized")
  //     localStorage.clear();
  //     window.location.href = '/admin/login';
  //   }
  // }, []);
  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-technologies');
      if (response.status === 200) {
        setTechnologyData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchModuleData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "get-module-by-id/" + module.moduleId);
      if (response.status === 200) {
        console.log(response.data)
        setData(response.data);
        setswitch3(response.data.status === 1);
      }
    } catch (error) {
      console.log("Error fetching module data:", error);
    }
  };

  const handleSelectGroup = (selectedGroup) => {
    setselectedGroup(selectedGroup);
    setData({ ...data, technology: selectedGroup.value });
  };

  const handleChange = (e) => {
    setData({ ...data, module_name: e.target.value });
  };
  const handleSwitchChange = (e) => {
    setswitch3(!switch3)
    const newStatus = !switch3 ? 1 : 0;
    setData({ ...data, status: newStatus })
  }
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };
  const updateModule = async () => {
    const newStatus = switch3 ? 1 : 0;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module_name', data.module_name);
    formData.append('technology', selectedGroup.value);
    formData.append('status', newStatus)
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'update-module/' + module.moduleId, formData);
      if (response.status === 200) {
        navigate(`/modules-list`);
        alert("Success");
      }
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };

  useEffect(() => {
    if (technologyData.length > 0 && data.technology) {
      const initialSelectedGroup = technologyData.find((ele) => ele._id === data.technology);
      setselectedGroup({ label: initialSelectedGroup.technology_name, value: initialSelectedGroup._id });
    }
  }, [technologyData, data.technology]);

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
              <h4 className="card-title">EDIT Module</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Technology</Label>
                      <Select
                        value={selectedGroup}
                        onChange={handleSelectGroup}
                        options={technologyData.map((ele) => ({ label: ele.technology_name, value: ele._id }))}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Module Name</Label>
                      <AvField
                        name="module_name"
                        placeholder="Module name"
                        type="text"
                        errorMessage="Enter Module Name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.module_name}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">

                      <div className="mb-3">
                        <label className="form-lable">Default file input</label><br />
                        {previewUrl && <img src={previewUrl} alt="Module Icon" width="50px" />}
                        {!previewUrl && data.module_icon && <img src={backendImageUrl + "module-icons/" + data.module_icon} alt="Module Icon" width="50px" />}
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
                        onChange={handleSwitchChange}
                        checked={switch3}
                      />
                      &nbsp;
                    </div>
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={updateModule}>
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

export default connect(null, { setBreadcrumbItems })(EditModule);


