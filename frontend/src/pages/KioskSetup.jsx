import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../scss/components/section.scss";
import Header from "../components/header/header.jsx";
import "../components/interview/interview.css";
import api, { errorMessage } from "../api/axiosInstance";

/**
 * One-time registration of a physical mPod kiosk. A college admin signs in here
 * on the kiosk itself; the device then receives a long-lived, httpOnly device
 * cookie bound to that college. Admins can revoke kiosks from the admin portal.
 */
function KioskSetup() {
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ roll_no: "", password: "", device_name: "", tenant_id: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("kiosk/me", { skipAuthRedirect: true }).then((r) => setCurrent(r.data)).catch(() => setCurrent(null));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = { roll_no: form.roll_no.trim(), password: form.password, device_name: form.device_name.trim() };
      if (form.tenant_id.trim()) body.tenant_id = form.tenant_id.trim();
      const res = await api.post("kiosk/register", body, { skipAuthRedirect: true });
      setDone(res.data.device);
      setForm({ roll_no: "", password: "", device_name: "", tenant_id: "" });
    } catch (err) {
      setError(errorMessage(err, "Registration failed."));
    } finally {
      setBusy(false);
    }
  };

  const unregister = async () => {
    if (!window.confirm("Unregister this kiosk? Students will not be able to use it until it is registered again.")) return;
    try {
      await api.post("kiosk/unregister", {}, { skipAuthRedirect: true });
      setCurrent(null);
      setDone(null);
    } catch (err) {
      setError(errorMessage(err, "Could not unregister this kiosk."));
    }
  };

  return (
    <div className="wrapper-style" id="wrapper">
      <Header />
      <div className="mpod-center">
        <div className="mpod-panel mpod-panel-narrow">
          <div className="mpod-panel-header">
            <h2>REGISTER THIS KIOSK</h2>
          </div>
          {done ? (
            <>
              <p>Kiosk <strong>{done.name}</strong> is now registered to <strong>{done.organization_name}</strong>.</p>
              <div className="mpod-actions">
                <Link className="mpod-btn mpod-btn-primary" to="/home-2">Open the kiosk screen</Link>
              </div>
            </>
          ) : (
            <>
              {current && (
                <p className="mpod-muted">
                  Currently registered as <strong>{current.name}</strong> ({current.organization_name}).{" "}
                  <button type="button" className="mpod-btn" onClick={unregister}>Unregister</button>
                </p>
              )}
              <p className="mpod-muted">Sign in with a college admin account. Your password is not stored on this device.</p>
              <form onSubmit={submit}>
                <div className="mpod-field">
                  <label htmlFor="ks-name">Kiosk name (e.g. "CSE Block Lab 2")</label>
                  <input id="ks-name" className="mpod-input" value={form.device_name} onChange={set("device_name")} maxLength={100} required />
                </div>
                <div className="mpod-field">
                  <label htmlFor="ks-roll">Admin user id</label>
                  <input id="ks-roll" className="mpod-input" value={form.roll_no} onChange={set("roll_no")} autoComplete="username" required />
                </div>
                <div className="mpod-field">
                  <label htmlFor="ks-pass">Password</label>
                  <input id="ks-pass" className="mpod-input" type="password" value={form.password} onChange={set("password")} autoComplete="current-password" required />
                </div>
                <div className="mpod-field">
                  <label htmlFor="ks-tenant">College id (platform admins only, optional)</label>
                  <input id="ks-tenant" className="mpod-input" value={form.tenant_id} onChange={set("tenant_id")} />
                </div>
                {error && <p className="mpod-warn" role="alert">{error}</p>}
                <div className="mpod-actions">
                  <button className="mpod-btn mpod-btn-primary" type="submit" disabled={busy}>
                    {busy ? "Registering..." : "Register kiosk"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default KioskSetup;
