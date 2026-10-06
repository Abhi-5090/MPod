const express = require("express");
const Lite = require("../controllers/LiteInterviewController");
const rl = require("../middlewares/rateLimits");
const { requireStudent } = require("../middlewares/auth");

// Student self-practice on the Q&A bank. Always the logged-in student's own data.
const Router = express.Router();
const student = requireStudent();

Router.get("/api/get-all-lite-interview-details/:roll_no", student, Lite.getAllLiteInterviewDetails);
Router.post("/api/get-lite-interview-accuracy", student, rl.llm, Lite.getLiteInterviewAccuracy);
Router.get("/api/get-technologies-with-questions", student, Lite.getTechnologiesWithQuestions);
Router.post("/api/questions-by-technology", student, Lite.questionsByTechnology);
Router.post("/api/add-favorite", student, Lite.addFaviorite);
Router.post("/api/remove-favorite", student, Lite.removeFavorite);
Router.post("/api/get-favorite-questions", student, Lite.getFavoriteQuestions);
Router.post("/api/add-doubt", student, Lite.addDoubt);
Router.post("/api/remove-doubt", student, Lite.removeDoubt);
Router.post("/api/get-doubts", student, Lite.getDoubtsByTechnology);
Router.post("/api/get-star-quesitons", student, Lite.getStarQuestions);

module.exports = Router;
