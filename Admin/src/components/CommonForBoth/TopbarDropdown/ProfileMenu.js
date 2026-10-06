import React, { useState } from "react"
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap"
import { Link } from "react-router-dom"

import { useAuth } from "../../../context/AuthContext"
import { IMAGE_BASE } from "../../../config/api"

const ProfileMenu = () => {
  const { user } = useAuth()
  const [menu, setMenu] = useState(false)

  return (
    <React.Fragment>
      <Dropdown isOpen={menu} toggle={() => setMenu(!menu)} className="d-inline-block">
        <DropdownToggle className="btn header-item waves-effect" id="page-header-user-dropdown" tag="button">
          <img
            src={`${IMAGE_BASE}profile-pics/${user ? encodeURIComponent(user.roll_no) : "default"}.png`}
            className="rounded-circle header-profile-user"
            alt="Profile"
            width="30px"
            onError={e => {
              e.target.onerror = null
              e.target.src = `${IMAGE_BASE}profile-pics/default.png`
            }}
          />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem header>
            <div className="fw-semibold text-body">{user && user.first_name}</div>
            <div className="small text-muted">
              {user && user.role}
              {user && user.organization ? ` · ${user.organization}` : ""}
            </div>
          </DropdownItem>
          <div className="dropdown-divider" />
          <Link to="/logout" className="dropdown-item text-danger">
            <i className="mdi mdi-power font-size-17 align-middle me-1 text-danger" />
            <span>Logout</span>
          </Link>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  )
}

export default ProfileMenu
