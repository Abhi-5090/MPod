import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  CardTitle,
  Input,
  InputGroup,
  Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import Select from "react-select"
import Flatpickr from "react-flatpickr"

import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css"

const AddPermission = (props) => {
  document.title = "Technial Hub| Add Permission";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Permissions", link: "/permissions-list" },
    { title: "Add Permission", link: "/add-permission" },
  ];
  const [data, setData] = useState({});
  const [selectedReason, setSelectedReason] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromdate, setfromdate] = useState(null);
  const [todate, settodate] = useState(null);
  const navigate = useNavigate();
  const [textareabadge, settextareabadge] = useState(0)
  const [daysDifference, setDaysDifference] = useState();

  useEffect(() => {
    props.setBreadcrumbItems('Add Permission', breadcrumbItems);
  }, []);


  const reasonOptions = [
    { label: "College Activities", value: "college_activities" },
    { label: "Health Issue", value: "health_issue" },
    { label: "Personal", value: "personal" },
    { label: "other", value: "other" }
  ];


  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleFromDateChange = (selectedDates, dateStr, instance) => {
    const date = selectedDates[0];
    setfromdate(date)
    const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y");
    setFromDate(formattedDate);
    calculateDaysDifference(date, todate);
  };
  
  const handleToDateChange = (selectedDates, dateStr, instance) => {
    const date = selectedDates[0];
    settodate(date)
    const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y");    
    setToDate(formattedDate);
    calculateDaysDifference(fromdate, date);

  };

  const calculateDaysDifference = (start, end) => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (!isNaN(startDate) && !isNaN(endDate)) {
        const differenceInTime = endDate.getTime() - startDate.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        setDaysDifference(differenceInDays);
      } else {
        alert('Invalid date(s) provided');
      }
    } else {
      setDaysDifference(null);
    }
  };

  const handleReasonSelect = (selectedReason) => {
    setSelectedReason(selectedReason);
  };



  function textareachange(event) {
    const count = event.target.value.length
    if (count > 0) {
      settextareabadge(true)
    } else {
      settextareabadge(false)
    }
  }


  const addPermission = async () => {
    data.from_date = fromDate
    data.to_date = toDate
    data.days = daysDifference+1
    data.permission_type=selectedReason.value
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(backendUrl + 'add-permission', data
      // {
        // headers: {
        //   'Content-Type': 'multipart/form-data'
        // }
      // }
    );
      
      if (response.status == 200) {
        alert("success");
        navigate(`/permissions-list`)
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert(" permission already exists");
      }if (error.response && error.response.status === 400) {
        alert("wrongs dates selected");
      } else {
        console.error('Error fetching data:', error);
      }
    }
  };
  
  return (
    <React.Fragment>

      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Add Permission</h4>
              <AvForm className="needs-validation">
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label htmlFor="validationCustom01">Roll No</Label>
                      <AvField
                        name="roll_no"
                        placeholder="Roll no"
                        type="text"
                        errorMessage="Enter Roll no"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.roll_no}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Type of Permission</Label>
                      <Select
                        value={selectedReason}
                        onChange={handleReasonSelect}
                        options={reasonOptions}
                        classNamePrefix="select2-selection"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <Label>Permission Remarks</Label>
                      <Input
                        type="textarea"
                        id="remarks"
                        onChange={handleChange}
                        value={data.remarks}
                        maxLength="225"
                        name="remarks"
                        rows="5"
                        placeholder="Enter the reason for this permission"
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>From Date</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M,yyyy"
                            name="from_date"
                            onChange={handleFromDateChange}
                            options={{
                              altInput: true,
                              altFormat: "F j, Y",
                              dateFormat: "Y-m-d",
                              // onChange: function (selectedDates, dateStr, instance) {
                              //   const formattedDate = instance.formatDate(selectedDates[0], "d-m-Y");
                              //   setStartDate(formattedDate);
                              // }
                            }}
                          />

                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <div className="mb-3">
                      <FormGroup className="mb-4">
                        <Label>To Date</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd M,yyyy"
                            onChange={handleToDateChange}
                            options={{
                              altInput: true,
                              altFormat: "F j, Y",
                              dateFormat: "Y-m-d",

                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={addPermission}>
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

export default connect(null, { setBreadcrumbItems })(AddPermission);
