import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, CardTitle, Badge, Label, Input, Button } from "reactstrap";
import Select from "react-select";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from 'react-loader-spinner';
import axios from "axios";
import "./datatables.scss";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';

const SubmittedActivitiesList = (props) => {
  document.title = "Activities list | Technical Hub - All the list of Activities";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Activities", link: "#" },
    { title: "Activities List", link: "#" },
  ];

  const [activityData, setActivityData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [batchData, setBatchData] = useState([]);
  const [selectedBatchGroup, setselectedBatchGroup] = useState(null);
  const [studentActivities, setStudentActivities] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [title, setTitle] = useState([]);
  const [scores, setScores] = useState({});


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
    props.setBreadcrumbItems('Activities', breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-activities');
      if (response.status === 200) {
        setActivityData(response.data);
        const newTitles = response.data.map((ele) => ele.title);
        setTitle(newTitles);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (activity) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-activity/${activityToDelete._id}`);
    if (response.status === 200) {
      const updatedActivityData = activityData.filter(activity => activity._id !== activityToDelete._id);
      setActivityData(updatedActivityData);
    }
    setShowDeleteModal(false);
  };

  useEffect(() => {
    let user = JSON.parse(localStorage.getItem('authUser'));
    const fetchBatchesData = async () => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
      try {
        const response = await axios.post(backendUrl + 'get-batches-by-technology', { technology: user.technology });
        if (response.status === 200) {
          setBatchData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    if (user.technology) {
      fetchBatchesData();
    }
  }, []);

  useEffect(() => {
    const fetchStudentActivitiesList = async () => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.post(backendUrl + 'get-submitted-activities', { batch: selectedBatchGroup.value });
        if (response.status === 200) {
          console.log(response.data)
          setStudentActivities(response.data);
          // Clear scores when a new batch is selected
          setScores({});
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    if (selectedBatchGroup) {
      fetchStudentActivitiesList();
    }
  }, [selectedBatchGroup]);

  const batchOptionGroup = batchData.map((ele) => ({
    options: [
      { label: ele.batch_name, value: ele._id }
    ]
  }));

  function handleSelectBatchGroup(selectedGroup) {
    setselectedBatchGroup(selectedGroup);
  }

  const toggleDeleteModal = (activity) => {
    setActivityToDelete(activity);
    setShowDeleteModal(!showDeleteModal);
  };

  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL;
  const typeData = [
    { "type_name": "ai", "value": "ai" },
    { "type_name": "general", "value": "general" },
  ];
 
  const handleScoreChange = (id, score) => {
    setScores({
      ...scores,
      [id]: score,
    });
  };

  const handleAddScore = async (activity) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(`${backendUrl}update-activity-score`, {
        roll_no: activity.roll_no,
        id: activity._id,
        score: scores[activity._id]
      });
      if (response.status === 200) {
        alert("Score updated successfully")
        const updatedActivities = studentActivities.map(act => 
          act._id === activity._id ? { ...act, score: scores[activity._id] } : act
        );
        setStudentActivities(updatedActivities);
        console.log(updatedActivities)
      }
    } catch (error) {
      console.log("Error updating score:", error);
    }
  };

  const handleDownload = async (activity) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    console.log(activity); 
  
    try {
      const response = await axios.post(`${backendUrl}download-activity-file`, {
        file: activity.file,
        roll_no: activity.roll_no
      }, {
        responseType: 'blob'
      });
  
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${activity.roll_no}_${activity.file}`); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
      }
    } catch (error) {
      console.log("Error downloading file:", error);
    }
  };
  
  

  const columns = [
    { text: "Roll No", dataField: "roll_no", sort: true },
    { text: "Technology", dataField: "technology_name", sort: true },
    { text: "Module", dataField: "module_name", sort: true },
    { text: "Topic", dataField: "topic_name", sort: true },
    { text: "Title", dataField: "activity_name", sort: true },
    {
      text: "Type",
      dataField: "activity_type",
      sort: true,
    },
    { text: "Start Date", dataField: "start_date_time", sort: true },
    { text: "End Date", dataField: "end_date_time", sort: true },
    { text: "Level", dataField: "level", sort: true },
    { text: "Status", dataField: "status", sort: true },
    { text: "Score", dataField: "score", sort: false },
    { text: "Action", dataField: "actions", sort: true },
  ];

  const data = studentActivities.map(activity => {
    // const parseDateTime = (dateTime) => {
    //   const [date, time] = dateTime.split(' ');
    //   const [day, month, year] = date.split('-').map(Number);
    //   const [hours, minutes] = time.split(':').map(Number);
    //   return new Date(year, month - 1, day, hours, minutes);
    // };

    // const startDate = parseDateTime(activity.start_date_time);
    // const endDate = parseDateTime(activity.end_date_time);
    let status;
    let scoreInput = null;

    if (activity.status === 1) {
      status = <Badge color="danger" className="bg-danger">Submitted</Badge>;
      scoreInput = (
        <Input
          type="text"
          value={scores[activity._id] || activity.score || ""}
          style={{width:"35px", paddingLeft:"2px", paddingRight:"2px"}}
          onChange={(e) => handleScoreChange(activity._id, e.target.value)}
        />
      );
    } else {
      status = <Badge color="warning" className="bg-warning">Not Submitted</Badge>;
    }

    return {
      roll_no: activity.roll_no,
      technology_name: activity.technology_name,
      module_name: activity.module_name,
      topic_name: activity.topic_name,
      activity_name: activity.title,
      activity_type: activity.activity_type,
      start_date_time: activity.start_date_time,
      end_date_time: activity.end_date_time,
      level: activity.level,
      status: status,
      score: scoreInput,
      actions: (
        <div>
          <Link to="#" onClick={() => handleDownload(activity)}>
            <i className="mdi mdi-download-box" style={{width:"30px", height:"30px",
                fontSize: "30px",
                color: "#008730",
          }}></i>
          </Link>
        
          <Button color="danger" size="sm" onClick={() => handleAddScore(activity)}>Add</Button>
        </div>
      ),
    };
  });

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };
  const optionTypeGroup = typeData.map((ele) => (
    <option key={ele.value} value={ele.value}>{ele.type_name}</option>
  ));
  const handleTitleFilterChange = (e) => {
    setTitleFilter(e.target.value);
  };
  const optionTitleGroup = title.map((ele) => (
    <option key={ele} value={ele}>{ele}</option>
  ));
  const handlestatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const filteredData = data.filter(data => {
    let status;
    const statusValue = data.status.props.children;
    if (statusFilter === "1") {
      status = 'Submitted';
    } else {
      status = 'Not Submitted';
    }
    return (
      (statusFilter === "" || statusValue === status) &&
      (titleFilter === "" || data.activity_name === titleFilter) &&
      (typeFilter === "" || data.activity_type === typeFilter)
    );
  });

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="justify-content-between align-items-center">
              <CardTitle className="h4">Submitted Activities List</CardTitle>
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
                data.length !== 0 ? (
                  <div className="row">
                    <Col md={2} style={{ marginBottom: "20px" }}>
                      <Input type="select" value={typeFilter} onChange={handleTypeFilterChange}>
                        <option value="">All Types</option>
                        {optionTypeGroup}
                      </Input>
                    </Col>
                    <Col md={2} style={{ marginBottom: "20px" }}>
                      <Input type="select" value={titleFilter} onChange={handleTitleFilterChange}>
                        <option value="">All Activity Titles</option>
                        {optionTitleGroup}
                      </Input>
                    </Col>
                    <Col md={2} style={{ marginBottom: "20px" }}>
                      <Input type="select" value={statusFilter} onChange={handlestatusFilterChange}>
                        <option value="">All Status</option>
                        <option key="1" value="1">Submitted</option>
                        <option key="0" value="0">Not Submitted</option>
                      </Input>
                    </Col>
                    <BootstrapTable
                      keyField='_id'
                      data={filteredData}
                      columns={columns}
                      filter={filterFactory()}
                    />
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-2 offset-5">
                      <MutatingDots
                        visible={true}
                        height="100"
                        width="100"
                        color="#2B3A4A"
                        secondaryColor="#2B3A4A"
                        radius="12.5"
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
      <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(SubmittedActivitiesList);
