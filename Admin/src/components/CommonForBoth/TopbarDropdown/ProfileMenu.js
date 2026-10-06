import React, { useState, useEffect } from "react"
import PropTypes from 'prop-types'
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap"

//i18n
import { withTranslation } from "react-i18next"
// Redux
import { connect } from "react-redux"
import { Link } from "react-router-dom";
import withRouter from "components/Common/withRouter"
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
// users
import user1 from "../../../assets/images/users/user-1.jpg"

const ProfileMenu = props => {
  const imgURL = process.env.REACT_APP_BACKEND_IMAGE_URL;
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const [menu, setMenu] = useState(false)
  const backendImageUrl = process.env.REACT_APP_BACKEND_IMAGE_URL;

  const handleLogoutClick = () => {
    navigate('/logout');
  };
  useEffect(() => {
    fetchCurrentUserData();
  }, []);

  const fetchCurrentUserData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_MPOD_BACKEND_URL;

      const response = await axios.get(backendUrl + "get-admin-current-user");
      console.log(response.data)
      setUser(response.data);
    } catch (error) {
      console.log(error)

      // navigate('/login');
      console.error("Error fetching user data", error);
    }
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item waves-effect"
          id="page-header-user-dropdown"
          tag="button"
        >
          {/* <img
            className="rounded-circle header-profile-user"
            src={user && imgURL + "profile-pics/" + user.profile_pic}
            alt="Header Avatar"
          /> */}
           <img
          src={`${backendImageUrl}profile-pics/${user&&user.roll_no}.png`}
           className="rounded-circle header-profile-user"
          alt="Profile Icon"
          width="30px"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${backendImageUrl}profile-pics/default.png`;
          }}
        />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          {/* <DropdownItem tag="a" href="#">
            {" "}
            <i className="mdi mdi-account-circle font-size-17 text-muted align-middle me-1"/>
            {props.t("Profile")}{" "}
          </DropdownItem> */}
          {/* <DropdownItem tag="a" href="#">
            <i className="mdi mdi-wallet font-size-17 text-muted align-middle me-1"/>
            {props.t("My Wallet")}
          </DropdownItem> */}
          {/* <DropdownItem className="d-flex align-items-center" to="#">
            <i className="mdi mdi-cog font-size-17 text-muted align-middle me-1"></i>
            {props.t("Settings")}<span className="badge bg-success ms-auto">11</span></DropdownItem> */}
          {/* <DropdownItem tag="a" href="auth-lock-screen">
            <i className="mdi mdi-lock-open-outline font-size-17 text-muted align-middle me-1"/>
            {props.t("Lock screen")}
          </DropdownItem> */}
          <DropdownItem tag="a" href="auth-lock-screen">
            {user&&user.first_name}
          </DropdownItem>
          <div className="dropdown-divider" />
          <Link to="/logout" className="dropdown-item text-danger">
            <i className="mdi mdi-power font-size-17 text-muted align-middle me-1 text-danger" />

            <span onClick={handleLogoutClick}>Logout</span>

          </Link>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  )
}

ProfileMenu.propTypes = {
  success: PropTypes.any,
  t: PropTypes.any
}

const mapStatetoProps = state => {
  const { error, success } = state.Profile
  return { error, success }
}

export default withRouter(
  connect(mapStatetoProps, {})(withTranslation()(ProfileMenu))
)