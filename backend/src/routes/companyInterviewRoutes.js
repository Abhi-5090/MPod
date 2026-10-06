const express = require('express');
const Router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const CompanyInterviewController = require('../controllers/CompanyInterviewController')

Router.post('/api/add-company-interview',CompanyInterviewController.addInterviewDetails)
Router.post('/api/bulk-add-company-interviews', upload.single('file'),CompanyInterviewController.bulkAddInterviewDetails)
Router.get('/api/get-company-interviews/:id',CompanyInterviewController.getAllInterviewDetails)
Router.get('/api/get-company-interview-by-id/:id',CompanyInterviewController.getInterviewDetailsById)
Router.put('/api/update-company-interview/:id',CompanyInterviewController.updateCompanyInterview)
Router.post('/api/generate-company-questions',CompanyInterviewController.generateCompanyQuestions)
Router.delete('/api/delete-company-interviewee-details/:id',CompanyInterviewController.deleteCompanyInterviewDetails)
Router.post('/api/available-company-questions',CompanyInterviewController.availableCompanyQuestions)

module.exports = Router;
