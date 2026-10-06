// import React, { useEffect, useState } from "react"
// import { MDBDataTable } from "mdbreact"
// import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap"
// import { MutatingDots } from 'react-loader-spinner';
// import { connect } from "react-redux";
// import { Link } from "react-router-dom";
// import { ToastContainer, toast, Bounce } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// //Import Action to copy breadcrumb items from local state to redux state
// import { setBreadcrumbItems } from "../../store/actions";
// import axios from "axios";
// import "./datatables.scss"
// import axiosInstance from "../../api/axiosInstance";

// import DeleteConfirmationModal from "./DeleteConfirmationModal";
// const TenantsList = (props) => {
//   document.title = "Tenants list | Technical Hub - All the list of Tenants";
//   const breadcrumbItems = [
//     { title: "Technical Hub", link: "#" },
//     { title: "Tenants", link: "#" },
//     { title: "Tenants List", link: "#" },
//   ]
//   const [userData, setUserData] = useState([]);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     props.setBreadcrumbItems('Users', breadcrumbItems);
//     fetchData();
//   }, []);
//   useEffect(() => {
//     fetchCurrentUserData();

//   }, []);

//   const fetchCurrentUserData = async () => {
//     try {
//     const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

//       const response = await axios.get(backendUrl+"get-admin-current-user");
//       console.log(response.data)
//       setUser(response.data);
   
//     } catch (error) {
//       console.log(error)

//       // navigate('/login');
//       console.error("Error fetching user data", error);
//     }
//   };

//   // useEffect(() => {
//   //   if (user&&user.role == 'admin' || user.role == 'superadmin') {
//   //   }
//   //   else {
//   //     alert("your not autherized")
//   //     window.location.href = '/admin/login';
//   //   }
//   // }, [user]);

//   const fetchData = async () => {
//     const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
//     try {
//       const response = await axios.get(backendUrl + 'get-tenants');
//       console.log(response.data)
//       if (response.status === 200) {
//         setUserData(response.data);
//       }
//     } catch (error) {
//       console.log("Error fetching data:", error);
//     }
//   };

//   const handleDelete = async (user) => {
//     const backendUrl = process.env.REACT_APP_BACKEND_URL;
//     const response = await axios.delete(`${backendUrl}delete-user/${userToDelete._id}`);
//     if (response.status == 200) {
//       console.log("User deleted:", userToDelete);
//       toast.success('User deleted successfully', {
//         position: "top-right",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "light",
//         transition: Bounce,
//       });
//     }
//     const updatedUserData = userData.filter(user => user._id !== userToDelete._id);
//     setUserData(updatedUserData);
//     setShowDeleteModal(false);
//   };

//   const toggleDeleteModal = (user) => {
//     setUserToDelete(user);
//     setShowDeleteModal(!showDeleteModal);
//   };
//   const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
//   const data = {
//     columns: [
//       { label: "Name", field: "organization_name", sort: "asc", width: 150 },
//       { label: "Contact Person", field: "contact_person", sort: "asc", width: 150 },
//       { label: "Email", field: "email", sort: "asc", width: 150 },
//       { label: "Assigned Credits", field: "assigned_credits", sort: "asc", width: 150 },
//       { label: "Active Credits", field: "active_credits", sort: "asc", width: 150 },
//       { label: "", field: "status", sort: "asc", width: 30 },
//       // { label: "Action", field: "actions", sort: "asc", width: 30 },
//     ],
//     rows: userData.map(user => ({
//       organization_name: user.organization_name,
//       contact_person: user.contact_person,
//       email: user.email,
//       assigned_credits: user.assigned_credits,
//       active_credits: user.active_credits,
//       status: user.status === 1 ? <Badge color="success" className="bg-success">Active</Badge> : <Badge color="danger" className="bg-danger">Inactive</Badge>,
//       // actions: (
//       //   <div>
//       //     <Link to={`/edit-tenant/${user._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
//       //     {/* <Button color="danger" size="sm" onClick={() => toggleDeleteModal(user)}>Delete</Button> */}
//       //   </div>
//       // ),
//     })),
//   };

//   const handleAddTenant = () => {
//     window.location.href = '/add-tenant';
//   }

//   return (
//     <React.Fragment>
//       <Row>
//         <ToastContainer
//           position="top-right"
//           autoClose={5000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//           transition={Bounce}  // Corrected this line
//         />

