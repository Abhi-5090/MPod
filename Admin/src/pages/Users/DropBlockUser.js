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
  Input
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import Switch from "react-switch"
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const DropBlockUser = (props) => {
  const navigate = useNavigate();
  document.title = "Technial Hub|Update User Status";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Users", link: "/users-list" },
    { title: "Add User", link: "/add-user" },
  ];
  const [data, setData] = useState({});
  const [blockSwitch, setBlockSwitch] = useState(true);
  const [dropSwitch, setDropSwitch] = useState(true);
  const [holdSwitch, setHoldSwitch] = useState(true);
  const [dropRemarks, setDropRemarks] = useState(true);
  const [holdRemarks, setHoldRemarks] = useState(true);
  const [blockRemarks, setBlockRemarks] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('')
  const [user, setUser] = useState();
  const [isBlockSwitch, setIsBlockSwitch] = useState();
  const [isDropSwitch, setIsDropSwitch] = useState();
  const [isHoldSwitch, setIsHoldSwitch] = useState();

  useEffect(() => {
    props.setBreadcrumbItems('Add User', breadcrumbItems);
    fetchData()
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

  
  function textareachange(event) {
    const count = event.target.value.length
  }

  const Offsymbol = (props) => {
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

  const statusOptions = [
    { label: "Block", value: "block" },
    { label: "Drop", value: "drop" },
    { label: "Hold", value: "hold" },
  ];

  const handleStatusSelect = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
  };

  const fetchData = async () => {

    try {
      const response = await axios.get(backendUrl + 'get-technologies');
      if (response.status === 200) {

      }

    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };


  const handleChange = async (e) => {
    try {
      if (e.target.name == "roll_no") {
        let curr_roll = e.target.value;
        if (curr_roll.length == 10) {
          await axios.get(backendUrl + "get-user-by-rollno/" + curr_roll).then((response) => {
            console.log(response.data)
            console.log(response.status)
            if (response.status === 200) {
              setUser(response.data)
              setIsBlockSwitch(true)
              setIsDropSwitch(true)
              setIsHoldSwitch(true)
              setBlockSwitch(response.data.block_status == 0 ? false : true)
              setDropSwitch(response.data.drop_status == 0 ? false : true)
              setHoldSwitch(response.data.hold_status == 0 ? false : true)
            }
          })
        }
        else {
          setIsBlockSwitch(false)
          setIsDropSwitch(false)
          setIsHoldSwitch(false)
        }
      }
      setData({ ...data, [e.target.name]: e.target.value });
      console.log(data)
    } catch (error) {
      console.log(error)
      if (error.response && error.response.status === 404) {
        alert("User not exists")
      }
    }

  };




  const addUser = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    data.block_status = blockSwitch;
    data.drop_status = dropSwitch;
    data.hold_status = holdSwitch;
    console.log(data)
    try {
      const response = await axios.post(backendUrl + 'update-user-status/' + data.roll_no, data);
      if (response.status == 200) {
        alert("Status updated successfully");
        navigate(`/user-status`)
      }

    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("User already exists")
      } else if (error.response && error.resopnse.status == 500) {
        alert("something went wrong")
      } else if (error.response && error.response.status === 404) {
        alert("User not found")
      }
      console.error('Error fetching data:', error);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Update User Status</h4>

              <AvForm className="needs-validation">
                <Row>

                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="rollValidation">Roll No</Label>
                      <AvField
                        name="roll_no"
                        placeholder="Roll no/Emp Id"
                        type="text"
                        errorMessage="Enter Roll no/Emp Id"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="rollValidation"
                        onChange={handleChange}
                      />
                      <span>{user && user.first_name}</span>
                    </div>
                  </Col>
                </Row>

                <Row>

                  

                  <Col md="6" className={isDropSwitch ? "d-block" : "d-none"}>
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Drop Status</Label>&nbsp;&nbsp;&nbsp;&nbsp;<br />
                      <Switch
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                        onColor="#02a499"
                        onChange={() => {
                          setDropSwitch(!dropSwitch)
                        }}
                        checked={dropSwitch}
                      />
                      &nbsp;
                    </div>
                  </Col>

                  <Col md="6" className={dropSwitch && isDropSwitch ? "d-block" : "d-none"}>
                    <div className="mb-3">
                      <Label>Drop Remarks</Label>
                      <Input
                        type="textarea"
                        id="drop_remarks"
                        onChange={handleChange}
                        maxLength="225"
                        rows="3"
                        name="drop_remarks"
                        placeholder="Remarks about the permission"
                        defaultValue={user&&user.drop_remarks}
                      />
                    </div>
                  </Col>

                </Row>
                <Row>
                  <Col md="6" className={isHoldSwitch ? "d-block" : "d-none"}>
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Hold Status</Label>&nbsp;&nbsp;&nbsp;&nbsp;<br />
                      <Switch
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                        onColor="#02a499"
                        onChange={() => {
                          setHoldSwitch(!holdSwitch)
                        }}
                        checked={holdSwitch}
                      />
                      &nbsp;
                    </div>
                  </Col>
                  
                  <Col md="6" className={holdSwitch && isHoldSwitch ? "d-block" : "d-none"}>
                    <div className="mb-3">
                      <Label>Hold Remarks</Label>
                      <Input
                        type="textarea"
                        id="hold_remarks"
                        onChange={handleChange}
                        maxLength="225"
                        rows="3"
                        name="hold_remarks"
                        placeholder="Remarks about the Hold"
                        defaultValue={user&&user.hold_remarks}
                      />
                    </div>
                  </Col>

                  

                </Row>

                <Row>
                  <Col md="6" className={isBlockSwitch ? "d-block" : "d-none"}>
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Block Status</Label>&nbsp;&nbsp;&nbsp;&nbsp;<br />
                      <Switch
                        uncheckedIcon={<Offsymbol />}
                        checkedIcon={<OnSymbol />}
                        onColor="#02a499"
                        onChange={() => {
                          setBlockSwitch(!blockSwitch)
                        }}
                        checked={blockSwitch}
                      />
                      &nbsp;
                    </div>
                  </Col>
                  
                  <Col md="6" className={blockSwitch && isBlockSwitch ? "d-block" : "d-none"}>
                    <div className="mb-3">
                      <Label>Block Remarks</Label>
                      <Input
                        type="textarea"
                        id="block_remarks"
                        onChange={handleChange}
                        maxLength="225"
                        rows="3"
                        name="block_remarks"
                        placeholder="Remarks about the Block"
                        defaultValue={user&&user.block_remarks}

                      />
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

export default connect(null, { setBreadcrumbItems })(DropBlockUser);
