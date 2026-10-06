import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Label } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Switch from "react-switch";

const AddUser = (props) => {
  const navigate = useNavigate();
  document.title = "Technical Hub | Add User";

  const [data, setData] = useState({});
  const [categorySelectedGroup, setCategorySelectedGroup] = useState();
  const [roleSelectedGroup, setRoleSelectedGroup] = useState();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [addedby, setAddedBy] = useState("");
  const [status, setStatus] = useState(true); // true for Active, false for Inactive

  const Offsymbol = () => {
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

  useEffect(() => {
    const curr_user = JSON.parse(localStorage.getItem('authUser'));
    if (curr_user) {
      setAddedBy(curr_user.roll_no);
    }
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


  const roleOptionGroup = [
    {
      options: [
        { label: "2024/2025", value: "2024/2025" },
        { label: "2025/2026", value: "2025/2026" },
        { label: "2026", value: "2026" },
        { label: "2025", value: "2025" },
        { label: "2024", value: "2024" },
        
      ]
    },
  ];

  const categoryOptionGroup = [
    {
      options: [
        { label: "Hackathon", value: "Hackathon" },
        { label: "Placement", value: "Placement" },
        { label: "Contest", value: "Contest" },
        { label: "Internship", value: "Internship" },
      ]
    },
  ];

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleCategorySelectGroup = (selectedOption) => {
    setCategorySelectedGroup(selectedOption.value);
  };

  const handleRoleSelectGroup = (selectedOption) => {
    setRoleSelectedGroup(selectedOption.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };

  const addUser = async () => {
    const formData = new FormData();
    formData.append('company_logo', file);
    formData.append('register_link', data.register_link);
    formData.append('Deadline', data.Deadline);
    formData.append('addedby', addedby);
    formData.append('createdAt', new Date().toISOString());
    formData.append('category', categorySelectedGroup);
    formData.append('eligibility', roleSelectedGroup);
    formData.append('status', status ? 1 : 0); // Convert boolean to 1 (Active) or 0 (Inactive)

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.post(backendUrl+'add-placements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 201) {
        alert('Placement added successfully');
        navigate(`/companycards`);
      }
    } catch (error) {
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
      console.error('Error adding placement:', error);
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

        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">ADD DATA</h4>

              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label className="form-label">Company Logo</Label><br />
                      {previewUrl && <img src={previewUrl} alt="User Icon" width="50px" />}
                      <input type="file" className="form-control form-control-file" data-buttonname="btn-secondary" onChange={handleFileChange} />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="LinkValidation">Registration Link</Label>
                      <AvField
                        name="register_link"
                        placeholder="Link"
                        type="text"
                        errorMessage="Insert Link"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="LinkValidation"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="dateValidation">Deadline</Label>
                      <AvField
                        name="Deadline"
                        type="date"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="dateValidation"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Eligibility</Label>
                      <Select
                        onChange={handleRoleSelectGroup}
                        options={roleOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Category</Label>
                      <Select
                        onChange={handleCategorySelectGroup}
                        options={categoryOptionGroup}
                        classNamePrefix="select2-selection"
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
                        onChange={() => setStatus(!status)}
                        checked={status}
                      />
                      &nbsp;
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
