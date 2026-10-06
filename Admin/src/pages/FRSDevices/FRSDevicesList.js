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
import {MutatingDots } from 'react-loader-spinner'
const DevicesList = (props) => {
  document.title = "Devices list | Technical Hub - All the list of Devices";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Devices", link: "#" },
    { title: "Devices List", link: "#" },
  ]
  const [deviceData, setDeviceData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    props.setBreadcrumbItems('Devices', breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-frs-devices');
      if (response.status === 200) {
        setDeviceData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (device) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-frs-device/${deviceToDelete._id}`);
    if(response.status == 200) {
      console.log("Device deleted:", deviceToDelete);

    }
    const updatedDeviceData = deviceData.filter(device => device._id !== deviceToDelete._id);
    setDeviceData(updatedDeviceData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (device) => {
    setDeviceToDelete(device);
    setShowDeleteModal(!showDeleteModal);
  };



  const data = {
    columns: [
      { label: "Device Name", field: "name", sort: "asc", width: 150 },
      { label: "Serial No", field: "serial_no", sort: "asc", width: 150 },
      { label: "Device Location", field: "location", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: deviceData.map(device => ({
      name: device.name,
      serial_no: device.serial_no,
      location: device.location,
      status: device.status === 1 ? <Badge color="success" className="bg-success">Active</Badge> : <Badge color="danger" className="bg-danger">Inactive</Badge>,
      actions: (
        <div>
          <Link to={`/edit-frs-device/${device._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" size="sm" onClick={() => toggleDeleteModal(device)}>Delete</Button>
        </div>
      ),
    })),
  };
  console.log(data)



  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Device</CardTitle>
              <a href="/add-frs-device">
                <Button type="button" color="primary" className="waves-effect waves-light">Add Device</Button>
              </a>
            </CardBody>
            <CardBody>
              {
                data.rows.length!=0?<MDBDataTable responsive bordered data={data} noBottomColumns />:
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
              }
              
            </CardBody>
          </Card>
        </Col>
      </Row>
      <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(DevicesList);