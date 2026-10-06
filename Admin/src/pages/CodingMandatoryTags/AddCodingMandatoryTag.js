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
import Select from "react-select"

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


    document.title = "Technial Hub| Add Mandatory Tag";

    const breadcrumbItems = [
        { title: "Technical Hub", link: "#" },
        { title: "Tag", link: "/tags-list" },
        { title: "Mandatory Tag", link: "/add-tag" },
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
        props.setBreadcrumbItems('Add Mandatory Tag', breadcrumbItems);
        fetchData();
    }, []);

    const [data, setData] = useState({
        "tag_name": "",
        "createdAt": "",
        "updatedAt": "",
        "added_by": "",
        "status": "",
    });
    const [loading, setLoading] = useState(false)
    const [technologyData, setTechnologyData] = useState([])
    const [selectedGroup, setselectedGroup] = useState(null)

    const updateData = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const navigate = useNavigate();
    const fetchData = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await axios.get(backendUrl + 'get-owlground-technologies');
            if (response.status === 200) {
                console.log(response.data)
                setTechnologyData(response.data);
            }
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };
    const optionGroup = technologyData.map((ele) => ({
        options: [
            { label: ele.technology_name, value: ele._id }
        ]
    }));
    function handleSelectGroup(selectedGroup) {
        setselectedGroup(selectedGroup)
        // setData({ ...data, technology: selectedGroup.value });

    }
    const addTag = async () => {
        const axiosAPI = axios.create()
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
       
        data.technology=selectedGroup.value;
        data.course="Coding Mandatory";
        data.status = 1;
        data.createdAt = new Date();
        data.updatedAt = new Date();
        data.added_by = "tester";
        axiosAPI.post(backendUrl + "add-mandatory-tag", data
        ).then((res) => {
            if (res.status == 201) {
                alert('Tag added successfully')
                navigate("/coding-madatory-tags-list");
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
                            <h4 className="card-title">Add Mandatory Tag</h4>
                            <AvForm className="needs-validation">
                                <Row>
                                    <Col md="6">
                                        <div className="mb-3">
                                            <Label htmlFor="validationCustom01">Course Name</Label>
                                            <AvField
                                                name="module_name"
                                                placeholder="Module name"
                                                type="text"
                                                errorMessage="Enter Module Name"
                                                className="form-control"
                                                validate={{ required: { value: true } }}
                                                id="validationCustom01"
                                                value="Coding Mandatory"
                                                disabled
                                                // onChange={handleChange}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="6">
                                        <div className="mb-3">
                                            <Label>Select technology</Label>
                                            <Select
                                                value={selectedGroup}
                                                onChange={handleSelectGroup}
                                                options={optionGroup}
                                                classNamePrefix="select2-selection"
                                            />
                                        </div>
                                    </Col>
                                </Row>
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
