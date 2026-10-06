const CompanyInterview = require("../models/companyInterview");
const Interview = require("../models/interview");
const CodingInterview = require("../models/codingInterview");
const CompanyQuestion = require("../models/companyQuestion");
const Tenant = require("../models/tenant");
const User = require("../models/user");
const Technology = require("../models/technology");
const Module = require("../models/module");
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
const addInterviewDetails = async (req, res) => {
  try {
    const {
      platform,
      roll_no,
      type,
      round,
      tag,
      start_date_time,
      level,
      questions_count,
      created_by,
      company,
      tenant_id
    } = req.body;
    const tenant = await Tenant.findOne({ _id: tenant_id });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (tenant.active_credits === 0) {
      return res.status(400).json({ message: "Your credits are not enough to create an interview" });
    }
    const interviewStartTime = new Date(start_date_time);
    const interviewEndTime = new Date(interviewStartTime.getTime() + 30 * 60000); 

   
    const existingInterview = await Interview.findOne({
      roll_no,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - 30 * 60000), 
        $lte: interviewEndTime 
      }
    });
    const existingCodingInterview = await CodingInterview.findOne({
      roll_no,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - 30 * 60000), 
        $lte: interviewEndTime 
      }
    });
    const existingCompanyInterview = await CompanyInterview.findOne({
      roll_no,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - 30 * 60000), 
        $lte: interviewEndTime 
      }
    });
    if (existingInterview||existingCodingInterview||existingCompanyInterview) {
      let tag
      if(existingInterview) {
        tag="Technology interview"
      } else if(existingCodingInterview) {
        tag = "Coding Interview"
      } else if(existingCompanyInterview) {
        tag = "Company Interview"
      }
      return res.status(400).json({
        message: `${tag} is already scheduled around this time. Please choose a different time.`
      });
    }
    const newInterview = new CompanyInterview({
      platform,
      company,
      roll_no,
      type,
      round,
      tag,
      start_date_time,
      level,
      questions_count,
      created_by,
      status: 1
    });

    const savedInterview = await newInterview.save();
    tenant.active_credits -= 1;
    await tenant.save();
    return res.status(200).json({
      message: "Interview added successfully",
      data: savedInterview
    });

  } catch (error) {
    console.error("Error adding interview:", error);
    return res.status(500).json({
      message: "An error occurred while adding the interview",
      error: error.message
    });
  }
};

