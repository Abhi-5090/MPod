import React, { useEffect, useState } from "react"
import { MDBDataTable } from "mdbreact"
import {
  Row, Col, Card, CardBody, CardTitle, Button, Badge, UncontrolledPopover, Input,
  PopoverBody,
  PopoverHeader,
  UncontrolledTooltip
} from "reactstrap"
import moment from "moment";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";
import { MutatingDots } from 'react-loader-spinner';
import BootstrapTable from 'react-bootstrap-table-next';
import axios from "axios";
import "./datatables.scss"
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import * as XLSX from 'xlsx';
import { FaFileExcel } from 'react-icons/fa';
const SessionsList = (props) => {
  document.title = "Sessions list | Technical Hub - All the list of Sessions";
  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Sessions", link: "#" },
    { title: "Sessions Details", link: "#" },
  ]
  const [sessionData, setSessionData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [user, setUser] = useState();
  const [batchAttendanceCount, setBatchAttendanceCount] = useState();
  const [typeFilter, setTypeFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [technologyFilter, setTechnologyFilter] = useState("");

  const [technologies, setTechnologies] = useState([]);

  //environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  //getting localstorage details

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    setUser(authUser);

    try {
      axios.get(backendUrl + "get-technologies").then((response) => {
        setTechnologies(response.data)
      })
    } catch (err) {
      console.log(err)
    }
  }, []);

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

  useEffect(() => {
    if (user) {
      props.setBreadcrumbItems('Sessions', breadcrumbItems);
      fetchData();
    }
  }, [user]);

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

  const filteredData = sessionData.filter(sess => {
    // console.log(sess)
    return (
      (typeFilter === "" || sess.type === typeFilter) &&
      (modeFilter === "" || sess.mode === modeFilter) &&
      (technologyFilter === "" || sess.technology_name === technologyFilter)

    );
  });
  console.log("Filtered Data:", filteredData);
  const typeData = [
    { "label": "online", "value": "online" },
    { "label": "offline", "value": "offline" },
  ];
  const modeData = [
    { "label": "lightmode", "value": "lightmode" },
    { "label": "brightmode", "value": "brightmode" },
    { "label": "shinemode", "value": "shinemode" },
    { "label": "darkmode", "value": "darkmode" },
  ];
  const optionTypeGroup = typeData.map((ele) => (
    <option key={ele.value} value={ele.value}>{ele.value}</option>
  ));
  const optionModeGroup = modeData.map((ele) => (
    <option key={ele.value} value={ele.value}>{ele.value}</option>
  ));
  const optionTechnologyGroup = technologies.map((ele) => (
    <option key={ele.technology_name} value={ele.technology_name}>{ele.technology_name}</option>
  ));
  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };
  const handleModeFilterChange = (e) => {
    setModeFilter(e.target.value);
  };
  const handleTechnologyFilterChange = (e) => {
    setTechnologyFilter(e.target.value);
  };
  const columns = [
    { dataField: 'course_name', text: 'Course Name', sort: true },
    { dataField: 'technology_name', text: 'Technology Name', sort: true },
    { dataField: 'module_name', text: 'Module', sort: true },
    { dataField: 'topic_name', text: 'Topic', sort: true },
    { dataField: 'batch_name', text: 'Batch', sort: true },
    { dataField: 'mode', text: 'Mode', sort: true },
    { dataField: 'type', text: 'Type', sort: true },
    { dataField: 'batch_count', text: 'Batch Count', sort: true },
    { dataField: 'attendance_count', text: 'Attendance', sort: true },
    {
      dataField: 'created', text: 'Created at', sort: true,
      formatter: (cell, row) => (
        <span style={isToday(row.createdAt) ? { color: "red" } : { color: "black" }}>{formatDate(row.createdAt)}</span>
      )
    },
  ];

  // const data = sessionData.map(session => {
  //   return {
  //     course_name: session.course_name,
  //     technology_name: isToday(session.createdAt) ? (
  //       <span title="Attended">
  //         {session.technology_name}{' '}
  //         <Badge color="primary" className=" rounded-pill bg-primary mo-mb-2 me-1 me-1" style={{ marginLeft: '10px', fontSize: '10pt' }} id="tooltip1">
  //           {batchAttendanceCount && batchAttendanceCount.find(ele => ele.batch_name === session.batch_name)?.count}
  //         </Badge>{' '}
  //         <UncontrolledTooltip placement="top" target="tooltip1">
  //           Attendance
  //         </UncontrolledTooltip>
  //       </span>
  //     ) : session.technology_name,
  //     module: session.module_name,
  //     type: session.type,
  //     topic: session.topic_name,
  //     batch: session.batch_name,
  //     mode: session.mode === 'lightmode' ? 'Lightmode' : session.mode === 'brightmode' ? 'Brightmode' : session.mode === 'shinemode' ? 'Shinemode' : session.mode === 'darkmode' ? 'Darkmode' : '',
  //     created: <span style={isToday(session.createdAt) ? { color: "red" } : { color: "black" }}>{formatDate(session.createdAt)}</span>,
  //     attendance: session.attendance_count,
  //     count: session.batch_count
  //   }
  // });
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Certifications");
    XLSX.writeFile(wb, "Certifications_List.xlsx");
  };
  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody>
              {/* {data.length !== 0 ? ( */}
              <div>
                <Row className="mb-3">
                  <Col md={2}>
                    <Input type="select" value={technologyFilter} onChange={handleTechnologyFilterChange}>
                      <option value="">All Technologies</option>
                      {optionTechnologyGroup}
                    </Input>
                  </Col>
                  <Col md={2}>
                    <Input type="select" value={typeFilter} onChange={handleTypeFilterChange}>
                      <option value="">All types</option>
                      {optionTypeGroup}
                    </Input>
                  </Col>
                  <Col md={2}>
                    <Input type="select" value={modeFilter} onChange={handleModeFilterChange}>
                      <option value="">All Modes</option>
                      {optionModeGroup}
                    </Input>
                  </Col>
                  <Col md={4}></Col>
                  <Col md={2}>
                    <Button type="button" color="primary" className="waves-effect waves-light me-2" onClick={exportToExcel}>
                      <FaFileExcel /> Export to Excel
                    </Button>
                  </Col>
                </Row>
                <BootstrapTable
                  keyField="_id"
                  data={filteredData}
                  columns={columns}
                  bordered
                  bootstrap4
                  pagination={paginationFactory()}
                  noDataIndication={() => (
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
                  )}
                />
              </div>


              {/* ) : ( */}
              {/* <div className="row">
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
                </div> */}
              {/* )} */}
            </CardBody>
          </Card>
        </Col>
      </Row>
      <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} />
    </React.Fragment>
  );

};

export default connect(null, { setBreadcrumbItems })(SessionsList);