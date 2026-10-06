const express = require('express');
const Router = express.Router();
const multer = require('multer');
const TopicController = require('../controllers/TopicController')
const topicUpload = multer({dest:'uploads/topics'})

//Topic Routes

Router.post('/api/add-topic',topicUpload.single('file'), TopicController.addTopic);
Router.get('/api/get-topics', TopicController.getTopics);
Router.get('/api/get-topic-by-id/:id', TopicController.getTopicById)
Router.post('/api/update-topic/:id', TopicController.updateTopic)
Router.delete('/api/delete-topic/:id', TopicController.deleteTopic)
Router.post('/api/get-topics-by-module', TopicController.getTopicsByModule);
Router.post('/api/total-topics-report', TopicController.topicsTotalReport);
Router.post('/api/get-topics-by-multi-modules',TopicController.getTopicsByMultiModules);

module.exports = Router;
