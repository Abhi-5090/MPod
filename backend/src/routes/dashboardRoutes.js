const express = require('express');
const Router = express.Router();
const DashboardController = require('../controllers/DashboardController')

// Router.post('/api/add-user', excelUpload.single('file'), UserController.addUser);
// Router.post('/api/upload-profile-pics', upload.single('profile_pics_zip'), UserController.uploadProfilePics);

// Router.get("/api/logout/:roll_no/:slug", authMiddleware, UserController.logout);
// Router.get('/api/get-users/:id',UserController.getUsers);
// Router.post('/api/login',UserController.login);
// Router.post('/api/admin-login',UserController.adminLogin);

// Router.get('/api/get-assigned-interviews/:id',UserController.getAssignedInterviews);
// Router.get('/api/get-currentUser',UserController.getCurrentUser);
// Router.post("/api/get-interview-details-by-id", authMiddleware, UserController.getInterviewDetailsById);
// Router.post('/api/update-session-token',UserController.updateSessionToken);
// Router.get('/api/get-past-interviews/:id',UserController.getTraineePastInterviews);
// Router.get('/api/attempted-interviews-count/:id',UserController.attemptedInterviewsCount);
// Router.get('/api/platform-interviews-count/:id',UserController.platformInterviewsCount);
// Router.get('/api/overall-accuracy/:id',UserController.overallAccuracy);
// Router.get('/api/get-admin-current-user',UserController.getAdminCurrentUser);
// Router.get('/api/find-session-token/:id',UserController.findSessionToken);


Router.get('/api/get-users-stats/:tid',DashboardController.userStats);
Router.get('/api/get-interview-stats/:tid',DashboardController.getInterviewStats);
Router.get('/api/get-platform-stats/:tid',DashboardController.getPlatformStats);
Router.get('/api/get-coding-questions-count',DashboardController.getCodingQuestionsCount);
Router.get('/api/get-company-questions-count',DashboardController.getCompanyQuestionsCount);
Router.get('/api/get-assigned-interview-stats/:tid',DashboardController.getAssignedInterviewStats);
Router.get('/api/get-yesterday-assigned-interview-stats/:tid',DashboardController.getYesterdayAssignedInterviewStats);
Router.get('/api/get-overall-yesterday-assigned-interview-stats',DashboardController.getOverAllYesterdayAssignedInterviewStats);
Router.get('/api/get-yesterday-attempted-interview-stats/:tid',DashboardController.getYesterdayAttemptedInterviewStats);
Router.get('/api/get-overall-yesterday-attempted-interview-stats',DashboardController.getOverAllYesterdayAttemptedInterviewStats);
Router.get('/api/get-yesterday-tech-stats/:tid',DashboardController.getYesterdayTechStats);
Router.get('/api/get-yesterday-attempted-tech-stats/:tid',DashboardController.getYesterdayAttemptedTechStats);
Router.get("/api/get-all-tenants-yesterday-assigned-stats",DashboardController.getAllTenantsYesterdayAssignedStats);
Router.get("/api/get-overall-stats",DashboardController.overallStats);
Router.get("/api/get-current-stats",DashboardController.currentStats);
Router.get("/api/get-day-wise-stats",DashboardController.getDaywiseStats);

Router.get('/api/get-all-interview-stats/:roll_no',DashboardController.getAllInterviewStats);


module.exports = Router;



