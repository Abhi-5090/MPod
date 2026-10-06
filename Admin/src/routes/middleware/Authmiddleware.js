import React from "react"
import PropTypes from "prop-types"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import PageLoader from "../../components/Common/PageLoader"
import NotAuthorised from "../../pages/Errors/NotAuthorised"

// Guards authenticated routes.
// - waits for the session check (GET get-admin-current-user)
// - no session -> redirect to /login
// - `roles` given and user's role not in it -> "Not authorised" page
const Authmiddleware = ({ roles, children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (roles && !roles.includes(user.role)) return <NotAuthorised />

  return <React.Fragment>{children}</React.Fragment>
}

Authmiddleware.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node,
}

export default Authmiddleware
