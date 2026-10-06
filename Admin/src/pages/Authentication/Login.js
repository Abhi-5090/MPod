import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Label, Form, Alert, Input, FormFeedback } from 'reactstrap';
import logoDark from "../../assets/images/maya-dark.png";
import logoLight from "../../assets/images/maya-dark.png";
import * as Yup from "yup";
import { useFormik } from "formik";
import axios from "axios";

const Login = () => {
  document.title = "Login | TechnicalHub";
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const validation = useFormik({
    initialValues: {
      roll_no: '',
      password: '',
    },
    validationSchema: Yup.object({
      roll_no: Yup.string().required("Please Enter Your user id"),
      password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: async (values) => {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

      try {
        const response = await axios.post(`${backendUrl}admin-login`, 
          {
            roll_no: values.roll_no,
            password: values.password,
            confirmLogout: true,
          }
         
        );
        if (response.status === 200) {
          localStorage.setItem('authUser', JSON.stringify(response.data));
          navigate("/dashboard");
        }
      } catch (error) {
        if (error.response?.status === 403) {
          const confirmLogout = window.confirm(error.response.data.message);
          if (confirmLogout) {
            try {
              const confirmResponse = await axios.post(
                `${backendUrl}login`,
                {
                  roll_no: values.roll_no,
                  password: values.password,
                  confirmLogout: true,
                },
              );

              alert(confirmResponse.data.message);
              navigate("/dashboard");
            } catch (confirmError) {
              alert(confirmError.response?.data?.message || "Error during confirmation login.");
            }
          }
        } else {
          alert(error.response?.data?.message || "Login failed. Please try again.");
        }
      }
    }
  });

  const signIn = async (type) => {
    try {
      const response = await axios.post(`/social-login/${type}`);
      if (response.status === 200) {
        localStorage.setItem('authUser', JSON.stringify(response.data));
        navigate("/dashboard");
      }
    } catch (error) {
      setError("Social login failed. Please try again.");
    }
  };
  return (
    <div className="account-pages my-5 pt-sm-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="overflow-hidden">
              <CardBody className="pt-0">
                <h3 className="text-center mt-5 mb-4">
                  <Link to="/" className="d-block auth-logo">
                    <img src={logoDark} alt="logo" height="60" className="auth-logo-dark" />
                    <img src={logoLight} alt="logo" height="60" className="auth-logo-light" />
                  </Link>
                </h3>

                <div className="p-3">
                  <h4 className="text-muted font-size-18 mb-1 text-center">Welcome Back!</h4>
                  <p className="text-muted text-center">Sign in to continue to Mpod.</p>

                  <Form
                    className="form-horizontal mt-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      validation.handleSubmit();
                      return false;
                    }}
                  >
                    {error && <Alert color="danger">{error}</Alert>}

                    <div className="mb-3">
                      <Label htmlFor="roll_no">User Id</Label>
                      <Input
                        name="roll_no"
                        className="form-control"
                        placeholder="Enter user Id"
                        type="text"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.roll_no}
                        invalid={validation.touched.roll_no && !!validation.errors.roll_no}
                      />
                      {validation.touched.roll_no && validation.errors.roll_no && (
                        <FormFeedback>{validation.errors.roll_no}</FormFeedback>
                      )}
                    </div>

                    <div className="mb-3">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        name="password"
                        type="password"
                        placeholder="Enter Password"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.password}
                        invalid={validation.touched.password && !!validation.errors.password}
                      />
                      {validation.touched.password && validation.errors.password && (
                        <FormFeedback>{validation.errors.password}</FormFeedback>
                      )}
                    </div>

                    <Row className="mb-3 mt-4">
                      <Col xs={6}>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customControlInline" />
                          <label className="form-check-label" htmlFor="customControlInline">
                            Remember me
                          </label>
                        </div>
                      </Col>
                      <Col xs={6} className="text-end">
                        <button className="btn btn-primary w-md" type="submit">
                          Log In
                        </button>
                      </Col>
                    </Row>

                    <Row className="mb-0">
                      <Col>
                        <Link to="/forgot-password" className="text-muted">
                          <i className="mdi mdi-lock"></i> Forgot your password?
                        </Link>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </CardBody>
            </Card>

            <div className="mt-5 text-center">© {new Date().getFullYear()} Reserved to Technicalhub</div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
