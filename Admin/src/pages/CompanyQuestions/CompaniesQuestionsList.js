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
// import DeleteConfirmationModal from "./DeleteConfirmationModal";
// const CompanyQuestionsList = (props) => {
//   document.title = "Company Questions list | Technical Hub - All the list of Company Questions";


//   const breadcrumbItems = [
//     { title: "Technical Hub", link: "#" },
//     { title: "Companies", link: "#" },
//     { title: "Company Questions List", link: "#" },
//   ]
//   const [topicData, setTopicData] = useState([]);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [topicToDelete, setTopicToDelete] = useState(null);

//   useEffect(() => {
//     props.setBreadcrumbItems('Company Questions', breadcrumbItems);
//     fetchData();
//   }, []);
//   // useEffect(() => {
//   //   let authUser = JSON.parse(localStorage.getItem('authUser'));
//   //   if (authUser.role == 'admin' || authUser.role == 'superadmin') {
//   //   }
//   //   else {
//   //     alert("your not autherized")
//   //     localStorage.clear();
//   //     window.location.href = '/admin/login';
//   //   }
//   // }, []);

//   const fetchData = async () => {
//     const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
//     try {
//       const response = await axios.get(backendUrl + 'get-company-questions');
//       console.log(response.data)
//       if (response.status === 200) {
//         setTopicData(response.data);
//       }
//     } catch (error) {
//       console.log("Error fetching data:", error);
//     }
//   };

//   const handleDelete = async (topic) => {
//     const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;
//     const response = await axios.delete(`${backendUrl}delete-topic/${topicToDelete._id}`);
//     if (response.status == 200) {
//       toast.success('Topic deleted successfully', {
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
//     const updatedTopicData = topicData.filter(topic => topic._id !== topicToDelete._id);
//     setTopicData(updatedTopicData);

//     setShowDeleteModal(false);
//   };

//   const toggleDeleteModal = (topic) => {
//     setTopicToDelete(topic);
//     setShowDeleteModal(!showDeleteModal);
//   };
//   const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
//   const data = {
//     columns: [
//       { label: "Company", field: "company_name", sort: "asc", width: 150 },
//       { label: "Tag", field: "tag_name", sort: "asc", width: 150 },
//       { label: "Type", field: "type", sort: "asc", width: 150 },
//       { label: "Round", field: "round", sort: "asc", width: 150 },
//       { label: "Year", field: "year", sort: "asc", width: 150 },
//       { label: "Question", field: "question", sort: "asc", width: 150 },

//       { label: "Status", field: "status", sort: "asc", width: 30 },
//       { label: "Action", field: "actions", sort: "asc", width: 30 },
//     ],
//     rows: topicData.map(topic => ({
//       company_name: topic.company_name,
//       tag_name: topic.tag_name,
//       type: topic.type,
//       round: topic.round,
//       year: topic.year,
//       question: topic.question,

//       status: topic.status === 1 ? <Badge color="success" className="bg-success">Active</Badge> : <Badge color="danger" className="bg-danger">Inactive</Badge>,
//       actions: (
//         <div>
//           <Link to={`/edit-company-question/${topic._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
//           <Button color="danger" className="d-none" size="sm" onClick={() => toggleDeleteModal(topic)}>Delete</Button>
//         </div>
//       ),
//     })),
//   };

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
//             <CardBody className="d-flex justify-content-between align-items-center">
//               <CardTitle className="h4">Add Company Question</CardTitle>
//               <a href="add-company-question">
//                 <Button type="button" color="primary" className="waves-effect waves-light">ADD COMPANY QUESTION</Button>
//               </a>
//             </CardBody>
//             <CardBody>
//               <h2>Filters</h2>
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

// export default connect(null, { setBreadcrumbItems })(CompanyQuestionsList);

