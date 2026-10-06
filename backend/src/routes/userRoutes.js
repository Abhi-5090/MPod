const express = require("express");
const Auth = require("../controllers/AuthController");
const User = require("../controllers/UserController");
const rl = require("../middlewares/rateLimits");
const upload = require("../middlewares/upload");
const { requireStaff, requireStudent } = require("../middlewares/auth");
const { CAN } = require("../config/roles");

const Router = express.Router();

// Authentication (public, rate limited)
Router.post("/api/login", rl.loginPerIp, rl.login, Auth.login);
Router.post("/api/admin-login", rl.loginPerIp, rl.login, Auth.adminLogin);
Router.post("/api/logout", Auth.logout);
Router.get("/api/logout/:roll_no/:slug", Auth.logout); // legacy form; roll_no is ignored
Router.post("/api/send-otp", rl.otpSend, Auth.sendOtp);
Router.post("/api/check-otp", rl.otpVerify, Auth.checkOtp);
Router.post("/api/reset-password", rl.otpVerify, Auth.resetPassword);

// Current user
Router.get("/api/get-currentUser", requireStudent(), Auth.getCurrentUser);
Router.get("/api/get-admin-current-user", requireStaff(), Auth.getAdminCurrentUser);

// User management (platform admins and college admins, scoped to their college)
const manageUsers = requireStaff(CAN.manageUsers);
Router.post("/api/add-user", manageUsers, upload.cleanupUpload, upload.single("file", "sheet"), User.addUser);
Router.post("/api/upload-profile-pics", manageUsers, upload.cleanupUpload, upload.single("profile_pics_zip", "zip"), User.uploadProfilePics);
Router.get("/api/get-users/:id", manageUsers, User.getUsers);
Router.get("/api/get-user-by-id/:id", manageUsers, User.getUserById);
Router.put("/api/update-user/:id", manageUsers, User.updateUser);
Router.delete("/api/delete-user/:id", manageUsers, User.deleteUser);

// Student dashboard (always the logged-in student's own data)
Router.get("/api/get-assigned-interviews/:id", requireStudent(), User.getAssignedInterviews);
Router.get("/api/get-past-interviews/:id", requireStudent(), User.getTraineePastInterviews);
Router.post("/api/get-interview-details-by-id", requireStudent(), User.getInterviewDetailsById);
Router.get("/api/attempted-interviews-count/:id", requireStudent(), User.attemptedInterviewsCount);
Router.get("/api/platform-interviews-count/:id", requireStudent(), User.platformInterviewsCount);
Router.get("/api/overall-accuracy/:id", requireStudent(), User.overallAccuracy);

module.exports = Router;
