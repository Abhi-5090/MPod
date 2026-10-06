import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../scss/components/section.scss";
import Header from "../components/header/header.jsx";
import api, { errorMessage } from "../api/axiosInstance";

function Login() {
  const navigate = useNavigate();
  const [roll_no, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const attempt = (confirmLogout) =>
    api.post("login", { roll_no: roll_no.trim(), password, confirmLogout }, { skipAuthRedirect: true });

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await attempt(false);
      navigate("/dashboard");
    } catch (err) {
      const res = err.response;
      if (res && res.status === 403 && res.data && res.data.code === "SESSION_ACTIVE") {
        // The server asks before ending the student's other session.
        if (window.confirm(res.data.message)) {
          try {
            await attempt(true);
            navigate("/dashboard");
            return;
          } catch (err2) {
            setError(errorMessage(err2, "Login failed. Please try again."));
          }
        }
      } else {
        setError(errorMessage(err, "Login failed. Please try again."));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrapper-style" id="wrapper">
      <Header />
      <div className="tf-section flat-login flat-auctions-details" style={{ marginTop: "50px", minHeight: "100svh" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="wrap-login">
                <div className="box-login post justify-content-center">
                  <div className="heading-login">
                    <h2 className="fw-5">Sign in</h2>
                  </div>
                  <form id="contactform" onSubmit={handleLogin} noValidate>
                    <div className="form-login flat-form flex-one">
                      <div className="info-login">
                        <fieldset>
                          <label htmlFor="roll_no" className="title-infor-account">Roll Number / Interviewee Id</label>
                          <input
                            id="roll_no"
                            type="text"
                            name="roll_no"
                            autoComplete="username"
                            value={roll_no}
                            onChange={(e) => setRollNo(e.target.value)}
                            placeholder="Enter your id"
                            required
                          />
                        </fieldset>
                        <fieldset className="style-pass">
                          <label htmlFor="password" className="title-infor-account">Password</label>
                          <input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </fieldset>
                        {error && (
                          <p role="alert" style={{ color: "#ff8a8a", marginBottom: 12 }}>
                            {error}
                          </p>
                        )}
                        <div className="row-form style-1 flex-two">
                          <Link to="/forgot-password" className="forgot-pass text-p">Forgot Password?</Link>
                        </div>
                        <button className="submit button-login" type="submit" disabled={busy || !roll_no || !password}>
                          {busy ? "Signing in..." : "Sign in"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
