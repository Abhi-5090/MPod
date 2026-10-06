import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/header/header.jsx";
import "../components/interview/interview.css";

function NotFound() {
  return (
    <div className="wrapper-style" id="wrapper">
      <Header />
      <div className="mpod-center">
        <div className="mpod-panel mpod-panel-narrow">
          <h2 className="mpod-title">Page not found</h2>
          <p className="mpod-muted">The page you are looking for does not exist.</p>
          <div className="mpod-actions">
            <Link className="mpod-btn mpod-btn-primary" to="/dashboard">Go to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
