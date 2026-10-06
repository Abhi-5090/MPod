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
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import Switch from "react-switch"
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";

const EditUser = (props) => {
  document.title = "Technical Hub | Edit User";

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
    props.setBreadcrumbItems('Edit User', breadcrumbItems);
    fetchData();
    fetchUserData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-technologies');
      if (response.status === 200) {
        console.log(response.data)
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

        setstatusswitch3(response.data.status);
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
        { label: "hod", value: "hod" },
        { label: "faculty", value: "faculty" },
        { label: "Principal", value: "Principal" },
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

 

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };
  const updateUser = async () => {
    const newStatus = statusswitch3 ? 1 : 0;
    const formData = new FormData();
    const initialTechnologyValueArray = initialTechnologyValue.map(ele=>ele.value)
    formData.append('file', file);
    formData.append('first_name', data.first_name);
    formData.append('roll_no', data.roll_no);
    formData.append('gender', typeof(initialGenderValue.value)=='undefined'?data.gender:initialGenderValue.value);
    formData.append('mobile', data.mobile);
    formData.append('email', data.email);
    formData.append('section', data.section);
    formData.append('role', typeof(initialRoleValue.value)=='undefined'?data.role:initialRoleValue.value);
    formData.append('technology', initialTechnologyValueArray);
    formData.append('profile_pic', data.profile_pic);
    formData.append('status', newStatus)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'update-user/' + user.userId, formData);
      if (response.status === 200) {
        navigate(`/users-list`);
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
              <h4 className="card-title">EDIT User</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">

                      <div className="mb-3">
                        <label className="form-lable">Default file input</label><br />
                        {previewUrl && <img src={previewUrl} alt="User Icon" width="50px" />}
                        {!previewUrl && data.profile_pic && <img src={backendImageUrl + "profile-pics/" + data.profile_pic} alt="Profile pic" width="50px" />}

                        <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                      </div>

                    </div>
                  </Col>
                </Row>
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
                        onChange={handleChange}
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
                        onChange={handleChange}
                        value={data.roll_no}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Gender</Label>
                      <Select
                        onChange={handleGenderSelectGroup}
                        options={genderOptionGroup}
                        classNamePrefix="select2-selection"
                        value={initialGenderValue}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select technology</Label>
                      <Select
                        onChange={handleTechnologySelectGroup}
                        options={optionGroup}
                        isMulti={true}
                        value={initialTechnologyValue}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>

                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="mobileValidation">Mobile</Label>
                      <AvField
                        name="mobile"
                        placeholder="Mobile"
                        type="text"
                        errorMessage="Enter mobile number"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="mobileValidation"
                        onChange={handleChange}
                        value={data.mobile}

                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="emailValidation">Email</Label>
                      <AvField
                        name="email"
                        placeholder="your email"
                        type="text"
                        errorMessage="Enter Email"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="emailValidation"
                        onChange={handleChange}
                        value={data.email}

                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>User role</Label>
                      <Select
                        onChange={handleRoleSelectGroup}
                        options={roleOptionGroup}
                        classNamePrefix="select2-selection"
                        value={initialRoleValue}
                      />
                    </div>
                    <Col md="6">
                    <div className="mb-3">
          <Label htmlFor="sectionValidation">section</Label>
                      <AvField
                        name="section"
                        placeholder="section"
                        type="text"
                        errorMessage="Enter your section"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="nameValidation"
                        onChange={handleChange}
                        value={data.section}
                      />
                    </div>
                  </Col>
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
                <Button color="primary" type="button" onClick={updateUser}>
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


