const express = require('express');
const Router = express.Router();
const multer = require('multer');
const unzipper = require('unzipper');
const path = require('path');
const fs = require('fs-extra');
const UserController = require('../controllers/UserController')
const profileUpload = multer({dest:'uploads/profile-pics'})
const excelUpload = multer({ dest: 'uploads/' });
//User Routes
const authMiddleware = require("../middlewares/authMiddleware");
const upload = multer({ dest: 'uploads/profile-pics' });
Router.post('/api/add-user', excelUpload.single('file'), UserController.addUser);
Router.post('/api/upload-profile-pics', upload.single('profile_pics_zip'), UserController.uploadProfilePics);

Router.get("/api/logout/:roll_no/:slug", authMiddleware, UserController.logout);
Router.get('/api/get-users/:id',UserController.getUsers);
Router.post('/api/login',UserController.login);
Router.post('/api/admin-login',UserController.adminLogin);

Router.get('/api/get-assigned-interviews/:id',UserController.getAssignedInterviews);
Router.get('/api/get-currentUser',UserController.getCurrentUser);
Router.post("/api/get-interview-details-by-id", UserController.getInterviewDetailsById);
Router.post('/api/update-session-token',UserController.updateSessionToken);
Router.get('/api/get-past-interviews/:id',UserController.getTraineePastInterviews);
Router.get('/api/attempted-interviews-count/:id',UserController.attemptedInterviewsCount);
Router.get('/api/platform-interviews-count/:id',UserController.platformInterviewsCount);
Router.get('/api/overall-accuracy/:id',UserController.overallAccuracy);
Router.get('/api/get-admin-current-user',UserController.getAdminCurrentUser);
Router.get('/api/find-session-token/:id',UserController.findSessionToken);
Router.post('/api/send-otp',UserController.sendOtp);
Router.post('/api/check-otp',UserController.checkOtp);
Router.post('/api/reset-password',UserController.resetPassword);

module.exports = Router;



