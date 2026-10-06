const express = require("express");
const Lite = require("../controllers/LiteInterviewController");
const rl = require("../middlewares/rateLimits");
const { requireStudent } = require("../middlewares/auth");

// Student self-practice on the Q&A bank. Always the logged-in student's own data.
const Router = express.Router();
const { toObjectId } = require("../lib/http");

// Casts id fields so request bodies cannot carry query operators (e.g. {"$ne": null}).
const castIds = (req, res, next) => {
  try {
    for (const k of ["technology", "question"]) {
      if (req.body && req.body[k] !== undefined) req.body[k] = toObjectId(req.body[k], k);
    }
    next();
  } catch (e) {
    next(e);
  }
};
const student = [requireStudent(), castIds];

Router.get("/api/get-all-lite-interview-details/:roll_no", requireStudent(), Lite.getAllLiteInterviewDetails);
Router.post("/api/get-lite-interview-accuracy", requireStudent(), rl.llm, Lite.getLiteInterviewAccuracy);
Router.get("/api/get-technologies-with-questions", requireStudent(), Lite.getTechnologiesWithQuestions);
Router.post("/api/questions-by-technology", student, Lite.questionsByTechnology);
Router.post("/api/add-favorite", student, Lite.addFaviorite);
Router.post("/api/remove-favorite", student, Lite.removeFavorite);
Router.post("/api/get-favorite-questions", student, Lite.getFavoriteQuestions);
Router.post("/api/add-doubt", student, Lite.addDoubt);
Router.post("/api/remove-doubt", student, Lite.removeDoubt);
Router.post("/api/get-doubts", student, Lite.getDoubtsByTechnology);
Router.post("/api/get-star-quesitons", student, Lite.getStarQuestions);

module.exports = Router;
