const mongoose = require("mongoose");
const LiteInterview = require("../models/liteInterview");
const LiteInterviewQuestion = require("../models/liteInterviewQuestion");
const InterviewQuestionInteraction = require("../models/interviewQuestionInteraction");
const evaluation = require("../services/evaluation");
const { readSheetRows } = require("../services/scheduling");
const { ownRollNo } = require("./UserController");
const { asyncHandler } = require("../lib/http");

/** POST /get-lite-interview-accuracy — student practice: scores answers and stores the attempt. */
const PRACTICE_EVALS_PER_DAY = 20;
const getLiteInterviewAccuracy = async (req, res) => {
  const { questions, technology, module, topic, complexity, questions_count } = req.body || {};
  if (!Array.isArray(questions) || !questions.length || questions.length > 10) {
    return res.status(400).json({ message: "Send between 1 and 10 questions." });
  }
  // Each evaluation costs LLM calls, so practice scoring is capped per student per day.
  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const used = await LiteInterview.countDocuments({ roll_no: req.auth.user.roll_no, createdAt: { $gte: since } });
  if (used >= PRACTICE_EVALS_PER_DAY) {
    return res.status(429).json({ message: `Daily practice limit reached (${PRACTICE_EVALS_PER_DAY} evaluations per day). Try again tomorrow.` });
  }
  const items = questions.map((q) => ({
    question: String(q?.question || "").slice(0, 500),
    answer: String(q?.answer || "").slice(0, 3000),
    time: Number.isFinite(Number(q?.time)) ? Math.max(0, Math.min(3600, Number(q.time))) : null,
  }));
  const { results, overall } = await evaluation.evaluateVerbalInterview(items);
  await LiteInterview.create({
    roll_no: req.auth.user.roll_no,
    technology: mongoose.Types.ObjectId.isValid(String(technology)) ? technology : undefined,
    module: Array.isArray(module) ? module.filter((m) => mongoose.Types.ObjectId.isValid(String(m))) : [],
    topic: Array.isArray(topic) ? topic.filter((t) => mongoose.Types.ObjectId.isValid(String(t))) : [],
    level: String(complexity || "practice").slice(0, 50),
    questions_count: String(questions_count || items.length),
    question_details: results,
    overall_analysis: overall,
    status: 1,
  });
  return res.status(200).json({ results, overallAnalysis: overall });
};

const getAllLiteInterviewDetails = async (req, res, next) => {
  const roll_no = ownRollNo(req, req.params.roll_no);

  try {
    const result = await LiteInterview.aggregate([
      {
        $match: { roll_no: roll_no },
      },
      {
        $lookup: {
          from: "technologies",
          localField: "technology",
          foreignField: "_id",
          as: "technologyDetails",
        },
      },
      {
        $addFields: {
          technology_name: { $arrayElemAt: ["$technologyDetails.technology_name", 0] },
        },
      },
      {
        $lookup: {
          from: "modules",
          localField: "module",
          foreignField: "_id",
          as: "moduleDetails",
        },
      },
      {
        $addFields: {
          module_name: { $arrayElemAt: ["$moduleDetails.module_name", 0] },
        },
      },
      {
        $lookup: {
          from: "topics",
          localField: "topic",
          foreignField: "_id",
          as: "topicDetails",
        },
      },
      {
        $addFields: {
          topic_name: { $arrayElemAt: ["$topicDetails.topic_name", 0] },
        },
      },
      {
        $unset: ["technologyDetails", "moduleDetails", "topicDetails"],
      },
    ]);

    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ message: "No interviews found for this roll number." });
    }
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return res.status(500).json({ message: "Internal server error", ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }) });
  }
};




const addInterviewQuestions = async (req, res) => {
  const { technology } = req.body || {};
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  if (!mongoose.Types.ObjectId.isValid(String(technology))) return res.status(400).json({ message: "Select a technology" });
  let company = [];
  if (req.body.company) {
    try {
      const parsed = JSON.parse(req.body.company);
      company = (Array.isArray(parsed) ? parsed : [parsed]).filter((c) => mongoose.Types.ObjectId.isValid(String(c)));
    } catch (_) {
      return res.status(400).json({ message: "Invalid company list" });
    }
  }
  const data = readSheetRows(req.file.path);
  if (!data.length) return res.status(400).json({ message: "Excel file is empty or invalid" });
  if (data.length > 5000) return res.status(400).json({ message: "A file can have at most 5000 rows" });

  const insertData = data
    .map((row) => ({
      technology,
      question: String(row.question || row.Question || "").trim().slice(0, 2000),
      answer: String(row.answer || row.Answer || "").trim().slice(0, 10000),
      company,
      previous_asked_status:
        row.star_status !== undefined && row.star_status !== ""
          ? (Number(row.star_status) === 1 ? 1 : 0)
          : (Number(req.body.previous_asked_status) === 1 ? 1 : 0),
      created_by: req.auth.user.roll_no,
      status: 1,
    }))
    .filter((r) => r.question);
  if (!insertData.length) return res.status(400).json({ message: "No questions found. Use columns 'question' and 'answer'." });
  await LiteInterviewQuestion.insertMany(insertData);
  return res.status(200).json({ message: `${insertData.length} interview questions added successfully` });
};

