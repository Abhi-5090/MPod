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
  document.title = "Technial Hub| Add Topic";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Topics", link: "/topics-list" },
    { title: "Add Topic", link: "/add-topic" },
  ];
  const [data, setData] = useState({});
  const [technologyData, setTechnologyData] = useState([])
  const [selectedGroup, setselectedGroup] = useState(null)
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [moduleData, setModuleData] = useState([])
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    props.setBreadcrumbItems('Add Topic', breadcrumbItems);
    fetchTechnologyData()
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
  useEffect(() => {
    if(selectedTechnologyGroup){
      fetchData()
    }
    console.log(selectedTechnologyGroup)
  }, [selectedTechnologyGroup])
  // const fetchData = async () => {
  //   const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
  //   try {
  //     const response = await axios.get(backendUrl + 'get-modules');
  //     if (response.status === 200) {
  //       setModuleData(response.data);
  //     }
  //   } catch (error) {
  //     console.log("Error fetching data:", error);
  //   }
  // };

  const fetchData = async () => {
    if (typeof (selectedTechnologyGroup) != 'undefined') {

      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
      try {
        const response = await axios.post(backendUrl + 'get-modules-by-technology', { technology_id: selectedTechnologyGroup.value });
        if (response.status === 200) {
          
          setModuleData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
  }



  const fetchTechnologyData = async () => {
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

  const technologyOptionGroup = technologyData.map((ele) => ({
    options: [
      { label: ele.technology_name, value: ele._id }
    ]
  }));


  const optionGroup = moduleData.map((ele) => ({
    options: [
      { label: ele.module_name, value: ele._id }
    ]
  }));

  const handleChange = (e) => {
    setData({ ...data, topic_name: e.target.value });
  };
  function handleSelectGroup(selectedGroup) {
    setselectedGroup(selectedGroup)
  }

  function handleSelectTechnologyGroup(selectedGroup) {
    setselectedTechnologyGroup(selectedGroup)
    console.log(selectedTechnologyGroup)
  }


  const addTopic = async () => {
    if (!selectedTechnologyGroup) {
      toast.error("Please select a technology");
      return;
    }
    if (!selectedGroup) {
      toast.error("Please select a module");
      return;
    }
    if (!file) {
      toast.error("Please upload a topic file");
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', selectedGroup.value);
    formData.append('technology', selectedTechnologyGroup.value);
  
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
  
    try {
      const response = await axios.post(backendUrl + 'add-topic', formData, {
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
    console.log(event.target.files[0])
  };
  return (
    <React.Fragment>
      <Row>
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}  // Corrected this line
        />

        {/* Same as */}
        <ToastContainer />
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">ADD TOPIC</h4>

              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select technology</Label>
                      <Select
                        value={selectedTechnologyGroup}
                        onChange={handleSelectTechnologyGroup}
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
                        value={selectedGroup}
                        onChange={handleSelectGroup}
                        options={optionGroup}
                        classNamePrefix="select2-selection"
                        // name="module"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>            
                  <Col md="6">
                    <div className="mb-3">
                      <div className="mb-3">
                        <label className="form-lable">Upload topics</label><br />
                        <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                      </div>
                    </div>
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
