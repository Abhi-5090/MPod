import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Label } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Switch from "react-switch";

const EditUser = (props) => {
  const { id } = useParams(); // Assuming you're using React Router to get the ID from URL params
  const navigate = useNavigate();
  document.title = "Technical Hub | Edit User";

  const [data, setData] = useState({
    register_link: '',
    Deadline: '',
    category: '',
    eligibility: '',
    status: 1,
  });
  const [categorySelectedGroup, setCategorySelectedGroup] = useState();
  const [roleSelectedGroup, setRoleSelectedGroup] = useState();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [addedby, setAddedBy] = useState("");
  const [status, setStatus] = useState(true); // true for Active, false for Inactive

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' ||  authUser.role == 'superadmin') {
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

    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (id) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(backendUrl+`getdata-id/${id}`);
      if (response.status === 200) {
        console.log(response.data)
        setData(response.data);
        setCategorySelectedGroup({ label: response.data.category, value: response.data.category }); // Assuming you have a field named 'category'
        setRoleSelectedGroup({ label: response.data.eligibility, value: response.data.eligibility }); // Assuming you have a field named 'eligibility'
        setStatus(response.data.status); // Convert status to boolean
        if (response.data.company_logo) {
          const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
          setPreviewUrl(backendImageUrl+`${response.data.company_logo}`);
        }
      }
      // Handle other fields as per your data structure
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error fetching data
    }
  };

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

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(event.target.files[0]);
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleCategorySelectGroup = (selectedOption) => {
    setCategorySelectedGroup(selectedOption);
  };

  const handleRoleSelectGroup = (selectedOption) => {
    setRoleSelectedGroup(selectedOption);
  };

  const editUser = async () => {
    const formData = new FormData();
    formData.append('company_logo', file);
    formData.append('register_link', data.register_link);
    formData.append('Deadline', data.Deadline);
    formData.append('addedby', addedby);
    formData.append('updated_at', new Date().toISOString());
    formData.append('category', categorySelectedGroup.value);
    formData.append('eligibility', roleSelectedGroup.value);
    formData.append('status', status ? 1 : 0); // Convert boolean to 1 (Active) or 0 (Inactive)
    console.log(formData);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.put(backendUrl+`edit-data/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        toast.success('Data updated successfully', {
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
        navigate(`/companycards`); // Redirect after successful update
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
      console.error('Error updating data:', error);
    }
  };

  const Offsymbol = () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", fontSize: 12, color: "#fff", paddingRight: 2 }}>
      No
    </div>
  );

  const OnSymbol = () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", fontSize: 12, color: "#fff", paddingRight: 2 }}>
      Yes
    </div>
  );

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
              <h4 className="card-title">EDIT DATA</h4>

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
                        value={data.register_link}
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
                        value={data.Deadline}
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
                        value={roleOptionGroup[0].options.find(option => option.value === roleSelectedGroup?.value)}
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
                        value={categoryOptionGroup[0].options.find(option => option.value === categorySelectedGroup?.value)}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Status</Label>
                      <Switch
                        checked={status}
                        onChange={() => setStatus(!status)}
                        onColor="#34c38f"
                        offColor="#f46a6a"
                        className="form-check form-switch"
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                      />
                    </div>
                  </Col>
                </Row>
                <Button color="primary" onClick={editUser}>Update</Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const mapStatetoProps = state => {
  const { breadcrumbItems } = state;
  return { breadcrumbItems };
};

export default connect(mapStatetoProps, { setBreadcrumbItems })(EditUser);
