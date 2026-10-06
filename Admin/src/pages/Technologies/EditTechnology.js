import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import Switch from "react-switch";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";

const EditTechnology = (props) => {
  document.title = "Technical Hub | Edit Technology";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Technologies", link: "#" },
    { title: "Edit Technology", link: "#" },
  ];

  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL+"technology-icons/";
  const [data, setData] = useState({});
  const [switch3, setSwitch3] = useState(true);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState(null);
  const [technologyIcon, setTechnologyIcon] = useState(null);

  const { technologyId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    props.setBreadcrumbItems("Edit Technology", breadcrumbItems);
    fetchTechnologyData();
  }, [technologyId]);

  const fetchTechnologyData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(
        backendUrl + "get-technology-by-id/" + technologyId
      );
      if (response.status === 200) {
        setData(response.data);
        setTechnologyIcon(response.data.technology_icon || null);

        categoryOptionGroup[0].options.forEach((ele) => {
          if (response.data.technology_category === ele.value) {
            setSelectedCategoryGroup(ele);
          }
        });

        setSwitch3(response.data.status === 1);
      }
    } catch (error) {
      console.log("Error fetching technology data:", error);
    }
  };

  const handleCategorySelectGroup = (selectedCategoryGroup) => {
    setSelectedCategoryGroup(selectedCategoryGroup);
  };

  const updateTechnology = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    const newStatus = switch3 ? 1 : 0;

    const formData = new FormData();
    formData.append("technology_name", data.technology_name);
    formData.append("technology_category", selectedCategoryGroup.value);
    formData.append("status", newStatus);

    if (technologyIcon instanceof File) {
      formData.append("technology_icon", technologyIcon);
    }

    try {
      const response = await axios.post(
        backendUrl + "update-technology/" + technologyId,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("Success");
        navigate("/technologies-list");
      }
    } catch (error) {
      console.error("Error updating technology:", error);
    }
  };

  const Offsymbol = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        fontSize: 12,
        color: "#fff",
        paddingRight: 2,
      }}
    >
      No
    </div>
  );

  const OnSymbol = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        fontSize: 12,
        color: "#fff",
        paddingRight: 2,
      }}
    >
      Yes
    </div>
  );

  const categoryOptionGroup = [
    {
      options: [
        { label: "Low Code", value: "lowcode" },
        { label: "High Code", value: "highcode" },
        { label: "No Code", value: "nocode" },
        { label: "Owl Ground", value: "owlground" },
      ],
    },
  ];

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">EDIT Technology</h4>

              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="technology_name">Technology Name</Label>
                      <AvField
                        name="technology_name"
                        placeholder="Technology name"
                        type="text"
                        errorMessage="Enter Technology Name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="technology_name"
                        onChange={(e) =>
                          setData({ ...data, technology_name: e.target.value })
                        }
                        value={data.technology_name || ""}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Select Category</Label>
                      <Select
                        value={selectedCategoryGroup}
                        onChange={handleCategorySelectGroup}
                        options={categoryOptionGroup[0].options}
                        classNamePrefix="select2-selection"
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Upload Technology Icon</Label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) =>
                          setTechnologyIcon(e.target.files[0])
                        }
                      />
                      {typeof technologyIcon === "string" && (
                        <img
                          src={`${backendImageUrl}${technologyIcon}`}
                          alt="Technology Icon"
                          style={{ height: "60px", marginTop: "10px" }}
                        />
                      )}
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label>Active</Label>
                      <Switch
                        onChange={() => setSwitch3(!switch3)}
                        checked={switch3}
                        onColor="#0d6efd"
                        offColor="#6c757d"
                        onHandleColor="#fff"
                        offHandleColor="#fff"
                        handleDiameter={20}
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Button color="primary" type="button" onClick={updateTechnology}>
                  Update
                </Button>
              </AvForm>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(EditTechnology);
