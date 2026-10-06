import React, { useEffect, useState } from "react";
import {
    Row,
    Col,
    Card,
    CardBody,
    Input,
    FormGroup,
    Form,
    Button,
    CardTitle,
    Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import Switch from "react-switch"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const AddTag = (props) => {
    const axiosAPI = axios.create()
    const [formErrors, setFormErrors] = useState();
    const [data, setData] = useState({
        "company_name": "",
        "added_date": "",
        "update_date": "",
        "added_by": "",
        "status": "",
    });
    const [loading, setLoading] = useState(false)
    const updateData = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const navigate = useNavigate();

    const AddCompaniesSubmit = () => {
        data.status = 1;
        data.added_date = new Date();
        data.update_date = new Date();
        data.added_by = "tester";
        const baseURL = `${process.env.REACT_APP_MPOD_BACKEND_URL}add-company`;
        axiosAPI.post(baseURL, data
        ).then((res) => {
            if (res.status == 201) {
                toast.success('Company Added', {
                    position: "top-right",
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                navigate("/companies-list");                    
            }
        }).catch((err) => {
            if (err.status == 400) {
                toast.warning('Company not Added', {
                    position: "top-right",
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }
        })
    }

    const Offsymbol = (props) => {
        document.title = "Add FRS Device";

        useEffect(() => {
            let authUser = JSON.parse(localStorage.getItem('authUser'));
            if (authUser.role == 'admin' || authUser.role == 'superadmin' ) {
            }
            else {
              alert("your not autherized")
              localStorage.clear();
              window.location.href = '/admin/login';
            }
          }, []);

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



    return (
        <React.Fragment>
            <Row>
                <Col xl="12">
                    <Card>
                        <CardBody>
                            <h4 className="card-title"></h4>
                            <p className="card-title-desc"></p>
                            <Form className="row g-3 needs-validation"
                                name="form"
                                encType="multipart/form-data"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    AddCompaniesSubmit();
                                    // return false;
                                }}>
                                <ToastContainer />
                                <Row>
                                    <Col md="6">
                                        <FormGroup className="mb-3">
                                            <Label>Company Name</Label>
                                            <Input
                                                name="company_name"
                                                placeholder="Enter Company Name"
                                                type="text"
                                                className="form-control"
                                                onChange={updateData}
                                                
                                                value={updateData['company_name']}
                                            />

                                        </FormGroup>
                                    </Col>

                                </Row>
                                <div className="col-12">
                                    <button className="btn btn-primary" type="submit">Submit form</button>
                                </div>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
                <Col xl="6">
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default connect(null, { setBreadcrumbItems })(AddTag);
