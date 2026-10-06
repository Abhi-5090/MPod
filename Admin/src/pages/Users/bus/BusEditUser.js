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
import { setBreadcrumbItems } from "../../../store/actions";
import axios from "axios";
import Switch from "react-switch"
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import FormData from 'form-data';

const EditUser = (props) => {
  document.title = "Technical Hub | Bus Edit User";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Users", link: "#" },
    { title: "Edit User", link: "#" },
  ];
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL

  const [data, setData] = useState({});
  const [statusswitch3, setstatusswitch3] = useState(true);
  const navigate = useNavigate();
  const [technologyData, setTechnologyData] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [initialGenderValue, setInitialGenderValue] = useState([]);
  const [initialRoleValue, setInitialRoleValue] = useState([]);
  const [initialTechnologyValue, setInitialTechnologyValue] = useState([]);

  let user = useParams();
  useEffect(() => {
    props.setBreadcrumbItems('Bus Edit User', breadcrumbItems);
    fetchData();
    fetchUserData();
  }, []);

  const fetchData = async () => {
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

  // useEffect(() => {
  //   if (technologyData.length > 0 && data.technology) {
  //     initialSelectedGroup = technologyData.filter((ele) => {
  //       return ele._id == data.technology
  //     });
  //     if (initialSelectedGroup.length > 0) {
  //       initialSelectedGroup.map((ele) => {
  //         initialTechnologyValue.push({ label: ele.technology_name, value: ele.technology_name })
  //       })
  //     }

  //   }
  // }, [technologyData, data.technology, initialSelectedGroup]);



  const fetchUserData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + "get-user-by-id/" + user.userId);
      if (response.status === 200) {
        console.log(response.data)
        setData(response.data);

        setstatusswitch3(response.data.bus_status);
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  const optionGroup = technologyData.map((ele) => ({
    options: [
      { label: ele.technology_name, value: ele._id }
    ]
  }));

  const genderOptionGroup = [
    {
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ]
    },
  ]

  const roleOptionGroup = [
    {
      options: [
        { label: "Admin", value: "admin" },
        { label: "Superadmin", value: "superadmin" },
        { label: "Manager", value: "manager" },
        { label: "Trainer", value: "trainer" },
        { label: "Trainee", value: "trainee" },
        { label: "Operations", value: "operations" },
        { label: "Intern", value: "intern" },
        { label: "Busstaff", value: "busstaff" },
      ]
    },
  ]

  useEffect(() => {
    let genderGroup = genderOptionGroup[0].options;
    let curr_gender = genderGroup.filter((ele) => {
      return ele.value == data.gender
    })
    if (curr_gender && curr_gender.length > 0) {
      setInitialGenderValue(prevState => [
        ...prevState,
        { label: curr_gender[0].label, value: curr_gender[0].value }
      ]);
    }


    let roleGroup = roleOptionGroup[0].options;
    let curr_role = roleGroup.filter((ele) => {
      return ele.value == data.role
    })
    if (curr_role && curr_role.length > 0) {
      setInitialRoleValue(prevState => [
        ...prevState,
        { label: curr_role[0].label, value: curr_role[0].value }
      ]);
    }

    console.log(technologyData)

  }, [data.gender, data.role, data.technology])

  useEffect(() => {
    if (technologyData.length > 0 && data.technology && data.technology.length > 0) {
      console.log(technologyData)
      console.log(data.technology)
      const initialSelectedTechnologies = data.technology.map(techId => {
        const tech = technologyData.find(techy => techy._id === techId);
        if (tech) {
          return { label: tech.technology_name, value: tech._id };
        }
        return null;
      }).filter(tech => tech !== null);
      console.log(initialSelectedTechnologies)

      setInitialTechnologyValue(initialSelectedTechnologies);
    }
  }, [technologyData, data.technology]);




  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };


  function handleTechnologySelectGroup(e) {
    setInitialTechnologyValue(e)
  }

  function handleRoleSelectGroup(e) {
    setInitialRoleValue(e)
  }

  function handleGenderSelectGroup(e) {
    setInitialGenderValue(e)
  }



  const handleStatusSwitchChange = (e) => {
    setstatusswitch3(!statusswitch3)
    const newStatus = !statusswitch3 ? 1 : 0;
    setData({ ...data, status: newStatus })
  }



  // const handleFileChange = (event) => {
  //   setFile(event.target.files[0]);
  //   const fileReader = new FileReader();
  //   fileReader.onload = () => {
  //     setPreviewUrl(fileReader.result);
  //   };
  //   fileReader.readAsDataURL(event.target.files[0]);
  // };
  const BUSupdateUser = async () => {
    const newStatus = statusswitch3 ? 1 : 0;
    // const formData = new FormData();
    // formData.append('first_name', data.first_name);
    // formData.append('roll_no', data.roll_no);
    // formData.append('bus_stage', data.bus_stage);
    // formData.append('town', data.town);
    // formData.append('bus_status', newStatus);
    // formData.append('test', 'testValue');
    const formData = {
      bus_stage:data.bus_stage,
      town:data.town,
      bus_status:newStatus
    }
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      // console.log(formData)
      const response = await axios.post(backendUrl + 'bus-update-user/' + user.userId, formData);
      if (response.status === 200) {
        console.log(response);
        navigate(`/users-businfo`);
        alert("Success");
      }
    } catch (error) {
      console.error('Error updating user:', error);
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
          fontSize: 10,
          marginLeft:"3px",
          color: "#fff",
          // background:"red",
          paddingRight: 5,
          width:"100%"
          
        }}
      >
        Inactive
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
          fontSize: 10,
          marginLeft:"10px",
          color: "#fff",
          paddingRight: 12
        }}
      >
        Active
      </div>
    );
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">EDIT User</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="nameValidation">Name</Label>
                      <AvField
                        name="first_name"
                        placeholder="Name"
                        type="text"
                        errorMessage="Enter your Name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="nameValidation"
                        // onChange={handleChange}
                        readOnly
                        value={data.first_name}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="rollValidation">Roll No</Label>
                      <AvField
                        name="roll_no"
                        placeholder="Roll no/Emp Id"
                        type="text"
                        errorMessage="Enter Roll no/Emp Id"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="rollValidation"
                        // onChange={handleChange}
                        readOnly
                        value={data.roll_no}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="bus_stageValidation">Stage</Label>
                      <AvField
                        name="bus_stage"
                        placeholder="Bus stage"
                        type="text"
                        errorMessage="Enter Bus stage"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="bus_stageValidation"
                        onChange={handleChange}
                        value={data.bus_stage}

                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="townValidation">Town</Label>
                      <AvField
                        name="town"
                        placeholder="your Town"
                        type="text"
                        errorMessage="Enter town"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="TownValidation"
                        onChange={handleChange}
                        value={data.town}
                      />
                    </div>
                  </Col>


                  <Col style={{ margin: "auto 0", paddingTop: "20px" }} md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Status</Label>&nbsp;&nbsp;&nbsp;&nbsp;
                      <Switch
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                        onColor="#02a499"
                        onChange={handleStatusSwitchChange}
                        checked={statusswitch3}
                      />
                    </div>
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={BUSupdateUser}>
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

export default connect(null, { setBreadcrumbItems })(EditUser);


