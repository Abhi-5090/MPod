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
import Select from "react-select";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AddTechnology = (props) => {
  document.title = "Technical Hub | Add Technology";
  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Technologies", link: "/technologies-list" },
    { title: "Add Technology", link: "/add-technology" },
  ];

  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems("Add Technology", breadcrumbItems);
  }, []);

  const categoryOptionGroup = [
    {
      options: [
        { label: "Low Code", value: "lowcode" },
        { label: "High Code", value: "highcode" },
        { label: "No Code", value: "nocode" },
      ],
    },
  ];

  const handleChange = (e) => {
    setData({ ...data, technology_name: e.target.value });
  };

  const handleCategorySelectGroup = (selectedOption) => {
    setSelectedCategoryGroup(selectedOption);
  };

  const addTechnology = async () => {
    if (!data.technology_name || data.technology_name.trim() === "") {
      toast.error("Technology name is required!");
      return;
    }

    if (!selectedCategoryGroup) {
      toast.error("Please select a technology category!");
      return;
    }

    const dataList = {
      technology_name: data.technology_name.trim(),
      technology_category: selectedCategoryGroup.value,
    };

    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + "add-technology", dataList);
      if (response.status === 200) {
        toast.success("Technology added successfully!");
        setTimeout(() => navigate("/technologies-list"), 1500);
      }
    } catch (error) {
      console.error("Error adding technology:", error);
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <React.Fragment>
      <ToastContainer position="top-right" autoClose={3000} />
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">ADD Technology</h4>
              <AvForm
                className="needs-validation"
                onValidSubmit={addTechnology}
              >
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Technology Name</Label>
                      <AvField
                        name="technology_name"
                        placeholder="Technology name"
                        type="text"
                        errorMessage="Enter Technology Name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Select Category</Label>
                      <Select
                        value={selectedCategoryGroup}
                        onChange={handleCategorySelectGroup}
                        options={categoryOptionGroup}
                        classNamePrefix="select2-selection"
                        placeholder="Select a category"
                      />
                    </div>
                  </Col>
                </Row>

                <Button color="primary" type="submit">
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

export default connect(null, { setBreadcrumbItems })(AddTechnology);
