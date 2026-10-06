import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, CardTitle, Label, Input, Button, Form, FormGroup } from "reactstrap";
import Select from "react-select";
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from 'react-loader-spinner';
import axios from "axios";

const SubmittedActivitiesList = (props) => {
  document.title = "Batch list | Technical Hub - All the list of Batches";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "FeedBack", link: "#" },
    { title: "FeedBack List", link: "#" },
  ];

  const [batchData, setBatchData] = useState([]);
  const [selectedBatchGroup, setSelectedBatchGroup] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [addedby, setAddedBy] = useState(""); 
  const [data, setData] = useState({
    whattheyshouldcontinue: "",
    improve: "",
    suggestion: ""
  });

  useEffect(() => {
    props.setBreadcrumbItems('FeedBack', breadcrumbItems);
    fetchBatchData();
  }, []);

  useEffect(() => {
    const curr_user = JSON.parse(localStorage.getItem('authUser'));
    if (curr_user) {
      setAddedBy(curr_user.roll_no); 
    }
  }, []);

  const fetchBatchData = async () => {
    let user = JSON.parse(localStorage.getItem('authUser'));
    
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await axios.post(backendUrl + 'get-batches-by-technology', { technology: user.technology });
      if (response.status === 200) {
        setBatchData(response.data);
      }
    } catch (error) {
      console.log("Error fetching batch data:", error);
    }
  };

  useEffect(() => {
    setShowForm(!!selectedBatchGroup);
  }, [selectedBatchGroup]);

  
  const batchOptionGroup = batchData.map((ele) => ({
    options: [
      { label: ele.batch_name, value: ele._id }
    ]
  }));


  const handleSelectBatchGroup = (selectedGroup) => {
    setSelectedBatchGroup(selectedGroup);
  };

  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const feedbackData = {
      batchId: selectedBatchGroup.value,
      whattheyshouldcontinue: data.whattheyshouldcontinue,
      improve: data.improve,
      suggestion: data.suggestion,
      addedby: addedby 
    };

    try {
      const response = await axios.post(`http://node.technicalhub.io:4001/api/trainer-feedback`, feedbackData);
      if (response.status === 201) {
        alert("Feedback submitted successfully");
        setData({
          whattheyshouldcontinue: "",
          improve: "",
          suggestion: ""
        });
        setSelectedBatchGroup(null);
      }
      console.log(response);
    } catch (error) {
      console.error("Error submitting feedback:", error.response ? error.response.data : error.message);
      alert("There was an error submitting the feedback");
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="justify-content-between align-items-center">
              <CardTitle className="h4">Submitted Feedback List</CardTitle>
              <Col lg="3" className="mb-3">
                <Label>Select Batch</Label>
                <Select
                  value={selectedBatchGroup}
                  onChange={handleSelectBatchGroup}
                  options={batchOptionGroup}
                  classNamePrefix="select2-selection"
                />
              </Col>
            </CardBody>
            <CardBody>
              {
                showForm ? (
                  <Form onSubmit={handleSubmit}>
                    <h5>Form for Batch: {selectedBatchGroup ? selectedBatchGroup.label : ''}</h5>
                    <FormGroup>
                      <Label for="whattheyshouldcontinueInput">What They Should Be Continue</Label>
                      <Input
                        type="textarea"
                        name="whattheyshouldcontinue"
                        id="whattheyshouldcontinueInput"
                        value={data.whattheyshouldcontinue}
                        onChange={handleInputChange}
                        required

                      />
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="improveInput">How to Improve</Label>
                      <Input
                        type="textarea"
                        name="improve"
                        id="improveInput"
                        value={data.improve}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="suggestionInput">Suggestion to CEO</Label>
                      <Input
                        type="textarea"
                        name="suggestion"
                        id="suggestionInput"
                        value={data.suggestion}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                    <Button type="submit" color="primary">Submit</Button>
                  </Form>
                ) : (
                  <div className="row">
                    <div className="col-md-2 offset-5">
                      <MutatingDots
                        visible={true}
                        height={100}
                        width={100}
                        color="#2B3A4A"
                        secondaryColor="#2B3A4A"
                        radius={12.5}
                        ariaLabel="mutating-dots-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                      />
                    </div>
                  </div>
                )
              }
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(SubmittedActivitiesList);
