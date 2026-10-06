import React from "react"
import { Navigate } from "react-router-dom"

// Profile
import UserProfile from "../pages/Authentication/user-profile"

// Pages Calendar
import Calendar from "../pages/Calendar/index"

//Email
import EmailInbox from "../pages/Email/email-inbox"
import EmailRead from "../pages/Email/email-read"
import EmailCompose from "../pages/Email/email-compose"

// Authentication related pages
import Login from "../pages/Authentication/Login"
import Logout from "../pages/Authentication/Logout"
import Register from "../pages/Authentication/Register"
import ForgetPwd from "../pages/Authentication/ForgetPassword"

// Inner Authentication
import Login1 from "../pages/AuthenticationInner/Login"
import Register1 from "../pages/AuthenticationInner/Register"
import Recoverpw from "../pages/AuthenticationInner/Recoverpw"
import LockScreen from "../pages/AuthenticationInner/auth-lock-screen"

// Dashboard
import Dashboard from "../pages/Dashboard/index"
import APTDashboard from "../pages/AptDashboard/APTindex"
import CodingDashboard from "../pages/CodingDashBoard/CodingIndex"
import StudentProblems from "../pages/Dashboard/StudentCodingProblems/StudentProblems"
import StudentCertifications from "../pages/Dashboard/certifications-dashboard/StudentCertifications"
import CodingInActivestatus from "../pages/Dashboard/StudentCodingProblems/codingInActiveStudents"

import PrincipalCodingDashboard from "../pages/PrincipalCodingDashBoard/PrincipalCodingIndex"
import PrincipalStudentCodingproblemsList from "../pages/PrincipalCodingDashBoard/StudentProblems"
import PrincipalStudentCodinginactiveStatusList from "../pages/PrincipalCodingDashBoard/codingInActiveStudents"
import PrincipalAPTDashboard from "../pages/PrincipalAptDashboard/PrincipalAPTindex"
import ApitudeList from "../pages/PrincipalAptDashboard/StudentAptitude"
import ReasoningList from "../pages/PrincipalAptDashboard/StudentReasoning"
import VerbalList from "../pages/PrincipalAptDashboard/StudentVerbal"
import PrincipalStudentCodingRankListCollege from "../pages/PrincipalCodingDashBoard/CodingRankListByCollege"


import MandatoryTests from "../pages/MandatoryTests/MandatoryList"
import DrivereadyTests from "../pages/MandatoryTests/Driveready2026"


//Charts
import ChartsAppex from "../pages/Charts/charts-appex";
import ChartsJs from "../pages/Charts/charts-chartjs";
import ChartsKnob from "../pages/Charts/charts-knob";
import ChartsC3 from "../pages/Charts/charts-c3";
import ChartsSparkLine from "../pages/Charts/charts-sparkline";

// Maps
import MapsGoogle from "../pages/Maps/MapsGoogle"
import MapsVector from "../pages/Maps/MapsVector"

//Icons
import IconMaterialdesign from "../pages/Icons/IconMaterialdesign"
import Iconion from "../pages/Icons/Iconion"
import IconFontawesome from "../pages/Icons/IconFontawesome"
import IconThemify from "../pages/Icons/IconThemify"
import IconDripicons from "../pages/Icons/IconDripicons"
import IconTypicons from "../pages/Icons/IconTypicons"

//Tables
import BasicTables from "../pages/Tables/BasicTables"
import DatatableTables from "../pages/Tables/DatatableTables"
import ResponsiveTables from "../pages/Tables/ResponsiveTables"
import EditableTables from "../pages/Tables/EditableTables"

//FRS Devices
import AddFRSDevice from "../pages/FRSDevices/AddFRSDevice"
import FRSDevicesList from "../pages/FRSDevices/FRSDevicesList"
import EditFRSDevice from "../pages/FRSDevices/EditFRSDevice"


//Registrations
import AddRegistrations from "../pages/Registrations/AddRegistration"
import RegistrationsList from "../pages/Registrations/RegistrationsList"
import EditRegistration from "../pages/Registrations/EditRegistrations"

//Hoot
import HootDashboard from "../pages/Hoot/Hoot-Dashboard"
import ReadingParagraphsList from "../pages/Hoot/ParagraphsList"
import StoryRetellingsList from "../pages/Hoot/StoryRetellingsList"
import ListenandRepeat from "../pages/Hoot/LisenAndRepeat"
import QuestionnaireList from "../pages/Hoot/QuestionnaireList"
import LandAList from "../pages/Hoot/LandaList"
import SpeakOutList from "../pages/Hoot/speakOutList"


//Student Explore
import StudentExplore from "../pages/StudentExplore/Student-Explore"


//Users
import UsersList from "../pages/Users/UsersList"
import AddUser from "../pages/Users/AddUser"
import AddStudent from "../pages/Users/AddStudent"
import DropBlockUser from "../pages/Users/DropBlockUser"
import EditUser from "../pages/Users/EditUser"
import UsersProfilePicsList from "../pages/Users/UsersProfilePicsList"


import UpdateMobile from "../pages/Users/UploadMobile"

