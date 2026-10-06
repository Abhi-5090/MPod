import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"

import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { MutatingDots } from 'react-loader-spinner';

//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
const ModulesList = (props) => {
  document.title = "Modules list | Technical Hub - All the list of Modules";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Modules", link: "#" },
    { title: "Modules List", link: "#" },
  ]
  const [moduleData, setModuleData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems('Modules', breadcrumbItems);
    fetchData();
  }, []);
  // useEffect(() => {
  //   let authUser = JSON.parse(localStorage.getItem('authUser'));
  //   if (authUser.role == 'admin' || authUser.role == 'superadmin') {
  //   }
  //   else {
  //     alert("your not autherized")
  //     localStorage.clear();
  //     window.location.href = '/admin/login';
  //   }
  // }, []);
  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-Modules');
      console.log(response.data)
      if (response.status === 200) {
        setModuleData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (module) => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-module/${moduleToDelete._id}`);
    if (response.status == 200) {
      console.log("Module deleted:", moduleToDelete);
    }
    const updatedModuleData = moduleData.filter(module => module._id !== moduleToDelete._id);
    setModuleData(updatedModuleData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (module) => {
    setModuleToDelete(module);
    setShowDeleteModal(!showDeleteModal);
  };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL

  const data = {
    columns: [
      { label: "Technology Name", field: "technology_name", sort: "asc", width: 150 },
      { label: "Module Name", field: "module_name", sort: "asc", width: 150 },
      { label: "Module Icon", field: "module_icon", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: moduleData.map(module => ({
      technology_name: module.technology_name,
      module_name: module.module_name,
      status: module.status === 1 ? <Badge color="success" className="bg-success">Active</Badge> : <Badge color="danger" className="bg-danger">Inactive</Badge>,
      module_icon: (<img src={backendImageUrl+"module-icons/"+ module.module_icon} alt="Topic Icon" width="50px" />),
      actions: (
        <div>
          <Link to={`/edit-module/${module._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" className="d-none" size="sm" onClick={() => toggleDeleteModal(module)}>Delete</Button>
        </div>
      ),
    })),
  };

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Module</CardTitle>
              <a href="/admin/add-module">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD Module</Button>
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

export default connect(null, { setBreadcrumbItems })(ModulesList);