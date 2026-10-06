import React from "react";
import Sessionwidget from "../Dashboard/sessions-dashboard/Sessionwidget"
import { setBreadcrumbItems } from "../../store/actions";
import { Card, CardBody, Row, Col, CardTitle } from "reactstrap"
const SessionStatus = (props) => {
  document.title = "Technial Hub| Add Session";

  const breadcrumbItems = [
    { title: "TechnicalHub", link: "#" },
    { title: "Sessions", link: "/sessions-status" },
    { title: "Session Status", link: "/sessions-status" },
  ];


  return (
    <React.Fragment>
      <Row>
        <Col xl="6">
          <Card>
            <CardBody>
              <Sessionwidget/>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default SessionStatus
