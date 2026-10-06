import React, { useState, useEffect } from "react";
import { Row, Card, CardBody, Button, Label, Col, FormGroup, Input, InputGroup } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { ToastContainer, toast, Bounce } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Switch from "react-switch";

const AddRegistration = () => {
  const navigate = useNavigate();
  document.title = "Technical Hub | AddRegistration";

  const [data, setData] = useState({});
  const [typeSelectedGroup, setTypeSelectedGroup] = useState([]); 
  const [batchSelectedGroup, setBatchSelectedGroup] = useState([]);
  const [branchSelectedGroup, setBranchSelectedGroup] = useState([]);
  const [yearSelectedGroup, setYearSelectedGroup] = useState([]);
  const [addedby, setAddedBy] = useState("");
  const [gender, setGender] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const curr_user = JSON.parse(localStorage.getItem('authUser'));
    if (curr_user) {
      setAddedBy(curr_user.roll_no);
    }
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

  const handleYearSelectGroup = (selectedOption) => {
    setYearSelectedGroup(selectedOption ? selectedOption.map(option => option.value) : []);
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

  const addUser = async () => {
    console.log(typeSelectedGroup)
    console.log(batchSelectedGroup)
    console.log(branchSelectedGroup)
    console.log(yearSelectedGroup)
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("type", typeSelectedGroup);
    formData.append("batch", batchSelectedGroup);
    formData.append("branch", branchSelectedGroup);
    formData.append("pass_out_year", yearSelectedGroup);
    formData.append("addedby", addedby);
    formData.append("createdAt", new Date().toISOString());
    formData.append("gender", gender);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("seats", data.seats);
    formData.append("technology_name", data.technology_name);
    formData.append("technology_icon", file);

    //  for (let [key, value] of formData.entries()) {
    //     console.log(key, value);
    // }
    // console.log("form data" ,formData)
    // console.log("title",data.title);
    // console.log("type" ,typeSelectedGroup)
    // console.log("batch",batchSelectedGroup)
    // console.log("branch", branchSelectedGroup)
    // console.log("pass_out_year", yearSelectedGroup)
    // console.log("addedby", addedby)
    // console.log("gender", gender);
    // console.log("start date",startDate)
    // console.log("end date",endDate)
    // console.log("technology_icon", file)
    // console.log("technology_name", data.technology_name)
    // console.log("seats", data.seats)
    try {
      const response = await axios.post(
        'http://node.technicalhub.io:4001/api/add-registrations',
        formData
      );
      
      if (response.status === 201) {
        toast.success('Registration added successfully', {
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
        navigate('/registrations-list');
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
      console.error('Error adding Registration:', error);
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
              <h4 className="card-title">ADD Registration Data</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="title">Title</Label>
                      <AvField
                        name="title"
                        placeholder="Enter Title"
                        type="text"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="title"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Type</Label>
                      <Select
                        isMulti
                        onChange={handleTypeSelectGroup}
                        options={typeOptionGroup}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                {typeSelectedGroup.includes('Branch') && (
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Branch</Label>
                        <Select
                          isMulti
                          onChange={handleTypeBranchGroup}
                          options={branchOptionGroup}
                          classNamePrefix="select2-selection"
                        />
                      </div>
                    </Col>
                  </Row>
                )}
                {typeSelectedGroup.includes('Batch') && (
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Batch</Label>
                        <Select
                          isMulti
                          onChange={handleTypeBatchGroup}
                          options={batchOptionGroup}
                          classNamePrefix="select2-selection"
                        />
                      </div>
                    </Col>
                  </Row>
                )}
                {typeSelectedGroup.includes('Passout Year') && (
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Passout Year</Label>
                        <Select
                          isMulti
                          onChange={handleYearSelectGroup}
                          options={yearOptionGroup}
                          classNamePrefix="select2-selection"
                        />
                      </div>
                    </Col>  
                  </Row>
                )}
                {typeSelectedGroup.includes('Gender') && (
                  <Row>
                    <Col md="6">
                      <div className="mb-3">
                        <Label>Gender</Label>&nbsp;&nbsp;&nbsp;
                        <FormGroup check inline>
                          <Label check>
                            <Input type="radio" name="gender" value="Male" onChange={handleGenderChange} /> Male
                          </Label>
                        </FormGroup>
                        <FormGroup check inline>
                          <Label check>
                            <Input type="radio" name="gender" value="Female" onChange={handleGenderChange} /> Female
                          </Label>
                        </FormGroup>
                      </div>
                    </Col>
                  </Row>
                )}
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="startDate">Start Date</Label>
                      <InputGroup>
                        <Flatpickr
                          className="form-control d-block"
                          placeholder="Select Date"
                          options={{ dateFormat: "d M, Y" }}
                          value={startDate}
                          onChange={([date]) => setStartDate(date)}
                        />
                      </InputGroup>
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="endDate">End Date</Label>
                      <InputGroup>
                        <Flatpickr
                          className="form-control d-block"
                          placeholder="Select Date"
                          options={{ dateFormat: "d M, Y" }}
                          value={endDate}
                          onChange={([date]) => setEndDate(date)}
                        />
                      </InputGroup>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="seats">Seats</Label>
                      <AvField
                        name="seats"
                        placeholder="Enter Seats"
                        type="text"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="seats"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="technology_name">Technology Name</Label>
                      <AvField
                        name="technology_name"
                        placeholder="Enter Technology Name"
                        type="text"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="technology_name"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="technology_icon">Technology Icon</Label>
                      <Input
                        type="file"
                        className="form-control"
                        id="technology_icon"
                        onChange={handleFileChange}
                        accept=".jpg, .png, .jpeg"
                      />
                      {previewUrl && (
                        <div className="mt-2">
                          <img src={previewUrl} alt="Preview" style={{ maxHeight: "100px" }} />
                        </div>
                      )}
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

export default AddRegistration;
