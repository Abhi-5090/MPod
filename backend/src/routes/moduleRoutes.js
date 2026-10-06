const express = require('express');
const Router = express.Router();
const multer = require('multer');
const moduleUpload = multer({dest:'uploads/module-icons'})

const ModuleController = require('../controllers/ModuleController')

//Module Routes

Router.post('/api/add-module', moduleUpload.single('file'), ModuleController.addModule);
Router.get('/api/get-modules', ModuleController.getModules);
Router.get('/api/get-module-by-id/:id', ModuleController.getModuleById)
Router.post('/api/update-module/:id', moduleUpload.single('file'), ModuleController.updateModule)
Router.delete('/api/delete-module/:id', ModuleController.deleteModule)
Router.post('/api/get-modules-by-technology', ModuleController.getModulesByTechnology);
Router.post('/api/get-modules-by-technologies', ModuleController.getModulesByTechnologies);


module.exports = Router;
