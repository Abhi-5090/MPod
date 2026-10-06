import React, { useEffect, useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { Alert, Button, Form, FormFeedback, Input, Label, Spinner } from "reactstrap"
import * as Yup from "yup"
import { useFormik } from "formik"
import axios from "axios"

import AuthCard from "./AuthCard"
import { apiUrl } from "../../config/api"
import { useAuth } from "../../context/AuthContext"

const messageForError = error => {
  const status = error.response && error.response.status
  const serverMessage = error.response && error.response.data && error.response.data.message
  if (status === 400 || status === 401) return serverMessage || "Invalid user id or password."
  if (status === 403) return serverMessage || "This account is not a staff account."
  if (status === 429) return serverMessage || "Too many login attempts. Please wait a few minutes and try again."
  if (!error.response) return "Cannot reach the server. Please check your connection."
  return serverMessage || "Login failed. Please try again."
}

// Only same-app relative paths are allowed as redirect targets (no "//host" or absolute URLs).
const safeRedirectPath = value =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") &&
  value.split("?")[0] !== "/login"
    ? value
    : null

// Where to go after login: ?next=<path> (set by the 401 interceptor) or state.from (set by the route guard).
const redirectTarget = location => {
  const next = new URLSearchParams(location.search).get("next")
  return safeRedirectPath(next) || safeRedirectPath(location.state && location.state.from) || "/dashboard"
}

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, refresh } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = "Login | Mpod"
  }, [])

  const validation = useFormik({
    initialValues: { roll_no: "", password: "" },
    validationSchema: Yup.object({
      roll_no: Yup.string().trim().required("Please enter your user id"),
      password: Yup.string().required("Please enter your password"),
    }),
    onSubmit: async values => {
      setError(null)
      try {
        await axios.post(
          apiUrl("admin-login"),
          { roll_no: values.roll_no.trim(), password: values.password },
          { withCredentials: true }
        )
        const current = await refresh()
        if (!current) {
          setError("Logged in, but the session could not be loaded. Please check that cookies are enabled.")
          return
        }
        navigate(redirectTarget(location), { replace: true })
      } catch (err) {
        setError(messageForError(err))
      }
    },
  })

  // Already signed in (valid cookie) -> go straight to the requested page (or the dashboard).
  if (!loading && user && !validation.isSubmitting) {
    return <Navigate to={redirectTarget(location)} replace />
  }

  return (
    <AuthCard title="Welcome Back!" subtitle="Sign in to continue to Mpod.">
      <Form
        className="form-horizontal mt-4"
        onSubmit={e => {
          e.preventDefault()
          validation.handleSubmit()
        }}
      >
        {error && <Alert color="danger">{error}</Alert>}

        <div className="mb-3">
          <Label htmlFor="roll_no">User Id</Label>
          <Input
            id="roll_no"
            name="roll_no"
            placeholder="Enter user id"
            type="text"
            autoComplete="username"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.roll_no}
            invalid={validation.touched.roll_no && !!validation.errors.roll_no}
          />
          <FormFeedback>{validation.errors.roll_no}</FormFeedback>
        </div>

        <div className="mb-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.password}
            invalid={validation.touched.password && !!validation.errors.password}
          />
          <FormFeedback>{validation.errors.password}</FormFeedback>
        </div>

        <div className="mb-3 mt-4 text-end">
          <Button color="primary" className="w-md" type="submit" disabled={validation.isSubmitting}>
            {validation.isSubmitting && <Spinner size="sm" className="me-1" />}
            Log In
          </Button>
        </div>

        <div className="mb-0">
          <Link to="/forgot-password" className="text-muted">
            <i className="mdi mdi-lock"></i> Forgot your password?
          </Link>
        </div>
      </Form>
    </AuthCard>
  )
}

export default Login
