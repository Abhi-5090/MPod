const express = require('express');
const Router = express.Router();
const multer = require('multer');
const CompanyQuestionController = require('../controllers/CompanyQuestionController')
const topicUpload = multer({dest:'uploads/topics'})

//Topic Routes

Router.post('/api/add-company-question',topicUpload.single('file'), CompanyQuestionController.addCompanyQuestion);
Router.get('/api/get-company-questions', CompanyQuestionController.getCompanyQuestions);
Router.get('/api/get-company-question-by-id/:id', CompanyQuestionController.getCompanyQuestionById)
Router.put('/api/update-company-question/:id', CompanyQuestionController.updateCompanyQuestion)
Router.delete('/api/delete-comapny-question/:id', CompanyQuestionController.deleteCompanyQuestion)
Router.get('/api/get-company-questions-by-tag-id/:tag_id', CompanyQuestionController.getCompanyQuestionsByTag)


module.exports = Router;
