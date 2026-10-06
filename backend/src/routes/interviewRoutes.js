const express = require("express");
const Tech = require("../controllers/InterviewController");
const Company = require("../controllers/CompanyInterviewController");
const Coding = require("../controllers/CodingInterviewController");
const upload = require("../middlewares/upload");
const { requireStaff, reportAccess, scopeTenantParam } = require("../middlewares/auth");
const { CAN } = require("../config/roles");

// Scheduling and managing interviews (staff, scoped to their college) and
// reports (the student who took it, or staff of the same college).
const Router = express.Router();
const staff = requireStaff(CAN.scheduleInterviews);
const sheet = [upload.cleanupUpload, upload.single("file", "sheet")];
const reportReader = reportAccess();

// Technology interviews
Router.post("/api/add-interviewee-details", staff, Tech.addInterviewDetails);
Router.post("/api/add-bulk-interviewee-details", staff, ...sheet, Tech.addBulkInterviewDetails);
Router.get("/api/get-all-interviewee-details/:id", staff, scopeTenantParam("id"), Tech.getAllInterviewDetails);
Router.get("/api/get-interviewee-details/:id", staff, Tech.getInterviewDetailsById);
Router.put("/api/edit-interviewee-details/:id", staff, Tech.editInterviewDetails);
Router.delete("/api/delete-interviewee-details/:id", staff, Tech.deleteInterviewDetails);
Router.get("/api/get-question-details/:id/:interview_type/:roll_no", reportReader, Tech.getQuestionDetails);

// Company interviews
Router.post("/api/add-company-interview", staff, Company.addInterviewDetails);
Router.post("/api/bulk-add-company-interviews", staff, ...sheet, Company.bulkAddInterviewDetails);
Router.get("/api/get-company-interviews/:id", staff, scopeTenantParam("id"), Company.getAllInterviewDetails);
Router.get("/api/get-company-interview-by-id/:id", staff, Company.getInterviewDetailsById);
Router.put("/api/update-company-interview/:id", staff, Company.updateCompanyInterview);
Router.delete("/api/delete-company-interviewee-details/:id", staff, Company.deleteCompanyInterviewDetails);
Router.post("/api/available-company-questions", staff, Company.availableCompanyQuestions);

// Coding interviews
Router.post("/api/add-coding-interview", staff, Coding.addInterviewDetails);
Router.post("/api/add-bulk-coding-interview", staff, ...sheet, Coding.addBulkInterviewDetails);
Router.get("/api/get-all-coding-interview-details/:id", staff, scopeTenantParam("id"), Coding.getAllCodingInterviewDetails);
Router.get("/api/get-coding-interview-details-by-id/:id", staff, Coding.getInterviewDetailsById);
Router.put("/api/update-coding-interview/:id", staff, Coding.updateInterviewDetails);
Router.delete("/api/delete-coding-interview/:id", staff, Coding.deleteCodingInterviewDetails);
Router.get("/api/get-coding-report-details/:id/:interview_type/:roll_no", reportReader, Coding.getCodingReportDetails);

module.exports = Router;
