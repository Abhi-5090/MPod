import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import DarkMode from "./DarkMode";
import "./styles.scss";
import logo from "../../assets/images/logo/mayalogo.png";
import axiosInstance from "../../api/axiosInstance";

const NO_USER_PATHS = ["/home-2", "/kiosk-setup", "/report", "/coding-report", "/forgot-password", "/login", "/"];

const Header = () => {
  const navigate = useNavigate();
  const [scroll, setScroll] = useState(false);
  const [user, setUser] = useState(null);
  const currentPath = window.location.pathname;

  const shouldSkipUserLogic = NO_USER_PATHS.includes(currentPath);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!shouldSkipUserLogic) {
      fetchCurrentUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentUserData = async () => {
    try {
      const response = await axiosInstance.get("/get-currentUser");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout", { slug: "user" });
    } catch (error) {
      /* the session is cleared server-side when possible; leave anyway */
    }
    setUser(null);
    navigate("/login");
  };

  return (
    <header id="header_main" className={`header_1 js-header ${scroll ? "is-fixed" : ""}`}>
      <div className="themes-container">
        <div className="row">
          <div className="col-md-12">
            <div id="site-header-inner">
              <div
                className="wrap-box flex"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div id="site-logo" style={{ height: "56px" }} className="clearfix">
                  <div id="site-logo-inner" style={{ marginTop: "45px" }}>
                    <NavLink to="/" className="main-logo">
                      <img src={logo} style={{ width: "206px", height: "104px" }} alt="mPod" />
                    </NavLink>
                  </div>
                </div>

                {/* Logout button condition */}
                {user?.roll_no && !shouldSkipUserLogic && (
                  <button
                    style={{ padding: "7px", background: "#008738", border: "none", color: "white" }}
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DarkMode />
    </header>
  );
};

export default Header;
