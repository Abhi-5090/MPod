const CompanyQuestion = require("../models/companyQuestion");
const Module = require("../models/module");
const mongoose = require('mongoose');
const xlsx = require('xlsx');

const addCompanyQuestion = async (req, res, next) => {
  try {
    const { company, type, round, year, tag } = req.body;
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const questions = xlsx.utils.sheet_to_json(sheet, { header: 'A' }).map((row) => Object.values(row)[0].toString());

    const savedCompanyQuestions = [];
    for (const ele of questions) {
      const companyQuestion = new CompanyQuestion({
        company: company,
        type: type,
        round: round,
        year: year,
        tag: tag,
        question: ele,
        added_by: "test"
      });
      const savedCompanyQuestion = await companyQuestion.save();
      savedCompanyQuestions.push(savedCompanyQuestion);
    }
    if (savedCompanyQuestions.length > 0) {
      return res.status(200).json(savedCompanyQuestions);
    } else {
      return res.status(500).json({ message: "Failed to save questions." });
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
const getCompanyQuestions = async (req, res, next) => {
  try {
    const questions = await CompanyQuestion.aggregate([
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo"
        }
      },
      {
        $lookup: {
          from: "tags",
          localField: "tag",
          foreignField: "_id",
          as: "tagInfo"
        }
      },
      {
        $addFields: {
          company_name: { $arrayElemAt: ["$companyInfo.company_name", 0] },
          tag_name: { $arrayElemAt: ["$tagInfo.tag_name", 0] }
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

const getCompanyQuestionsByTag = async (req, res) => {
  try {
    const { tag_id } = req.params;
    const tag_obj_id = new mongoose.Types.ObjectId(tag_id);
     const questions = await CompanyQuestion.aggregate([
      {
        $match: {
          tag: tag_obj_id
        }
      },
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo"
        }
      },
      {
        $lookup: {
          from: "tags",
          localField: "tag",
          foreignField: "_id",
          as: "tagInfo"
        }
      },
      {
        $addFields: {
          company_name: { $arrayElemAt: ["$companyInfo.company_name", 0] },
          tag_name: { $arrayElemAt: ["$tagInfo.tag_name", 0] }
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
}

const getCompanyQuestionById = async (req, res, next) => {
  const questionId = req.params.id;
  try {
    const question = await CompanyQuestion.aggregate([
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
const updateCompanyQuestion = async (req, res, next) => {
  const questionId = req.params.id;
  const { company, type, round, year, tag, question } = req.body;
  try {
    const comapnyQuestion = await CompanyQuestion.findById(questionId);
    if (!comapnyQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    if (company != 'undefined') {
      comapnyQuestion.company = company
    }
    if (type != 'undefined') {
      comapnyQuestion.type = type;
    }
    if (round != 'undefined') {
      comapnyQuestion.round = round;
    }
    if (year != 'undefined') {
      comapnyQuestion.year = year;
    }
    if (tag != 'undefined') {
      comapnyQuestion.tag = tag;
    }
    if (question != 'undefined') {
      comapnyQuestion.question = question;
    }
    // if (status != 'undefined') {
    //   question.status = status;
    // }


    await comapnyQuestion.save();

    return res.status(200).json({ message: "Question updated successfully", comapnyQuestion });
  } catch (error) {
    console.error("Error updating Question:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
const deleteCompanyQuestion = async (req, res, next) => {
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
const QuestionsCount = async (req, res, next) => {
  const { company, type, round } = req.body;
  try {
    const result = await CompanyQuestion.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(company),
          type: type,
          round: round
        }
      }
    ])
  } catch (error) {
    return req.status(500).json({ message: "Internal server error" })
  }
}

module.exports = {
  addCompanyQuestion,
  getCompanyQuestions,
  getCompanyQuestionById,
  updateCompanyQuestion,
  deleteCompanyQuestion,
  QuestionsCount,
  getCompanyQuestionsByTag
};
