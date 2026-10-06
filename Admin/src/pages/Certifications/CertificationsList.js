import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, CardTitle, Button, Badge, Input } from "reactstrap";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { setBreadcrumbItems } from "../../store/actions";
import axios from "axios";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import * as XLSX from 'xlsx';
import { FaFileExcel } from 'react-icons/fa';
import data from "./data.json";
import paginationFactory from 'react-bootstrap-table2-paginator';
const CertificationsList = (props) => {
  document.title = "Certifications list | Technical Hub - All the list of Certifications";

  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Certifications", link: "#" },
    { title: "Certifications List", link: "#" },
  ];

  const [certificationData, setCertificationData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certificationToDelete, setCertificationToDelete] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [testCenterFilter, setTestCenterFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')

  useEffect(() => {
    props.setBreadcrumbItems('Certifications', breadcrumbItems);
    fetchData();
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

  const fetchData = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}get-certifications`);
      if (response.status === 200) {
        console.log(response.data)
        setCertificationData(response.data);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleDelete = async () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const response = await axios.delete(`${backendUrl}delete-certification/${certificationToDelete._id}`);
    if (response.status === 200) {
      console.log("Certification deleted:", certificationToDelete);
      const updatedCertificationData = certificationData.filter(cert => cert._id !== certificationToDelete._id);
      setCertificationData(updatedCertificationData);
      setShowDeleteModal(false);
    }
  };

  const toggleDeleteModal = (certification) => {
    setCertificationToDelete(certification);
    setShowDeleteModal(!showDeleteModal);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Certifications");
    XLSX.writeFile(wb, "Certifications_List.xlsx");
  };

  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL;

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleLevelFilterChange = (e) => {
    setLevelFilter(e.target.value);
  };
  const handleTestCenterFilterChange = (e) => {
    setTestCenterFilter(e.target.value);
  };
  const handleVendorFilterChange = (e) => {
    setVendorFilter(e.target.value);
  };
  const filteredData = certificationData.filter(cert => {
    return (
      (categoryFilter === "" || cert.category === categoryFilter) &&
      (levelFilter === "" || (cert.level === levelFilter)) &&
      (testCenterFilter === "" || cert.testing_platform.includes(testCenterFilter)) &&
      (vendorFilter === "" || (cert.vendor === vendorFilter))

    );
  });
  const optionCategoryGroup = data.categoryData.map((ele) => (
    <option key={ele.value} value={ele.value}>{ele.category_name}</option>
  ));
  const optionLevelGroup = data.levelData.map((ele) => (
    <option key={ele.value} value={ele.value}>{ele.level_name}</option>
  ));
  const optionTestCenterGroup = data.testPlatformData.map((ele) => (
    <option key={ele.value} value={ele.value}>{ele.test_platform_name}</option>
  ));
  const uniqueVendors = [...new Set(certificationData.map(ele => ele.vendor))];

  const optionVendorGroup = uniqueVendors.map(vendor => (
    <option key={vendor} value={vendor}>{vendor}</option>
  ));
  console.log(optionTestCenterGroup)
  const columns = [
    { dataField: 'category', text: 'Category', sort: true },
    { dataField: 'certification_name', text: 'Certification ', sort: true },
    { dataField: 'level', text: 'Level', sort: true },
    { dataField: 'vendor', text: 'Vendor', sort: true },
    {
      dataField: 'testing_platform',
      text: 'Test Center',
      sort: true,
      formatter: (cell, row) => (
        cell.join(", ")
      )
    },
    { dataField: 'score_card', text: 'Score Card', sort: true },
    { dataField: 'offering', text: 'Offering', sort: true },
    {
      dataField: 'status',
      text: 'Status',
      sort: true,
      formatter: (cell, row) => (
        cell === 1 ? <Badge color="success" className="bg-success">Active</Badge> : <Badge color="danger" className="bg-danger">Inactive</Badge>
      )
    },
    {
      dataField: 'certification_icon',
      text: 'Certification Icon',
      formatter: (cell, row) => (
        <img src={`${backendImageUrl}certification-icons/${cell}`} alt="Certification Icon" width="30px" />
      )
    },
    {
      dataField: 'actions',
      text: 'Actions',
      formatter: (cell, row) => (
        <div>
          <Link to={`/edit-certification/${row._id}`} className="btn btn-info btn-sm me-2">Edit</Link>
          <Button color="danger" size="sm" onClick={() => toggleDeleteModal(row)}>Delete</Button>
        </div>
      )
    },
  ];

  return (
    <React.Fragment>
      <Row>
        <Col className="col-12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center">
              <CardTitle className="h4">Add Certification</CardTitle>
              <div>
                <Button type="button" color="primary" className="waves-effect waves-light me-2" onClick={exportToExcel}>
                  <FaFileExcel /> Export to Excel
                </Button>
                <a href="/add-certification">
                  <Button type="button" color="primary" className="waves-effect waves-light">ADD Certification</Button>
                </a>
              </div>
            </CardBody>
            <CardBody>
              <Row className="mb-3">
                <Col md={2}>
                  <Input type="select" value={categoryFilter} onChange={handleCategoryFilterChange}>
                    <option value="">All Categories</option>
                    {/* Assuming you have a predefined list of categories */}
                    {optionCategoryGroup}
                  </Input>
                </Col>
                <Col md={2}>
                  <Input type="select" value={levelFilter} onChange={handleLevelFilterChange}>
                    <option value="">All Levels</option>
                    {optionLevelGroup}
                  </Input>
                </Col>
                <Col md={2}>
                  <Input type="select" value={testCenterFilter} onChange={handleTestCenterFilterChange}>
                    <option value="">All Test Centers</option>
                    {optionTestCenterGroup}
                  </Input>
                </Col>
                <Col md={2}>
                  <Input type="select" value={vendorFilter} onChange={handleVendorFilterChange}>
                    <option value="">All Vendors</option>
                    {optionVendorGroup}
                  </Input>
                </Col>
              </Row>
              <BootstrapTable
                bootstrap4
                keyField='_id'
                data={filteredData}
                columns={columns}
                filter={filterFactory()}
                striped
                hover
                condensed
                pagination={paginationFactory()}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <DeleteConfirmationModal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)} onDelete={handleDelete} />
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(CertificationsList);
