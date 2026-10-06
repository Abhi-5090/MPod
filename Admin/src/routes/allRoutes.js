import { lazy } from "react"
import { ROLES } from "../config/roles"

// Every authenticated route declares the roles allowed to open it.
// The backend enforces the same rules; this is only for UX.

// Authentication (public)
const Login = lazy(() => import("../pages/Authentication/Login"))
const Logout = lazy(() => import("../pages/Authentication/Logout"))
const ForgetPwd = lazy(() => import("../pages/Authentication/ForgetPassword"))
const NotFound = lazy(() => import("../pages/Errors/NotFound"))

// Dashboard
const Dashboard = lazy(() => import("../pages/Dashboard/index"))

// Users
const UsersList = lazy(() => import("../pages/Users/UsersList"))
const AddUser = lazy(() => import("../pages/Users/AddUser"))
const EditUser = lazy(() => import("../pages/Users/EditUser"))
const UsersProfilePicsList = lazy(() => import("../pages/Users/UsersProfilePicsList"))

// Tenants
const TenantsList = lazy(() => import("../pages/Tenants/TenantsList"))
const AddTenant = lazy(() => import("../pages/Tenants/AddTenant"))
const EditTenant = lazy(() => import("../pages/Tenants/EditTenant"))
const TenantCredits = lazy(() => import("../pages/Tenants/TenantCredits"))

// Kiosk devices
const KioskDevices = lazy(() => import("../pages/Kiosk/KioskDevices"))

// Content (platform only)
const TechnologiesList = lazy(() => import("../pages/Technologies/TechnologiesList"))
const AddTechnology = lazy(() => import("../pages/Technologies/AddTechnology"))
const EditTechnology = lazy(() => import("../pages/Technologies/EditTechnology"))
const ModulesList = lazy(() => import("../pages/Modules/ModulesList"))
const AddModule = lazy(() => import("../pages/Modules/AddModule"))
const EditModule = lazy(() => import("../pages/Modules/EditModule"))
const TopicsList = lazy(() => import("../pages/Topics/TopicsList"))
const AddTopic = lazy(() => import("../pages/Topics/AddTopic"))
const EditTopic = lazy(() => import("../pages/Topics/EditTopic"))
const InterviewQuestionsList = lazy(() => import("../pages/InterviewQuestions/InterviewQuestionsList"))
const AddInterviewQuestion = lazy(() => import("../pages/InterviewQuestions/AddInterviewQuestion"))
const EditInterviewQuestion = lazy(() => import("../pages/InterviewQuestions/EditInterviewQuestion"))
const CompaniesQuestionsList = lazy(() => import("../pages/CompanyQuestions/CompaniesQuestionsList"))
const AddCompanyQuestion = lazy(() => import("../pages/CompanyQuestions/AddCompanyQuestion"))
const EditCompanyQuestion = lazy(() => import("../pages/CompanyQuestions/EditCompanyQuestion"))
const CodingQuestionsList = lazy(() => import("../pages/CodingQuestions/CodingQuestionsList"))
const AddCodingQuestion = lazy(() => import("../pages/CodingQuestions/AddCodingQuestion"))
const EditCodingQuestion = lazy(() => import("../pages/CodingQuestions/EditCodingQuestion"))
const TagsList = lazy(() => import("../pages/Tags/TagsList"))
const AddTag = lazy(() => import("../pages/Tags/AddTag"))
const EditTag = lazy(() => import("../pages/Tags/EditTag"))
const CompaniesList = lazy(() => import("../pages/Companies/CompaniesList"))
const AddCompany = lazy(() => import("../pages/Companies/AddCompany"))
const EditCompany = lazy(() => import("../pages/Companies/EditCompany"))

// Interviews (Maya AI)
const InterviewsList = lazy(() => import("../pages/MayaAI/InterviewsList"))
const AddInterview = lazy(() => import("../pages/MayaAI/AddInterview"))
const EditInterview = lazy(() => import("../pages/MayaAI/EditInterview"))
const CompanyInterviewsList = lazy(() => import("../pages/MayaAI/CompanyInterviewsList"))
const AddCompanyInterview = lazy(() => import("../pages/MayaAI/AddCompanyInterview"))
const EditCompanyInterview = lazy(() => import("../pages/MayaAI/EditCompanyInterview"))
const CodingInterviewsList = lazy(() => import("../pages/MayaAI/CodingInterviewsList"))
const AddCodingInterview = lazy(() => import("../pages/MayaAI/AddCodingInterview"))
const EditCodingInterview = lazy(() => import("../pages/MayaAI/EditCodingInterview"))

