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
const TechnologiesList = (props) => {
  document.title = "Technologies list | Technical Hub - All the list of Technologies";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Technologies", link: "#" },
    { title: "Technologies List", link: "#" },
  ]
  const [technologyData, setTechnologyData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [technologyToDelete, setTechnologyToDelete] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems('Technologies', breadcrumbItems);
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
      const response = await axios.get(backendUrl + 'get-Technologies');
      console.log(response.data)
      if (response.status === 200) {
        setTechnologyData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (technology) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-technology/${technologyToDelete._id}`);
    if (response.status == 200) {
      console.log("Technology deleted:", technologyToDelete);
    }
    const updatedTechnologyData = technologyData.filter(technology => technology._id !== technologyToDelete._id);
    setTechnologyData(updatedTechnologyData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (technology) => {
    setTechnologyToDelete(technology);
    setShowDeleteModal(!showDeleteModal);
  };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
  const data = {
    columns: [
      { label: "Technology Name", field: "technology_name", sort: "asc", width: 150 },
      { label: "Category", field: "technology_category", sort: "asc", width: 150 },
      // { label: "Technology Icon", field: "technology_icon", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: technologyData.map(technology => ({
      technology_name: technology.technology_name,
      technology_category: technology.technology_category,
      status: technology.status === 1 ? <Badge color="success" className="bg-success">Active</Badge> : <Badge color="danger" className="bg-danger">Inactive</Badge>,
      // technology_icon: (<img src={backendImageUrl+"technology-icons/" + technology.technology_icon} alt="Technology Icon" width="50px" />),
      actions: (
        <div>
          <Link to={`/edit-technology/${technology._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" className="d-none" size="sm" onClick={() => toggleDeleteModal(technology)}>Delete</Button>
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
              <CardTitle className="h4">Add Technology</CardTitle>
              <a href="/admin/add-technology">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD Technology</Button>
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

export default connect(null, { setBreadcrumbItems })(TechnologiesList);