//Tenants
import TenantsList from "../pages/Tenants/TenantsList"
import AddTenant from "../pages/Tenants/AddTenant"
import EditTenant from "../pages/Tenants/EditTenant"

//Attendance
import AttendanceList from "../pages/Attendance/AttendanceList"
import BatchWiseAttendance from "../pages/Attendance/BatchWiseAttendance"
import UploadAttendance from "../pages/Attendance/UploadAttendance"



//update seat and hall
import UpdateSeatAndVenue from "../pages/SittingAlignment/UploadSeatVenue"

//Courses
import CoursesList from "../pages/Courses/CoursesList"
import AddCourse from "../pages/Courses/AddCourse"
import EditCourse from "../pages/Courses/EditCourse"

//Technologies
import TechnologiesList from "../pages/Technologies/TechnologiesList"
import AddTechnology from "../pages/Technologies/AddTechnology"
import EditTechnology from "../pages/Technologies/EditTechnology"

//Modules
import ModulesList from "../pages/Modules/ModulesList"
import AddModule from "../pages/Modules/AddModule"
import EditModule from "../pages/Modules/EditModule"

//Topics
import TopicsList from "../pages/Topics/TopicsList"
import AddTopic from "../pages/Topics/AddTopic"
import EditTopic from "../pages/Topics/EditTopic"
import TotalTopicReport from "../pages/Topics/TotalTopicsReport"

//Topics
import InterviewQuestionsList from "../pages/InterviewQuestions/InterviewQuestionsList"
import AddInterviewQuestion from "../pages/InterviewQuestions/AddInterviewQuestion"
import EditInterviewQuestion from "../pages/InterviewQuestions/EditInterviewQuestion"
//companies
import CompaniesQuestionsList from "../pages/CompanyQuestions/CompaniesQuestionsList"
import AddCompanyQuestion from "../pages/CompanyQuestions/AddCompanyQuestion"
import EditCompanyQuestion from "../pages/CompanyQuestions/EditCompanyQuestion"

//Batches
import BatchesList from "../pages/Batches/BatchesList"
import AddBatch from "../pages/Batches/AddBatch"
import EditBatch from "../pages/Batches/EditBatch"

import FindStudent from "../pages/Batches/FindstudentInBatch"
import RemoveMultipleUsersFrmBatch from "../pages/Batches/RemovemultipleuserBatch"

//Permissions
import PermissionsList from "../pages/Permissions/PermissionsList"
import AddPermission from "../pages/Permissions/AddPermission"
import EditPermission from "../pages/Permissions/EditPermission"


//Certifications
import CertificationsList from "../pages/Certifications/CertificationsList"
import AddCertification from "../pages/Certifications/AddCertification"
import EditCertification from "../pages/Certifications/EditCertification"

//Assessments
import AssessmentsList from "../pages/Assessments/AssessmentsList"
import AddAssessment from "../pages/Assessments/AddAssessment"
import EditAssessment from "../pages/Assessments/EditAssessment"
import AddAssessmentQuestion from "../pages/Assessments/AddAssessmentQuestion"
import AssessmentQuestionsList from "../pages/Assessments/AssessmentQuestionsList"
import EditAssessmentQuestion from "../pages/Assessments/EditAssessmentQuestion"
import AssessmentQuestionsReport from "../pages/Assessments/AssessmentQuestionsReport"
import AssessmentsReport from "../pages/Assessments/AssessmentsReport"
import StudentAssessmentsReport from "../pages/Assessments/StudentAssessmentsReport"


//Coding Badge Tests
import BadgeTestList from "../pages/CodingTests/BadgeTestList"
import AddBadgeTest from "../pages/CodingTests/AddBadgeTest"
import EditBadgeTest from "../pages/CodingTests/EditBadgeTest"
import CodingReports from "../pages/CodingTests/CodingReports"

import CodingReportsFaculty from "../pages/CodingTests/CodingReports_faculty"


//Coding Contest Tests
import ContestTestList from "../pages/CodingContests/ContestTestList"
import AddContestTest from "../pages/CodingContests/AddContestTest"
import EditContestTest from "../pages/CodingContests/EditContestTest"
import CodingContestReports from "../pages/CodingContests/CodingContestReports"


//Coding Questions
import CodingQuestionsList from "../pages/CodingQuestions/CodingQuestionsList"
import AddCodingQuestion from "../pages/CodingQuestions/AddCodingQuestion"
import EditCodingQuestion from "../pages/CodingQuestions/EditCodingQuestion"

//Aptlogic Badge Tests
import AptLogicBadgeTestsList from "../pages/AptLogicBadgeTests/BadgeTestsList"
import AddAptLogicBadgeTest from "../pages/AptLogicBadgeTests/AddBadgeTest"
import EditAptLogicBadgeTest from "../pages/AptLogicBadgeTests/EditBadgeTest"

