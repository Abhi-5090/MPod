import React from "react"
import { Link } from "react-router-dom"
import { Container } from "reactstrap"

const NotFound = () => {
  document.title = "Page not found | Mpod"
  return (
    <div className="account-pages my-5 pt-sm-5">
      <Container className="text-center">
        <h1 className="display-4">404</h1>
        <h4 className="mb-4">Sorry, page not found</h4>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </Container>
    </div>
  )
}

export default NotFound
