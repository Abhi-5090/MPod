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

import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AddModule = (props) => {
  document.title = "Technial Hub| Add Module";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Modules", link: "/modules-list" },
    { title: "Add Module", link: "/add-module" },
  ];
  const [data, setData] = useState({});
  const [selectedGroup, setselectedGroup] = useState(null)
  const [technologyData, setTechnologyData] = useState([])
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    props.setBreadcrumbItems('Add Module', breadcrumbItems);
    fetchData()
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

  const optionGroup = technologyData.map((ele) => ({
    options: [
      { label: ele.technology_name, value: ele._id }
    ]
  }));

  const handleChange = (e) => {
    setData({ ...data, module_name: e.target.value });
  };
  function handleSelectGroup(selectedGroup) {
    setselectedGroup(selectedGroup)
    // setData({ ...data, technology: selectedGroup.value });

  }
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };
  const addModule = async () => {
    if (!selectedGroup) {
      toast.error("Please select a technology");
      return;
    }
    if (!data.module_name || data.module_name.trim() === "") {
      toast.error("Module name is required");
      return;
    }
    // if (!file) {
    //   toast.error("Please upload a module icon");
    //   return;
    // }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("module_name", data.module_name);
    formData.append("technology", selectedGroup.value);
  
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + "add-module", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        toast.success("Module added successfully");
        setTimeout(() => navigate("/modules-list"), 2000);
      }
    } catch (error) {
      console.error("Error adding module:", error);
      toast.error("Something went wrong while adding the module");
    }
  };
  

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">ADD MODULE</h4>
              <ToastContainer position="top-right" autoClose={3000} />

              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select technology</Label>
                      <Select
                        value={selectedGroup}
                        onChange={handleSelectGroup}
                        options={optionGroup}
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
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">

                      <div className="mb-3">
                        <label className="form-lable">Default file input</label><br/>
                        {previewUrl && <img src={previewUrl} alt="Module Icon" width="50px" />}
                        <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                      </div>

                    </div>
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={addModule}>
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

export default connect(null, { setBreadcrumbItems })(AddModule);
