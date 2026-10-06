import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Button, Label } from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const AddCodingMandatoryTest = (props) => {
    const [data, setData] = useState({
        easy: 0,
        medium: 0,
        hard: 0,
    });
    const [technologyData, setTechnologyData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [tagsData, setTagsData] = useState([]);
    const navigate = useNavigate();
    const [detailsData, setDetailsData] = useState([]);
    const breadcrumbItems = [
        { title: "Technical Hub", link: "#" },
        { title: "Test", link: "/tags-list" },
        { title: "Mandatory Test", link: "/add-tag" },
    ];

    useEffect(() => {
        document.title = "Technical Hub | Add Mandatory Test";
        props.setBreadcrumbItems("Add Mandatory Test", breadcrumbItems);
        fetchTechnologies();
    }, []);

    const fetchTechnologies = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await axios.get(`${backendUrl}get-owlground-technologies`);
            if (response.status === 200) {
                setTechnologyData(response.data);
            }
        } catch (error) {
            console.error("Error fetching technologies:", error);
            toast.error("Failed to load technologies.");
        }
    };

    const fetchTagsData = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await axios.post(`${backendUrl}get-mandatory-tags-by-technology`, {
                technology: selectedGroup?.value,
            });
            if (response.status === 200) {
                setTagsData(
                    response.data.map((tag) => ({
                        ...tag,
                        easy: 0,
                        medium: 0,
                        hard: 0,
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        }
    };
    const fetchProblemsDetails = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await axios.post(`${backendUrl}get-mandatory-test-problems-details`, {
                technology: selectedGroup?.value,
            });
            if (response.status === 200) {
                setDetailsData(response.data)
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        }
    };
    const handleSelectGroup = (selectedGroup) => {
        setSelectedGroup(selectedGroup);
    };

    useEffect(() => {
        if (selectedGroup?.value) {
            fetchTagsData();
            fetchProblemsDetails()
        }
    }, [selectedGroup?.value]);

    const handleTagChange = (index, field, value) => {
        const updatedTags = [...tagsData];
        updatedTags[index][field] = value;
        setTagsData(updatedTags);
    };

    const addTag = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;

        // Constructing problems_details array
        const problems_details = tagsData.map(({ _id, easy, medium, hard, tag_name }) => ({
            topic: _id, // Use `_id` as the `topic` field
            easy: parseInt(easy, 10) || 0,
            medium: parseInt(medium, 10) || 0,
            hard: parseInt(hard, 10) || 0,
            topic_name: tag_name, // Map `tag_name` to `topic_name`
        }));
        try {
            const response = await axios.post(`${backendUrl}add-mandatory-test`, {
                technology: selectedGroup?.value,
                easy: data.easy,
                medium: data.medium,
                hard: data.hard,
                course: "Coding Mandatory",
                status: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                added_by: "tester",
                problems_details, // Include the structured problems_details array
            });

            if (response.status === 201) {
                toast.success("Test added successfully");
                navigate("/coding-mandatory-tests-list");
            }
        } catch (error) {
            console.error("Error adding test:", error);
            toast.warning("Failed to add test");
        }
    };


    const optionGroup = technologyData.map((tech) => ({
        label: tech.technology_name,
        value: tech._id,
    }));

    return (
        <React.Fragment>
            <ToastContainer />
            <Row>
                <Col xl="6">
                    <Card>
                        <CardBody>
                            <h4 className="card-title">Add Mandatory Test</h4>
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
                                                value="Coding Mandatory"
                                                disabled
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="6">
                                        <div className="mb-3">
                                            <Label>Select Technology</Label>
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
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label>Easy (in min)</Label>
                                            <AvField
                                                name="easy"
                                                placeholder="Enter Easy Questions duration"
                                                type="number"
                                                errorMessage="Enter a valid number"
                                                className="form-control"
                                                value={data.easy || ""}
                                                onChange={(e) => setData({ ...data, easy: e.target.value })}
                                            />
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label>Medium (in min)</Label>
                                            <AvField
                                                name="medium"
                                                placeholder="Enter Medium Questions duration"
                                                type="number"
                                                errorMessage="Enter a valid number"
                                                className="form-control"
                                                value={data.medium || ""}
                                                onChange={(e) => setData({ ...data, medium: e.target.value })}
                                            />
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label>Hard (in min)</Label>
                                            <AvField
                                                name="hard"
                                                placeholder="Enter Hard Questions duration"
                                                type="number"
                                                errorMessage="Enter a valid number"
                                                className="form-control"
                                                value={data.hard || ""}
                                                onChange={(e) => setData({ ...data, hard: e.target.value })}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                {tagsData.length > 0 && (
                                    <div className="mb-3">
                                        <Label>Problem Details</Label>
                                        {tagsData.map((tag, index) => (
                                            <Row key={index}>
                                                <Col md="3">
                                                    <Label>{tag.tag_name}</Label>
                                                </Col>
                                                <Col md="3">
                                                    <div className="mb-3">
                                                        <Label>Easy</Label>
                                                        <AvField
                                                            name={`easy_${index}`}
                                                            type="number"
                                                            value={tag.easy || ""}
                                                            onChange={(e) =>
                                                                handleTagChange(index, "easy", e.target.value)
                                                            }
                                                            placeholder="Easy"
                                                        />
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                    <div className="mb-3">
                                                        <Label>Medium</Label>
                                                        <AvField
                                                            name={`medium_${index}`}
                                                            type="number"
                                                            value={tag.medium || ""}
                                                            onChange={(e) =>
                                                                handleTagChange(index, "medium", e.target.value)
                                                            }
                                                            placeholder="Medium"
                                                        />
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                    <div className="mb-3">
                                                        <Label>Hard</Label>
                                                        <AvField
                                                            name={`hard_${index}`}
                                                            type="number"
                                                            value={tag.hard || ""}
                                                            onChange={(e) =>
                                                                handleTagChange(index, "hard", e.target.value)
                                                            }
                                                            placeholder="Hard"
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                        ))}
                                    </div>
                                )}
                                <div className="col-12">
                                    <Button
                                        color="primary"
                                        type="button"
                                        onClick={addTag}
                                        disabled={!selectedGroup}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </AvForm>
                        </CardBody>
                    </Card>
                </Col>
                <Col xl="6">
                <Card>
                    <CardBody>
                     
                         {detailsData.length > 0 && (
                                    <div className="mb-3">
                                        <Label>Problem Details</Label>
                                        {detailsData.map((tag, index) => (
                                            <Row key={index}>
                                                <Col md="3">
                                                    <Label>{tag.tag_name}</Label>
                                                </Col>
                                                <Col md="3">
                                                    <div className="mb-3">
                                                        <Label>Easy: {tag.easy}</Label>
                                                        
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                    <div className="mb-3">
                                                        <Label>Medium: {tag.medium}</Label>
                                                       
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                    <div className="mb-3">
                                                        <Label>Hard: {tag.hard}</Label>
                                                       
                                                    </div>
                                                </Col>
                                            </Row>
                                        ))}
                                    </div>
                                )}
                    </CardBody>
                </Card>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default connect(null, { setBreadcrumbItems })(AddCodingMandatoryTest);
