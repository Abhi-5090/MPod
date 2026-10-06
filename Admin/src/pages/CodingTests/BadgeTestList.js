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
const BadgesList = (props) => {
  document.title = "Badges list | Technical Hub - All the list of Badges";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Badges", link: "#" },
    { title: "Badges List", link: "#" },
  ]
  const [badgeData, setBadgeData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState(null);


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
    props.setBreadcrumbItems('Badges', breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const authUser = JSON.parse(localStorage.getItem('authUser'))
    try {
      const response = await axios.get(backendUrl + 'get-coding-badge-tests');
      // const response = await axios.get(backendUrl + 'get-badges');

      console.log(response.data)
      if (response.status === 200) {
        setBadgeData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (badge) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-badge/${badgeToDelete._id}`);
    if (response.status == 200) {
      console.log("Badge deleted:", badgeToDelete);
    }
    const updatedBadgeData = badgeData.filter(badge => badge._id !== badgeToDelete._id);
    setBadgeData(updatedBadgeData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (badge) => {
    console.log(badge)
    setBadgeToDelete(badge);
    setShowDeleteModal(!showDeleteModal);
  };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
  const currentDate = new Date();

  const data = {
    columns: [
      { label: "Programme", field: "course_name", sort: "asc", width: 150 },
      { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
      { label: "Badge Test Name", field: "badge_name", sort: "asc", width: 150 },
      { label: "Start Date", field: "start_date_time", sort: "asc", width: 150 },
      { label: "End Date", field: "end_date_time", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      // { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: badgeData.map(badge => {
      const parseDateTime = (dateTime) => {
        const [date, time] = dateTime.split(' ');
        const [day, month, year] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
      };
  
      // const startDate = parseDateTime(badge.start_date);
      // const endDate = parseDateTime(badge.end_date);
      const startDate =badge.start_date;
      const endDate = badge.end_date;
  
      const currentDate = new Date();
  
      let status = '';
      if (startDate > currentDate && badge.status === 1) {
        status = <Badge color="info" className="bg-info">Upcoming</Badge>;
      } else if (startDate <= currentDate && endDate >= currentDate && badge.status === 1) {
        status = <Badge color="warning" className="bg-warning">In Progress</Badge>;
      } else if (endDate < currentDate && badge.status === 1) {
        status = <Badge color="danger" className="bg-danger">Completed</Badge>;
      } else if (badge.status === 0) {
        status = <Badge color="secondary" className="bg-secondary">Hold</Badge>;
      }
  
      return {
        course_name: badge.course_name,
        badge_name: badge.title, // Assuming `title` is the badge name
        technology_name: badge.technology_names.join(', '), // Assuming `technology_names` is an array
        start_date_time: badge.start_date,
        end_date_time: badge.end_date,
        status: status,
        badge_icon: (<img src={backendImageUrl + "badge-icons/" + badge.badge_icon} alt="Badge Icon" width="50px" />),
        // actions: (
        //   <div>
        //     <Link to={`/edit-badge-test/${badge._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
        //     <Button color="danger" size="sm" onClick={() => toggleDeleteModal(badge)}>Delete</Button>
        //   </div>
        // ),
      };
    }),
  };
  



  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Badge</CardTitle>
              <a href="/admin/add-badge-test">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD BADGE TEST</Button>
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

export default connect(null, { setBreadcrumbItems })(BadgesList);