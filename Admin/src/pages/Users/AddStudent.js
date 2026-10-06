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

const AddUser = (props) => {
  const navigate = useNavigate();
  document.title = "Technial Hub| Add User";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Users", link: "/users-list" },
    { title: "Add User", link: "/add-user" },
  ];
  const [user, setUser] = useState({});
  const [data, setData] = useState({});
  const [collegeSelectedGroup, setCollegeSelectedGroup] = useState()
  const [branchSelectedGroup, setBranchSelectedGroup] = useState()
  const [technologySelectedGroup, setTechnologySelectedGroup] = useState()
  const [passoutSelectedGroup, setPassoutSelectedGroup] = useState()
  const [roleSelectedGroup, setRoleSelectedGroup] = useState()
  const [genderSelectedGroup, setGenderSelectedGroup] = useState()
  const [technologyData, setTechnologyData] = useState([])
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showCollege, setShowCollege] = useState(false)

  useEffect(() => {
    props.setBreadcrumbItems('Add User', breadcrumbItems);
    const authUser = JSON.parse(localStorage.getItem('authUser'))
    setUser(authUser)
    fetchData()
  }, []);

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


  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-technologies');
      console.log(response.status)
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

  const collegeOptionGroup = [
    {
      // label: "Picnic",
      options: [
        { label: "AUS", value: "AUS" },
        { label: "AEC", value: "AEC" },
        { label: "ACET", value: "ACET" },
        { label: "APC", value: "APC" },
        // { label: "ACOE", value: "ACOE" }
      ]
    },
  ]

  const branchOptionGroup = [
    {
      // label: "Picnic",
      options: [
        { label: "CSE", value: "CSE" },
        { label: "CSE1", value: "CSE1" },
        { label: "CSE2", value: "CSE2" },
        { label: "IT", value: "IT" },
        { label: "AIML", value: "AIML" },
        { label: "AIML1", value: "AIML1" },
        { label: "AIML2", value: "AIML2" },
        { label: "IOT", value: "IOT" },
        { label: "DS", value: "DS" },
        { label: "ECE", value: "ECE" },
        { label: "ECE1", value: "ECE1" },
        { label: "ECE2", value: "ECE2" },
        { label: "EEE", value: "EEE" },
        { label: "MECH", value: "MEC" },
        { label: "CE", value: "CE" },
        { label: "PET", value: "PET" },
        { label: "AGRI", value: "AG" },
        { label: "ME", value: "ME" },
        { label: "MCA", value: "MCA" },
        { label: "MBA", value: "MBA" }
      ]
    },
  ]

  const passoutYearOptionGroup = [
    {
      // label: "Picnic",
      options: [
        { label: "2024", value: "2024" },
        { label: "2025", value: "2025" },
        { label: "2026", value: "2026" },
        { label: "2027", value: "2027" },
        { label: "2028", value: "2028" },
        { label: "2029", value: "2029" },
        { label: "2030", value: "2030" },
        { label: "2031", value: "2031" },
        { label: "2032", value: "2032" },
        { label: "2033", value: "2033" },
      ]
    },
  ]

  const genderOptionGroup = [
    {
      // label: "Picnic",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ]
    },
  ]

  const roleOptionGroup = [
    {
      // label: "Picnic",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Superadmin", value: "superadmin" },
        { label: "Manager", value: "manager" },
        { label: "Trainer", value: "trainer" },
        { label: "Trainee", value: "trainee" },
        { label: "Operations", value: "operations" },
        { label: "Intern", value: "intern" },
        { label: "HOD", value: "hod" },
        { label: "Busstaff", value: "busstaff" },
      ]
    },
  ]


  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    console.log(data)
  };
  function handleCollegeSelectGroup(e) {
    setCollegeSelectedGroup(e.value)
    console.log(collegeSelectedGroup)
  }

  function handleBranchSelectGroup(e) {
    setBranchSelectedGroup(e)
    console.log(e)
  }

  function handlePassoutSelectGroup(e) {
    setPassoutSelectedGroup(e.value)
  }

  function handleTechnologySelectGroup(e) {
    console.log(e)
    setTechnologySelectedGroup(e)
  }

  function handleRoleSelectGroup(e) {
    setRoleSelectedGroup(e.value)
    if (e.value == "hod") {
      setShowCollege(true)
    } else {
      setShowCollege(false)
    }
  }

  function handleGenderSelectGroup(e) {
    console.log(genderSelectedGroup)
    setGenderSelectedGroup(e.value)
  }

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };
  const addUser = async () => {    
    let branchSelectedGroupArray
    if(typeof(branchSelectedGroup)!='undefined'){
      branchSelectedGroupArray = branchSelectedGroup.map(ele => ele.value)
    }
    data.college = collegeSelectedGroup;
    data.branch= branchSelectedGroupArray
    data.passout_year =  passoutSelectedGroup
    data.gender = genderSelectedGroup
    data.added_by=  user.first_name
    console.log(data)
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'add-student', data);
      if (response.status == 200) {
        // alert("User added successfully");
        toast('User added successfully', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        navigate(`/users-list`)
      }

    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("User already exists")
      } 
      console.error('Error fetching data:', error);
    }
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
              <h4 className="card-title">Add Student</h4>

              <AvForm className="needs-validation">
                {/* <Row>
                  <Col md="6">
                    <div className="mb-3">

                      <div className="mb-3">
                        <label className="form-lable">User Icon</label><br />
                        {previewUrl && <img src={previewUrl} alt="User Icon" width="50px" />}
                        <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                      </div>

                    </div>
                  </Col>
                </Row> */}
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
                      />
                    </div>
                  </Col>
                </Row>
                
                <Row >
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select College</Label>
                      <Select
                        onChange={handleCollegeSelectGroup}
                        options={collegeOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Branch</Label>
                      <Select
                        onChange={handleBranchSelectGroup}
                        isMulti={true}
                        options={branchOptionGroup}
                        classNamePrefix="select2-selection"
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
                      />
                    </div>
                  </Col>
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
                      />
                    </div>
                  </Col>

                </Row>


                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Passout year </Label>
                      <Select
                        onChange={handlePassoutSelectGroup}
                        options={passoutYearOptionGroup}
                        classNamePrefix="select2-selection"
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
                      />
                    </div>
                  </Col>                 
                </Row>

                <Button color="primary" type="button" onClick={addUser}>
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

export default connect(null, { setBreadcrumbItems })(AddUser);
