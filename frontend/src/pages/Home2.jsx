import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../scss/components/section.scss";
import Header from "../components/header/header.jsx";
import InterviewFlow from "../components/interview/InterviewFlow";
import "../components/interview/interview.css";
import api, { errorMessage, forgetAttemptTokens } from "../api/axiosInstance";

/**
 * mPod kiosk screen. Works only on a device registered to a college
 * (see /kiosk-setup). A student enters their roll number to take the
 * kiosk interview scheduled for them right now.
 */
function Home2() {
  const [device, setDevice] = useState(null);
  const [deviceState, setDeviceState] = useState("checking"); // checking | ok | unregistered | error
  const [rollNo, setRollNo] = useState("");
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    forgetAttemptTokens(); // a new student is starting on this kiosk
    api
      .get("kiosk/me", { skipAuthRedirect: true })
      .then((res) => {
        setDevice(res.data);
        setDeviceState("ok");
      })
      .catch((err) => setDeviceState(err.response && err.response.status === 401 ? "unregistered" : "error"));
  }, []);

  const lookup = async (e) => {
    e.preventDefault();
    if (!rollNo.trim()) {
      setError("Please enter your roll number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await api.post("kiosk/interview", { roll_no: rollNo.trim() }, { skipAuthRedirect: true });
      setDetails(res.data);
    } catch (err) {
      setError(errorMessage(err, "Could not find your interview."));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setDetails(null);
    setRollNo("");
    setError("");
  };

  if (details) {
    return (
      <div className="wrapper-style" id="wrapper">
        <Header />
        <InterviewFlow
          details={details}
          startSession={() =>
            api.post("kiosk/start", { interview_id: details._id, interview_type: details.interview_type }, { skipAuthRedirect: true })
          }
          onExit={reset}
        />
      </div>
    );
  }

  return (
    <div className="wrapper-style" id="wrapper">
      <Header />
      <div className="mpod-center">
        <div className="mpod-panel mpod-panel-narrow">
          <div className="mpod-panel-header">
            <h2>{deviceState === "ok" ? "ENTER YOUR ROLL NUMBER" : "mPOD KIOSK"}</h2>
          </div>
          {deviceState === "checking" && <p className="mpod-muted">Checking this kiosk...</p>}
          {deviceState === "unregistered" && (
            <>
              <p className="mpod-muted">This kiosk is not registered to a college yet.</p>
              <p className="mpod-muted">A college administrator must register it once.</p>
              <div className="mpod-actions">
                <Link className="mpod-btn mpod-btn-primary" to="/kiosk-setup">Register this kiosk</Link>
              </div>
            </>
          )}
          {deviceState === "error" && (
            <p className="mpod-warn" role="alert">Cannot reach the server. Check the network connection and reload.</p>
          )}
          {deviceState === "ok" && (
            <>
              <p className="mpod-muted">{device.organization_name} · {device.name}</p>
              <form onSubmit={lookup} style={{ display: "flex", gap: 10, marginTop: 12 }}>
                
                <input
                  id="kiosk-roll"
                  aria-label="Roll number"
                  className="mpod-input"
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="Roll number"
                  autoComplete="off"
                  autoFocus
                />
                <button className="mpod-btn mpod-btn-primary" type="submit" disabled={busy}>
                  {busy ? "..." : "Continue"}
                </button>
              </form>
              {error && <p className="mpod-warn" role="alert">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home2;
