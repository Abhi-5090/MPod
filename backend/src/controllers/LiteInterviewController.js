const Interview = require("../models/interview");
const Tenant = require("../models/tenant");
const User = require("../models/user");
const Technology = require("../models/technology");
const Module = require("../models/module");
const CodingInterview = require("../models/codingInterview");
const CompanyInterview = require("../models/companyInterview");
const LiteInterview = require("../models/liteInterview");
const LiteInterviewQuestion = require("../models/liteInterviewQuestion");
const InterviewQuestionInteraction = require("../models/interviewQuestionInteraction");
const OpenAI = require('openai')
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { handleFileUpload } = require('../utils/fileUploadUtil');
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const { exec } = require('child_process');

const getLiteInterviewAccuracy = async (req, res, next) => {
  const { questions, roll_no, technology, module, topic,complexity,questions_count } = req.body; 
  let results = []; 

  try {
    for (let i = 0; i < questions.length; i++) {
      const { question, answer, id, time } = questions[i];

      let jsonResponse = {
        given_question: question,
        given_answer: answer,
        accuracy: 0,
        analysis: "",
        improvements: "",
        confidence_level: "none",
        time: time,
      };

      if (!answer || answer.trim() === "") {
        results.push(jsonResponse);
        continue; // Skip OpenAI API call
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert evaluator for technical interview answers. Your job is to evaluate the correctness and completeness of an answer given a specific question.
            
            - If the answer is **completely incorrect, irrelevant, or unrelated**, **give an accuracy of 0**.
            - If the answer has **partial correct sentences with spelling mistakes**, **give an accuracy between 10-20**.
            - If the answer is **partially correct with no spelling mistakes**, assign a score between **40-70**.
            - If the answer is **mostly correct**, assign a score between **70-90**.
            - If the answer is **fully correct and well-explained**, assign a score between **90-100**.
            
            Your response must be in **valid JSON format** with these keys:
            - given_question
            - given_answer
            - accuracy (integer, between 0-100)
            - analysis (explanation of correctness)
            - improvements (how to improve the answer)
            
            Do NOT generate a new or corrected answer. Simply analyze the given one.`,
          },
          {
            role: "user",
            content: `Evaluate the following:
            
            **Question:** "${question}"
            **Answer:** "${answer}"
            
            Provide the JSON response strictly in this format:
            {
              "given_question": "question text",
              "given_answer": "answer text",
              "accuracy": 85, 
              "analysis": "Explain why the answer is correct or incorrect.",
              "improvements": "Provide suggestions to improve the answer."
            }`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1024,
        top_p: 1,
      });

      const apiResponse = response.choices[0].message.content;

      try {
        jsonResponse = JSON.parse(apiResponse);
        jsonResponse["time"] = time;

        if (typeof jsonResponse.accuracy === "string") {
          jsonResponse.accuracy = parseFloat(jsonResponse.accuracy.replace("%", "")) || 0;
        }

        if (
          jsonResponse.accuracy > 0 &&
          (jsonResponse.analysis.toLowerCase().includes("incorrect") ||
            jsonResponse.analysis.toLowerCase().includes("wrong") ||
            jsonResponse.analysis.toLowerCase().includes("unrelated"))
        ) {
          jsonResponse.accuracy = 0;
        }

        jsonResponse.confidence_level = determineConfidenceLevel(jsonResponse.accuracy);
        results.push(jsonResponse);
      } catch (err) {
        console.error("Error parsing GPT response:", err);
        results.push({ error: "Error parsing GPT response" });
      }
    }
    const overallAnalysis = await getOverallAnalysis(results);
      const interview = new LiteInterview({
        roll_no:roll_no,
        technology:technology,
        module:module,
        topic:topic,
        level:complexity,
        questions_count:questions_count,
        question_details:results,
        overall_analysis:overallAnalysis,
        status: 1 
      })
      const savedInterview = await interview.save();
      if (savedInterview) {
        return res.status(200).json({ results, overallAnalysis });
      } else {
        return res.status(500).json({ message: 'Failed to save the interview.' });
      }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const getAllLiteInterviewDetails = async (req, res, next) => {
  const roll_no = req.params.roll_no;

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
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


function determineConfidenceLevel(accuracy) {
  if (accuracy === 0) return "low";
  if (accuracy <= 50) return "medium";
  return "high";
}


const getOverallAnalysis = async (questionsList) => {
  // Check if all answers are empty
  const allAnswersEmpty = questionsList.every(q => !q.given_answer || q.given_answer.trim() === "");

  if (allAnswersEmpty) {
    return {
      strengths: [],
      areas_of_improvement: [],
      interview_parameters: {
        communication_skills: 0,
        understandability: 0,
        analytical_skills: 0,
        time_management: 0,
        domain_skills: 0,
        logical_thinking: 0,
        attention_to_detail: 0,
      }
    };
  }

  // If at least one answer is provided, call OpenAI for analysis
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You will analyze the strengths and weaknesses of an interviewee based on their answers to a series of questions.
        Also, analyze the interview parameters as percentages for the following fields:
        - communication_skills
        - understandability
        - analytical_skills
        - time_management
        - domain_skills
        - logical_thinking
        - attention_to_detail

        Provide the response in **strict JSON format** with these keys:
        - strengths (array)
        - areas_of_improvement (array)
        - interview_parameters (object with the above fields as keys, each having a percentage value).`,
      },
      {
        role: "user",
        content: `Here is the list of questions, answers, and analyses: ${JSON.stringify(questionsList)}. Summarize the interviewee's overall strengths as an array, areas of improvement as an array, and provide the interview parameters as percentages for the following fields: communication_skills, understandability, analytical_skills, time_management, domain_skills, logical_thinking, and attention_to_detail. Provide the response in JSON format with keys: strengths, areas_of_improvement, and interview_parameters (which is an object containing the mentioned fields as keys).`,
      },

    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  let rawResponse = response.choices[0].message.content;
  console.log("OpenAI Response:", rawResponse); // Log response for debugging

  try {
    // Ensure JSON parsing safety
    const cleanedResponse = rawResponse.trim().replace(/```json|```/g, ""); // Remove Markdown syntax if present
    return JSON.parse(cleanedResponse);
  } catch (err) {
    console.error("Error parsing OpenAI response:", err, "Raw Response:", rawResponse);
    return { error: "Invalid JSON response from AI" };
  }
};

const generateQuestions = async (req, res, next) => {
  const technology = new mongoose.Types.ObjectId(req.body.technology);
  const modules = req.body.module.map((mod) => new mongoose.Types.ObjectId(mod));
  const topics = req.body.topic.map((topic) => new mongoose.Types.ObjectId(topic));
  const technology_name = req.body.technology_name;
  const level = req.body.level;
  const questions_count = req.body.questions_count;

  try {
    // Fetch module and topic details
    const module_details = await Module.aggregate([
      {
        $match: { _id: { $in: modules } },
      },
      {
        $lookup: {
          from: "topics",
          localField: "_id",
          foreignField: "module",
          as: "topicDetails",
        },
      },
      {
        $project: {
          _id: 1,
          module_name: 1,
          topicDetails: {
            $filter: {
              input: "$topicDetails",
              as: "topic",
              cond: { $in: ["$$topic._id", topics] },
            },
          },
        },
      },
      {
        $addFields: {
          topic_names: {
            $map: {
              input: "$topicDetails",
              as: "topic",
              in: "$$topic.topic_name",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          module_name: 1,
          topic_names: 1,
        },
      },
    ]);

    // Shuffle module details to ensure randomness in question generation
    const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

    const shuffled_modules = shuffleArray(
      module_details.map(
        (module) => `${module.module_name}: ${module.topic_names.join(", ")}`
      )
    );

    const session_id = new Date().getTime(); // Unique session ID

    // OpenAI input prompt with instructions for single, simple questions
    const openai_input = `Generate ${questions_count} ${level} level interview questions for the technology "${technology_name}". 
Each question should:
- Avoid combining multiple questions into one.
- Follow a clear and simple format.
- must not contain more than 25 words

Topics to cover:\n\n${shuffled_modules.join("\n")}

Ensure each question is concise and independent. Session ID: ${session_id}.`;

    let response;
    try {
      response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: openai_input }],
        temperature: 0.6, // Structured and controlled output
        max_tokens: 256, // Limit to short responses
        top_p: 0.8,
      });
    } catch (error) {
      console.error("Error generating interview questions:", error);
      return res.status(500).json({ error: "Failed to generate questions." });
    }

    return res.status(200).json({
      technology,
      module: req.body.module,
      topic: req.body.topic,
      module_details,
      level,
      questions_count,
      technology_name,
      response, // Keeping the OpenAI response structure as it is
    });
  } catch (error) {
    console.error("Error in generating questions:", error);
    return res.status(500).json({ error: "An error occurred while generating questions." });
  }
};


