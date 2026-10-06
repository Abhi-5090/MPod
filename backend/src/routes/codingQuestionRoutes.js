const express = require('express');
const Router = express.Router();
const multer = require('multer');
const CodingQuestionController = require('../controllers/CodingQuestionController')
const topicUpload = multer({dest:'uploads/topics'})

//Topic Routes

Router.post('/api/add-coding-question', CodingQuestionController.addCodingQuestion);
Router.get('/api/get-coding-questions', CodingQuestionController.getCodingQuestions);
Router.get('/api/get-coding-question-by-id/:id', CodingQuestionController.getCodingQuestionById)
Router.put('/api/update-coding-question/:id', CodingQuestionController.updateCodingQuestion)
Router.delete('/api/delete-coding-question/:id', CodingQuestionController.deleteCodingQuestion)
Router.get('/api/coding-questions-count', CodingQuestionController.codingQuestionsCount);


module.exports = Router;
