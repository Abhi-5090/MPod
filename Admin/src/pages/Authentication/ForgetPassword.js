import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Alert, Button, Form, FormFeedback, Input, Label, Spinner } from "reactstrap"
import axios from "axios"

import AuthCard from "./AuthCard"
import { apiUrl } from "../../config/api"

// Three-step OTP flow:
//  1. POST send-otp       {roll_no}                       -> 200 {message} (always generic)
//  2. POST check-otp      {roll_no, otp}                  -> 200 | 400 {message}
//  3. POST reset-password {roll_no, otp, new_password}    -> 200 | 400 {message}
//  Any step may return 429 (too many attempts).
const MIN_PASSWORD = 8

const errorMessage = (error, fallback) => {
  const status = error.response && error.response.status
  const msg = error.response && error.response.data && error.response.data.message
  if (status === 429) return msg || "Too many attempts. Please wait a few minutes and try again."
  if (!error.response) return "Cannot reach the server. Please check your connection."
  return msg || fallback
}

const ForgetPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState("request") // request | verify | reset | done
  const [rollNo, setRollNo] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState(null)
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    document.title = "Forgot Password | Mpod"
  }, [])

  const run = async (fn, fallback) => {
    setError(null)
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      setError(errorMessage(err, fallback))
    } finally {
      setBusy(false)
    }
  }

  const sendOtp = e => {
    e.preventDefault()
    setTouched(true)
    if (!rollNo.trim()) return
    run(async () => {
      const res = await axios.post(apiUrl("send-otp"), { roll_no: rollNo.trim() })
      setInfo((res.data && res.data.message) || "If the account exists, an OTP has been sent.")
      setTouched(false)
      setStep("verify")
    }, "Could not send OTP. Please try again.")
  }

  const checkOtp = e => {
    e.preventDefault()
    setTouched(true)
    if (!otp.trim()) return
    run(async () => {
      const res = await axios.post(apiUrl("check-otp"), { roll_no: rollNo.trim(), otp: otp.trim() })
      setInfo((res.data && res.data.message) || "OTP verified. Choose a new password.")
      setTouched(false)
      setStep("reset")
    }, "Invalid or expired OTP.")
  }

  const passwordError =
    password.length < MIN_PASSWORD
      ? `Password must be at least ${MIN_PASSWORD} characters.`
      : password !== confirm
        ? "Passwords do not match."
        : null

  const resetPassword = e => {
    e.preventDefault()
    setTouched(true)
    if (passwordError) return
    run(async () => {
      const res = await axios.post(apiUrl("reset-password"), {
        roll_no: rollNo.trim(),
        otp: otp.trim(),
        new_password: password,
      })
      setInfo((res.data && res.data.message) || "Password changed. You can now log in.")
      setPassword("")
      setConfirm("")
      setStep("done")
    }, "Could not reset password.")
  }

  const resend = () => {
    run(async () => {
      const res = await axios.post(apiUrl("send-otp"), { roll_no: rollNo.trim() })
      setInfo((res.data && res.data.message) || "OTP sent again.")
    }, "Could not resend OTP.")
  }

  const startOver = () => {
    setStep("request")
    setOtp("")
    setPassword("")
    setConfirm("")
    setInfo(null)
    setError(null)
    setTouched(false)
  }

  const submitButton = label => (
    <div className="text-end">
      <Button color="primary" className="w-md" type="submit" disabled={busy}>
        {busy && <Spinner size="sm" className="me-1" />}
        {label}
      </Button>
    </div>
  )

  return (
    <AuthCard
      title="Reset Password"
      subtitle={
        step === "request"
          ? "Enter your user id and we will send you an OTP."
          : step === "verify"
            ? "Enter the OTP you received."
            : step === "reset"
              ? "Choose a new password."
              : null
      }
      footer={
        <div className="mt-4 text-center">
          <p>
            Remember it? <Link to="/login" className="text-primary">Sign in here</Link>
          </p>
        </div>
      }
    >
      {info && <Alert color="success">{info}</Alert>}
      {error && <Alert color="danger">{error}</Alert>}

      {step === "request" && (
        <Form className="mt-4" onSubmit={sendOtp}>
          <div className="mb-3">
            <Label htmlFor="roll_no">User Id</Label>
            <Input
              id="roll_no"
              value={rollNo}
              autoComplete="username"
              placeholder="Enter user id"
              onChange={e => setRollNo(e.target.value)}
              invalid={touched && !rollNo.trim()}
            />
            <FormFeedback>Please enter your user id</FormFeedback>
          </div>
          {submitButton("Send OTP")}
        </Form>
      )}

      {step === "verify" && (
        <Form className="mt-4" onSubmit={checkOtp}>
          <div className="mb-3">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              value={otp}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter OTP"
              onChange={e => setOtp(e.target.value)}
              invalid={touched && !otp.trim()}
            />
            <FormFeedback>Please enter the OTP</FormFeedback>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button color="link" className="p-0 me-3" type="button" onClick={resend} disabled={busy}>
                Resend OTP
              </Button>
              <Button color="link" className="p-0" type="button" onClick={startOver} disabled={busy}>
                Change user id
              </Button>
            </div>
            {submitButton("Verify")}
          </div>
        </Form>
      )}

      {step === "reset" && (
        <Form className="mt-4" onSubmit={resetPassword}>
          <div className="mb-3">
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              invalid={touched && password.length < MIN_PASSWORD}
            />
            <FormFeedback>Password must be at least {MIN_PASSWORD} characters.</FormFeedback>
          </div>
          <div className="mb-3">
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <Input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              invalid={touched && password.length >= MIN_PASSWORD && password !== confirm}
            />
            <FormFeedback>Passwords do not match.</FormFeedback>
          </div>
          {submitButton("Reset Password")}
        </Form>
      )}

      {step === "done" && (
        <div className="text-center mt-4">
          <Button color="primary" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      )}
    </AuthCard>
  )
}

export default ForgetPassword