const userRoutes = [
  { path: "/dashboard", component: Dashboard, roles: ROLES.dashboard },

  { path: "/users-list", component: UsersList, roles: ROLES.users },
  { path: "/add-user", component: AddUser, roles: ROLES.users },
  { path: "/edit-user/:userId", component: EditUser, roles: ROLES.users },
  { path: "/users-profile-pics-list", component: UsersProfilePicsList, roles: ROLES.users },

  { path: "/tenants-list", component: TenantsList, roles: ROLES.tenants },
  { path: "/add-tenant", component: AddTenant, roles: ROLES.tenants },
  { path: "/edit-tenant/:id", component: EditTenant, roles: ROLES.tenants },
  { path: "/tenant-credits/:id", component: TenantCredits, roles: ROLES.tenantCredits },

  { path: "/kiosk-devices", component: KioskDevices, roles: ROLES.kiosk },

  { path: "/technologies-list", component: TechnologiesList, roles: ROLES.technologies },
  { path: "/add-technology", component: AddTechnology, roles: ROLES.technologies },
  { path: "/edit-technology/:technologyId", component: EditTechnology, roles: ROLES.technologies },

  { path: "/modules-list", component: ModulesList, roles: ROLES.modules },
  { path: "/add-module", component: AddModule, roles: ROLES.modules },
  { path: "/edit-module/:moduleId", component: EditModule, roles: ROLES.modules },

  { path: "/topics-list", component: TopicsList, roles: ROLES.topics },
  { path: "/add-topic", component: AddTopic, roles: ROLES.topics },
  { path: "/edit-topic/:topicId", component: EditTopic, roles: ROLES.topics },

  { path: "/interview-questions-list", component: InterviewQuestionsList, roles: ROLES.interviewQuestions },
  { path: "/add-interview-question", component: AddInterviewQuestion, roles: ROLES.interviewQuestions },
  { path: "/edit-interview-question/:questionId", component: EditInterviewQuestion, roles: ROLES.interviewQuestions },

  { path: "/companies-questions-list", component: CompaniesQuestionsList, roles: ROLES.companyQuestions },
  { path: "/add-company-question", component: AddCompanyQuestion, roles: ROLES.companyQuestions },
  { path: "/edit-company-question/:questionId", component: EditCompanyQuestion, roles: ROLES.companyQuestions },

  { path: "/coding-questions-list", component: CodingQuestionsList, roles: ROLES.codingQuestions },
  { path: "/add-coding-question", component: AddCodingQuestion, roles: ROLES.codingQuestions },
  { path: "/edit-coding-question/:questionId", component: EditCodingQuestion, roles: ROLES.codingQuestions },

  { path: "/tags-list", component: TagsList, roles: ROLES.tags },
  { path: "/add-tag", component: AddTag, roles: ROLES.tags },
  { path: "/edit-tag/:tagId", component: EditTag, roles: ROLES.tags },

  { path: "/companies-list", component: CompaniesList, roles: ROLES.companies },
  { path: "/add-company", component: AddCompany, roles: ROLES.companies },
  { path: "/edit-company/:companyId", component: EditCompany, roles: ROLES.companies },

  { path: "/ai-interviews-list", component: InterviewsList, roles: ROLES.interviews },
  { path: "/add-ai-interview", component: AddInterview, roles: ROLES.interviews },
  { path: "/edit-ai-interview/:id", component: EditInterview, roles: ROLES.interviews },
  { path: "/company-interviews-list", component: CompanyInterviewsList, roles: ROLES.interviews },
  { path: "/add-company-interview", component: AddCompanyInterview, roles: ROLES.interviews },
  { path: "/edit-company-interview/:id", component: EditCompanyInterview, roles: ROLES.interviews },
  { path: "/coding-interviews-list", component: CodingInterviewsList, roles: ROLES.interviews },
  { path: "/add-coding-interview", component: AddCodingInterview, roles: ROLES.interviews },
  { path: "/edit-coding-interview/:id", component: EditCodingInterview, roles: ROLES.interviews },
]

const authRoutes = [
  { path: "/login", component: Login },
  { path: "/logout", component: Logout },
  { path: "/forgot-password", component: ForgetPwd },
]

export { userRoutes, authRoutes, NotFound }
