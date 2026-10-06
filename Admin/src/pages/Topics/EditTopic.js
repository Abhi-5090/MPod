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

const EditTopic = (props) => {
  document.title = "Technical Hub | Edit topic";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Topics", link: "#" },
    { title: "Edit Topic", link: "#" },
  ];
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL

  const [data, setData] = useState({});
  const [switch3, setswitch3] = useState(true);
  const [selectedTechnologyGroup, setselectedTechnologyGroup] = useState(null)
  const [technologyData, setTechnologyData] = useState([])
  const [selectedGroup, setselectedGroup] = useState(null);
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState([]);

  let topic = useParams();
  useEffect(() => {
    props.setBreadcrumbItems('Edit Topic', breadcrumbItems);
    fetchTechnologyData()
    fetchTopicData();
  },[])
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
  
  useEffect(()=>{
    if(selectedTechnologyGroup){
      fetchData();
    }
  }, [selectedTechnologyGroup]);


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



  const fetchData = async () => {
    if (typeof (selectedTechnologyGroup) != 'undefined') {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
      try {
        const response = await axios.post(backendUrl + 'get-modules-by-technology', { technology_id: selectedTechnologyGroup.value });
        if (response.status === 200) {
          console.log(response.data)
          setModuleData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
  };

  const fetchTopicData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "get-topic-by-id/" + topic.topicId);
      if (response.status === 200) {
        console.log(response.data)
        setData(response.data);
        setswitch3(response.data.status === 1);
      }
    } catch (error) {
      console.log("Error fetching topic data:", error);
    }
  };

  const handleSelectGroup = (selectedGroup) => {
    setselectedGroup(selectedGroup);
  };

  function handleSelectTechnologyGroup(selectedGroup) {
    setselectedTechnologyGroup(selectedGroup)
    console.log(selectedTechnologyGroup)
  }

  const handleChange = (e) => {
    setData({ ...data, topic_name: e.target.value });
  };

  const updateTopic = async () => {
    const newStatus = switch3 ? 1 : 0;
     let data_list = {
      topic_name:data.topic_name,
      module:selectedGroup.value,
      technology:selectedTechnologyGroup.value,
      status:newStatus
    }
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'update-topic/' + topic.topicId, data_list);
      if (response.status === 200) {
        navigate(`/topics-list`);
        alert("Success");
      }
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  useEffect(() => {
    if (technologyData.length > 0 && data.technology) {
      const initialSelectedGroup = technologyData.find((ele) => ele._id === data.technology);
      setselectedTechnologyGroup({ label: initialSelectedGroup.technology_name, value: initialSelectedGroup._id });
    }
  }, [technologyData, data.technology]);

  useEffect(() => {
    if (moduleData.length > 0 && data.module) {
      const initialSelectedGroup = moduleData.find((ele) => ele._id === data.module);
      if(initialSelectedGroup) {

        setselectedGroup({ label: initialSelectedGroup.module_name, value: initialSelectedGroup._id });
      }
    }
    // setselectedGroup({})
  }, [moduleData, data.module]);

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
              <h4 className="card-title">EDIT TOPIC</h4>
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
                      <Label>Select module</Label>
                      <Select
                        value={selectedGroup}
                        onChange={handleSelectGroup}
                        options={moduleData.map((ele) => ({ label: ele.module_name, value: ele._id }))}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Topic Name</Label>
                      <AvField
                        name="topic_name"
                        placeholder="Topic name"
                        type="text"
                        errorMessage="Enter Topic Name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.topic_name}
                      />
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