const addInterviewQuestions = async (req, res, next) => {
  try {
    const { technology, previous_asked_status, created_by } = req.body;
    const company = req.body.company ? JSON.parse(req.body.company) : "";
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.resolve(file.path);
    const workbook = xlsx.readFile(filePath); // Use readFile instead of read
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty or invalid" });
    }

    const insertData = data.map(row => ({
      technology,
      question: row.question || row.Question,
      answer: row.answer || row.Answer,
      company,
      previous_asked_status: row.star_status,
      created_by,
      status: 1,
    }));

    await LiteInterviewQuestion.insertMany(insertData);

    return res.status(200).json({ message: "Interview questions added successfully" });
  } catch (error) {
    console.error("Error adding questions:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const getTechnologiesWithQuestions = async (req, res, next) => {
  const baseUrl="https://mpod.ai/backend/technology-icons/"
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
  const { technology, roll_no } = req.body;

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
                favorite: 1
              }
            }
          ],
          as: "interaction"
        }
      },
      {
        $addFields: {
          favorite_status: {
            $ifNull: [{ $arrayElemAt: ["$interaction.favorite", 0] }, 0]
          },
          doubt_status: {
            $ifNull: [{ $arrayElemAt: ["$interaction.doubt", 0] }, 0]
          }

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
  const { roll_no, technology, question } = req.body;

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
  const { roll_no, technology, question } = req.body;

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
  const { roll_no, technology, question } = req.body;

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
  const { roll_no, technology, question } = req.body;

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
  const { roll_no, technology } = req.body;

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
  const { roll_no, technology } = req.body;

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
const getInterviewQuestionById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await LiteInterviewQuestion.findOne({ _id: id });
    if (result) {
      return res.status(200).json(result)
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

const updateInterviewQuestion = async (req, res, next) => {
  const { id, question, answer, technology, company, status } = req.body;
  console.log(req.body)
  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Construct the update object dynamically to avoid setting empty strings
  const updateFields = {
    question,
    answer,
    technology,
    previous_asked_status: status,
  };

  if (company && mongoose.Types.ObjectId.isValid(company)) {
    updateFields.company = company;
  } else {
    updateFields.company = null; // or omit it based on your schema
  }

  try {
    const updatedResult = await LiteInterviewQuestion.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedResult) {
      return res.status(404).json({ message: "Question not found" });
    }

    return res.status(200).json(updatedResult);
  } catch (error) {
    console.error("Error updating interview question:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
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

  generateQuestions,
  getAllLiteInterviewDetails,
  getLiteInterviewAccuracy,
  addInterviewQuestions,
  getTechnologiesWithQuestions,
  addFaviorite,
  questionsByTechnology,
  addDoubt,
  removeDoubt,
  removeFavorite,
  getFavoriteQuestions,
  getDoubtsByTechnology,
  getStarQuestions,
  getInterviewQuestions,
  getInterviewQuestionById,
  updateInterviewQuestion,
  deleteInterviewQuestion
};