//         {/* Same as */}
//         <ToastContainer />
//         <Col className="col-12">
//           <Card>
//              <CardBody className="d-flex justify-content-between align-items-center">
//               <CardTitle className="h4">Add Tenant</CardTitle>
//               <a href="add-tenant">
//                 <Button type="button" color="primary" className="waves-effect waves-light" onClick={handleAddTenant}>ADD Tenant</Button>
//               </a>
//             </CardBody>
//             <CardBody>
//               {
//                 data.rows.length !== 0 ? (
//                   <MDBDataTable responsive bordered data={data} noBottomColumns />
//                 ) : (
//                   <div className="row">
//                     <div className="col-md-2 offset-5">
//                       <MutatingDots
//                         visible={true}
//                         height="100"
//                         width="100"
//                         color="#2B3A4A"
//                         secondaryColor="#2B3A4A"
//                         radius="12.5"
//                         ariaLabel="mutating-dots-loading"
//                         wrapperStyle={{}}
//                         wrapperClass=""
//                       />
//                     </div>
//                   </div>
//                 )
//               }
//             </CardBody>
//           </Card>
//         </Col>
//       </Row>
//       <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} />
//     </React.Fragment>
//   );
// };


// export default connect(null, { setBreadcrumbItems })(TenantsList);


import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import "./datatables.scss";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const TenantsList = (props) => {
  document.title = "Tenants list | Technical Hub";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Tenants", link: "#" },
    { title: "Tenants List", link: "#" },
  ];

  const [tenantData, setTenantData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    props.setBreadcrumbItems('Tenants', breadcrumbItems);
    fetchData();
  }, []);

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-tenants`);
      if (response.status === 200) {
        setTenantData(response.data);
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast.error("Failed to fetch tenants", { position: "top-right", autoClose: 4000, transition: Bounce });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tenantToDelete) return;
    const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
    try {
      const response = await axios.delete(`${backendUrl}delete-tenant/${tenantToDelete._id}`);
      if (response.status === 200) {
        toast.success('Tenant deleted successfully', { position: "top-right", autoClose: 4000, transition: Bounce });
        setTenantData(tenantData.filter(t => t._id !== tenantToDelete._id));
      }
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error("Failed to delete tenant", { position: "top-right", autoClose: 4000, transition: Bounce });
    }
    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (tenant) => {
    setTenantToDelete(tenant);
    setShowDeleteModal(!showDeleteModal);
  };

  const handleAddTenant = () => {
    navigate("/add-tenant");
  };

  const handleEditTenant = (tenantId) => {
    navigate(`/edit-tenant/${tenantId}`);
  };

  const data = {
    columns: [
      { label: "Organization Name", field: "organization_name", sort: "asc", width: 150 },
      { label: "Contact Person", field: "contact_person", sort: "asc", width: 150 },
      { label: "Email", field: "email", sort: "asc", width: 150 },
      { label: "Assigned Credits", field: "assigned_credits", sort: "asc", width: 150 },
      { label: "Active Credits", field: "active_credits", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 100 },
      { label: "Actions", field: "actions", sort: "disabled", width: 150 },
    ],

    rows: tenantData.map(tenant => ({
      organization_name: tenant.organization_name,
      contact_person: tenant.contact_person,
      email: tenant.email,
      assigned_credits: tenant.assigned_credits?.reduce((sum, val) => sum + Number(val), 0) || 0,
      active_credits: tenant.active_credits,
      status: tenant.status === 1 
        ? <Badge color="success" className="bg-success">Active</Badge> 
        : <Badge color="danger" className="bg-danger">Inactive</Badge>,
      actions: (
        <div>
          <Button color="info" size="sm" className="me-2" onClick={() => handleEditTenant(tenant._id)}>Edit</Button>
          <Button color="danger" size="sm" onClick={() => toggleDeleteModal(tenant)}>Delete</Button>
        </div>
      ),
    })),
  };

  return (
    <React.Fragment>
      <ToastContainer />
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4 mb-0">Tenants List</CardTitle>
              <Button color="primary" onClick={handleAddTenant}>+ Add Tenant</Button>
            </CardBody>

            <CardBody>
              {loading ? (
                <div className="row">
                  <div className="col-md-2 offset-5">
                    <MutatingDots
                      visible={true}
                      height="100"
                      width="100"
                      color="#2B3A4A"
                      secondaryColor="#2B3A4A"
                      radius="12.5"
                      ariaLabel="loading"
                    />
                  </div>
                </div>
              ) : (
                <MDBDataTable responsive bordered data={data} noBottomColumns />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        toggle={() => setShowDeleteModal(!showDeleteModal)}
        onDelete={handleDelete}
      />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(TenantsList);
