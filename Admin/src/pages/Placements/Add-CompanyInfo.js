import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Label } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // Import Select component

const AddCompany = () => {
  const navigate = useNavigate();
  document.title = "Technical Hub | Add Company";

  const [data, setData] = useState({
    company_name: '',
    percentage: '',
    backlogs: '',
    branches: '',
    industry: '',
    higest_package: '',
    company_link: '',
    createdAt: '',
    addedby: ''
  });
  const [rolePackage, setRolePackage] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [skills, setSkills] = useState([]);
  const [file, setFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [addedby, setAddedBy] = useState("");
  const [industrySelectedGroup, setIndustrySelectedGroup] = useState();

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
    const curr_user = JSON.parse(localStorage.getItem('authUser'));
    if (curr_user) {
      setAddedBy(curr_user.roll_no);
    }
  }, []);

  const industryOptionGroup = [
    {
      options: [
        { label: "IT", value: "IT" },
        { label: "Core", value: "Core" },
      ]
    },
  ];

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleIndustrySelectGroup = (selectedOption) => {
    setIndustrySelectedGroup(selectedOption.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };

  const handleJDChange = (event) => {
    setJdFile(event.target.files[0]);
  
  };


  const addUser = async () => {
    const roles = rolePackage.map((role, index) => ({
      role: role,
      package: data[`package_${index + 1}`]
    }));

    const final_selection_process = rounds.map((round) => ({
      round: round
    }));

    const final_skillset = skills.map((skill) => ({
      skill: skill
    }));

    const formData = new FormData();
    formData.append('company_big_Logo', file);
    formData.append('job_description', jdFile);
    formData.append('company_name', data.company_name);
    formData.append('percentage', data.percentage);
    formData.append('backlogs', data.backlogs);
    formData.append('branches', data.branches);
    formData.append('higest_package', data.higest_package);
    formData.append('company_link', data.company_link);

    formData.append('industry', industrySelectedGroup);
   
    formData.append('addedby', addedby);
    formData.append('Role', JSON.stringify(roles));
    formData.append('Section_process', JSON.stringify(final_selection_process));
    formData.append('skillset', JSON.stringify(final_skillset));

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.post(backendUrl+'add-companyinfo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 201) {
        alert('Company Info added successfully');
        navigate(`/companyInfo`);
      } else {
        console.log('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Error adding company info:', error);
      if (error.response) {
        const status = error.response.status;
        let errorMessage = 'An unexpected error occurred';
        if (status === 400) {
          errorMessage = 'Please fill in all required fields correctly.';
        } else if (status === 500) {
          errorMessage = 'Something went wrong';
        }
        toast.error(errorMessage, {
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
      } else {
        toast.error('An unexpected error occurred', {
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
      }
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
          transition={Bounce}
        />
        <Col xl="12">
          <Card>
            <CardBody>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="4">
                    <div className="mb-3">
                      <Label htmlFor="companyName">Company Name</Label>
                      <AvField
                        name="company_name"
                        placeholder="Enter Company name"
                        type="text"
                        errorMessage="Insert Company Name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="companyName"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="mb-3">
                      <Label className="form-label">Company Logo</Label><br />
                      {previewUrl && <img src={previewUrl} alt="Company Logo" width="50px" />}
                      <input type="file" name="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                    </div>
                  </Col>

                  <Col md="4">
                    <div className="mb-3">
                      <Label className="form-label">job_description</Label><br />
                     
                      <input type="file" name="jdfile" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleJDChange} />
                    </div>
                  </Col>

                  <Col md="4">
                    <div className="mb-3">
                      <Label>Industry</Label>
                      <Select
                        options={industryOptionGroup}
                        onChange={handleIndustrySelectGroup}
                      />
                    </div>
                  </Col>
                </Row>
                
                <Row>
                  <legend>Roles</legend>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="roleOne">Role One</Label>
                      <AvField
                        name="role_1"
                        placeholder="Role One"
                        type="text"
                        errorMessage="Insert Role One"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="roleOne"
                        onChange={(e) => setRolePackage((prev) => {
                          const newRolePackage = [...prev];
                          newRolePackage[0] = e.target.value;
                          return newRolePackage;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="packageOne">Package One</Label>
                      <AvField
                        name="package_1"
                        type="text"
                        placeholder="Package One"
                        className="form-control"
                       
                        id="packageOne"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="roleTwo">Role Two</Label>
                      <AvField
                        name="role_2"
                        placeholder="Role Two"
                        type="text"
                        errorMessage="Insert Role Two"
                        className="form-control"
                        
                        id="roleTwo"
                        onChange={(e) => setRolePackage((prev) => {
                          const newRolePackage = [...prev];
                          newRolePackage[1] = e.target.value;
                          return newRolePackage;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="packageTwo">Package Two</Label>
                      <AvField
                        name="package_2"
                        type="text"
                        placeholder="Package Two"
                        className="form-control"
                       
                        id="packageTwo"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                </Row>

               

                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="roleThree">Role Three</Label>
                      <AvField
                        name="role_3"
                        placeholder="Role Three"
                        type="text"
                        errorMessage="Insert Role Three"
                        className="form-control"
                       
                        id="roleThree"
                        onChange={(e) => setRolePackage((prev) => {
                          const newRolePackage = [...prev];
                          newRolePackage[2] = e.target.value;
                          return newRolePackage;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="packageThree">Package Three</Label>
                      <AvField
                        name="package_3"
                        type="text"
                        placeholder="Package Three"
                        className="form-control"
                       
                        id="packageThree"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                </Row>
                
                <Row>
                  <legend>Selection Process</legend>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="roundOne">Round One</Label>
                      <AvField
                        name="round_1"
                        placeholder="Round One"
                        type="text"
                        errorMessage="Insert Round One"
                        className="form-control"
                        
                        id="roundOne"
                        onChange={(e) => setRounds((prev) => {
                          const newRounds = [...prev];
                          newRounds[0] = e.target.value;
                          return newRounds;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="roundTwo">Round Two</Label>
                      <AvField
                        name="round_2"
                        placeholder="Round Two"
                        type="text"
                        errorMessage="Insert Round Two"
                        className="form-control"
                        
                        id="roundTwo"
                        onChange={(e) => setRounds((prev) => {
                          const newRounds = [...prev];
                          newRounds[1] = e.target.value;
                          return newRounds;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="roundThree">Round Three</Label>
                      <AvField
                        name="round_3"
                        placeholder="Round Three"
                        type="text"
                        errorMessage="Insert Round Three"
                        className="form-control"
                       
                        id="roundThree"
                        onChange={(e) => setRounds((prev) => {
                          const newRounds = [...prev];
                          newRounds[2] = e.target.value;
                          return newRounds;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="roundFour">Round Four</Label>
                      <AvField
                        name="round_4"
                        placeholder="Round Four"
                        type="text"
                        errorMessage="Insert Round Four"
                        className="form-control"
                        
                        id="roundFour"
                        onChange={(e) => setRounds((prev) => {
                          const newRounds = [...prev];
                          newRounds[3] = e.target.value;
                          return newRounds;
                        })}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  {/* <legend>Selection Process</legend> */}
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="roundFive">Round Five</Label>
                      <AvField
                        name="round_5"
                        placeholder="Round Five"
                        type="text"
                        errorMessage="Insert Round Five"
                        className="form-control"
                        
                        id="roundFive"
                        onChange={(e) => setRounds((prev) => {
                          const newRounds = [...prev];
                          newRounds[4] = e.target.value;
                          return newRounds;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="roundSix">Round Six</Label>
                      <AvField
                        name="round_6"
                        placeholder="Round Six"
                        type="text"
                        errorMessage="Insert Round Six"
                        className="form-control"
                        
                        id="roundSix"
                        onChange={(e) => setRounds((prev) => {
                          const newRounds = [...prev];
                          newRounds[5] = e.target.value;
                          return newRounds;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="roundSeven">Round Seven</Label>
                      <AvField
                        name="round_7"
                        placeholder="Round Seven"
                        type="text"
                        errorMessage="Insert Round Seven"
                        className="form-control"
                       
                        id="roundSeven"
                        onChange={(e) => setRounds((prev) => {
                          const newRounds = [...prev];
                          newRounds[6] = e.target.value;
                          return newRounds;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="roundEight">Round Eight</Label>
                      <AvField
                        name="round_8"
                        placeholder="Round Eight"
                        type="text"
                        errorMessage="Insert Round Eight"
                        className="form-control"
                        
                        id="roundEight"
                        onChange={(e) => setRounds((prev) => {
                          const newRounds = [...prev];
                          newRounds[7] = e.target.value;
                          return newRounds;
                        })}
                      />
                    </div>
                  </Col>
                </Row>

               
                
                <Row>
                  <legend>Skills Required</legend>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="skillOne">Skill One</Label>
                      <AvField
                        name="skill_1"
                        placeholder="Skill One"
                        type="text"
                        errorMessage="Insert Skill One"
                        className="form-control"
                       
                        id="skillOne"
                        onChange={(e) => setSkills((prev) => {
                          const newSkills = [...prev];
                          newSkills[0] = e.target.value;
                          return newSkills;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="skillTwo">Skill Two</Label>
                      <AvField
                        name="skill_2"
                        placeholder="Skill Two"
                        type="text"
                        errorMessage="Insert Skill Two"
                        className="form-control"
                        
                        id="skillTwo"
                        onChange={(e) => setSkills((prev) => {
                          const newSkills = [...prev];
                          newSkills[1] = e.target.value;
                          return newSkills;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="skillThree">Skill Three</Label>
                      <AvField
                        name="skill_3"
                        placeholder="Skill Three"
                        type="text"
                        errorMessage="Insert Skill Three"
                        className="form-control"
                       
                        id="skillThree"
                        onChange={(e) => setSkills((prev) => {
                          const newSkills = [...prev];
                          newSkills[2] = e.target.value;
                          return newSkills;
                        })}
                      />
                    </div>
                  </Col>
                  <Col md="3">
                    <div className="mb-3">
                      <Label htmlFor="skillFour">Skill Four</Label>
                      <AvField
                        name="skill_4"
                        placeholder="Skill Four"
                        type="text"
                        errorMessage="Insert Skill Four"
                        className="form-control"
                        
                        id="skillFour"
                        onChange={(e) => setSkills((prev) => {
                          const newSkills = [...prev];
                          newSkills[3] = e.target.value;
                          return newSkills;
                        })}
                      />
                    </div>
                  </Col>
                </Row>

              
                
                <Row>
                  <Col md="4">
                    <div className="mb-3">
                      <Label htmlFor="percentage">Percentage</Label>
                      <AvField
                        name="percentage"
                        placeholder="Percentage"
                        type="text"
                        errorMessage="Insert Percentage"
                        className="form-control"
                       
                        id="percentage"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="mb-3">
                      <Label htmlFor="higest_package">higest_package</Label>
                      <AvField
                        name="higest_package"
                        placeholder="higest_package"
                        type="text"
                        errorMessage="Insert higest_package"
                        className="form-control"
                       
                        id="higest_package"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="mb-3">
                      <Label htmlFor="backlogs">Backlogs</Label>
                      <AvField
                        name="backlogs"
                        placeholder="Backlogs"
                        type="text"
                        errorMessage="Insert Backlogs"
                        className="form-control"
                       
                        id="backlogs"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="mb-3">
                      <Label htmlFor="branches">Branches</Label>
                      <AvField
                        name="branches"
                        placeholder="Branches"
                        type="text"
                        errorMessage="Insert Branches"
                        className="form-control"
                       
                        id="branches"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                  <Col md="4">
                    <div className="mb-3">
                      <Label htmlFor="branches">company_link</Label>
                      <AvField
                        name="company_link"
                        placeholder="company_link"
                        type="text"
                        errorMessage="Insert company_link"
                        className="form-control"
                       
                        id="company_link"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                </Row>
                
                
                <Button color="primary" type="submit" onClick={addUser}>
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

export default AddCompany;
