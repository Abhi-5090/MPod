import React from "react"
import { Link } from "react-router-dom"
import { Card, CardBody } from "reactstrap"

const NotAuthorised = () => {
  document.title = "Not authorised | Mpod"
  return (
    <Card>
      <CardBody className="text-center py-5">
        <h4 className="mb-2">Not authorised</h4>
        <p className="text-muted mb-4">Your account does not have access to this page.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </CardBody>
    </Card>
  )
}

export default NotAuthorised
