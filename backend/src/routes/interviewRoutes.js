const express = require('express');
const Router = express.Router();
const multer = require('multer');
const InterviewController = require('../controllers/InterviewController')
const upload = multer({ dest: 'uploads/' });


Router.post('/api/get-interviewee-details', InterviewController.getIntervieweeDetails)
Router.post('/api/add-interviewee-details', InterviewController.addInterviewDetails);
Router.post('/api/add-bulk-interviewee-details', upload.single('file'), InterviewController.addBulkInterviewDetails);

Router.get('/api/get-all-interviewee-details/:id', InterviewController.getAllInterviewDetails)
Router.post('/api/get-accuracy', InterviewController.getAccuracy)
Router.post('/api/generate-questions', InterviewController.generateQuestions)
Router.put('/api/edit-interviewee-details/:id', InterviewController.editInterviewDetails)
Router.get('/api/get-interviewee-details/:id', InterviewController.getInterviewDetailsById)
Router.get('/api/get-question-details/:id/:interview_type/:roll_no', InterviewController.getQuestionDetails)
Router.post('/api/submit-emotions', InterviewController.submitEmotions)

Router.post('/api/get-emotions', InterviewController.getEmotionsData)
Router.delete('/api/delete-interviewee-details/:id', InterviewController.deleteInterviewDetails)
Router.post('/api/get-accuracy-temp', InterviewController.getAccuracyTemporary)
Router.post('/api/get-technology-wise-date-range-interviews-attempted-count', InterviewController.getTechnologyWiseMpodInterviewsSubmissionsStatisticsFromDateAndToDate);
Router.post('/api/add-interviewee-details-replica', InterviewController.addInterviewDetailsReplica);

module.exports = Router;
