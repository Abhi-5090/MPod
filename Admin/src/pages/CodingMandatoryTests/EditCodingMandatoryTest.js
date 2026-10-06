import React, { useEffect, useState } from "react";
import {
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Label,
} from "reactstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { useRef } from "react";
const EditCodingMandatoryTest = (props) => {
    const [data, setData] = useState({
        easy_duration: 0,
        medium_duration: 0,
        hard_duration: 0,
        technology: "",
        added_by: "",
        course: "Coding Mandatory",
        problems_details: [],  // Problems details array
    });
    const [technologyData, setTechnologyData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const navigate = useNavigate();
    const { testId } = useParams();
    const initialData = useRef(data);
    // Breadcrumb
    const breadcrumbItems = [
        { title: "Technical Hub", link: "#" },
        { title: "Test", link: "/tags-list" },
        { title: "Mandatory Test", link: `/edit-mandatory-test/${testId}` },
    ];

    useEffect(() => {
        document.title = "Technical Hub | Edit Mandatory Test";
        props.setBreadcrumbItems("Edit Mandatory Test", breadcrumbItems);
        fetchTechnologies();
        fetchTestDetails();
    }, []);

    // Fetch available technologies
    const fetchTechnologies = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await axios.get(`${backendUrl}get-owlground-technologies`);
            if (response.status === 200) {
                console.log(response.data)
                setTechnologyData(response.data);
            }
        } catch (error) {
            console.error("Error fetching technologies:", error);
            toast.error("Failed to load technologies.");
        }
    };

    // Fetch test details for editing
    const fetchTestDetails = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await axios.get(`${backendUrl}get-mandatory-test/${testId}`);
            if (response.status === 200) {
                const testData = response.data;
                console.log(testData)
                setData({
                    ...testData,
                    easy_duration: testData.easy_duration || 0,
                    medium_duration: testData.medium_duration || 0,
                    hard_duration: testData.hard_duration || 0,
                    problems_details: testData.problems_details || [],
                });
                setSelectedGroup({
                    label: testData.technology_name || "Select Technology",
                    value: testData.technology,
                });
            }
        } catch (error) {
            console.error("Error fetching test details:", error);
            toast.error("Failed to load test details.");
        }
    };

    // Handle technology selection
    const handleSelectGroup = (selectedGroup) => {
        setSelectedGroup(selectedGroup);
        setData({ ...data, technology: selectedGroup.value });
    };

    // Handle change in problem details (easy, medium, hard)
    const handleProblemDetailChange = (index, field, value) => {
        // Make sure you're creating a new reference to the problems array
        const updatedProblems = [...data.problems_details];
        updatedProblems[index] = {
            ...updatedProblems[index],  // Spread the previous problem to maintain other fields
            [field]: value,  // Update the specific field (easy, medium, or hard)
        };
        setData({ ...data, problems_details: updatedProblems });
    };
    const updateTest = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
    
        // Create an object to hold updated fields
        let updatedData = {};
    
        // Check for changes in easy, medium, and hard durations
        if (data.easy_duration !== initialData.current.easy_duration) {
            updatedData.easy_duration = data.easy_duration;
        }
        if (data.medium_duration !== initialData.current.medium_duration) {
            updatedData.medium_duration = data.medium_duration;
        }
        if (data.hard_duration !== initialData.current.hard_duration) {
            updatedData.hard_duration = data.hard_duration;
        }
    
        // Check if technology has changed
        if (selectedGroup?.value !== initialData.current.technology) {
            updatedData.technology = selectedGroup?.value;
        }
    
        updatedData.course = data.course;
    
        // Transform `problems_details` into the desired format
        const formattedProblemsDetails = data.problems_details.map((problem) => ({
            topic: problem.topic, // Ensure `topic` is included
            easy: Number(problem.easy || 0), // Convert easy count to a number
            medium: Number(problem.medium || 0), // Convert medium count to a number
            hard: Number(problem.hard || 0), // Convert hard count to a number
        }));
    
        // Check for changes in problem details
        if (JSON.stringify(formattedProblemsDetails) !== JSON.stringify(initialData.current.problems_details)) {
            updatedData.problems_details = formattedProblemsDetails;
        }
    
        // If there are any changes, send the updated data
        if (Object.keys(updatedData).length > 0) {
            try {
                console.log("Formatted problems_details:", formattedProblemsDetails);
    
                const response = await axios.post(`${backendUrl}update-mandatory-test/${testId}`, {
                    ...updatedData,
                    status: data.status,
                    updatedAt: new Date(),
                });
    
                if (response.status === 200) {
                    alert("success")
                    toast.success("Test updated successfully");
                    navigate("/coding-mandatory-tests-list");
                }
            } catch (error) {
                console.error("Error updating test:", error);
                toast.warning("Failed to update test");
            }
        } else {
            toast.info("No changes detected.");
        }
    };
    

    // // Update test details
    // const updateTest = async () => {
    //     const backendUrl = process.env.REACT_APP_BACKEND_URL;
    //     try {
    //         const response = await axios.put(`${backendUrl}update-mandatory-test/${testId}`, {
    //             easy_duration: data.easy_duration,
    //             medium_duration: data.medium_duration,
    //             hard_duration: data.hard_duration,
    //             technology: selectedGroup?.value,
    //             status: data.status,
    //             problems_details: data.problems_details, // Include problems details
    //             updatedAt: new Date(),
    //         });
    //         if (response.status === 200) {
    //             toast.success("Test updated successfully");
    //             navigate("/coding-mandatory-tests-list");
    //         }
    //     } catch (error) {
    //         console.error("Error updating test:", error);
    //         toast.warning("Failed to update test");
    //     }
    // };

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
                            <h4 className="card-title">Edit Mandatory Test</h4>
                            <AvForm className="needs-validation">
                                <Row>
                                    <Col md="6">
                                        <div className="mb-3">
                                            <Label>Course Name</Label>
                                            <AvField
                                                name="course_name"
                                                type="text"
                                                value={data.course}
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
                                            <Label>Easy Duration (in min)</Label>
                                            <AvField
                                                name="easy_duration"
                                                type="number"
                                                value={data.easy_duration || ""}
                                                onChange={(e) =>
                                                    setData({ ...data, easy_duration: e.target.value })
                                                }
                                            />
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label>Medium Duration (in min)</Label>
                                            <AvField
                                                name="medium_duration"
                                                type="number"
                                                value={data.medium_duration || ""}
                                                onChange={(e) =>
                                                    setData({ ...data, medium_duration: e.target.value })
                                                }
                                            />
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3">
                                            <Label>Hard Duration (in min)</Label>
                                            <AvField
                                                name="hard_duration"
                                                type="number"
                                                value={data.hard_duration || ""}
                                                onChange={(e) =>
                                                    setData({ ...data, hard_duration: e.target.value })
                                                }
                                            />
                                        </div>
                                    </Col>
                                </Row>

                                {/* Dynamic input fields for problems_details */}
                                <h5>Problem Details</h5>
                                {data.problems_details.map((problem, index) => (
                                    <Row key={index}>
                                        <Col md="3">
                                            <Label>{problem.topic_name}</Label>
                                        </Col>
                                        <Col md="3">
                                            <div className="mb-3">
                                                <Label>Easy</Label>

                                                <AvField
                                                    name={`easy_${index}`}
                                                    type="number"
                                                    value={problem.easy || ""}
                                                    onChange={(e) =>
                                                        handleProblemDetailChange(index, "easy", e.target.value)
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
                                                    value={problem.medium || ""}
                                                    onChange={(e) =>
                                                        handleProblemDetailChange(index, "medium", e.target.value)
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
                                                    value={problem.hard || ""}
                                                    onChange={(e) =>
                                                        handleProblemDetailChange(index, "hard", e.target.value)
                                                    }
                                                    placeholder="Hard"
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                ))}

                                <div className="col-12">
                                    <Button
                                        color="primary"
                                        type="button"
                                        onClick={updateTest}
                                        disabled={!selectedGroup}
                                    >
                                        Update
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

export default connect(null, { setBreadcrumbItems })(EditCodingMandatoryTest);
