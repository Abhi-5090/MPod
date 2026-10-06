import React, { useState, useEffect } from "react";
import { Row, Card, CardBody, Button, Label, Col, FormGroup, Input, Form } from "reactstrap";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import Switch from "react-switch";

const AddUser = () => {
  document.title = "Technical Hub | Add User";

  // State containing only the required fields
  const [data, setData] = useState({
    color: '',       // Color field
    image_url: '',   // Image URL
    logo_color: '',  // Logo Color
    Colors: [],      // Array of colors
  });

  const [status, setStatus] = useState(true); // true for Active, false for Inactive

  // Handle form input change
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Handle color array change
  const handleColorsChange = (e) => {
    const colors = e.target.value.split(',').map(color => color.trim()); // Handle multiple colors
    setData({ ...data, Colors: colors });
  };

  // Function to submit the form data
  const addUser = async () => {
    const formData = {
      color: data.color,
      image_url: data.image_url,
      logo_color: data.logo_color,
      Colors: data.Colors, // Assuming this is an array of color codes
      status: status ? 1 : 0 // Convert boolean to 1 (Active) or 0 (Inactive)
    };

    try {
      const response = await axios.post('http://node.technicalhub.io:4001/api/addappheaderdata', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 201) {
        toast.success('Data added successfully', {
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
        // Optional: Add navigation logic here if needed
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
      console.error('Error adding data:', error);
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
              <h4 className="card-title">Add Header Data</h4>
              <Form className="needs-validation">
                <Row>
                  {/* Color */}
                  <Col md="6">
                    <FormGroup>
                      <Label for="color">Color</Label>
                      <Input
                        type="text"
                        id="color"
                        name="color"
                        placeholder="Enter color"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  {/* Image URL */}
                  <Col md="6">
                    <FormGroup>
                      <Label for="image_url">Image URL</Label>
                      <Input
                        type="text"
                        id="image_url"
                        name="image_url"
                        placeholder="Enter image URL"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  {/* Logo Color */}
                  <Col md="6">
                    <FormGroup>
                      <Label for="logo_color">Logo Color</Label>
                      <Input
                        type="text"
                        id="logo_color"
                        name="logo_color"
                        placeholder="Enter logo color"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  {/* Colors Array */}
                  <Col md="6">
                    <FormGroup>
                      <Label for="Colors">Colors (comma-separated)</Label>
                      <Input
                        type="text"
                        id="Colors"
                        name="Colors"
                        placeholder="Enter colors (ex.123,123)"
                        className="form-control"
                        onChange={handleColorsChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  {/* Status Switch */}
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
