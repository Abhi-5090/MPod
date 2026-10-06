const express = require('express');
const Router = express.Router();

const TagController = require('../controllers/TagController')

//Tag Routes
Router.post('/api/add-tag',TagController.AddTag);
Router.get('/api/tags-list', TagController.getTags);
Router.get('/api/get-tag/:id', TagController.getTagById)
Router.delete('/api/delete-tag/:id', TagController.deleteTag)
Router.put('/api/update-tag/:id', TagController.updateTag)

module.exports = Router;