//Aptlogic Aptitude Assessments
import AptitudeTestsList from "../pages/AptLogicAssessments/Aptitude/AptitudeTestsList"
import AddAptitudeTest from "../pages/AptLogicAssessments/Aptitude/AddAptitudeTest"
import EditAptitudeQuestions from "../pages/AptLogicAssessments/Aptitude/EditAptitudeQuestion"
import Testing from "../pages/AptLogicAssessments/Aptitude/Testing"
import UploadAptitudeQuestions from "../pages/AptLogicAssessments/Aptitude/UploadAptitudeQuestions"
import AptitudeQuestions from "../pages/AptLogicAssessments/Aptitude/AptitudeQuestions"
import AptlogicTestReports from "../pages/AptLogicAssessments/TestReports"


//Aptlogic Mandatory Assessments
import AptitudeMandatoryTests from "../pages/AptLogicMandatoryTests/Aptitude/AptitudeTestsList"
import AddMandatoryTest from "../pages/AptLogicMandatoryTests/Aptitude/AddMandatoryTest"
import EditAptitudeMandatoryTest from "../pages/AptLogicMandatoryTests/Aptitude/EditAptitudeTest"

//AptLogic Reasoning Assessments
import ReasoningTestsList from "../pages/AptLogicAssessments/Reasoning/ReasoningTestsList"
// import Testing from "../pages/AptLogicAssessments/Reasoning/Testing"
import AddReasoningTest from "../pages/AptLogicAssessments/Reasoning/AddReasoningTest"
// import EditAptLogicTest from "../pages/AptLogicAssessments/Reasoning/EditAptLogicTest"
import ReasoningQuestions from "../pages/AptLogicAssessments/Reasoning/ReasoningQuestions"
import EditReasoningQuestions from "../pages/AptLogicAssessments/Reasoning/EditReasoningQuestion"


//Aptlogic Reasoning Mandatory Assessments
import ReasoningMandatoryTests from "../pages/AptLogicMandatoryTests/Reasoning/ReasoningTestsList"
import EditReasoningMandatoryTest from "../pages/AptLogicMandatoryTests/Reasoning/EditReasoningTest"


//AptLogic Verbal Assessments
import VerbalTestsList from "../pages/AptLogicAssessments/Verbal/VerbalTestsList"
// import Testing from "../pages/AptLogicAssessments/Verbal/Testing"
import AddVerbalTest from "../pages/AptLogicAssessments/Verbal/AddVerbalTest"
// import EditAptLogicTest from "../pages/AptLogicAssessments/Verbal/EditAptLogicTest"
import VerbalQuestions from "../pages/AptLogicAssessments/Verbal/VerbalQuestions"
import EditVerbalQuestions from "../pages/AptLogicAssessments/Verbal/EditVerbalQuestion"


//Aptlogic Verbal Mandatory Assessments
import VerbalMandatoryTests from "../pages/AptLogicMandatoryTests/Verbal/VerbalTestsList"
import EditVerbalMandatoryTest from "../pages/AptLogicMandatoryTests/Verbal/EditVerbalTest"

//Activities
import ActivitiesList from "../pages/Activities/ActivitiesList"
import AddActivity from "../pages/Activities/AddActivity"
import EditActivity from "../pages/Activities/EditActivity"
import SubmittedActivitiesList from "../pages/Activities/SubmittedActivitiesList"
import ActivitiesReport from "../pages/Activities/ActivitiesReport"

//TraineFeedback

import TrainerFeedback from "../pages/TrainerFeedback/TrainerFeedbackList"


//Sessions
import SessionsList from "../pages/Sessions/SessionsList"
import AddSession from "../pages/Sessions/AddSession"
import EditSession from "../pages/Sessions/EditSession"
import SessionsDetails from "../pages/Sessions/SessionsDetails"
import SessionsStatus from "../pages/Sessions/SessionsStatus"


//Coding Profiles
import UploadCodingProfiles from "../pages/CodingProfiles/UploadCodingProfiles"

//Programs

import AddProblem from "../pages/Problems/AddProblem"
import EditProblem from "../pages/Problems/EditProblem"
import ProblemsList from "../pages/Problems/ProblemsList"
import MapProblem from "../pages/Problems/ProblemMapping"

//Tags
import TagsList from "../pages/Tags/TagsList"
import AddTag from "../pages/Tags/AddTag"
import EditTag from "../pages/Tags/EditTag"

//Tags
import CodingMandatoryTagsList from "../pages/CodingMandatoryTags/CodingMandatoryTagsList"
import AddCodingMandatoryTag from "../pages/CodingMandatoryTags/AddCodingMandatoryTag"
import EditCodingMandatoryTag from "../pages/CodingMandatoryTags/EditCodingMandatoryTag"

//Coding mandatory tests
import CodingMandatoryTestsList from "../pages/CodingMandatoryTests/CodingMandatoryTestsList"
import AddCodingMandatoryTest from "../pages/CodingMandatoryTests/AddCodingMandatoryTest"
import EditCodingMandatoryTest from "../pages/CodingMandatoryTests/EditCodingMandatoryTest"
import CodingMandatoryTestReports from "../pages/CodingMandatoryTests/CodingMandatoryReports"


//Companies
import CompaniesList from "../pages/Companies/CompaniesList"
import AddCompany from "../pages/Companies/AddCompany"
import EditCompany from "../pages/Companies/EditCompany"

