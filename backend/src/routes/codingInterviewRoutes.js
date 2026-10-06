const express = require('express');
const Router = express.Router();
const multer = require('multer');
const InterviewController = require('../controllers/CodingInterviewController')
const upload = multer({ dest: 'uploads/' });
Router.post('/api/get-interviewee-details', InterviewController.getIntervieweeDetails)
Router.post('/api/add-coding-interview',InterviewController.addInterviewDetails)
Router.post('/api/add-bulk-coding-interview',upload.single('file'),InterviewController.addBulkInterviewDetails)

Router.get('/api/get-all-coding-interview-details/:id',InterviewController.getAllCodingInterviewDetails)
Router.get('/api/get-coding-interview-details-by-id/:id',InterviewController.getInterviewDetailsById)
Router.put('/api/update-coding-interview/:id',InterviewController.updateInterviewDetails)
Router.post('/api/generate-coding-questions',InterviewController.generateCodingQuestions)
Router.post('/api/analyze-idea',InterviewController.analyzeIdea)
Router.post('/api/submit-coding-interview',InterviewController.submitCodingInterview)
Router.get('/api/get-coding-report-details/:id/:interview_type/:roll_no', InterviewController.getCodingReportDetails);

Router.delete('/api/delete-coding-interview/:id',InterviewController.deleteCodingInterviewDetails)


module.exports = Router;
