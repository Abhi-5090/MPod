import React, { useEffect, useState } from 'react';

import { connect } from "react-redux";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle
} from "reactstrap"


// Pages Components
import Attendancewidget from "./Attendancewidget"
import Codingcards from "./Codingcards"
import CodingRankList from "./CodingRankList"
import TotalCountCards from "./totalCountCards"
import Sessionwidget from "./sessions-dashboard/Sessionwidget"
import CourseStats from "../AllCharts/dashboardCharts/students-stats/StudentsByCourse"
import MonthlyEarnings from "./montly-earnings";
import EmailSent from "./email-sent";
import MonthlyEarnings2 from "./montly-earnings2";
import Inbox from "./inbox";
import RecentActivity from "./recent-activity";
import WidgetUser from "./widget-user";
import Bus_info from "./bus_info_status";
import LatestTransactions from "./latest-transactions";
import LatestOrders from "./latest-orders";

//Import Action to copy breadcrumb items from local state to redux state
import { setBreadcrumbItems } from "../../store/actions";

const Dashboard = (props) => {

  const [user, setUser] = useState(null);
  useEffect(() => {
    let authUser = JSON.parse(localStorage.getItem('authUser'));
    setUser(authUser)
    console.log(authUser.role)
  }, [])



  document.title = "Dashboard | Technical Hub";


  const breadcrumbItems = [
    { title: "Technical Hub", link: "#" },
    { title: "Coding Dashboard", link: "#" }
  ]

  useEffect(() => {
    props.setBreadcrumbItems('Coding Dashboard', breadcrumbItems)
  },)

  const reports = [
    { title: "Orders", iconClass: "cube-outline", total: "1,587", average: "+11%", badgecolor: "info" },
    { title: "Revenue", iconClass: "buffer", total: "$46,782", average: "-29%", badgecolor: "danger" },
    { title: "Average Price", iconClass: "tag-text-outline", total: "$15.9", average: "0%", badgecolor: "warning" },
    { title: "Product Sold", iconClass: "briefcase-check", total: "1890", average: "+89%", badgecolor: "info" },
  ]

  return (
    <React.Fragment>

      {user && user.role == "busstaff" ?
        <>
          <Row>
            <Col xl="3">
              <Bus_info/>
            </Col>
          </Row>

        </>
        : user && user.role == "hod"?
        <>
        <Row>
            <Col xl="12">
            <TotalCountCards/>
            </Col>
        </Row>
         <Row>
            <Col xl="12">
              <Codingcards />
            </Col>
          </Row>
          <Row>
            <Col xl="12">
              <CodingRankList />
            </Col>
          </Row>
          </>
          :
          <>
          <Row>
            <Col xl="4">
              <CourseStats />
            </Col>
            <Col xl="8">
              <Attendancewidget />
            </Col>

          </Row>
          <Row>
            <Col xl="12">
              {/* <Sessionwidget /> */}
              
            </Col>
          </Row>
        </>
      }
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(Dashboard);