const bulkAddInterviewDetails = async (req, res) => {
  try {
    const {
      platform,
      type,
      round,
      start_date_time,
      level,
      questions_count,
      created_by,
      company,
      tenant_id
    } = req.body;

    // --------------------------
    // FIX ARRAY FIELDS
    // --------------------------
    const parseToArray = (val) => {
      try {
        let parsed = JSON.parse(val.replace(/'/g, '"').trim());
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return [val.trim()];
      }
    };

    const typeArr = parseToArray(type);
    const roundArr = parseToArray(round);
    const companyArr = parseToArray(company);

    // Validate tenant
    const tenant = await Tenant.findOne({ _id: tenant_id });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (tenant.active_credits === 0) {
      return res.status(400).json({ message: "Your credits are not enough to create an interview" });
    }

    // BULK MODE
    if (req.file) {
      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      const results = [];
      const alreadyScheduled = [];

      const interviewStartTime = new Date(start_date_time);
      const interviewEndTime = new Date(interviewStartTime.getTime() + 30 * 60000);

      for (const row of data) {
        const rollNo = row.roll_no?.toString().trim();

        if (!rollNo) {
          results.push({ roll_no: null, status: "failed", reason: "Missing roll number" });
          continue;
        }

        try {
          if (tenant.active_credits <= 0) {
            results.push({ roll_no: rollNo, status: "failed", reason: "No credits left" });
            continue;
          }

          // Overlap check
          const overlapQuery = {
            roll_no: rollNo,
            start_date_time: {
              $gte: new Date(interviewStartTime.getTime() - 30 * 60000),
              $lte: interviewEndTime
            }
          };

          const existingInterview = await Interview.findOne(overlapQuery);
          const existingCodingInterview = await CodingInterview.findOne(overlapQuery);
          const existingCompanyInterview = await CompanyInterview.findOne(overlapQuery);

          if (existingInterview || existingCodingInterview || existingCompanyInterview) {
            let tag = existingInterview
              ? "Technology Interview"
              : existingCodingInterview
              ? "Coding Interview"
              : "Company Interview";

            results.push({
              roll_no: rollNo,
              status: "failed",
              reason: `${tag} already scheduled around this time`
            });
            alreadyScheduled.push(rollNo);
            continue;
          }

          // Save interview
          const newInterview = new CompanyInterview({
            platform,
            company: companyArr,
            roll_no: rollNo,
            type: typeArr,
            round: roundArr,
            start_date_time,
            level,
            questions_count,
            created_by,
            status: 1
          });

          await newInterview.save();
          tenant.active_credits -= 1;
          await tenant.save();

          results.push({
            roll_no: rollNo,
            status: "success",
            message: "Interview scheduled"
          });

        } catch (err) {
          results.push({ roll_no: rollNo, status: "failed", reason: err.message });
        }
      }

      return res.status(207).json({
        message: "Bulk processing completed",
        total: data.length,
        success: results.filter(r => r.status === "success").length,
        failed: results.filter(r => r.status === "failed").length,
        already_scheduled: alreadyScheduled,
        results
      });
    }

    return res.status(400).json({ message: "Missing file for bulk upload" });

  } catch (error) {
    console.error("Bulk Error:", error);
    return res.status(500).json({
      message: "An error occurred while processing bulk upload",
      error: error.message
    });
  }
};

const getAllInterviewDetails = async (req, res) => {
  const tenant_id = req.params.id;
  try {
    // parse optional date query param (YYYY-MM-DD)
    let dateParam = req.query.date;
    let targetDate;
    if (dateParam) {
      // create Date from YYYY-MM-DD (interpreted in server timezone as midnight)
      targetDate = new Date(dateParam);
    } else {
      // default to yesterday
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - 1);
    }

    // build start and end of target day in server timezone
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const InterviewDetails = await CompanyInterview.aggregate([
      // match start_date_time within the day
      {
        $match: {
          start_date_time: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      // join users to get first_name, gender and tenant filtering
      {
        $lookup: {
          from: "users",
          localField: "roll_no",
          foreignField: "roll_no",
          as: "userDetails",
        },
      },
      // filter by tenant_id – matches if any userDetails element has tenant_id
      {
        $match: {
          "userDetails.tenant_id": new mongoose.Types.ObjectId(tenant_id)
        }
      },
      // compute IST string and basic fields
      {
        $addFields: {
          first_name: { $arrayElemAt: ["$userDetails.first_name", 0] },
          gender: { $arrayElemAt: ["$userDetails.gender", 0] },
          start_date_time_ist: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata"
            }
          }
        }
      },
      // compute interview_status based on question_details and time
      {
        $addFields: {
          interview_status: {
            $cond: {
              if: { $gt: [{ $size: "$question_details" }, 0] },
              then: "Attempted",
              else: {
                $cond: {
                  if: { $lt: ["$start_date_time", new Date()] },
                  then: "Expired",
                  else: "Upcoming"
                }
              }
            }
          }
        }
      },
      // project required fields only
      {
        $project: {
          _id: 1,
          roll_no: 1,
          first_name: 1,
          gender: 1,
          type: 1,
          round: 1,
          start_date_time: 1,
          questions_count: 1,
          platform: 1,
          start_date_time_ist: 1,
          interview_status: 1
        }
      }
    ]);

    return res.status(200).json(InterviewDetails);
  } catch (error) {
    console.error("Error fetching interview details:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getInterviewDetailsById = async (req, res) => {
  const { id } = req.params;
  try {
    const interviewDetails = await CompanyInterview.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        },
      },

    ]);
    if (interviewDetails.length === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.status(200).json(interviewDetails[0]); // Return the single interview details
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const updateCompanyInterview = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }
    const {
      platform,
      company,
      roll_no,
      type,
      round,
      start_date_time,
      level,
      questions_count,
      created_by,
    } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    const updateFields = {
      platform,
      company,
      roll_no,
      type,
      round,
      start_date_time,
      level,
      questions_count,
      created_by,
    };

    Object.keys(updateFields).forEach(
      (key) => updateFields[key] === undefined && delete updateFields[key]
    );

    const updatedInterview = await CompanyInterview.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedInterview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.status(200).json({
      message: "Interview updated successfully",
      data: updatedInterview,
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    return res.status(500).json({
      message: "An error occurred while updating the interview",
      error: error.message,
    });
  }
};
const generateCompanyQuestions = async (req, res, next) => {
  const { company, round, type, questions_count, tag } = req.body;
  try {
    const questions = await CompanyQuestion.aggregate([
      {
        $match: {
          company: { $in: company.map(id => new mongoose.Types.ObjectId(id)) },
          round: { $in: round },
          type: { $in: type },
          tag:new mongoose.Types.ObjectId(tag)
        }
      },
      {
        $sample: { size: parseInt(questions_count) } 
      }
    ]);
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const deleteCompanyInterviewDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInterview = await CompanyInterview.findByIdAndDelete(id);

    if (!deletedInterview) {
      return res.status(404).json({
        message: 'Interview not found'
      });
    }

    const user = await User.findOne({ roll_no: deletedInterview.roll_no });

    if (user) {
      const tenant = await Tenant.findOne({ _id: user.tenant_id });

      if (tenant) {
        tenant.active_credits += 1;
        await tenant.save();
      }
    }

    return res.status(200).json({
      message: 'Interview deleted successfully',
      data: deletedInterview
    });

  } catch (error) {
    console.error('Error deleting interview:', error);
    return res.status(500).json({
      message: 'An error occurred while deleting the interview',
      error: error.message
    });
  }
};
const availableCompanyQuestions = async (req, res, next) => {
  const { company, type, round, tag } = req.body;

  try {
    const result = await CompanyQuestion.aggregate([
      {
        $match: {
          company: { $in: company.map(id => new mongoose.Types.ObjectId(id)) },
          type: { $in: type },
          round: { $in: round },
          tag:new mongoose.Types.ObjectId(tag)
        }
      },
      {
        $count: "total"
      }
    ]);

    const count = result.length > 0 ? result[0].total : 0;

    return res.status(200).json({ count });
  } catch (error) {
    console.error("Aggregation Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  addInterviewDetails,
  getInterviewDetailsById,
  getAllInterviewDetails,
  updateCompanyInterview,
  generateCompanyQuestions,
  deleteCompanyInterviewDetails,
  availableCompanyQuestions,
  bulkAddInterviewDetails
};
