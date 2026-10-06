const CodingQuestion = require("../models/codingQuestion");
const Module = require("../models/module");
const mongoose = require('mongoose');
const xlsx = require('xlsx');

const addCodingQuestion = async (req, res, next) => {
  try {
    console.log("adding")
    const { company, problem_name, complexity, time, description, input, output, constraints, added_by } = req.body;

    const codingQuestion = new CodingQuestion({
      company,
      problem_name,
      complexity,
      time,
      description,
      input,
      output,
      constraints,
      added_by: "test"
    });
    const savedCodingQuestion = await codingQuestion.save();

    if (savedCodingQuestion) {
      return res.status(200).json(savedCodingQuestion);
    } else {
      return res.status(500).json({ message: "Failed to save questions." });
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
const getCodingQuestions = async (req, res, next) => {
  try {
    const questions = await CodingQuestion.aggregate([
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo"
        }
      },
      {
        $addFields: {
          company_name: { $arrayElemAt: ["$companyInfo.company_name", 0] },
        }
      },
      {
        $project: {
          companyInfo: 0
        }
      }
    ])
    if (questions.length > 0) {
      return res.status(200).json(questions);
    } else {
      return res.status(404).json({ message: "Questions not found" });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getCodingQuestionById = async (req, res, next) => {
  const questionId = req.params.id;
  try {
    const question = await CodingQuestion.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(questionId)
        }
      }
    ]);

    if (!question || question.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }
    res.status(200).json(question[0]);
  } catch (error) {
    console.error("Error fetching topic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateCodingQuestion = async (req, res, next) => {
  const questionId = req.params.id;
  const { problem_name, complexity, time, company, description, input, output, constraints } = req.body;

  try {
    const companyQuestion = await CodingQuestion.findById(questionId);
    if (!companyQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (problem_name !== undefined) {
      companyQuestion.problem_name = problem_name;
    }
    if (complexity !== undefined) {
      companyQuestion.complexity = complexity;
    }
    if (time !== undefined) {
      companyQuestion.time = time;
    }
    if (company !== undefined) {
      companyQuestion.company = company;
    }
    if (description !== undefined) {
      companyQuestion.description = description;
    }
    if (input !== undefined) {
      companyQuestion.input = input;
    }
    if (output !== undefined) {
      companyQuestion.output = output;
    }
    if (constraints !== undefined) {
      companyQuestion.constraints = constraints;
    }

    await companyQuestion.save();

    return res.status(200).json({ message: "Question updated successfully", companyQuestion });
  } catch (error) {
    console.error("Error updating Question:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const deleteCodingQuestion = async (req, res, next) => {
  const topicId = req.params.id;

  try {
    const deleteTopic = await Topic.findByIdAndDelete(topicId);

    if (!deleteTopic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    return res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("Error deleting Topic:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
const codingQuestionsCount = async (req, res, next) => {
  try {
    const result = await CodingQuestion.aggregate([
      {
        $match: {
          status: 1, 
        },
      },
      {
        $group: {
          _id: "$complexity", 
          count: { $sum: 1 }, 
        },
      },
    ]);

    const formattedResult = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    result.forEach(item => {
      const key = item._id?.toLowerCase();
      if (formattedResult.hasOwnProperty(key)) {
        formattedResult[key] = item.count;
      }
    });

    return res.status(200).json(formattedResult);
  } catch (error) {
    console.error("Error in codingQuestionsCount:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  addCodingQuestion,
  getCodingQuestions,
  getCodingQuestionById,
  updateCodingQuestion,
  deleteCodingQuestion,
  codingQuestionsCount
};