// Forms
import FormElements from "../pages/Forms/FormElements"
import FormAdvanced from "../pages/Forms/FormAdvanced"
import FormEditors from "../pages/Forms/FormEditors"
import FormValidations from "../pages/Forms/FormValidations"
import FormUpload from "../pages/Forms/FormUpload"
import FormXeditable from "../pages/Forms/FormXeditable"

//Ui
import UiAlert from "../pages/Ui/UiAlert"
import UiButtons from "../pages/Ui/UiButtons"
import UiBadge from "../pages/Ui/UiBadge"
import UiCards from "../pages/Ui/UiCards"
import UiCarousel from "../pages/Ui/UiCarousel"
import UiDropdown from "../pages/Ui/UiDropdown"
import UiGrid from "../pages/Ui/UiGrid"
import UiImages from "../pages/Ui/UiImages"
import UiLightbox from "../pages/Ui/UiLightbox"
import UiModal from "../pages/Ui/UiModal"
import UiPagination from "../pages/Ui/UiPagination"
import UiPopoverTooltips from "../pages/Ui/UiPopoverTooltips"
import UiProgressbar from "../pages/Ui/UiProgressbar"
import UiTabsAccordions from "../pages/Ui/UiTabsAccordions"
import UiTypography from "../pages/Ui/UiTypography"
import UiVideo from "../pages/Ui/UiVideo"
import UiSessionTimeout from "../pages/Ui/UiSessionTimeout"
import UiRangeSlider from "../pages/Ui/UiRangeSlider"

//Sitting
//Hall-2-2
import Hall_2_2 from "../pages/SittingAlignment/hall-2-2";
import Hall_4_2 from "../pages/SittingAlignment/hall-4-2";
import Hall_4_1 from "../pages/SittingAlignment/hall-4-1";
import Hall_3_2 from "../pages/SittingAlignment/hall-3-2";
import Hall_3_3 from "../pages/SittingAlignment/hall-3-3";
import Hall_3_1 from "../pages/SittingAlignment/hall-3-1";
import Hall_3_4 from "../pages/SittingAlignment/hall-3-4";
import Hall_3_5 from "../pages/SittingAlignment/hall-3-5";
import Hall_5_1_island_1 from "../pages/SittingAlignment/hall-5-1-island-1";
import Hall_5_1_island_2 from "../pages/SittingAlignment/hall-5-1-island-2";
import Hall_5_1_island_3 from "../pages/SittingAlignment/hall-5-1-island-3";
import Hall_5_1_island_4 from "../pages/SittingAlignment/hall-5-1-island-4";
import Hall_5_1_island_5 from "../pages/SittingAlignment/hall-5-1-island-5";

//Extra Pages
import PagesTimeline from "../pages/Extra Pages/pages-timeline";
import PagesInvoice from "../pages/Extra Pages/pages-invoice";
import PagesDirectory from "../pages/Extra Pages/pages-directory";
import PagesBlank from "../pages/Extra Pages/pages-blank";
import Pages404 from "../pages/Extra Pages/pages-404";
import Pages500 from "../pages/Extra Pages/pages-500";
import UiUtilities from "pages/Ui/UiUtilities"
import UiColors from "pages/Ui/UiColors"
import UiOffcanvas from "pages/Ui/UiOffcanvas"
import Chat from "pages/Chat/Chat";
import Kanban from "pages/Kanban"

//Placements
import CompanyCards from "../pages/Placements/Companycards";
import AddPlacements from "../pages/Placements/Add-Placements";
import CompanyInfo from "../pages/Placements/CompanyInfo";
import AddCompanyInfo from "../pages/Placements/Add-CompanyInfo";
import EditPlacements from "../pages/Placements/Edit-Placementdata";
import EditCompanies from "../pages/Placements/Edit-Companiesdata";

//Notifications

import Notifications from "../pages/Notifications/NotificationList";
import AddNotifications from "../pages/Notifications/Add-Notifications";
import EditNofifications from "../pages/Notifications/Edit-notifications"


//Maya Ai
import Interviews from "../pages/MayaAI/InterviewsList";
import AddInterview from "../pages/MayaAI/AddInterview";
import EditInterview from "../pages/MayaAI/EditInterview";
import DeleteInterview from "../pages/MayaAI/DeleteInterview";
import CodingInterviews from "../pages/MayaAI/CodingInterviewsList";
import CompanyInterviews from "../pages/MayaAI/CompanyInterviewsList";
import AddCompanyInterview from "../pages/MayaAI/AddCompanyInterview";
import AddCodingInterview from "../pages/MayaAI/AddCodingInterview";
import EditCompanyInterview from "../pages/MayaAI/EditCompanyInterview";
import EditCodingInterview from "../pages/MayaAI/EditCodingInterview";

//App Header

import AppHeader from "../pages/AppHeader/appheaderList"
import AddAppHeaderdata from "../pages/AppHeader/Add-appheader"

