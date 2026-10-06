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
const EditCourse = (props) => {
  document.title = "Technical Hub | Edit course";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Courses", link: "#" },
    { title: "Edit Course", link: "#" },
  ];

  useEffect(() => {
    props.setBreadcrumbItems('Edit Course', breadcrumbItems);
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
  let course = useParams();
  const navigate = useNavigate()
  useEffect(() => {
    async function fetchData() {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(backendUrl+"get-course-by-id/"+course.courseId);
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
    document.title = "Form Advanced | Lexa - Responsive Bootstrap 5 Admin Dashboard";
  
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
    setData({ ...data, course_name: e.target.value });
  };

  const updateCourse = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;  
    const newStatus = switch3 ? 1 : 0;
    const updatedData = { ...data, status: newStatus };
    try {
      const response = await axios.post(backendUrl + 'update-course/' + course.courseId, updatedData);
      
      if (response) {
        navigate(`/courses-list`)
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
                      <Label htmlFor="validationCustom01">Course Name</Label>
                      <AvField
                        name="course_name"
                        placeholder="Course name"
                        type="text"
                        errorMessage="Enter Course Name"
                        className="form-control"
                        validate={{ required: { value: true } }}
                        id="validationCustom01"
                        onChange={handleChange}
                        value={data.course_name}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
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
                <Button color="primary" type="button" onClick={updateCourse}>
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

export default connect(null, { setBreadcrumbItems })(EditCourse);
