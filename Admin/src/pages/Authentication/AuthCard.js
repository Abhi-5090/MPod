import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Card, CardBody, Col, Container, Row } from "reactstrap"
import logo from "../../assets/images/maya-dark.png"

// Shared frame for the login / forgot-password pages.
const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className="account-pages my-5 pt-sm-5">
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <Card className="overflow-hidden">
            <CardBody className="pt-0">
              <h3 className="text-center mt-5 mb-4">
                <Link to="/login" className="d-block auth-logo">
                  <img src={logo} alt="Mpod" height="60" />
                </Link>
              </h3>
              <div className="p-3">
                <h4 className="text-muted font-size-18 mb-1 text-center">{title}</h4>
                {subtitle && <p className="text-muted text-center">{subtitle}</p>}
                {children}
              </div>
            </CardBody>
          </Card>
          {footer}
          <div className="mt-5 text-center">© {new Date().getFullYear()} Mpod</div>
        </Col>
      </Row>
    </Container>
  </div>
)

AuthCard.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
}

export default AuthCard