const getTechnologiesWithQuestions = async (req, res, next) => {
  const baseUrl = `${process.env.PUBLIC_BACKEND_URL || "https://mpod.ai/backend/"}technology-icons/`;
  try {
    const result = await LiteInterviewQuestion.aggregate([
      {
        $lookup: {
          from: 'technologies',
          localField: 'technology',
          foreignField: '_id',
          as: 'technology_info'
        }
      },
      {
        $unwind: '$technology_info'
      },
      {
        $group: {
          _id: '$technology',
          technology_name: { $first: '$technology_info.technology_name' },
          technology_icon: {
            $cond: [
              { $ifNull: ["$technology_info.technology_icon", false] },
              {
                $concat: [
                  baseUrl,
                  "$technology_info.technology_icon"
                ]
              },
              null
            ]
          },
          question_count: { $sum: 1 }
        }
      },
      {
        $sort: { technology_name: 1 }
      }
    ]);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getTechnologiesWithQuestions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const questionsByTechnology = async (req, res, next) => {
  const { technology } = req.body || {};
  const roll_no = req.auth.user.roll_no;

  try {
    const result = await LiteInterviewQuestion.aggregate([
      {
        $match: {
          technology: new mongoose.Types.ObjectId(technology)
        }
      },
      {
        $lookup: {
          from: "interviewquestioninteractions",
          let: { questionId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$question_id", "$$questionId"] },
                    { $eq: ["$roll_no", roll_no] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 0,
                favorite: 1,
                doubt: 1
              }
            }
          ],
          as: "interaction"
        }
      },
      {
        $addFields: {
          // favourites and doubts are stored as separate interaction documents
          favorite_status: { $ifNull: [{ $max: "$interaction.favorite" }, 0] },
          doubt_status: { $ifNull: [{ $max: "$interaction.doubt" }, 0] }

        }
      },
      {
        $project: {
          interaction: 0
        }
      }
    ]);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getting questions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const addFaviorite = async (req, res, next) => {
  const { technology, question } = req.body || {};
  const roll_no = req.auth.user.roll_no;

  try {
    const result = await InterviewQuestionInteraction.find({
      roll_no,
      technology,
      question_id: question,
      favorite: 1
    });

    if (result.length > 0) {
      return res.status(200).json({ message: "Question is already set as favorite" });
    }

    const interaction = new InterviewQuestionInteraction({
      roll_no,
      technology,
      question_id: question,
      favorite: 1
    });

    const savedInteraction = await interaction.save();
    return res.status(200).json(savedInteraction);

  } catch (error) {
    console.error("Error in addFavorite:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const removeFavorite = async (req, res, next) => {
  const { technology, question } = req.body || {};
  const roll_no = req.auth.user.roll_no;

  try {
    const interaction = await InterviewQuestionInteraction.findOne({
      roll_no,
      technology,
      question_id: question,
      favorite: 1, 
    });

    if (!interaction) {
      return res.status(404).json({ message: "Favorite entry not found" });
    }

    interaction.favorite = 0;
    const updatedInteraction = await interaction.save();

    return res.status(200).json({
      message: "Favorite removed successfully",
      data: updatedInteraction,
    });

  } catch (error) {
    console.error("Error in removeFavorite:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addDoubt = async (req, res, next) => {
  const { technology, question } = req.body || {};
  const roll_no = req.auth.user.roll_no;

  try {
    const result = await InterviewQuestionInteraction.find({
      roll_no,
      technology,
      question_id: question,
      doubt: 1
    });

    if (result.length > 0) {
      return res.status(200).json({ message: "Question is already set as doubt" });
    }

    const interaction = new InterviewQuestionInteraction({
      roll_no,
      technology,
      question_id: question,
      doubt: 1
    });

    const savedInteraction = await interaction.save();
    return res.status(200).json(savedInteraction);

  } catch (error) {
    console.error("Error in addFavorite:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const removeDoubt = async (req, res, next) => {
  const { technology, question } = req.body || {};
  const roll_no = req.auth.user.roll_no;

  try {
    const interaction = await InterviewQuestionInteraction.findOne({
      roll_no,
      technology,
      question_id: question,
      doubt: 1, 
    });

    if (!interaction) {
      return res.status(404).json({ message: "Favorite entry not found" });
    }

    interaction.doubt = 0;
    const updatedInteraction = await interaction.save();

    return res.status(200).json({
      message: "Doubt removed successfully",
      data: updatedInteraction,
    });

  } catch (error) {
    console.error("Error in removeFavorite:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getFavoriteQuestions = async (req, res, next) => {
  const { technology } = req.body || {};
  const roll_no = req.auth.user.roll_no;

  try {
    const result = await InterviewQuestionInteraction.aggregate([
      {
        $match: {
          roll_no: roll_no,
          technology: new mongoose.Types.ObjectId(technology),
          favorite: 1
        }
      },
      {
        $lookup: {
          from: "liteinterviewquestions",
          localField: "question_id",
          foreignField: "_id",
          as: "questionDetails"
        }
      },
      {
        $unwind: "$questionDetails"
      },
      {
        $project: {
          _id: 0,
          roll_no: 1,
          question: "$questionDetails.question",
          answer: "$questionDetails.answer"
        }
      }
    ]);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getFavoriteQuestions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getDoubtsByTechnology = async (req, res, next) => {
  const { technology } = req.body || {};
  const roll_no = req.auth.user.roll_no;

  try {
    const result = await InterviewQuestionInteraction.aggregate([
      {
        $match: {
          roll_no: roll_no,
          technology: new mongoose.Types.ObjectId(technology),
          doubt: 1
        }
      },
      {
        $lookup: {
          from: "liteinterviewquestions",
          localField: "question_id",
          foreignField: "_id",
          as: "questionDetails"
        }
      },
      {
        $unwind: "$questionDetails"
      },
      {
        $project: {
          _id: 0,
          roll_no: 1,
          question: "$questionDetails.question",
          answer: "$questionDetails.answer"
        }
      }
    ]);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getDoubtsByTechnology:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getStarQuestions = async (req, res, next) => {
  const { technology } = req.body;
  try {
    const questions = await LiteInterviewQuestion.aggregate([
      {
        $match: {
          technology: new mongoose.Types.ObjectId(technology),
          previous_asked_status: 1
        }
      }
    ])
    if (questions) {
      return res.status(200).json(questions)
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
const getInterviewQuestions = async (req, res, next) => {
  try {
    const result = await LiteInterviewQuestion.aggregate([
      {
        $lookup: {
          from: "technologies",
          localField: "technology",
          foreignField: "_id",
          as: "technologyDetails"
        },
      },
      {
        $unwind: "$technologyDetails"
      },
      {
        $project: {
          _id: 1,
          technology_name: "$technologyDetails.technology_name",
          question: 1,
          answer: 1,
          previous_asked_status: 1
        }
      }
    ]);
    if (result) {
      return res.status(200).json(result)
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
const getInterviewQuestionById = async (req, res) => {
  const id = String(req.params.id || "");
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });
  const result = await LiteInterviewQuestion.findById(id).lean();
  if (!result) return res.status(404).json({ message: "Question not found" });
  return res.status(200).json(result);
};

const updateInterviewQuestion = async (req, res) => {
  const { id, question, answer, technology, company, status } = req.body || {};
  if (!id || !mongoose.Types.ObjectId.isValid(String(id))) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const set = {};
  if (question !== undefined) {
    const q = String(question).trim();
    if (!q) return res.status(400).json({ message: "Question cannot be empty" });
    set.question = q.slice(0, 2000);
  }
  if (answer !== undefined) set.answer = String(answer).slice(0, 10000);
  if (technology !== undefined && technology !== "") {
    if (!mongoose.Types.ObjectId.isValid(String(technology))) return res.status(400).json({ message: "Invalid technology" });
    set.technology = technology;
  }
  // company is a list; leave it unchanged when not sent.
  if (company !== undefined) {
    const list = (Array.isArray(company) ? company : company ? [company] : []).map(String);
    if (list.some((c) => !mongoose.Types.ObjectId.isValid(c))) return res.status(400).json({ message: "Invalid company" });
    set.company = list;
  }
  if (status !== undefined && status !== "") set.previous_asked_status = Number(status) === 1 ? 1 : 0;

  const updated = await LiteInterviewQuestion.findByIdAndUpdate(id, { $set: set }, { new: true });
  if (!updated) return res.status(404).json({ message: "Question not found" });
  return res.status(200).json(updated);
};

const deleteInterviewQuestion = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await LiteInterviewQuestion.findByIdAndDelete(id);
    if (result) {
      return res.status(200).json({ message: "Interview Question is deleted successfully" });
    } else {
      return res.status(404).json({ message: "Interview Question not found" });
    }
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  getAllLiteInterviewDetails: asyncHandler(getAllLiteInterviewDetails),
  getLiteInterviewAccuracy: asyncHandler(getLiteInterviewAccuracy),
  addInterviewQuestions: asyncHandler(addInterviewQuestions),
  getTechnologiesWithQuestions: asyncHandler(getTechnologiesWithQuestions),
  addFaviorite: asyncHandler(addFaviorite),
  questionsByTechnology: asyncHandler(questionsByTechnology),
  addDoubt: asyncHandler(addDoubt),
  removeDoubt: asyncHandler(removeDoubt),
  removeFavorite: asyncHandler(removeFavorite),
  getFavoriteQuestions: asyncHandler(getFavoriteQuestions),
  getDoubtsByTechnology: asyncHandler(getDoubtsByTechnology),
  getStarQuestions: asyncHandler(getStarQuestions),
  getInterviewQuestions: asyncHandler(getInterviewQuestions),
  getInterviewQuestionById: asyncHandler(getInterviewQuestionById),
  updateInterviewQuestion: asyncHandler(updateInterviewQuestion),
  deleteInterviewQuestion: asyncHandler(deleteInterviewQuestion),
};
