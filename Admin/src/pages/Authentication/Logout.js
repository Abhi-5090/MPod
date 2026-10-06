import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import PageLoader from "../../components/Common/PageLoader"

// POST logout {slug:'admin'} (clears the adminSessionToken cookie), then go to /login.
const Logout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    logout().finally(() => {
      if (!cancelled) navigate("/login", { replace: true })
    })
    return () => {
      cancelled = true
    }
  }, [logout, navigate])

  return <PageLoader />
}

export default Logout
