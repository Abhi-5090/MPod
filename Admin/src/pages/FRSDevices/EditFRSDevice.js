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
import Switch from "react-switch"
import { useParams, useNavigate } from "react-router-dom";
const EditFRSDevice = (props) => {
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


  document.title = "Technical Hub | Edit device";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Devices", link: "#" },
    { title: "Edit Device", link: "#" },
  ];
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
    props.setBreadcrumbItems('Edit Device', breadcrumbItems);
  }, []);
  let device = useParams();
  console.log(device)
  const navigate = useNavigate()
  useEffect(() => {
    async function fetchData() {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(backendUrl+"get-frs-device-by-id/"+device.deviceId);
      if(response.status == 200)
      {
        setData(response.data)
        if(response.data.status == 1) {
          setswitch3(true)
        } else {
          setswitch3(false)
        }
      }
    }
    fetchData();
  }, [])
  const [data, setData] = useState({});
  const [switch3, setswitch3] = useState(true)
  const Offsymbol = (props) => {
    document.title = "Update FRS Devices || Admin Dashboard";
  
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
  
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const updateDevice = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;  
    const newStatus = switch3 ? 1 : 0;
    console.log(newStatus)
    // const updatedData = { ...data, status: newStatus };
    data.status = newStatus;
    data.update_at = curr_date_time
    try {
      const response = await axios.post(backendUrl + 'update-frs-device/' + device.deviceId, data);
      
      if (response) {
        navigate(`/frs-devices-list`)
        alert("Success");
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }; 

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">EDIT COURSE</h4>

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
                        value = {data.name}
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
                        value = {data.serial_no}
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
                        value = {data.location}
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
                <Button color="primary" type="button" onClick={updateDevice}>
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

export default connect(null, { setBreadcrumbItems })(EditFRSDevice);
