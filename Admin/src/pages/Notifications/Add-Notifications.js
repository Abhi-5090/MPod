import React, { useState, useEffect } from "react";
import { Row, Card, CardBody, Button, Label, Col, FormGroup, Input, Form } from "reactstrap";
import Select from "react-select";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Switch from "react-switch";

const AddUser = () => {
  const navigate = useNavigate();
  document.title = "Technical Hub | Add User";

  const [data, setData] = useState({
    Description: '',
    heading: '',
    register_link: '',
  });

  const [typeSelectedGroup, setTypeSelectedGroup] = useState([]);
  const [selectedCertificationGroup, setSelectedCertificationGroup] = useState([]);
  const [branchSelectedGroup, setBranchSelectedGroup] = useState([]);
  const [yearSelectedGroup, setYearSelectedGroup] = useState([]);
  const [batchSelectedGroup, setBatchSelectedGroup] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [addedby, setAddedBy] = useState("");
  const [status, setStatus] = useState(true); // true for Active, false for Inactive
  const [gender, setGender] = useState("");
  const [certificationData, setCertificationData] = useState([]);
  const [category,setCategory] = useState([]);
  const [contentFile,setContentFile] =useState()
  useEffect(() => {
    const curr_user = JSON.parse(localStorage.getItem('authUser'));
    if (curr_user) {
      setAddedBy(curr_user.roll_no);
    }
    fetchCertificationsData();
  }, []);

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

  const branchOptionGroup = [
    { label: "EEE", value: "EEE" },
    { label: "ECE", value: "ECE" },
    { label: "CSE", value: "CSE" },
  ];

  const genderOptions = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  const categoryOptions = [
    { label: "Thub", value: "thub" },
    { label: "Non-Thub", value: "nonthub" },
    { label: "All", value: "all" },
  ];

  const fetchCertificationsData = async () => {
    try {
      const response = await axios.get('http://node.technicalhub.io:4001/api/get-batches-technologies');
      if (response.status === 200) {
        setCertificationData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
      toast.error("Error fetching batch data.", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const optionCertificationGroup = certificationData
    .filter((ele) => ele.batch_name)
    .map((ele) => ({
      label: ele.batch_name,
      value: ele.batch_name,
    }));

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleTypeSelectGroup = (selectedOptions) => {
   
    setTypeSelectedGroup(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleCertificationSelectGroup = (selectedGroup) => {
    setSelectedCertificationGroup(selectedGroup);
    setBatchSelectedGroup(selectedGroup ? selectedGroup.map(option => option.value) : []);
  };

  const handleTypeBranchGroup = (selectedOptions) => {
    setBranchSelectedGroup(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleYearSelectGroup = (selectedOptions) => {
    setYearSelectedGroup(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleGenderChange = (selectedOption) => {
    setGender(selectedOption ? selectedOption.value : "");
  };

  const handleCategoryChange = (selectedOption) => {
    console.log(selectedOption)
    setCategory(selectedOption ? selectedOption.value : "");
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
const handleContentFileChange= (e)=>{
  const selectedFile=e.target.files[0];
  setContentFile(selectedFile)
}
  const addUser = async () => {
    const formData = new FormData();

    // Append each branch separately to ensure it's treated as an array in the backend
    branchSelectedGroup.forEach(branch => {
      formData.append('branch[]', branch);
    });

    yearSelectedGroup.forEach(pass_outyear => {
      formData.append('pass_outyear[]', pass_outyear);
    });

    batchSelectedGroup.forEach(batch => {
      formData.append('batch[]', batch);
    });
console.log(category)
    formData.append('file', file);
    formData.append('type', typeSelectedGroup.join(','));
    formData.append('link', data.register_link);
    formData.append('Description', data.Description);
    formData.append('heading', data.heading);
    formData.append('addedby', addedby);
    formData.append('createdAt', new Date().toISOString());
    formData.append('status', status ? 1 : 0); // Convert boolean to 1 (Active) or 0 (Inactive)
    formData.append('gender', gender);
    formData.append('category', category);
    formData.append('content_file', contentFile);


    try {
      const response = await axios.post('http://node.technicalhub.io:4001/api/add-notificationdata', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.status === 201) {
        toast.success('Notifications added successfully', {
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
        navigate('/notificationslist'); // Update to string path
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
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      console.error('Error adding Notifications:', error);
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
              <h4 className="card-title">ADD Notifications Data</h4>
              <Form className="needs-validation">
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="image">Image</Label><br />
                      {previewUrl && <img src={previewUrl} alt="Preview" width="50px" />}
                      <Input type="file" id="image" className="form-control" onChange={handleFileChange} />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="image">Content</Label><br />
                      {/* {previewUrl && <img src={previewUrl} alt="Preview" width="50px" />} */}
                      <Input type="file" id="image" className="form-control" onChange={handleContentFileChange} />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="type">Type</Label>
                      <Select
                        isMulti
                        onChange={handleTypeSelectGroup}
                        options={typeOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                  
                    <Col md="6">
                      <FormGroup>
                        <Label for="category">category</Label>
                        <Select
                          onChange={handleCategoryChange}
                          options={categoryOptions}
                          classNamePrefix="select2-selection"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                
                {typeSelectedGroup.includes('Branch') && (
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="branch">Branch</Label>
                        <Select
                          isMulti
                          onChange={handleTypeBranchGroup}
                          options={branchOptionGroup}
                          classNamePrefix="select2-selection"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                )}
                {typeSelectedGroup.includes('Batch') && (
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="batch">Batch</Label>
                        <Select
                          isMulti
                          onChange={handleCertificationSelectGroup}
                          options={optionCertificationGroup}
                          classNamePrefix="select2-selection"
                          value={batchSelectedGroup.map(batch => optionCertificationGroup.find(option => option.value === batch))}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                )}
                {typeSelectedGroup.includes('Passout Year') && (
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="passoutyear">Passout Year</Label>
                        <Select
                          isMulti
                          onChange={handleYearSelectGroup}
                          options={yearOptionGroup}
                          classNamePrefix="select2-selection"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                )}
                {typeSelectedGroup.includes('Gender') && (
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="gender">Gender</Label>
                        <Select
                          onChange={handleGenderChange}
                          options={genderOptions}
                          classNamePrefix="select2-selection"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                )}
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="heading">Heading</Label>
                      <Input
                        type="text"
                        id="heading"
                        name="heading"
                        placeholder="Heading"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="register_link">Link</Label>
                      <Input
                        type="text"
                        id="register_link"
                        name="register_link"
                        placeholder="Link"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="12">
                    <FormGroup>
                      <Label for="Description">Description</Label>
                      <Input
                        type="textarea"
                        id="Description"
                        name="Description"
                        placeholder="Description"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="status">Status</Label>
                      <div>
                        <Switch
                          onChange={() => setStatus(!status)}
                          checked={status}
                          offColor="#888"
                          onColor="#28a745"
                          uncheckedIcon={false}
                          checkedIcon={false}
                          height={20}
                          width={40}
                        />
                        <span style={{ marginLeft: "8px" }}>{status ? "Active" : "Inactive"}</span>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
                <Button color="primary" onClick={addUser}>Submit</Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default AddUser;