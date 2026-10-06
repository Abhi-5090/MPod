import React, { useEffect, useState } from "react";
import {
    Row,
    Col,
    Card,
    CardBody,
    Input,
    FormGroup,
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
        { title: "Tag", link: "/tags-list" },
        { title: "Add Tag", link: "/add-tag" },
    ];
    // useEffect(() => {
    //     let authUser = JSON.parse(localStorage.getItem('authUser'));
    //     if (authUser.role == 'admin' || authUser.role == 'superadmin') {
    //     }
    //     else {
    //       alert("your not autherized")
    //       localStorage.clear();
    //       window.location.href = '/admin/login';
    //     }
    //   }, []);
    useEffect(() => {
        props.setBreadcrumbItems('Add Tag', breadcrumbItems);
    }, []);

    const [data, setData] = useState({
        "tag_name": "",
        "createdAt": "",
        "updatedAt": "",
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

    const addTag = async () => {
        const axiosAPI = axios.create()
        const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
        data.status = 1;
        data.createdAt = new Date();
        data.updatedAt = new Date();
        data.added_by = "tester";
        axiosAPI.post(backendUrl+"add-tag", data
        ).then((res) => {
            if (res.status == 201) {
                alert('Tag added successfully')
                navigate("/tags-list");                    
            }
        }).catch((err) => {
            if (err.status == 400) {
                alert("Tag not added")
                toast.warning('Tag not Added', {
                    position: "top-right",
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }
        })

    };
    return (
        <React.Fragment>
            <Row>
                <Col xl="6">
                    <Card>
                        <CardBody>
                            <h4 className="card-title">Add Tag</h4>

                            <AvForm className="needs-validation">

                                <Row>
                                    <Col md="6">
                                        <FormGroup className="mb-3">
                                            <Label htmlFor="validationCustom01">Tag Name</Label>
                                            <Input
                                                name="tag_name"
                                                placeholder="Enter Tag Name"
                                                type="text"
                                                className="form-control"
                                                id="validationCustom01"
                                                onChange={updateData}
                                                value={updateData['tag_name']}
                                            />
                                        </FormGroup>
                                    </Col>

                                </Row>
                                <div className="col-12">
                                    <Button color="primary" type="button" onClick={addTag}>
                                        Submit
                                    </Button>
                                </div>


                            </AvForm>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default connect(null, { setBreadcrumbItems })(AddTag);
