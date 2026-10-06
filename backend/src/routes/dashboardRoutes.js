const express = require("express");
const Dashboard = require("../controllers/DashboardController");
const { requireStaff, scopeTenantParam } = require("../middlewares/auth");
const { CAN } = require("../config/roles");

const Router = express.Router();
const tenantStats = [requireStaff(CAN.viewTenantStats), scopeTenantParam("tid")];
const platformStats = requireStaff(CAN.viewPlatformStats);

// One college (tenant staff always see their own college)
Router.get("/api/get-users-stats/:tid", ...tenantStats, Dashboard.userStats);
Router.get("/api/get-interview-stats/:tid", ...tenantStats, Dashboard.getInterviewStats);
Router.get("/api/get-platform-stats/:tid", ...tenantStats, Dashboard.getPlatformStats);
Router.get("/api/get-assigned-interview-stats/:tid", ...tenantStats, Dashboard.getAssignedInterviewStats);
Router.get("/api/get-yesterday-assigned-interview-stats/:tid", ...tenantStats, Dashboard.getYesterdayAssignedInterviewStats);
Router.get("/api/get-yesterday-attempted-interview-stats/:tid", ...tenantStats, Dashboard.getYesterdayAttemptedInterviewStats);
Router.get("/api/get-yesterday-tech-stats/:tid", ...tenantStats, Dashboard.getYesterdayTechStats);
Router.get("/api/get-yesterday-attempted-tech-stats/:tid", ...tenantStats, Dashboard.getYesterdayAttemptedTechStats);
Router.get("/api/get-coding-questions-count", requireStaff(CAN.viewTenantStats), Dashboard.getCodingQuestionsCount);
Router.get("/api/get-company-questions-count", requireStaff(CAN.viewTenantStats), Dashboard.getCompanyQuestionsCount);

// Whole platform
Router.get("/api/get-overall-yesterday-assigned-interview-stats", platformStats, Dashboard.getOverAllYesterdayAssignedInterviewStats);
Router.get("/api/get-overall-yesterday-attempted-interview-stats", platformStats, Dashboard.getOverAllYesterdayAttemptedInterviewStats);
Router.get("/api/get-all-tenants-yesterday-assigned-stats", platformStats, Dashboard.getAllTenantsYesterdayAssignedStats);
Router.get("/api/get-overall-stats", platformStats, Dashboard.overallStats);
Router.get("/api/get-current-stats", platformStats, Dashboard.currentStats);
Router.get("/api/get-day-wise-stats", platformStats, Dashboard.getDaywiseStats);

module.exports = Router;
