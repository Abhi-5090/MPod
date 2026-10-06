import React, { useEffect } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { Row, Col } from "reactstrap"

import { setBreadcrumbItems } from "../../store/actions"
import { useAuth } from "../../context/AuthContext"
import { isPlatformRole } from "../../config/roles"
import TotalStats from "./stats/totalStats"
import TotalSuperAdminStats from "./SuperAdmin/totalSuperAdminStats"

const breadcrumbItems = [
  { title: "Mpod", link: "#" },
  { title: "Dashboard", link: "#" },
]

const Dashboard = props => {
  const { user } = useAuth()
  const { setBreadcrumbItems: setBreadcrumbs } = props

  useEffect(() => {
    document.title = "Dashboard | Mpod"
    setBreadcrumbs("Dashboard", breadcrumbItems)
  }, [setBreadcrumbs])

  if (!user) return null

  return (
    <React.Fragment>
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <h2 className="mb-0">Welcome! {user.organization}</h2>
        {user.role === "tenantadmin" && user.t_id && (
          <div>
            <Link to={`/tenant-credits/${user.t_id}`} className="btn btn-outline-primary me-2">
              Credit history
            </Link>
            <Link to="/kiosk-devices" className="btn btn-outline-secondary">
              Kiosk devices
            </Link>
          </div>
        )}
      </div>
      {isPlatformRole(user.role) ? (
        <Row>
          <TotalSuperAdminStats />
        </Row>
      ) : (
        <Row>
          <Col xl="12">
            <TotalStats tenant={user.t_id} />
          </Col>
        </Row>
      )}
    </React.Fragment>
  )
}

Dashboard.propTypes = {
  setBreadcrumbItems: PropTypes.func,
}

export default connect(null, { setBreadcrumbItems })(Dashboard)
