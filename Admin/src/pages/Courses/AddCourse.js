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
const AddCourse = (props) => {
  document.title = "Technial Hub| Add Course";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Courses", link: "/courses-list" },
    { title: "Add Course", link: "/add-course" },
  ];

  useEffect(() => {
    props.setBreadcrumbItems('Add Course', breadcrumbItems);
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

  const [data, setData] = useState({});
  const navigate = useNavigate();
  const handleChange = (e) => {
    setData({ ...data, course_name: e.target.value });
  };

  const addCourse = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await axios.post(backendUrl + 'add-course', data);
      if (response.status ==200) {
        alert("success");
        navigate(`/courses-list`)
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
              <h4 className="card-title">ADD COURSE</h4>

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
                      />
                    </div>
                  </Col>
                </Row>
                <Button color="primary" type="button" onClick={addCourse}>
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

export default connect(null, { setBreadcrumbItems })(AddCourse);