import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import { Row, Col, Card, CardBody, CardTitle, Button, Badge, FormGroup, Label, Input } from "reactstrap"
import { MutatingDots } from 'react-loader-spinner';
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import * as XLSX from 'xlsx'; // Import XLSX for Excel export
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const CompanyQuestionsList = (props) => {
  document.title = "Company Questions list | Technical Hub";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Companies", link: "#" },
    { title: "Company Questions List", link: "#" },
  ]

  const [topicData, setTopicData] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);

  const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

  useEffect(() => {
    props.setBreadcrumbItems('Company Questions', breadcrumbItems);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [questionsRes, tagsRes] = await Promise.all([
        axios.get(backendUrl + 'get-company-questions'),
        axios.get(backendUrl + 'tags-list')
      ]);

      if (questionsRes.status === 200) setTopicData(questionsRes.data);
      if (tagsRes.status === 200) setTags(tagsRes.data.tags);
    } catch (error) {
      console.log("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleTagFilterChange = async (e) => {
    const tagId = e.target.value;
    setSelectedTag(tagId);
    setLoading(true);

    try {
      let response;
      if (tagId === "") {
        response = await axios.get(backendUrl + 'get-company-questions');
      } else {
        response = await axios.get(`${backendUrl}get-company-questions-by-tag-id/${tagId}`);
      }

      if (response.status === 200) {
        setTopicData(response.data);
      }
    } catch (error) {
      console.error("Error filtering by tag:", error);
      setTopicData([]);
    } finally {
      setLoading(false);
    }
  };

  // --- EXCEL DOWNLOAD FUNCTION ---
  const downloadExcel = () => {
    if (topicData.length === 0) {
      toast.warning("No data available to download");
      return;
    }

    // Format data for Excel (removing UI elements like Badges/Buttons)
    const excelData = topicData.map((item) => ({
      "Company": item.company_name,
      "Tag": item.tag_name,
      "Type": item.type,
      "Round": item.round,
      "Year": item.year,
      "Question": item.question,
      "Status": item.status === 1 ? "Active" : "Inactive"
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Company Questions");

    // Generate filename based on selected tag or "All"
    const fileName = selectedTag 
      ? `Questions_${tags.find(t => t._id === selectedTag)?.tag_name}.xlsx` 
      : "All_Company_Questions.xlsx";

    XLSX.writeFile(workbook, fileName);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${backendUrl}delete-topic/${topicToDelete._id}`);
      if (response.status === 200) {
        toast.success('Topic deleted successfully');
        setTopicData(topicData.filter(topic => topic._id !== topicToDelete._id));
      }
    } catch (error) {
      toast.error("Delete failed");
    }
    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (topic) => {
    setTopicToDelete(topic);
    setShowDeleteModal(!showDeleteModal);
  };

  const data = {
    columns: [
      { label: "Company", field: "company_name", sort: "asc", width: 150 },
      { label: "Tag", field: "tag_name", sort: "asc", width: 150 },
      { label: "Type", field: "type", sort: "asc", width: 150 },
      { label: "Round", field: "round", sort: "asc", width: 150 },
      { label: "Year", field: "year", sort: "asc", width: 150 },
      { label: "Question", field: "question", sort: "asc", width: 150 },
      { label: "Status", field: "status", sort: "asc", width: 30 },
      { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: topicData.map(topic => ({
      ...topic,
      status: topic.status === 1 ? <Badge color="success" className="bg-success">Active</Badge> : <Badge color="danger" className="bg-danger">Inactive</Badge>,
      actions: (
        <div>
          <Link to={`/edit-company-question/${topic._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" size="sm" onClick={() => toggleDeleteModal(topic)}>Delete</Button>
        </div>
      ),
    })),
  };

  return (
    <React.Fragment>
      <Row>
        <ToastContainer transition={Bounce} />
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Company Questions</CardTitle>
              <div>
                {/* Excel Download Button */}
                <Button 
                  color="success" 
                  className="me-2" 
                  onClick={downloadExcel}
                  disabled={loading || topicData.length === 0}
                >
                  <i className="mdi mdi-file-excel me-1"></i> EXPORT TO EXCEL
                </Button>
                <Link to="/add-company-question">
                  <Button color="primary">ADD COMPANY QUESTION</Button>
                </Link>
              </div>
            </CardBody>
            
            <CardBody className="border-top">
              <Row className="align-items-end">
                <Col md="4">
                  <FormGroup>
                    <Label for="tagFilter" className="fw-bold">Filter by Tag</Label>
                    <Input 
                      type="select" 
                      name="tagFilter" 
                      id="tagFilter" 
                      value={selectedTag} 
                      onChange={handleTagFilterChange}
                    >
                      <option value="">All Tags</option>
                      {tags.map(tag => (
                        <option key={tag._id} value={tag._id}>
                          {tag.tag_name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>

            <CardBody>
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <MutatingDots visible={true} height="100" width="100" color="#2B3A4A" secondaryColor="#2B3A4A" radius="12.5" />
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

export default connect(null, { setBreadcrumbItems })(CompanyQuestionsList);