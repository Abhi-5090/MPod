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
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import {useNavigate} from "react-router-dom"
import Switch from "react-switch"
const AddFRSDevice = (props) => {
  let currentTime = new Date();
  let curr_date_time = currentTime.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  console.log(curr_date_time)


  document.title = "Technial Hub| Add Course";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "FRS Devices", link: "/frs-devices-list" },
    { title: "Add Device", link: "/add-frs-device" },
  ];

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'trainer' || authUser.role == 'operations' || authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
  useEffect(() => {
    props.setBreadcrumbItems('Add Device', breadcrumbItems);
  }, []);

  const [deviceData, setDeviceData] = useState({});
  const [switch3, setswitch3] = useState(true)

  const navigate = useNavigate();
  const handleChange = (e) => {
    setDeviceData({ ...deviceData, [e.target.name]: e.target.value });
  };

  const addDevice = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    deviceData.status = switch3;
    deviceData.created_at = curr_date_time;

    try {
      const response = await axios.post(backendUrl + 'add-frs-device', deviceData);
      if (response.status ==201) {
        navigate(`/frs-devices-list`)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const Offsymbol = (props) => {
    document.title = "Add FRS Device";
  
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
        {" "}
        No
      </div>
    )
  }
  
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
        {" "}
        Yes
      </div>
    )
  }

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

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">ADD Device</h4>

              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Device Name</Label>
                      <AvField
                        name="name"
                        placeholder="Device name"
                        type="text"
                        errorMessage="Enter Device Name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>

                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Serial No</Label>
                      <AvField
                        name="serial_no"
                        placeholder="Serial No"
                        type="text"
                        errorMessage="Enter Device Serial No"
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
                      <Label htmlFor="validationCustom01">Device Location</Label>
                      <AvField
                        name="location"
                        placeholder="Device Location"
                        type="text"
                        errorMessage="Enter Device Location"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                      />
                    </div>
                  </Col>

                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Status</Label>&nbsp;&nbsp;&nbsp;&nbsp;
                      <Switch
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                        onColor="#02a499"
                        onChange={() => {
                          setswitch3(!switch3)
                        }}
                        checked={switch3}
                      />
                      &nbsp;
                    </div>
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={addDevice}>
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

export default connect(null, { setBreadcrumbItems })(AddFRSDevice);