//Bus information
//Users
import Users_bus from "../pages/Users/bus/users-businfo"
import Users_Inactive from "../pages/Users/bus/inactive-businfo"
import Users_Active from "../pages/Users/bus/active-businfo"
import UserScanReport from "../pages/Users/bus/user-scan-report"
import DateScanReport from "../pages/Users/bus/date-scan-report"
import BusEditUser from "../pages/Users/bus/BusEditUser"


//Ats
import FindAts from "../pages/Ats/FindAts"




const userRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/codingdashboard", component: <CodingDashboard /> },
  { path: "/student-problems", component: <StudentProblems /> },
  { path: "/student-certifications", component: <StudentCertifications /> },
  { path: "/CodingInActiveData", component: <CodingInActivestatus /> },
  { path: "/APTdashboard", component: <APTDashboard /> },

  { path: "/coding-dashboard", component: <PrincipalCodingDashboard /> },
  { path: "/studentProblems", component: <PrincipalStudentCodingproblemsList /> },
  { path: "/codinginactiveStudents", component: <PrincipalStudentCodinginactiveStatusList /> },
  { path: "/APT-dashboard", component: <PrincipalAPTDashboard /> },

  { path: "/Aptitude-List", component: <ApitudeList /> },
  { path: "/Reasoning-List", component: <ReasoningList /> },
  { path: "/Verbal-List", component: <VerbalList /> },
  { path: "/codingRanklist-college", component: <PrincipalStudentCodingRankListCollege /> },

  { path: "/Mandatory-List", component: <MandatoryTests /> },
  { path: "/DriverReady2026", component: <DrivereadyTests /> },

  // //calendar
  { path: "/calendar", component: <Calendar /> },
  { path: "/chat", component: <Chat /> },
  { path: "/kanbanboard", component: <Kanban /> },

  // // //profile
  { path: "/profile", component: <UserProfile /> },

  // //Email
  { path: "/email-inbox", component: <EmailInbox /> },
  { path: "/email-read", component: <EmailRead /> },
  { path: "/email-compose", component: <EmailCompose /> },

  // //Charts
  { path: "/apex-charts", component: <ChartsAppex /> },
  { path: "/charts-chartjs", component: <ChartsJs /> },
  { path: "/charts-knob", component: <ChartsKnob /> },
  { path: "/charts-c3", component: <ChartsC3 /> },
  { path: "/sparkline-charts", component: <ChartsSparkLine /> },

  // // Icons
  { path: "/icons-materialdesign", component: <IconMaterialdesign /> },
  { path: "/icons-ion", component: <Iconion /> },
  { path: "/icons-fontawesome", component: <IconFontawesome /> },
  { path: "/icons-themify", component: <IconThemify /> },
  { path: "/icons-dripicons", component: <IconDripicons /> },
  { path: "/icons-typicons", component: <IconTypicons /> },

  // // Tables
  { path: "/tables-basic", component: <BasicTables /> },
  { path: "/tables-datatable", component: <DatatableTables /> },
  { path: "/tables-responsive", component: <ResponsiveTables /> },
  { path: "/tables-editable", component: <EditableTables /> },

  // // Maps
  { path: "/maps-google", component: <MapsGoogle /> },
  { path: "/maps-vector", component: <MapsVector /> },

  // // Forms
  { path: "/form-elements", component: <FormElements /> },
  { path: "/form-advanced", component: <FormAdvanced /> },
  { path: "/form-editors", component: <FormEditors /> },
  { path: "/form-uploads", component: <FormUpload /> },
  { path: "/form-validation", component: <FormValidations /> },
  { path: "/form-xeditable", component: <FormXeditable /> },


  // FRS Device
  { path: "/add-frs-device", component: <AddFRSDevice /> },
  { path: "/frs-devices-list", component: <FRSDevicesList /> },
  { path: "/edit-frs-device/:deviceId", component: <EditFRSDevice /> },

  // Registrations
  { path: "/add-registrations", component: <AddRegistrations /> },
  { path: "/registrations-list", component: <RegistrationsList /> },
  { path: "/edit-registration/:id", component: <EditRegistration /> },

  // Hoot
  { path: "/paragraphs-list", component: <ReadingParagraphsList /> },
  { path: "/story-retellings-list", component: <StoryRetellingsList /> },
  { path: "/listenandRepeat-list", component: <ListenandRepeat /> },
  { path: "/questionnaire-list", component: <QuestionnaireList /> },
  { path: "/landA-list", component: <LandAList /> },
  { path: "/SpeakOut-list", component: <SpeakOutList /> },
  { path: "/Hoot-Dashboard", component: <HootDashboard /> },


  //Student Explore
  { path: "/student-explore", component: <StudentExplore /> },


  // // Users
  { path: "/users-list", component: <UsersList /> },
  { path: "/add-user", component: <AddUser /> },
  { path: "/add-student", component: <AddStudent /> },
  { path: "/user-status", component: <DropBlockUser /> },
  { path: "/edit-user/:userId", component: <EditUser /> },
  { path: "/bus-edit-user/:userId", component: <BusEditUser /> },
  { path: "/users-profile-pics-list", component: <UsersProfilePicsList /> },

  { path: "/update-mobile", component: <UpdateMobile /> },

  // // Tenants
  { path: "/tenants-list", component: <TenantsList /> },
  { path: "/add-tenant", component: <AddTenant /> },
  { path: "/edit-tenant/:id", component: <EditTenant /> },

  // Atendance
  { path: "/attendance", component: <AttendanceList /> },
  { path: "/batch-wise-attendance", component: <BatchWiseAttendance /> },
  { path: "/upload-attendance", component: <UploadAttendance /> },


  //upload seat and hall
  { path: "/update-seat-venue", component: <UpdateSeatAndVenue /> },



  // // Courses
  { path: "/courses-list", component: <CoursesList /> },
  { path: "/add-course", component: <AddCourse /> },
  { path: "/edit-course/:courseId", component: <EditCourse /> },

  // // Technologies
  { path: "/technologies-list", component: <TechnologiesList /> },
  { path: "/add-technology", component: <AddTechnology /> },
  { path: "/edit-technology/:technologyId", component: <EditTechnology /> },

  // // Modules
  { path: "/modules-list", component: <ModulesList /> },
  { path: "/add-module", component: <AddModule /> },
  { path: "/edit-module/:moduleId", component: <EditModule /> },

  // // Topics
  { path: "/topics-list", component: <TopicsList /> },
  { path: "/add-topic", component: <AddTopic /> },
  { path: "/edit-topic/:topicId", component: <EditTopic /> },
  { path: "/total-topics-report", component: <TotalTopicReport /> },
  // // InterviewQuestions
  { path: "/interview-questions-list", component: <InterviewQuestionsList /> },
  { path: "/add-interview-question", component: <AddInterviewQuestion /> },
  { path: "/edit-interview-question/:questionId", component: <EditInterviewQuestion /> },
  // // Companies
  { path: "/companies-questions-list", component: <CompaniesQuestionsList /> },
  { path: "/add-company-question", component: <AddCompanyQuestion /> },
  { path: "/edit-company-question/:questionId", component: <EditCompanyQuestion /> },
  // { path: "/total-topics-report", component: <TotalTopicReport /> },

  // // Batches
  { path: "/batches-list", component: <BatchesList /> },
  { path: "/add-batch", component: <AddBatch /> },
  { path: "/edit-batch/:batchId", component: <EditBatch /> },
  { path: "/find-student-batch", component: <FindStudent /> },
  { path: "/remove-multiple-users-batch", component: <RemoveMultipleUsersFrmBatch /> },

  // // Permissions
  { path: "/permissions-list", component: <PermissionsList /> },
  { path: "/add-permission", component: <AddPermission /> },
  { path: "/edit-permission/:permissionId", component: <EditPermission /> },

  // // Certifications
  { path: "/certifications-list", component: <CertificationsList /> },
  { path: "/add-certification", component: <AddCertification /> },
  { path: "/edit-certification/:certificationId", component: <EditCertification /> },

  // // Assessments
  { path: "/assessments-list", component: <AssessmentsList /> },
  { path: "/add-assessment", component: <AddAssessment /> },
  { path: "/edit-assessment/:assessmentId", component: <EditAssessment /> },
  { path: "/edit-assessment-question/:questionId", component: <EditAssessmentQuestion /> },
  { path: "/assessments-report", component: <AssessmentsReport /> },
  { path: "/student-assessments-report", component: <StudentAssessmentsReport /> },


  { path: "/add-assessment-question", component: <AddAssessmentQuestion /> },
  { path: "/assessment-questions-list", component: <AssessmentQuestionsList /> },
  { path: "/assessment-questions-report", component: <AssessmentQuestionsReport /> },

  // // Coding Badge Tests
  { path: "/badge-test-list", component: <BadgeTestList /> },
  { path: "/add-badge-test", component: <AddBadgeTest /> },
  { path: "/edit-badge-test/:badgeId", component: <EditBadgeTest /> },
  { path: "/coding-reports", component: <CodingReports /> },

  { path: "/coding-reports-faculty", component: <CodingReportsFaculty /> },

  // // Coding Contest Tests
  { path: "/contest-test-list", component: <ContestTestList /> },
  { path: "/add-contest-test", component: <AddContestTest /> },
  { path: "/edit-contest-test/:contestId", component: <EditContestTest /> },
  { path: "/coding-contest-reports", component: <CodingContestReports /> },

  // // Coding Questions
  { path: "/coding-questions-list", component: <CodingQuestionsList /> },
  { path: "/add-coding-question", component: <AddCodingQuestion /> },
  { path: "/edit-coding-question/:questionId", component: <EditCodingQuestion /> },


  // Apt Logic Badge Tests
  { path: "/aptlogic-badgetests-list", component: <AptLogicBadgeTestsList /> },
  { path: "/add-aptlogic-badge-test", component: <AddAptLogicBadgeTest /> },
  // { path: "/edit-aptlogic-test/:assessmentId", component: <EditAptLogicTest /> },


  // Apt Logic Aptitude Assessments
  { path: "/aptlogic-testing", component: <Testing /> },
  { path: "/aptitude-tests-list", component: <AptitudeTestsList /> },
  { path: "/add-aptitude-test", component: <AddAptitudeTest /> },
  { path: "/edit-aptitude-question/:questionId", component: <EditAptitudeQuestions /> },
  { path: "/upload-aptitude-questions", component: <UploadAptitudeQuestions /> },
  { path: "/aptitude-questions", component: <AptitudeQuestions /> },
  { path: "/practise-test-reports", component: <AptlogicTestReports /> },

  // { path: "/edit-aptlogic-test/:assessmentId", component: <EditAptLogicTest /> },

  //Aptitude Mandatory assessments
  { path: "/add-mandatory-test", component: <AddMandatoryTest /> },
  { path: "/aptitude-mandatory-tests", component: <AptitudeMandatoryTests /> },
  { path: "/edit-aptitude--mandatory-test/:testId", component: <EditAptitudeMandatoryTest /> },


  // // Apt Logic Reasoning Assessments
  { path: "/reasoning-tests-list", component: <ReasoningTestsList /> },
  { path: "/add-reasoning-test", component: <AddReasoningTest /> },
  // { path: "/edit-aptlogic-test/:assessmentId", component: <EditAptLogicTest /> },
  { path: "/reasoning-questions", component: <ReasoningQuestions /> },
  { path: "/edit-reasoning-question/:questionId", component: <EditReasoningQuestions /> },

  //Reasoning Mandatory assessments
  { path: "/reasoning-mandatory-tests", component: <ReasoningMandatoryTests /> },
  { path: "/edit-reasoning--mandatory-test/:testId", component: <EditReasoningMandatoryTest /> },


  // // Apt Logic Verbal Assessments
  { path: "/verbal-tests-list", component: <VerbalTestsList /> },
  { path: "/add-verbal-test", component: <AddVerbalTest /> },
  // { path: "/edit-aptlogic-test/:assessmentId", component: <EditAptLogicTest /> },
  { path: "/verbal-questions", component: <VerbalQuestions /> },
  { path: "/edit-verbal-question/:questionId", component: <EditVerbalQuestions /> },

  //Verbal Mandatory assessments
  { path: "/verbal-mandatory-tests", component: <VerbalMandatoryTests /> },
  { path: "/edit-verbal--mandatory-test/:testId", component: <EditVerbalMandatoryTest /> },


  // Activities
  { path: "/activities-list", component: <ActivitiesList /> },
  { path: "/add-activity", component: <AddActivity /> },
  { path: "/edit-activity/:activityId", component: <EditActivity /> },
  { path: "/submitted-activities-list", component: <SubmittedActivitiesList /> },
  { path: "/activities-report", component: <ActivitiesReport /> },

  // // TrainerFeedback

  { path: "/trainer-feedback", component: <TrainerFeedback /> },


  // // Sessions
  { path: "/sessions-list", component: <SessionsList /> },
  { path: "/add-session", component: <AddSession /> },
  { path: "/edit-session/:sessionId", component: <EditSession /> },
  { path: "/sessions-details", component: <SessionsDetails /> },
  { path: "/sessions-status", component: <SessionsStatus /> },


  // coding profiles
  { path: "/upload-coding-profile-data", component: <UploadCodingProfiles /> },

  //programs
  { path: "/add-problem", component: <AddProblem /> },
  { path: "/edit-problem/:problemId", component: <EditProblem /> },
  { path: "/problems-list", component: <ProblemsList /> },
  { path: "/map-problem", component: <MapProblem /> },

  // // Tags
  { path: "/tags-list", component: <TagsList /> },
  { path: "/add-tag", component: <AddTag /> },
  { path: "/edit-tag/:tagId", component: <EditTag /> },

  // // CodingMandatoryTags
  { path: "/coding-madatory-tags-list", component: <CodingMandatoryTagsList /> },
  { path: "/add-coding-madatory-tag", component: <AddCodingMandatoryTag /> },
  { path: "/edit-coding-madatory-tag/:tagId", component: <EditCodingMandatoryTag /> },

  // // CodingMandatoryTests
  { path: "/coding-mandatory-tests-list", component: <CodingMandatoryTestsList /> },
  { path: "/add-coding-mandatory-test", component: <AddCodingMandatoryTest /> },
  { path: "/edit-coding-mandatory-test/:testId", component: <EditCodingMandatoryTest /> },
  { path: "/coding-mandatory-tests-reports", component: <CodingMandatoryTestReports /> },

  // // Companies
  { path: "/companies-list", component: <CompaniesList /> },
  { path: "/add-company", component: <AddCompany /> },
  { path: "/edit-company/:companyId", component: <EditCompany /> },

  // // Ats
  { path: "/find-ats", component: <FindAts /> },

  // // Ui
  { path: "/ui-alerts", component: <UiAlert /> },
  { path: "/ui-buttons", component: <UiButtons /> },
  { path: "/ui-badge", component: <UiBadge /> },
  { path: "/ui-cards", component: <UiCards /> },
  { path: "/ui-carousel", component: <UiCarousel /> },
  { path: "/ui-dropdowns", component: <UiDropdown /> },
  { path: "/ui-grid", component: <UiGrid /> },
  { path: "/ui-images", component: <UiImages /> },
  { path: "/ui-lightbox", component: <UiLightbox /> },
  { path: "/ui-modals", component: <UiModal /> },
  { path: "/ui-pagination", component: <UiPagination /> },
  { path: "/ui-popover-tooltip", component: <UiPopoverTooltips /> },
  { path: "/ui-progressbars", component: <UiProgressbar /> },
  { path: "/ui-tabs-accordions", component: <UiTabsAccordions /> },
  { path: "/ui-typography", component: <UiTypography /> },
  { path: "/ui-video", component: <UiVideo /> },
  { path: "/ui-session-timeout", component: <UiSessionTimeout /> },
  { path: "/ui-rangeslider", component: <UiRangeSlider /> },
  { path: "/ui-utilities", component: <UiUtilities /> },
  { path: "/ui-colors", component: <UiColors /> },
  { path: "/ui-offcanvas", component: <UiOffcanvas /> },

  //Sitting View
  //Hall 2.2
  { path: "/hall-2-2", component: <Hall_2_2 /> },
  //Hall 5.3
  { path: "/hall-4-2", component: <Hall_4_2 /> },

  //Hall 4.1
  { path: "/hall-4-1", component: <Hall_4_1 /> },

  //Hall 3.2
  { path: "/hall-3-2", component: <Hall_3_2 /> },

  //Hall 3.3
  { path: "/hall-3-3", component: <Hall_3_3 /> },

  //Hall 3.1
  { path: "/hall-3-1", component: <Hall_3_1 /> },

  //Hall 3.4
  { path: "/hall-3-4", component: <Hall_3_4 /> },

  //Hall 3.5
  { path: "/hall-3-5", component: <Hall_3_5 /> },

  //Hall 5.1-island-1
  { path: "/hall-5-1-island-1", component: <Hall_5_1_island_1 /> },

  //Hall 5.1-island-2
  { path: "/hall-5-1-island-2", component: <Hall_5_1_island_2 /> },

  //Hall 5.1-island-3
  { path: "/hall-5-1-island-3", component: <Hall_5_1_island_3 /> },

  //Hall 5.1-island-4
  { path: "/hall-5-1-island-4", component: <Hall_5_1_island_4 /> },

  //Hall 5.1-island-5
  { path: "/hall-5-1-island-5", component: <Hall_5_1_island_5 /> },

  // //Extra Pages
  { path: "/pages-timeline", component: <PagesTimeline /> },
  { path: "/pages-invoice", component: <PagesInvoice /> },
  { path: "/pages-directory", component: <PagesDirectory /> },
  { path: "/pages-blank", component: <PagesBlank /> },

  // //Placements

  { path: "/companycards", component: <CompanyCards /> },
  { path: "/add-placements", component: <AddPlacements /> },
  { path: "/companyInfo", component: <CompanyInfo /> },
  { path: "/add-companies", component: <AddCompanyInfo /> },
  { path: "/edit-placements/:id", component: <EditPlacements /> },
  { path: "/edit-companies/:id", component: <EditCompanies /> },

  // //Notifications
  { path: "/notificationslist", component: <Notifications /> },
  { path: "/add-notifications", component: <AddNotifications /> },
  { path: "/edit-notifications/:id", component: <EditNofifications /> },

  // Maya Ai
  { path: "/ai-interviews-list", component: <Interviews /> },
  { path: "/add-ai-interview", component: <AddInterview /> },
  { path: "/edit-ai-interview/:id", component: <EditInterview /> },
  { path: "/delete-ai-interview/:id", component: <DeleteInterview /> },
  { path: "/coding-interviews-list", component: <CodingInterviews /> },
  { path: "/company-interviews-list", component: <CompanyInterviews /> },
  { path: "/add-company-interview", component: <AddCompanyInterview /> },
  { path: "/add-coding-interview", component: <AddCodingInterview /> },
  { path: "/edit-coding-interview/:id", component: <EditCodingInterview /> },
  { path: "/edit-company-interview/:id", component: <EditCompanyInterview /> },


  // //App Header 
  { path: "/appheaderlist", component: <AppHeader /> },
  { path: "/Add-Appheaderdata", component: <AddAppHeaderdata /> },

  // Bus Infomation
  { path: "/users-businfo", component: <Users_bus /> },
  { path: "/inactive-businfo", component: <Users_Inactive /> },
  { path: "/active-businfo", component: <Users_Active /> },
  { path: "/user-scan-report", component: <UserScanReport /> },
  { path: "/date-scan-report", component: <DateScanReport /> },













  // this route should be at the end of all other routes
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
]

const authRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/register", component: <Register /> },

  { path: "/pages-404", component: <Pages404 /> },
  { path: "/pages-500", component: <Pages500 /> },

  // Authentication Inner
  { path: "/pages-login", component: <Login1 /> },
  { path: "/pages-register", component: <Register1 /> },
  { path: "/page-recoverpw", component: <Recoverpw /> },
  { path: "/auth-lock-screen", component: <LockScreen /> },
]

export { userRoutes, authRoutes }