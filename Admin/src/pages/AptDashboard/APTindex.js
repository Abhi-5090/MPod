import React, { useEffect, useState } from 'react';

import { connect } from "react-redux";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle
} from "reactstrap"

import APTcards from "./Aptcards"
import TotalAPTCountCards from "./TotalAPTCountCards"
import { setBreadcrumbItems } from "../../store/actions";

const Dashboard = (props) => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser.role == 'admin' || authUser.role == 'superadmin' || authUser.role == 'manager' ||authUser.role == 'coding' ||authUser.role == 'Principal' ||authUser.role == 'faculty' ||authUser.role == 'hod') {
    }
    else {
      alert("your not autherized")
      localStorage.clear();
      window.location.href = '/admin/login';
    }
  }, []);
  
  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    setUser(authUser)
    console.log(authUser.role)
  }, [])



  document.title = "Dashboard | Technical Hub";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "APT LOGIC Dashboard", link: "#" }
  ]

  useEffect(() => {
    props.setBreadcrumbItems('APT LOGIC Dashboard', breadcrumbItems)
  },)

  const reports = [
    { title: "Orders", iconClass: "cube-outline", total: "1,587", average: "+11%", badgecolor: "info" },
    { title: "Revenue", iconClass: "buffer", total: "$46,782", average: "-29%", badgecolor: "danger" },
    { title: "Average Price", iconClass: "tag-text-outline", total: "$15.9", average: "0%", badgecolor: "warning" },
    { title: "Product Sold", iconClass: "briefcase-check", total: "1890", average: "+89%", badgecolor: "info" },
  ]

  return (
    <React.Fragment>

      {user && user.role == "hod" ?
        <>
          <Row>
            <Col xl="12">
              <TotalAPTCountCards />
            </Col>
          </Row>
          <Row>
            <Col xl="12">
              <APTcards />
            </Col>
          </Row>

        </>
        :
        <>
        </>
      }
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(Dashboard);