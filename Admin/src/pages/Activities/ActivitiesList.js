import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"

import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from 'react-loader-spinner';
import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
const ActivitiesList = (props) => {
  document.title = "Activities list | Technical Hub - All the list of Activities";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Activities", link: "#" },
    { title: "Activities List", link: "#" },
  ]
  const [activityData, setActivityData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

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
    const userDetails = JSON.parse(localStorage.getItem('authUser'))
    try {
      // const response = await axios.get(backendUrl + 'get-activities');
      const response = await axios.post(backendUrl + 'get-activities-by-technology', { technology: userDetails.technology });

      console.log(response.data)
      if (response.status === 200) {
        setActivityData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (activity) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-activity/${activityToDelete._id}`);
    if (response.status == 200) {
      console.log("Activity deleted:", activityToDelete);
    }
    const updatedActivityData = activityData.filter(activity => activity._id !== activityToDelete._id);
    setActivityData(updatedActivityData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (activity) => {
    setActivityToDelete(activity);
    setShowDeleteModal(!showDeleteModal);
  };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
  const currentDate = new Date();

  const data = {
    columns: [
      { label: "Programme", field: "course_name", sort: "asc", width: 150 },
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      { label: "Module", field: "module_name", sort: "asc", width: 150 },
      { label: "Topic", field: "topic_name", sort: "asc", width: 150 },
      { label: "Activity", field: "activity_name", sort: "asc", width: 150 },
      { label: "Activity Type", field: "activity_type", sort: "asc", width: 150 },
      { label: "Batch", field: "batch_name", sort: "asc", width: 150 },
      { label: "Start Date", field: "start_date_time", sort: "asc", width: 150 },
      { label: "End Date", field: "end_date_time", sort: "asc", width: 150 },
      { label: "Level", field: "level", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: activityData.map(activity => {
      const parseDateTime = (dateTime) => {
        const [date, time] = dateTime.split(' ');
        const [day, month, year] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
      };

      const startDate = parseDateTime(activity.start_date_time);
      const endDate = parseDateTime(activity.end_date_time);

      const currentDate = new Date();

      let status = '';
      if (startDate > currentDate && activity.status == 1) {
        status = <Badge color="info" className="bg-info">Upcoming</Badge>;
      } else if (startDate <= currentDate && endDate >= currentDate && activity.status == 1) {
        status = <Badge color="warning" className="bg-warning">In Progress</Badge>;
      } else if (endDate < currentDate && activity.status == 1) {
        status = <Badge color="danger" className="bg-danger">Completed</Badge>;
      } else if (activity.status == 0) {
        status = <Badge color="secondary" className="bg-secondary">Hold</Badge>;
      }

      return {
        course_name: activity.course_name,
        activity_name: activity.activity_name,
        technology_name: activity.technology_name,
        module_name: activity.module_name,
        topic_name: activity.topic_name,
        batch_name:activity.batch_name,
        activity_name:activity.title,
        activity_type:activity.activity_type,
        start_date_time: activity.start_date_time,
        end_date_time: activity.end_date_time,
        level: activity.level,
        year: activity.year,
        status: status,
        activity_icon: (<img src={backendImageUrl + "activity-icons/" + activity.activity_icon} alt="Activity Icon" width="50px" />),
        actions: (
          <div>
            <Link to={`/edit-activity/${activity._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
            <Button color="danger" size="sm" onClick={() => toggleDeleteModal(activity)}>Delete</Button>
          </div>
        ),
      };
    }),
  };



  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Activity</CardTitle>
              <a href="/admin/add-activity">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD ACTIVITY</Button>
              </a>
            </CardBody>
            <CardBody>
            {
                data.rows.length !== 0 ? (
                  <MDBDataTable responsive bordered data={data} noBottomColumns />
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

export default connect(null, { setBreadcrumbItems })(ActivitiesList);