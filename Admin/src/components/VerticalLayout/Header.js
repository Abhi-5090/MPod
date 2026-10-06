import PropTypes from "prop-types"
import React from "react"
import { Link } from "react-router-dom"

import ProfileMenu from "../CommonForBoth/TopbarDropdown/ProfileMenu"
import logo from "../../assets/images/maya.png"

const Header = () => {
  function tToggle() {
    const body = document.body
    body.classList.toggle("vertical-collpsed")
    body.classList.toggle("sidebar-enable")
  }

  return (
    <React.Fragment>
      <header id="page-topbar">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box">
              <Link to="/dashboard" className="logo logo-dark">
                <span className="logo-sm">
                  <img src={logo} alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src={logo} alt="" height="17" />
                </span>
              </Link>

              <Link to="/dashboard" className="logo logo-light">
                <span className="logo-sm">
                  <img src={logo} alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src={logo} alt="" height="50" />
                </span>
              </Link>
            </div>

            <button
              type="button"
              onClick={tToggle}
              className="btn btn-sm px-3 font-size-24 header-item waves-effect vertical-menu-btn"
              id="vertical-menu-btn"
              aria-label="Toggle menu"
            >
              <i className="mdi mdi-menu"></i>
            </button>
          </div>
          <div className="d-flex">
            <ProfileMenu />
          </div>
        </div>
      </header>
    </React.Fragment>
  )
}

Header.propTypes = {
  toggleMenuCallback: PropTypes.func,
}

export default Header
