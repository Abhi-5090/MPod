const express = require('express');
const Router = express.Router();

const TenantController = require('../controllers/TenantController')
//Tenant Routes

Router.get('/api/get-tenants',TenantController.getTenants);
Router.post('/api/add-tenant', TenantController.addTenant);
Router.get('/api/get-tenant/:id', TenantController.getTenantById);
Router.put('/api/update-tenant/:id', TenantController.updateTenant);
Router.delete('/api/delete-tenant/:id', TenantController.deleteTenant);

module.exports = Router;



