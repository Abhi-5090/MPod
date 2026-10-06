import PropTypes from "prop-types"
import React, { useCallback, useEffect, useRef, useState } from "react"

// //Import Scrollbar
import SimpleBar from "simplebar-react"

// MetisMenu
import MetisMenu from "metismenujs"
import withRouter from "components/Common/withRouter"
import { Link } from "react-router-dom"
import axios from "axios";

//i18n
import { withTranslation } from "react-i18next"
import axiosInstance from "../../api/axiosInstance";

const SidebarContent = props => {
  const ref = useRef();
  const [user, setUser] = useState(null)
  const [batches, setBatches] = useState();
  const [flag, setFlag] = useState(false)
  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);
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

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.lenght && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = process.env.PUBLIC_URL + props.router.location.pathname;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [props.router.location.pathname, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  }, []);

  useEffect(() => {
    if (user)
      new MetisMenu("#side-menu");
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }
  return (
    <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}>
        <div id="sidebar-menu">

          <ul className="metismenu list-unstyled" id="side-menu">
            {user && user.role == 'placementadmin' && (
              <>
               <li className="menu-title">{props.t("Interview")}</li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/interview.png" style={{ height: "18px" }} /></i>
                    <span>{props.t("Interviews")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/ai-interviews-list">{props.t("Interviews List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>
                  </ul>
                </li>
              </>
            )}
            {user && user.role == 'admin' && (
              <>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">

                    <i><img src="./dashboard-icons/dashboard.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Dashboard")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/dashboard">{props.t("Dashboard")}</Link>
                    </li>
                  </ul>
                </li>

                <li className="menu-title">{props.t("Users")}</li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">

                    <i><img src="./dashboard-icons/users.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Tenants")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/tenants-list">{props.t("Tenants List")}</Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">

                    <i><img src="./dashboard-icons/users.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Users")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/users-list">{props.t("Users List")}</Link>
                      {/* <Link to="/add-student">{props.t("Add Student")}</Link> */}
                      {/* <Link to="/update-mobile">{props.t("Update Mobile")}</Link> */}
                      <Link to="/users-profile-pics-list">{props.t("Update Profile pics")}</Link>

                    </li>
                  </ul>
                </li>

                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/student.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Student Explore")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/student-explore">{props.t("Explore")}</Link>
                    </li>
                  </ul>
                </li> */}

                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/block.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Drop/Block")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/user-status">{props.t("Drop/Block User")}</Link>
                    </li>
                  </ul>
                </li> */}

                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/permission.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Permissions")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/permissions-list">{props.t("Permission List")}</Link>
                    </li>


                  </ul>
                </li> */}

                <li className="menu-title">{props.t("Programee")}</li>
                {/* 
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/programmes.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Programmes")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/courses-list">{props.t("Programmes List")}</Link>
                    </li>


                  </ul>
                </li> */}
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/technologies.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Technologies")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/technologies-list">{props.t("Technologies List")}</Link>
                    </li>


                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/modules.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Modules")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/modules-list">{props.t("Modules List")}</Link>
                    </li>


                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/Topics.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Topics")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/topics-list">{props.t("Topics List")}</Link>
                    </li>
                    {/* <li>
                      <Link to="/total-topics-report">{props.t("Topics Report")}</Link>
                    </li> */}

                  </ul>
                </li>
                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/batch.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Batches")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/batches-list">{props.t("Batches List")}</Link>
                    </li>

                    <li>
                      <Link to="/find-student-batch">{props.t("Find Student In Batch")}</Link>
                    </li>

                    <li>
                      <Link to="/remove-multiple-users-batch">{props.t("Remove Bulk users")}</Link>
                    </li>

                  </ul>
                </li>

                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/session.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Sessions")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/sessions-list">{props.t("Sessions List")}</Link>
                      <Link to="/sessions-status">{props.t("Sessions Status")}</Link>
                    </li>
                  </ul>
                </li>


                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/attendance.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Attendance")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/attendance">{props.t("Attendance List")}</Link>
                    </li>
                    <li>
                      <Link to="/upload-attendance">{props.t("Upload Attendance")}</Link>
                    </li>
                    <li>
                      <Link to="/batch-wise-attendance">{props.t("Batch wise Attendance")}</Link>
                    </li>
                  </ul>
                </li>


                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/assessment.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Assessments")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/assessment-questions-list">{props.t("Assessment Questions")}</Link>
                    </li>
                    <li>
                      <Link to="/assessment-questions-report">{props.t("Assessment Questions Report")}</Link>
                    </li>
                    <li>
                      <Link to="/assessments-list">{props.t("Assessments List")}</Link>
                    </li>
                    <li>
                      <Link to="/assessments-report">{props.t("Assessments Report")}</Link>
                    </li>
                    <li>
                      <Link to="/student-assessments-report">{props.t("Students Assessments Report")}</Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/activities.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Activities")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/activities-list">{props.t("Activities List")}</Link>
                    </li>
                    <li>
                      <Link to="/submitted-activities-list">{props.t("Submitted Activities")}</Link>
                    </li>
                    <li>
                      <Link to="/activities-report">{props.t("Activities Report")}</Link>
                    </li>
                  </ul>
                </li> */}
                <li className="menu-title">{props.t("Interview")}</li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/interview.png" style={{ height: "18px" }} /></i>
                    <span>{props.t("Interviews")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/ai-interviews-list">{props.t("Interviews List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>

                    <li>
                      <Link to="/company-interviews-list">{props.t("Company Interviews List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>

                    <li>
                      <Link to="/coding-interviews-list">{props.t("Coding Interviews List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/interview.png" style={{ height: "18px" }} /></i>
                    <span>{props.t("Company Questions")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/companies-questions-list">{props.t("Company Questions List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/coding questions.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Coding Questions")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/coding-questions-list">{props.t("Coding Questions List")}</Link>
                    </li>


                  </ul>
                </li>
                {/*
                <li className="menu-title">{props.t("Coding")}</li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/problems.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Problems")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/problems-list">{props.t("Problems List")}</Link>
                      <Link to="/map-problem">{props.t("Map Problem")}</Link>
                    </li>
                  </ul>
                </li>


                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/tags.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Mandatory Tags")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/coding-madatory-tags-list">{props.t("Coding Mandatory Tags List")}</Link>
                    </li>


                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/tests.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Mandatory Tests")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/coding-mandatory-tests-list">{props.t("Mandatory Test List")}</Link>
                    </li>
                    <li>
                      <Link to="/coding-mandatory-tests-reports">{props.t("Mandatory Tests Reports")}</Link>
                    </li>

                  </ul>
                </li>

                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/coding questions.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Coding Questions")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/coding-questions-list">{props.t("Coding Questions List")}</Link>
                    </li>


                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/coding tests.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Coding Tests")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/badge-test-list">{props.t("Badge Test List")}</Link>
                    </li>
                    <li>
                      <Link to="/contest-test-list">{props.t("Contest List")}</Link>
                    </li>
                    <li>
                      <Link to="/coding-reports">{props.t("Coding Reports")}</Link>
                    </li>
                    <li>
                      <Link to="/coding-contest-reports">{props.t("Contest Reports")}</Link>
                    </li>
                  </ul>
                </li> */}

                {/* start to upload coding profile data */}
                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/coding profiles.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Coding Profiles")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/upload-coding-profile-data">{props.t("Upload Profiles")}</Link>
                    </li>
                  </ul>
                </li> */}
                {/* end to upload coding profile data */}

                {/* <li className="menu-title">{props.t("APT Logic")}</li> */}


                {/* APT Logic Questions Tab (Upload and Questions List) */}
                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    
                    <i><img src="./dashboard-icons/apt logic questions.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("APT-Logic Questions")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/upload-aptitude-questions">{props.t("Upload APT-Logic Questions")}</Link>
                    </li>
                    <li>
                      <Link to="/aptitude-questions">{props.t("Aptitude Questions List")}</Link>
                      <Link to="/reasoning-questions">{props.t("Reasoning Questions List")}</Link>
                      <Link to="/verbal-questions">{props.t("Verbal Questions List")}</Link>
                    </li>
                  </ul>
                </li> */}

                {/* APT Logic Test Tab */}
                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    
                    <i><img src="./dashboard-icons/tests.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Practise Tests")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/aptitude-tests-list">{props.t("Aptitude Tests List")}</Link>
                    </li>
                    <li>
                      <Link to="/reasoning-tests-list">{props.t("Reasoning Tests List")}</Link>
                    </li>
                    <li>
                      <Link to="/verbal-tests-list">{props.t("Verbal Tests List")}</Link>
                    </li>
                    <li>
                      <Link to="/practise-test-reports">{props.t("Reports")}</Link>
                    </li>
                  </ul>
                </li> */}

                {/* APT Logic Test Tab */}
                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    
                    <i><img src="./dashboard-icons/tests.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Mandatory Tests")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/aptitude-mandatory-tests">{props.t("Aptitude Tests List")}</Link>
                    </li>
                    <li>
                      <Link to="/reasoning-mandatory-tests">{props.t("Reasoning Tests List")}</Link>
                    </li>
                    <li>
                      <Link to="/verbal-mandatory-tests">{props.t("Verbal Tests List")}</Link>
                    </li>

                    <li>
                      <Link to="/DriverReady2026">{props.t("Driveready List")}</Link>
                    </li>

                  </ul>
                </li> */}

                {/* APT Logic Test Tab */}
                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    
                    <i><img src="./dashboard-icons/tests.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Mandatory stats")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/DriverReady2026">{props.t("Driveready List")}</Link>
                    </li>

                  </ul>
                </li> */}

                {/* APT Logic Test Tab */}
                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    
                    <i><img src="./dashboard-icons/tests.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Badge Tests")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/aptlogic-badgetests-list">{props.t("Badge Tests List")}</Link>
                    </li>
                  </ul>
                </li> */}


                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i className="mdi mdi-google-maps"></i>
                    <span>{props.t("Trainer Feedback")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/trainer-feedback">{props.t("TrainerFeedback List")}</Link>
                    </li>


                  </ul>
                </li> */}

                <li className="menu-title">{props.t("Others")}</li>


                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    
                    <i><img src="./dashboard-icons/tests.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Placements")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/companycards">{props.t("CompanyCard List")}</Link>
                    </li>
                    <li>
                      <Link to="/companyInfo">{props.t("Companies Info")}</Link>
                    </li>

                  </ul>
                </li> */}

                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    
                    <i><img src="./dashboard-icons/tests.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Certifications")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/certifications-list">{props.t("Certifications List")}</Link>
                    </li>
                  </ul>
                </li> */}





                {/* 
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    
                    <i><img src="./dashboard-icons/tags.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Tags")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/tags-list">{props.t("Tags List")}</Link>
                    </li>


                  </ul>
                </li> 
                */}
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/interview.png" style={{ height: "18px" }} /></i>
                    <span>{props.t("Interview Questions")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/interview-questions-list">{props.t("Interview Questions List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">

                    <i><img src="./dashboard-icons/tests.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Companies")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/companies-list">{props.t("Companies List")}</Link>
                    </li>


                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">

                    <i><img src="./dashboard-icons/tags.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Tags")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/tags-list">{props.t("Tags List")}</Link>
                    </li>


                  </ul>
                </li>

                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i className="mdi mdi-google-maps"></i>
                    <span>{props.t("Driveready Heatmap")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/update-seat-venue">{props.t("Update Seating Postion")}</Link>
                    </li>
                    <li>
                      <Link to="/hall-2-2">AWS Devops (Hall 2-2)</Link>
                    </li>
                    <li>
                      <Link to="/hall-3-1">VLSI (Hall 3-1)</Link>
                    </li>
                    <li>
                      <Link to="/hall-3-2">Google Flutter (Hall 3-2)</Link>
                    </li>
                    <li>
                      <Link to="/hall-3-3">Data Analytics (Hall 3-3)</Link>
                    </li>
                    <li>
                      <Link to="/hall-3-4">Cloud 3 With DevOps (Hall 3-4)</Link>
                    </li>
                    <li>
                      <Link to="/hall-3-5">Salesforce (Hall 3-5)</Link>
                    </li>
                    <li>
                      <Link to="/hall-4-1">AWS Development (Hall 4-1)</Link>
                    </li>
                    <li>
                      <Link to="/hall-5-1-island-1">Generative AI (Island-1)</Link>
                    </li>
                    <li>
                      <Link to="/hall-5-1-island-2">Cybersecurity (Island-2)</Link>
                    </li>
                    <li>
                      <Link to="/hall-5-1-island-3">Oracle APEX (Island-3)</Link>
                    </li>
                    <li>
                      <Link to="/hall-5-1-island-4">UI/Ux (Island-4)</Link>
                    </li>
                    <li>
                      <Link to="/hall-5-1-island-5">PEGA (Island-5)</Link>
                    </li>
                    <li>
                      <Link to="/hall-4-2">FSD with React Native (Hall 4-2)</Link>
                    </li>
                  </ul>
                </li> */}

                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    
                    <i className="mdi mdi-google-maps"></i>
                    <span>{props.t("FRS Devices")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/frs-devices-list">{props.t("Devices List")}</Link>
                    </li>


                  </ul>
                </li> */}


                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i className="mdi mdi-google-maps"></i>
                    <span>{props.t("Hoot")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/Hoot-Dashboard">{props.t("Dashboard")}</Link>
                    </li>
                    <li>
                      <Link to="/paragraphs-list">{props.t("Reading Paragraph List")}</Link>
                    </li>
                    <li>
                      <Link to="/story-retellings-list">{props.t("Story Retellings List")}</Link>
                    </li>
                    <li>
                      <Link to="/listenandRepeat-list">{props.t("Listen & Repeat List")}</Link>
                    </li>
                    <li>
                      <Link to="/questionnaire-list">{props.t("Questionnaire List")}</Link>
                    </li>
                    <li>
                      <Link to="/landA-list">{props.t("Listen & Answer List")}</Link>
                    </li>
                    <li>
                      <Link to="/SpeakOut-list">{props.t("Speak out list")}</Link>
                    </li>
                  </ul>
                </li> */}



                {/* <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i className="mdi mdi-google-maps"></i>
                    <span>{props.t("Maya Ai")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/ai-interviews-list">{props.t("Interviews List")}</Link>
                    </li>
                  </ul>
                </li> */}
              </>
            )}
            {user && user.role == 'tenantadmin' && (
              <>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">

                    <i><img src="./dashboard-icons/dashboard.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Dashboard")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/dashboard">{props.t("Dashboard")}</Link>
                    </li>
                  </ul>
                </li>

                <li className="menu-title">{props.t("Users")}</li>

                <li>
                  <Link to="/#" className="has-arrow waves-effect">

                    <i><img src="./dashboard-icons/users.svg" style={{ height: "18px" }} /></i>
                    <span>{props.t("Users")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/users-list">{props.t("Users List")}</Link>
                      {/* <Link to="/add-student">{props.t("Add Student")}</Link> */}
                      {/* <Link to="/update-mobile">{props.t("Update Mobile")}</Link> */}
                      <Link to="/users-profile-pics-list">{props.t("Update Profile pics")}</Link>

                    </li>
                  </ul>
                </li>

                <li className="menu-title">{props.t("Interview")}</li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/interview.png" style={{ height: "18px" }} /></i>
                    <span>{props.t("Interviews")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/ai-interviews-list">{props.t("Interviews List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>

                    <li>
                      <Link to="/company-interviews-list">{props.t("Company Interviews List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>

                    <li>
                      <Link to="/coding-interviews-list">{props.t("Coding Interviews List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>
                  </ul>
                </li>

              </>
            )}
            {user && user.role == 'trainer' && (
              <>

                <li className="menu-title">{props.t("Interview")}</li>
                <li>
                  <Link to="/#" className="has-arrow waves-effect">
                    <i><img src="./dashboard-icons/interview.png" style={{ height: "18px" }} /></i>
                    <span>{props.t("Interviews")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/ai-interviews-list">{props.t("Interviews List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>

                    <li>
                      <Link to="/company-interviews-list">{props.t("Company Interviews List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>

                    <li>
                      <Link to="/coding-interviews-list">{props.t("Coding Interviews List")}</Link>
                      {/* <Link to="/map-problem">{props.t("Map Problem")}</Link> */}
                    </li>
                  </ul>
                </li>

              </>
            )}
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  )
}

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
}

export default withRouter(withTranslation()(SidebarContent))
