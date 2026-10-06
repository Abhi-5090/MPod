import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import {
  Row, Col, Card, CardBody, CardTitle, Button, Badge, UncontrolledPopover,
  PopoverBody,
  PopoverHeader,
  UncontrolledTooltip
} from "reactstrap"
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from 'react-loader-spinner';

import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
const SessionsList = (props) => {
  document.title = "Sessions list | Technical Hub - All the list of Sessions";
  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Sessions", link: "#" },
    { title: "Sessions List", link: "#" },
  ]
  const [sessionData, setSessionData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [user, setUser] = useState();
  const [batchAttendanceCount, setBatchAttendanceCount] = useState();

  //environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  //getting localstorage details

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    setUser(authUser);

    try {
      axios.get(backendUrl + "get-today-batchwise-attendance").then((response) => {
        setBatchAttendanceCount(response.data)

      })
    } catch (err) {
      console.log(err)
    }
  }, []);

  useEffect(() => {
    if (user) {
      props.setBreadcrumbItems('Sessions', breadcrumbItems);
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'trainer' || authUser.role == 'operations' || authUser.role == 'coding') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);

  const fetchData = async () => {

    if (user.role == 'admin' || user.role == 'superadmin') {
      try {
        const response = await axios.get(backendUrl + 'get-sessions');
        if (response.status === 200) {
          console.log(response.data)
          setSessionData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    } else {
      try {
        const response = await axios.post(
          backendUrl + 'get-sessions-by-technology',
          { technologyArray: user.technology },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 200) {
          setSessionData(response.data);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    }

  };

  const handleDownloadExcel = () => {
    // Prepare data for Excel
    const excelData = sessionData.map((session) => ({
      "Course Name": session.course_name,
      "Technology Name": session.technology_name,
      "Module": session.module_name,
      "Topic": session.topic_name,
      "Batch": session.batch_name,
      "Mode": session.mode,
      "Type": session.type,
      "Created At": formatDate(session.createdAt),
      "Session Count": session.count,
    }));
  
    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sessions");
  
    // Generate and download Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "SessionsList.xlsx");
  };
  


  const handleDelete = async (session) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-session/${sessionToDelete._id}`);
    if (response.status == 200) {
      console.log("Session deleted:", sessionToDelete);
    }
    const updatedSessionData = sessionData.filter(session => session._id !== sessionToDelete._id);
    setSessionData(updatedSessionData);

    setShowDeleteModal(false);
  };

  const toggleDeleteModal = (session) => {
    setSessionToDelete(session);
    setShowDeleteModal(!showDeleteModal);
  };
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL
  const formatDate = (dateString) => {
    return moment(dateString).format("DD-MM-YYYY");
  };

  const isToday = (dateString) => {
    return moment(dateString).isSame(moment(), "day");
  };



  const data = {
    columns: [
      { label: "Course Name", field: "course_name", sort: "asc", width: 150 },
      { label: "Technology Name", field: "technology_name", sort: "asc", width: 150 },
      { label: "Module", field: "module", sort: "asc", width: 150 },
      { label: "Topic", field: "topic", sort: "asc", width: 150 },
      { label: "Batch", field: "batch", sort: "asc", width: 150 },
      { label: "Mode", field: "mode", sort: "asc", width: 150 },
      { label: "Type", field: "type", sort: "asc", width: 150 },

      { label: "Created at", field: "created", sort: "asc", width: 150 },
      { label: "Session", field: "session", sort: "asc", width: 150 },
      // { label: "Action", field: "actions", sort: "asc", width: 30 },
    ],
    rows: sessionData.map(session => {
      const formattedDate = formatDate(session.createdAt);
      const highlight = isToday(session.createdAt) ? { color: "red" } : {color:"black"};

      return {
        course_name: session.course_name,
        technology_name: isToday(session.createdAt) ? (<span title="Attended"> {session.technology_name}
          {/* <Badge color="primary" className="bg-primary">Primary</Badge>{" "} */}
          <Badge color="primary" className=" rounded-pill bg-primary mo-mb-2 me-1 me-1" style={{ marginLeft: "10px", fontSize: "10pt" }} id="tooltip1">
            {batchAttendanceCount && batchAttendanceCount.map((ele) => {
              if (ele.batch_name == session.batch_name) {
                return ele.count
              }
            })}
          </Badge>{" "}
          <UncontrolledTooltip placement="top" target="tooltip1">
            Attendance
          </UncontrolledTooltip>

        </span>) : session.technology_name,
        module: session.module_name,
        type:session.type,
        topic: session.topic_name,
        batch: session.batch_name,
        mode: session.mode=="lightmode"?"Lightmode":session.mode=="brightmode"?"Brightmode":session.mode=="shinemode"?"Shinemode":session.mode=="darkmode"?"Darkmode":session.mode=="moonmode"?"Moonmode":"",
        created: (<span style={highlight}>{formattedDate}</span>),
        // created: formattedDate,
        session: session.count,
        // actions: (
        //   <div>
        //     <Link to={`/edit-session/${session._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
        //     <Button color="danger" size="sm" onClick={() => toggleDeleteModal(session)}>Delete</Button>
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
            {/* <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Session</CardTitle>
              <a href="/admin/add-session">
                <Button type="button" color="primary" className="waves-effect waves-light">ADD Session</Button>
              </a>
            </CardBody> */}
            <CardBody className="d-flex justify-content-between align-items-center">
  <CardTitle className="h4">Add Session</CardTitle>
  <div className="d-flex align-items-center">
    {/* Download Excel Button */}
    <Button
      type="button"
      color="success"
      className="waves-effect waves-light me-3"
      onClick={() => handleDownloadExcel()}
    >
      Download Excel
    </Button>
    {/* Add Session Button */}
    <a href="/admin/add-session">
      <Button type="button" color="primary" className="waves-effect waves-light">
        ADD Session
      </Button>
    </a>
  </div>
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

export default connect(null, { setBreadcrumbItems })(SessionsList);