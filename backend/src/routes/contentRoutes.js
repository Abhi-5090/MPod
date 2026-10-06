const express = require("express");
const Technology = require("../controllers/TechnologyController");
const Module = require("../controllers/ModuleController");
const Topic = require("../controllers/TopicController");
const Company = require("../controllers/CompanyController");
const Tag = require("../controllers/TagController");
const CompanyQuestion = require("../controllers/CompanyQuestionController");
const CodingQuestion = require("../controllers/CodingQuestionController");
const Lite = require("../controllers/LiteInterviewController");
const upload = require("../middlewares/upload");
const { requireStaff } = require("../middlewares/auth");
const { CAN } = require("../config/roles");

// Syllabus and question banks: any staff member may read (needed to schedule
// interviews); only platform admins may change them.
const Router = express.Router();
const view = requireStaff(CAN.viewContent);
const manage = requireStaff(CAN.manageContent);
const sheet = (field) => [upload.cleanupUpload, upload.single(field, "sheet")];
const image = (field) => [upload.cleanupUpload, upload.single(field, "image")];

// Technologies
Router.get("/api/get-technologies", view, Technology.gettechnologies);
Router.get("/api/get-technology-by-id/:id", view, Technology.getTechnologyById);
Router.post("/api/add-technology", manage, Technology.addTechnology);
Router.post("/api/update-technology/:id", manage, ...image("technology_icon"), Technology.updateTechnology);
Router.delete("/api/delete-technology/:id", manage, Technology.deleteTechnology);

// Modules
Router.get("/api/get-modules", view, Module.getModules);
Router.get("/api/get-module-by-id/:id", view, Module.getModuleById);
Router.post("/api/get-modules-by-technology", view, Module.getModulesByTechnology);
Router.post("/api/get-modules-by-technologies", view, Module.getModulesByTechnologies);
Router.post("/api/add-module", manage, ...image("file"), Module.addModule);
Router.post("/api/update-module/:id", manage, ...image("file"), Module.updateModule);
Router.delete("/api/delete-module/:id", manage, Module.deleteModule);

// Topics
Router.get("/api/get-topics", view, Topic.getTopics);
Router.get("/api/get-topic-by-id/:id", view, Topic.getTopicById);
Router.post("/api/get-topics-by-module", view, Topic.getTopicsByModule);
Router.post("/api/get-topics-by-multi-modules", view, Topic.getTopicsByMultiModules);
Router.post("/api/add-topic", manage, ...sheet("file"), Topic.addTopic);
Router.post("/api/update-topic/:id", manage, Topic.updateTopic);
Router.delete("/api/delete-topic/:id", manage, Topic.deleteTopic);

// Companies
Router.get("/api/companies-list", view, Company.getCompanies);
Router.get("/api/get-company/:id", view, Company.getCompanyById);
Router.post("/api/get-company-names", view, Company.getCompaniesNames);
Router.post("/api/add-company", manage, Company.AddCompany);
Router.put("/api/update-company/:id", manage, Company.updateCompany);
Router.delete("/api/delete-company/:id", manage, Company.deleteCompany);

// Tags
Router.get("/api/tags-list", view, Tag.getTags);
Router.get("/api/get-tag/:id", view, Tag.getTagById);
Router.post("/api/add-tag", manage, Tag.AddTag);
Router.put("/api/update-tag/:id", manage, Tag.updateTag);
Router.delete("/api/delete-tag/:id", manage, Tag.deleteTag);

// Company question bank
Router.get("/api/get-company-questions", view, CompanyQuestion.getCompanyQuestions);
Router.get("/api/get-company-question-by-id/:id", view, CompanyQuestion.getCompanyQuestionById);
Router.get("/api/get-company-questions-by-tag-id/:tag_id", view, CompanyQuestion.getCompanyQuestionsByTag);
Router.post("/api/add-company-question", manage, ...sheet("file"), CompanyQuestion.addCompanyQuestion);
Router.put("/api/update-company-question/:id", manage, CompanyQuestion.updateCompanyQuestion);
Router.delete("/api/delete-company-question/:id", manage, CompanyQuestion.deleteCompanyQuestion);
Router.delete("/api/delete-comapny-question/:id", manage, CompanyQuestion.deleteCompanyQuestion); // legacy misspelling

// Coding problem bank
Router.get("/api/get-coding-questions", view, CodingQuestion.getCodingQuestions);
Router.get("/api/get-coding-question-by-id/:id", view, CodingQuestion.getCodingQuestionById);
Router.get("/api/coding-questions-count", view, CodingQuestion.codingQuestionsCount);
Router.post("/api/add-coding-question", manage, CodingQuestion.addCodingQuestion);
Router.put("/api/update-coding-question/:id", manage, CodingQuestion.updateCodingQuestion);
Router.delete("/api/delete-coding-question/:id", manage, CodingQuestion.deleteCodingQuestion);

// Practice Q&A bank (admin side)
Router.get("/api/get-interview-questions", view, Lite.getInterviewQuestions);
Router.get("/api/get-interview-question-by-id/:id", view, Lite.getInterviewQuestionById);
Router.post("/api/add-interview-questions", manage, ...sheet("file"), Lite.addInterviewQuestions);
Router.post("/api/update-interview-question", manage, Lite.updateInterviewQuestion);
Router.delete("/api/delete-interview-question/:id", manage, Lite.deleteInterviewQuestion);

module.exports = Router;
