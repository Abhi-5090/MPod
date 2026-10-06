import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { setBreadcrumbItems } from "../../store/actions";
import TotalStats from "./stats/totalStats";
import TotalSuperAdminStats from "./SuperAdmin/totalSuperAdminStats";

import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle
} from "reactstrap"
import axios from "axios"
const Dashboard = (props) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCurrentUserData();
  }, []);

  const fetchCurrentUserData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

      const response = await axios.get(backendUrl + "get-admin-current-user");
      console.log(response.data);
      setUser(response.data);
    } catch (error) {
      console.log(error);
      navigate("/login");
    }
  };

  useEffect(() => {
    if (user && !["tenantadmin", "admin", "superadmin","trainer","placementadmin"].includes(user.role)) {
      navigate("/login");
    }
  }, [user, navigate]);

  document.title = "Dashboard | Mpod";

  const breadcrumbItems = [
    { title: "Mpod", link: "#" },
    { title: "Dashboard", link: "#" },
  ];

  useEffect(() => {
    props.setBreadcrumbItems("Dashboard", breadcrumbItems);
  }, []);

  return (
    <React.Fragment>
      <h2>Welcome! {user && user.organization}</h2>
      {/* <h4>We will update soon...</h4> */}
          {user && user.role == "superadmin" ?
        <Row>
          <TotalSuperAdminStats />
        </Row> :
        <Row>
          <Col xl="12">
            <TotalStats tenant={user && user.t_id} />
          </Col>
        </Row>}
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(Dashboard);
