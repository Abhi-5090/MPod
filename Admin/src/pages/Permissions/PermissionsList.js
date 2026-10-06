import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"

import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
const PermissionsList = (props) => {
  document.title = "Permissions list | Technical Hub - All the list of Permissions";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Permissions", link: "#" },
    { title: "Permissions List", link: "#" },
  ]
  const [permissionData, setPermissionData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems('Permissions', breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-permissions');
      if (response.status === 200) {
        setPermissionData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  // const handleDelete = async (permission) => {
  //   const backendUrl = process.env.REACT_APP_BACKEND_URL;
  //   const response = await axios.delete(`${backendUrl}delete-permission/${permissionToDelete._id}`);
  //   if (response.status == 200) {
  //     console.log("Permission deleted:", permissionToDelete);
  //   }
  //   const updatedPermissionData = permissionData.filter(permission => permission._id !== permissionToDelete._id);
  //   setPermissionData(updatedPermissionData);

  //   setShowDeleteModal(false);
  // };

  // const toggleDeleteModal = (permission) => {
  //   setPermissionToDelete(permission);
  //   setShowDeleteModal(!showDeleteModal);
  // };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
  const currentDate = new Date();

const data = {
  columns: [
    { label: "Roll No", field: "roll_no", sort: "asc", width: 150 },
    { label: "Type of Permission", field: "permission_type", sort: "asc", width: 150 },
    { label: "From Date", field: "from_date", sort: "asc", width: 150 },
    { label: "To Date", field: "to_date", sort: "asc", width: 150 },
    { label: "No of Days", field: "days", sort: "asc", width: 100 },
    { label: "Remarks", field: "remarks", sort: "asc", width: 50 },
    // { label: "Status", field: "status", sort: "asc", width: 30 },
    // { label: "Action", field: "actions", sort: "asc", width: 30 },
  ],
  rows: permissionData.map(permission => {
        
    return {
      roll_no: permission.roll_no,
      permission_type: permission.permission_type,
      from_date: permission.from_date,
      to_date: permission.to_date,
      days: permission.days,
      remarks: permission.remarks,
    };
  }),
};


  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Permission</CardTitle>
              <a href="/add-permission">
                <Button type="button" color="primary" className="waves-effect waves-light">Add Permission</Button>
              </a>
            </CardBody>
            <CardBody>
              <MDBDataTable responsive bordered data={data} noBottomColumns />
            </CardBody>
          </Card>
        </Col>
      </Row>
      {/* <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} /> */}
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(PermissionsList);