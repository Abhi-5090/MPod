const express = require('express');
const Router = express.Router();
const multer = require('multer');

const InterviewController = require('../controllers/LiteInterviewController')
const questionsUpload = multer({dest:'uploads/interview-questions'})
Router.get('/api/get-all-lite-interview-details/:roll_no',InterviewController.getAllLiteInterviewDetails)
Router.post('/api/get-lite-interview-accuracy',InterviewController.getLiteInterviewAccuracy)
Router.post('/api/add-interview-questions',questionsUpload.single('file'),InterviewController.addInterviewQuestions)
Router.get('/api/get-technologies-with-questions',InterviewController.getTechnologiesWithQuestions)
Router.post('/api/add-favorite',InterviewController.addFaviorite)
Router.post('/api/questions-by-technology',InterviewController.questionsByTechnology)
Router.post('/api/add-doubt',InterviewController.addDoubt)
Router.post('/api/get-favorite-questions',InterviewController.getFavoriteQuestions)
Router.post('/api/get-doubts',InterviewController.getDoubtsByTechnology)
Router.post('/api/get-star-quesitons',InterviewController.getStarQuestions)
Router.get('/api/get-interview-questions',InterviewController.getInterviewQuestions)
Router.get('/api/get-interview-question-by-id/:id',InterviewController.getInterviewQuestionById)
Router.post('/api/update-interview-question',InterviewController.updateInterviewQuestion)
Router.delete('/api/delete-interview-question/:id',InterviewController.deleteInterviewQuestion)
Router.post('/api/remove-doubt',InterviewController.removeDoubt)
Router.post('/api/remove-favorite',InterviewController.removeFavorite)
module.exports = Router;
