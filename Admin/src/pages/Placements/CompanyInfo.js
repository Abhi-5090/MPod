import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Row, Col, Card, CardBody, CardTitle, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import "./datatables.scss";

const PlacementsList = (props) => {
  document.title = "Placements List | Technical Hub - All the placements list";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Placements", link: "#" },
    { title: "Placements List", link: "#" },
  ];

  const [placementsData, setPlacementsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [placementToDelete, setPlacementToDelete] = useState(null);

  useEffect(() => {
    props.setBreadcrumbItems('Placements', breadcrumbItems);
    fetchPlacementsData();
  }, []);

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

  const fetchPlacementsData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.get(backendUrl+`get-companyinfo`);
      if (response.status === 201) { // Corrected status check to 200 for successful response
        setPlacementsData(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      toast.error('Error fetching placements', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.delete(backendUrl+`delete-Companiesdata/${placementToDelete._id}`);
      if (response.status === 201) { // Corrected status check to 200 for successful response
        
        const updatedPlacementsData = placementsData.filter(p => p._id !== placementToDelete._id);
        setPlacementsData(updatedPlacementsData);
        setShowDeleteModal(false);
        setPlacementToDelete(null);
      }
      window.location.reload()
    } catch (error) {
      console.error("Error deleting placement:", error);
      toast.error('Error deleting placement', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  const toggleDeleteModal = (placement) => {
    setPlacementToDelete(placement);
    setShowDeleteModal(!showDeleteModal);
  };

  

  const data = {
    columns: [
      { label: "S.No", field: "sno", sort: "asc", width: 50 },
      { label: "Company Name", field: "company_name", sort: "asc", width: 150 },
      { label: "Company Logo", field: "company_logo", sort: "asc", width: 150 },
      { label: "Highest Package", field: "higest_package", sort: "asc", width: 150 },
      { label: "Role", field: "Role", sort: "asc", width: 150 },
      { label: "Percentage", field: "percentage", sort: "asc", width: 150 },
      { label: "Backlogs", field: "backlogs", sort: "asc", width: 150 },
      { label: "Branches", field: "branches", sort: "asc", width: 150 },
      { label: "Selection Process", field: "Section_process", sort: "asc", width: 150 },
    
      
      { label: "Skill Set", field: "skillset", sort: "asc", width: 150 },
      { label: "Industry", field: "industry", sort: "asc", width: 150 },
      { label: "Added By", field: "addedby", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 100 },
      { label: "Action", field: "actions", sort: "asc", width: 150 },
    ],
    rows: placementsData.map((placement, index) => ({
      sno: index + 1,
      company_name: placement.company_name,
      company_logo: (<img src={`${placement.company_big_Logo}`} alt="Company Logo" width="50px" />),
      higest_package: placement.higest_package,
      Role: placement.Role && placement.Package,
// const package = placement.package.map(pkg => pkg.package).join(', '),
// Role: `${placement.Role.map(role => role.role).join(', ')} - ${placement.Package}`,
     
      percentage: placement.percentage,
      backlogs: placement.backlogs,
      branches: placement.branches,
      selection_process: placement.selection_process,
      Section_process: placement.Section_process.map(round => round.round).join(', '),
      skillset: placement.skillset.map(skill => skill.skill).join(', '), // Render skillset as a comma-separated list
      industry: placement.industry,
      addedby: placement.addedby,
      status: (
        <span style={{ color: placement.status === 1 ? 'green' : 'red' }}>
          {placement.status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
      actions: (
        <div>
          <Link to={`/edit-companies/${placement._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" size="sm" className="me-2" onClick={() => toggleDeleteModal(placement)}>Delete</Button>
          
        </div>
      ),
    })),
    
  };

  return (
    <React.Fragment>
      <Row>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Placements List</CardTitle>
              <Link to="/add-companies">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD Data</Button>
              </Link>
            </CardBody>
            <CardBody>
              {loading ? (
                <div className="text-center">
                  <MutatingDots
                    visible={true}
                    height={50}
                    width={50}
                    color="#2B3A4A"
                    secondaryColor="#2B3A4A"
                    radius={12.5}
                    ariaLabel="mutating-dots-loading"
                  />
                </div>
              ) : (
                <MDBDataTable
                  responsive
                  bordered
                  data={data}
                  className="mt-2"
                  paging={false} // Disable pagination
                  noBottomColumns
                
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={showDeleteModal} toggle={() => toggleDeleteModal(null)}>
        <ModalHeader toggle={() => toggleDeleteModal(null)}>Delete</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this placement data?
        </ModalBody>
        <ModalFooter>
        <span color="secondary" onClick={() => toggleDeleteModal(null)}>Cancel</span>
          <Button color="danger" onClick={handleDelete}>Delete</Button>{' '}
          
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setBreadcrumbItems: (category, items) => dispatch(setBreadcrumbItems(category, items)),
});

export default connect(null, mapDispatchToProps)(PlacementsList);





// const data = {
//   columns: [
//     { label: "S.No", field: "sno", sort: "asc", width: 50 },
//     { label: "Company Name", field: "company_name", sort: "asc", width: 150 },
//     { label: "Company Logo", field: "company_logo", sort: "asc", width: 150 },
//     { label: "Highest Package", field: "higest_package", sort: "asc", width: 150 },
//     { label: "Role - Package", field: "Role_Package", sort: "asc", width: 150 },
//     { label: "Percentage", field: "percentage", sort: "asc", width: 150 },
//     { label: "Backlogs", field: "backlogs", sort: "asc", width: 150 },
//     { label: "Branches", field: "branches", sort: "asc", width: 150 },
//     { label: "Selection Process", field: "selection_process", sort: "asc", width: 150 },
//     { label: "Skill Set", field: "skillset", sort: "asc", width: 150 },
//     { label: "Industry", field: "industry", sort: "asc", width: 150 },
//     { label: "Added By", field: "addedby", sort: "asc", width: 150 },
//     { label: "Status", field: "status", sort: "asc", width: 100 },
//     { label: "Action", field: "actions", sort: "asc", width: 150 },
//   ],
//   rows: placementsData.map((placement, index) => {
//     const roleText = Array.isArray(placement.Role) && placement.Role.length > 0 ? placement.Role[0].role : '';
//     const packageText = Array.isArray(placement.Package) && placement.Package.length > 0 ? placement.Package[0].package : '';

//     return {
//       sno: index + 1,
//       company_name: placement.company_name,
//       company_logo: (
//         <img
//           src={`${placement.company_logo}`}
//           alt="Company Logo"
//           width="50px"
//         />
//       ),
//       higest_package: placement.higest_package,
//       Role_Package: `${roleText} - ${packageText}`,
//       percentage: placement.percentage,
//       backlogs: placement.backlogs,
//       branches: placement.branches,
//       selection_process: placement.selection_process,
//       Section_process: placement.Section_process.map(round => round.round).join(', '),
//       skillset: placement.skillset.map(skill => skill.skill).join(', '), // Render skillset as a comma-separated list
//       industry: placement.industry,
//       addedby: placement.addedby,
//       status: (
//         <span style={{ color: placement.status === 1 ? 'green' : 'red' }}>
//           {placement.status === 1 ? 'Active' : 'Inactive'}
//         </span>
//       ),
//       actions: (
//         <div>
//           <Link to={`/edit-companies/${placement._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
//           <Button color="danger" size="sm" className="me-2" onClick={() => toggleDeleteModal(placement)}>Delete</Button>
//         </div>
//       ),
//     };
//   }),
// };

// const PlacementsList = () => {
//   // Your logic to fetch placementsData and other component logic

//   return (
//     <MDBDataTable
//       striped
//       bordered
//       small
//       data={data}
//     />
//   );
// };
