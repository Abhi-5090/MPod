import React from "react"
import { Spinner } from "reactstrap"

const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
    <Spinner color="primary" />
  </div>
)

export default PageLoader
