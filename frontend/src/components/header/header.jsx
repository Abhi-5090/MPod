import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import menus from "../../pages/menu";
import DarkMode from "./DarkMode";
import Button from "../button/button-st1";
import "./styles.scss";
import logo from "../../assets/images/logo/mayalogo.png";
import axiosInstance from "../../api/axiosInstance";

const Header = () => {
  const navigate = useNavigate();
  const [scroll, setScroll] = useState(false);
  const [user, setUser] = useState(null);
  const currentPath = window.location.pathname;

  const shouldSkipUserLogic = currentPath.endsWith("/home-2") || currentPath.includes("/report") ||currentPath.includes("/coding-report")|| currentPath.endsWith("/forgot-password");

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [menuActive, setMenuActive] = useState(null);

  const handleMenuActive = () => {
    setMenuActive(!menuActive);
  };

  useEffect(() => {
    if (!currentPath.endsWith("/login") && !shouldSkipUserLogic) {
      fetchCurrentUserData();
    }
  }, []);

  const fetchCurrentUserData = async () => {
    try {
      const response = await axiosInstance.get("/get-currentUser");
      console.log("User data fetched:", response.data);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.get(`/logout/${user?.roll_no}/user`);
      console.log("User logged out successfully");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
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
                      <img src={logo} style={{ width: "206px", height: "104px" }} alt="Icoland" />
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
