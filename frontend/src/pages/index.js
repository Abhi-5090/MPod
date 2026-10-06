import { lazy } from "react";

const Login = lazy(() => import("./Login"));
const Home2 = lazy(() => import("./Home2"));
const KioskSetup = lazy(() => import("./KioskSetup"));
const Report = lazy(() => import("./Report"));
const Dashboard = lazy(() => import("./Dashboard"));
const CodingReport = lazy(() => import("./CodingReport"));
const ForgotPassword = lazy(() => import("./ForgotPassword"));
const NotFound = lazy(() => import("./NotFound"));

// Student website, kiosk screens and reports. Data access is enforced by the API;
// pages that need a student session redirect to /login on 401.
const routes = [
  { path: "/", component: <Login /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgotPassword /> },
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/report", component: <Report /> },
  { path: "/coding-report", component: <CodingReport /> },
  { path: "/home-2", component: <Home2 /> }, // mPod kiosk screen
  { path: "/kiosk-setup", component: <KioskSetup /> },
  { path: "*", component: <NotFound /> },
];

export default routes;
