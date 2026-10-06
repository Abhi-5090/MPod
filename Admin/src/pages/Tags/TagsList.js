import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Spinner, Badge } from "reactstrap"
import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { MutatingDots } from 'react-loader-spinner'
const TagsList = (props) => {
  document.title = "Tags list | Technical Hub - Tags List";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Tags", link: "#" },
    { title: "Tags List", link: "#" },
  ]
  const axiosAPI = axios.create()

  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems('Tags List', breadcrumbItems);
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

  useEffect(() => {
    setLoading(true)
    const baseURL = `${process.env.REACT_APP_MPOD_BACKEND_URL}tags-list`;
    axiosAPI.get(baseURL)
      .then((response) => setTags(response.data['tags']))
      .finally(() => {
        setLoading(false)
      })

  }, [])
  const data = {
    columns: [
      {
        label: "Tag Name",
        field: "tag_name",
        sort: "asc",
        width: 150,
      },
      {
        label: "Status",
        field: "status",
        sort: "asc",
        width: 200,
      },
      {
        label: "Action",
        field: "action",

        width: 200,
      },
    ],
    rows: tags
  };




  const handleDelete = (id) => {
    setTagToDelete(id);
    const baseURL = `${process.env.REACT_APP_MPOD_BACKEND_URL}delete-tag/` + id;
    axiosAPI.delete(baseURL).then((res) => {
      if (res.status == 200) {
        // alert("user added")
        toast.success('Tag Deleted', {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        }
        
      );
      // navigate("/users-list");
      window.location.reload(true);
      
    }
  }).catch((error) => {
      console.log(error)
      if (error.response.status === 400) {
        console.log(error.message);
        //  alert("user not added")
        toast.error('Tag not Deleted', {
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
    })
    setShowDeleteModal(!showDeleteModal);
  }



  if (data) {
    tags.map((item) => {

      let activeBtn = (<Badge className="bg-success badge bg-secondary">ACTIVE</Badge>)
      let inActiveBtn = (<Badge className="bg-danger badge bg-secondary">INACTIVE</Badge>)
      let isStatus = (item.status === 1 ? activeBtn : inActiveBtn)
      item.status = (isStatus)
      // <Link to={`/edit-tag/${item._id}`} className="btn btn-info" ><i className="fas fa-user-edit"></i></Link>
      let edit = (
        <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>)

      item.action = (edit)
      if (item['course_id']) {
        item.course_name = item['course_id']['course_name']
      }

    })
  }
  document.title = "Tags List";


  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody>
              <CardTitle className="h4"></CardTitle>
              <p className="card-title-desc"></p>
                <div className="text-right button-items" style={{float:"right", clear:"both"}}><Link to={`/add-tag`} className="btn btn-primary" >Add Tag</Link></div>
                
              {loading == true ?
                <div >
                  <Col lg={6}>
                    <Card>
                      <CardBody>
                        <div class="container">

                          {/* <Spinner type="grow" className="ms-2" color="primary" /> */}
                          {/* <Spinner type="grow" className="ms-2" color="secondary" /> */}
                          <Spinner type="grow" className="ms-2" color="success" />
                          <Spinner type="grow" className="ms-2" color="danger" />
                          <Spinner type="grow" className="ms-2" color="warning" />
                          {/* <Spinner type="grow" className="ms-2" color="info" /> */}
                          <Spinner type="grow" className="ms-2" color="light" />
                          <Spinner type="grow" className="ms-2" color="dark" />
                        </div>

                      </CardBody>
                    </Card>
                  </Col></div> :
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              }
            </CardBody>
          </Card>
        </Col>
      </Row>
      <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(TagsList);