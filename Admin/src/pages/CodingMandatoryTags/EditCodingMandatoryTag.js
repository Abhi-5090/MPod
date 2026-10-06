import React, { useEffect, useState } from "react";
import {
    Row,
    Col,
    Card,
    CardBody,
    FormGroup,
    Button,
    Input,
    CardTitle,
    Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import Switch from "react-switch"
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const EditTag = (props) => {
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
        if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding') {
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

    const axiosAPI = axios.create()

    const params = useParams();
    const [data, setData] = useState({
        "tag_name": "",
        "createdAt": "",
        "updatedAt": "",
        "added_by": "",
        "status": "",
    });
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        setLoading(true)
        const baseURL = `${process.env.REACT_APP_DATABASEURL}get-tag/` + params.id;

        axiosAPI.get(baseURL)
            .then((response) => {
                if (response.status == 200) {
                    console.log(response.data);
                    console.log(response.data.tag_name)
                    setData(response.data)
                }
            }).catch((err) => {
                console.log(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])


    const updateData = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const navigate = useNavigate();



    const EditTagSubmit = () => {
        data.status = 1;
        data.updateAt = new Date();
        data.added_by = "tester";
        const baseURL = `${process.env.REACT_APP_DATABASEURL}update-tag/` + params.id;

        axiosAPI.put(baseURL, data
        ).then((res) => {
            if (res.status == 200) {
                toast.success('Tag Updated', {
                    position: "top-right",
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                // navigate("/companies-list");
            }
        }).catch((err) => console.log(err))
    }
    //for change tooltip display propery
    function changeHandeler(event, eleId) {
        if (event.target.value !== "")
            document.getElementById(eleId).style.display = "none";
        else document.getElementById(eleId).style.display = "block";
    }

    document.title = "Edit Tag";


    return (
        <React.Fragment>
            <Row>
                <Col xl="6">
                    <Card>
                        <CardBody>
                            <h4 className="card-title">Edit Company</h4>

                            <AvForm className="needs-validation">
                                <Row>
                                    <Col md="6">
                                        <FormGroup className="mb-3">
                                            <Label>Company Name</Label>
                                            <Input
                                                name="company_name"
                                                placeholder="Enter Company Name"
                                                type="text"
                                                className="form-control"
                                                id="validationCustom01"
                                                onChange={updateData}
                                                value={data.company_name}

                                            />

                                        </FormGroup>
                                    </Col>

                                </Row>
                                <Button color="primary" type="button" onClick={EditTagSubmit}>
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

export default connect(null, { setBreadcrumbItems })(EditTag);
