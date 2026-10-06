import Login from "./Login";
import Home2 from "./Home2";
import KioskSetup from "./KioskSetup";
import Report from "./Report";
import Dashboard from "./Dashboard";
import CodingReport from "./CodingReport";
import ForgotPassword from "./ForgotPassword";
import NotFound from "./NotFound";

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
