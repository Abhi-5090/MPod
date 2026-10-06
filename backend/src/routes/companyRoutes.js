const express = require('express');
const Router = express.Router();


const CompanyController = require('../controllers/CompanyController')


//Company Routes
Router.post('/api/add-company',CompanyController.AddCompany);
Router.get('/api/companies-list', CompanyController.getCompanies);
Router.get('/api/get-company/:id', CompanyController.getCompanyById)
Router.delete('/api/delete-company/:id', CompanyController.deleteCompany)
Router.put('/api/update-company/:id', CompanyController.updateCompany)
Router.post('/api/get-company-names',CompanyController.getCompaniesNames);

module.exports = Router;