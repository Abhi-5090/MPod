import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"

import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { MutatingDots } from 'react-loader-spinner';
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
const BatchesList = (props) => {
  document.title = "Batches list | Technical Hub - All the list of Batches";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Batches", link: "#" },
    { title: "Batches List", link: "#" },
  ]
  const [batchData, setBatchData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

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
    props.setBreadcrumbItems('Batches', breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(backendUrl + 'get-batches');
      console.log(response.data)
      if (response.status === 200) {
        setBatchData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async (batch) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-batch/${batchToDelete._id}`);
    if (response.status == 200) {
      console.log("Batch deleted:", batchToDelete);
    }
    const updatedBatchData = batchData.filter(batch => batch._id !== batchToDelete._id);
    setBatchData(updatedBatchData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (batch) => {
    setBatchToDelete(batch);
    setShowDeleteModal(!showDeleteModal);
  };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
  const currentDate = new Date();

const data = {
  columns: [
    { label: "Programme", field: "course_name", sort: "asc", width: 150 },
    { label: "Technology", field: "technology_name", sort: "asc", width: 150 },
    { label: "Start Date", field: "start_date", sort: "asc", width: 150 },
    { label: "End Date", field: "end_date", sort: "asc", width: 150 },
    { label: "Primary Trainer", field: "primary_trainer", sort: "asc", width: 100 },
    { label: "Secondary Trainer", field: "secondary_trainers", sort: "asc", width: 50 },
    { label: "Mode", field: "mode", sort: "asc", width: 150 },
    { label: "Passout Year", field: "year", sort: "asc", width: 100 },
    { label: "Batch Name", field: "batch_name", sort: "asc", width: 150 },
    { label: "Status", field: "status", sort: "asc", width: 30 },
    { label: "Action", field: "actions", sort: "asc", width: 30 },
  ],
  rows: batchData.map(batch => {
    const startDateParts = batch.start_date.split("-");
    const endDateParts = batch.end_date.split("-");

    const startDate = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0]);
    const endDate = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0]);
  
    let status = '';
    if (startDate > currentDate && batch.status == 1) {
      status = <Badge color="info" className="bg-info">Upcoming</Badge>;
    } else if (startDate <= currentDate && endDate >= currentDate && batch.status == 1) {
      status = <Badge color="warning" className="bg-warning">In Progress</Badge>;
    } else if (endDate < currentDate && batch.status == 1) {
      status = <Badge color="danger" className="bg-danger">Completed</Badge>;
    } else if(batch.status==0) {
      status = <Badge color="secondary" className="bg-secondary">Hold</Badge>;
    }

    return {
      course_name: batch.course_name,
      batch_name: batch.batch_name+ " ("+batch.batch_count+")",
      technology_name: batch.technology_names.join(', '),
      start_date: batch.start_date,
      end_date: batch.end_date,
      primary_trainer: batch.primary_trainer,
      secondary_trainers: batch.secondary_trainers.join(', '),
      mode: batch.mode,
      year: batch.year,
      status: status,
      batch_icon: (<img src={backendImageUrl + "batch-icons/" + batch.batch_icon} alt="Batch Icon" width="50px" />),
      actions: (
        <div>
          <Link to={`/edit-batch/${batch._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" className="d-none" size="sm" onClick={() => toggleDeleteModal(batch)}>Delete</Button>
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
              <CardTitle className="h4">Add Batch</CardTitle>
              <a href="/admin/add-batch">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD Batch</Button>
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

export default connect(null, { setBreadcrumbItems })(BatchesList);