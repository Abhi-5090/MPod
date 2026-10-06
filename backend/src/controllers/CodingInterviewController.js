const mongoose = require("mongoose");
const Interview = require("../models/codingInterview"); // coding interviews
const scheduling = require("../services/scheduling");
const { loadInterviewForAccess } = require("../services/interviewModels");
const { asyncHandler } = require("../lib/http");

// Coding interviews: admin scheduling, lists and the student coding report.
// Problems are issued and evaluated by the interview session service.

const addInterviewDetails = async (req, res) => {
  const data = await scheduling.scheduleSingle(req, "coding");
  return res.status(201).json({ message: "Interview added successfully", data });
};

const addBulkInterviewDetails = async (req, res) => {
  const result = await scheduling.scheduleBulk(req, "coding");
  return res.status(207).json(result);
};

const updateInterviewDetails = async (req, res) => {
  const data = await scheduling.updateScheduled(req, "coding", req.params.id);
  return res.status(200).json({ message: "Interview updated successfully", data });
};

const deleteCodingInterviewDetails = async (req, res) => {
  const { refunded, data } = await scheduling.deleteScheduled(req, "coding", req.params.id);
  return res.status(200).json({ message: "Interview deleted successfully", refunded, data: { _id: data._id, roll_no: data.roll_no } });
};

const getAllCodingInterviewDetails = async (req, res) => {
  const tenant_id = req.params.id
  try {
    const InterviewDetails = await Interview.aggregate([{
      $match: { $or: [{ tenant_id: new mongoose.Types.ObjectId(tenant_id) }, { tenant_id: { $exists: false } }] },
    }, {
      $lookup: {
        from: "users",
        localField: "roll_no",
        foreignField: "roll_no",
        as: "userDetails",
      },
    },
    {
      $match: {
        "userDetails.tenant_id": new mongoose.Types.ObjectId(tenant_id),
      },
    },
    {
      $addFields: {
        first_name: { $arrayElemAt: ["$userDetails.first_name", 0] },
        gender: { $arrayElemAt: ["$userDetails.gender", 0] },
      },
    },
    {
      $addFields: {
        start_date_time_ist: {
          $dateToString: {
            format: "%d-%m-%Y %H:%M",
            date: "$start_date_time",
            timezone: "Asia/Kolkata"
          }
        },
      },
    },
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
                else: "Upcoming",
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        roll_no: 1,
        first_name: 1,
        gender: 1,
        level: 1,
        questions_count: 1,
        start_date_time: 1,
        platform: 1,
        start_date_time_ist: 1,
        interview_status: 1
      }
    }

    ]);

    return res.status(200).json(InterviewDetails);
  }
  catch (error) {
    return res.status(500).json({ message: "Internal server error", ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }) });
  }
}

const getInterviewDetailsById = async (req, res) => {
  const { id } = req.params;
  await loadInterviewForAccess(req, "coding", id);
  try {
    const interviewDetails = await Interview.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        },
      },
      { $unset: ["attempt.token_hash", "issued_questions", "answers", "idea_checks"] },
    ]);
    if (interviewDetails.length === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.status(200).json(interviewDetails[0]); // Return the single interview details
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }) });
  }
};

const getCodingReportDetails = async (req, res, next) => {
  const { id, roll_no } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid interview ID' });
  }
  const accessDoc = await loadInterviewForAccess(req, "coding", id, "roll_no tenant_id");
  if (accessDoc.roll_no !== roll_no) return res.status(404).json({ error: 'Interviewee not found' });
  try {
    const interviewee = await Interview.aggregate([
      {
        $match: {
          roll_no: roll_no,
          _id: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: "users",
          foreignField: "roll_no",
          localField: "roll_no",
          as: "userInfo",
          pipeline: [
            {
              $project: {
                _id: 0,
                first_name: 1,
                roll_no: 1,
                gender: 1,
                college: 1,
                branch: 1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          start_date_time_ist: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata",
            },
          },
        },
      },
    ]);

    if (!interviewee || interviewee.length === 0) {
      return res.status(404).json({ error: 'Interviewee not found' });
    }

    const interviewData = interviewee[0];
    return res.status(200).json({
      user_details: interviewData.userInfo?.[0] || null,
      question_details: interviewData.question_details || [],
      emotions: interviewData.emotions || null,
      start_date_time: interviewData.start_date_time,
      level: interviewData.level,
      questions_count: interviewData.questions_count,
      start_date_time_ist: interviewData.start_date_time_ist,

    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  addInterviewDetails: asyncHandler(addInterviewDetails),
  addBulkInterviewDetails: asyncHandler(addBulkInterviewDetails),
  updateInterviewDetails: asyncHandler(updateInterviewDetails),
  deleteCodingInterviewDetails: asyncHandler(deleteCodingInterviewDetails),
  getAllCodingInterviewDetails: asyncHandler(getAllCodingInterviewDetails),
  getInterviewDetailsById: asyncHandler(getInterviewDetailsById),
  getCodingReportDetails: asyncHandler(getCodingReportDetails),
};
