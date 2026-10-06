import React, { useState, useEffect } from "react";
import { Row, Card, CardBody, Button, Label, Col, FormGroup, Input } from "reactstrap";
import Select from "react-select";
import { ToastContainer, toast, Bounce } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Switch from "react-switch";

const EditNotifications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  document.title = "Technical Hub | Edit Registration";

  const [data, setData] = useState({
    Description: '',
    heading: '',
    register_link: '',
    gender: '',
  });
  const [typeSelectedGroup, setTypeSelectedGroup] = useState([]);
  const [batchSelectedGroup, setBatchSelectedGroup] = useState([
    { label: "Batch 1", value: "Batch 1" },
    { label: "Batch 2", value: "Batch 2" }
  ]);
  const [branchSelectedGroup, setBranchSelectedGroup] = useState([]);
  const [yearSelectedGroup, setYearSelectedGroup] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [addedby, setAddedBy] = useState("");
  const [status, setStatus] = useState(true);
  const [gender, setGender] = useState("");
  

  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const response = await axios.get(`http://node.technicalhub.io:4001/api/getnotificationdata-id/${id}`);
        if (response.status === 200) {
          const registration = response.data;
          console.log(response.data);
          setData(registration);
          setTypeSelectedGroup(registration.type || []);
          setBatchSelectedGroup(registration.batch || []);
          setBranchSelectedGroup(registration.branch || []);
          setYearSelectedGroup(registration.pass_out_year || []);
          setGender(registration.gender || "");
          
          setPreviewUrl(`http://node.technicalhub.io:4001/notifications/${registration.image}`);
          setAddedBy(registration.addedby || "");
        }
      } catch (error) {
        console.error('Error fetching registration data:', error);
        toast.error('Error fetching registration data', {
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
    };

    fetchRegistrationData();
  }, [id]);

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 9 }, (_, index) => ({
      label: (currentYear + index).toString(),
      value: (currentYear + index).toString(),
    }));
  };

  const yearOptionGroup = getYearOptions();

  const typeOptionGroup = [
    { label: "Batch", value: "Batch" },
    { label: "Branch", value: "Branch" },
    { label: "Passout Year", value: "Passout Year" },
    { label: "Gender", value: "Gender" },
  ];

  const batchOptionGroup = [
    { label: "Batch 1", value: "Batch 1" },
    { label: "Batch 2", value: "Batch 2" },
    { label: "Batch 3", value: "Batch 3" },
  ];

  const branchOptionGroup = [
    { label: "EEE", value: "EEE" },
    { label: "ECE", value: "ECE" },
    { label: "CSE", value: "CSE" },
  ];

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleTypeSelectGroup = (selectedOptions) => {
    setTypeSelectedGroup(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleTypeBatchGroup = (selectedOptions) => {
    setBatchSelectedGroup(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleTypeBranchGroup = (selectedOptions) => {
    setBranchSelectedGroup(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleYearSelectGroup = (selectedOptions) => {
    setYearSelectedGroup(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleGenderChange = (e) => {
    setGender(e.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(selectedFile);
  };

  const updateUser = async () => {
    const formData = new FormData();

    branchSelectedGroup.forEach(branch => {
      formData.append('branch[]', branch);
    });
  
    yearSelectedGroup.forEach(pass_outyear => {
      formData.append('pass_outyear[]', pass_outyear);
    });

    batchSelectedGroup.forEach(batch => {
      formData.append('batch[]', batch);
    });

    formData.append("heading", data.heading);
    formData.append("Description", data.Description);
    formData.append("link", data.register_link);
    formData.append("type", typeSelectedGroup);
    formData.append("batch", batchSelectedGroup);
    formData.append("branch", branchSelectedGroup);
    formData.append("pass_out_year", yearSelectedGroup);
    formData.append("addedby", addedby);
    formData.append("status", status ? 1 : 0);
 
    formData.append("gender", gender);
    if (file) formData.append("image", file);

    try {
      const response = await axios.put(
        `http://node.technicalhub.io:4001/api/edit-Notification_data/${id}`,
        formData
      );
      console.log(response.data);
      
      if (response.status === 200) {
        toast.success('Registration updated successfully', {
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
        navigate('/notificationslist');
      }
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Please fill in all required fields correctly.';
            break;
          case 500:
            errorMessage = 'Something went wrong';
            break;
          default:
            errorMessage = 'An unexpected error occurred';
        }
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
      console.error('Error updating Registration:', error);
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
              <h4 className="card-title">Edit Notifications Data</h4>
              
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="image">Image</Label><br />
                      <Input
                        type="file"
                        name="image"
                        className="form-control"
                        id="image"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </FormGroup>
                  </Col>
                  {previewUrl && (
                    <Col md="6">
                      <div className="img-preview">
                        <img src={previewUrl} alt="Preview" style={{ width: '7%', height: 'auto' }} />
                      </div>
                    </Col>
                  )}
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="heading">Heading</Label>
                      <Input
                        type="text"
                        name="heading"
                        className="form-control"
                        id="heading"
                        placeholder="Enter heading"
                        value={data.heading}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="Description">Description</Label>
                      <Input
                        type="text"
                        name="Description"
                        className="form-control"
                        id="Description"
                        placeholder="Enter description"
                        value={data.Description}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="register_link">Register Link</Label>
                      <Input
                        type="text"
                        name="register_link"
                        className="form-control"
                        id="register_link"
                        placeholder="Enter link"
                        value={data.register_link}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="type">Type</Label>
                      <Select
                        value={typeOptionGroup.filter(option => typeSelectedGroup.includes(option.value))}
                        isMulti={true}
                        onChange={handleTypeSelectGroup}
                        options={typeOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="batch">Batch</Label>
                      {console.log(batchSelectedGroup)}
                      <Select
                        value={batchOptionGroup.filter(option => batchSelectedGroup.includes(option.value))}
                        isMulti={true}
                        onChange={handleTypeBatchGroup}
                        options={batchOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="branch">Branch</Label>
                      <Select
                        value={branchOptionGroup.filter(option => branchSelectedGroup.includes(option.value))}
                        isMulti={true}
                        onChange={handleTypeBranchGroup}
                        options={branchOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="pass_outyear">Passout Year</Label>
                      <Select
                        value={yearOptionGroup.filter(option => yearSelectedGroup.includes(option.value))}
                        isMulti={true}
                        onChange={handleYearSelectGroup}
                        options={yearOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="gender">Gender</Label>
                      <Input
                        type="select"
                        name="gender"
                        id="gender"
                        value={gender}
                        onChange={handleGenderChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="status">Status</Label>
                      <Switch
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onColor="#626ed4"
                        onChange={() => setStatus(!status)}
                        checked={status}
                        className="ms-3"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Button color="primary" onClick={updateUser}>Update</Button>
             
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default EditNotifications;
