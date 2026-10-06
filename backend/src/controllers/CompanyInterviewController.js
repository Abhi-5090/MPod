const mongoose = require("mongoose");
const CompanyInterview = require("../models/companyInterview");
const CompanyQuestion = require("../models/companyQuestion");
const scheduling = require("../services/scheduling");
const { loadInterviewForAccess } = require("../services/interviewModels");
const { asyncHandler } = require("../lib/http");
const { decorate } = require("../services/interviewStatus");
const { istDayRange } = require("../lib/time");

// Company interviews: admin scheduling and lists. Questions are issued by the
// interview session service when the student starts.

const addInterviewDetails = async (req, res) => {
  const data = await scheduling.scheduleSingle(req, "company");
  return res.status(201).json({ message: "Interview added successfully", data });
};

const bulkAddInterviewDetails = async (req, res) => {
  const result = await scheduling.scheduleBulk(req, "company");
  return res.status(207).json(result);
};

const updateCompanyInterview = async (req, res) => {
  const data = await scheduling.updateScheduled(req, "company", req.params.id);
  return res.status(200).json({ message: "Interview updated successfully", data });
};

const deleteCompanyInterviewDetails = async (req, res) => {
  const { refunded, data } = await scheduling.deleteScheduled(req, "company", req.params.id);
  return res.status(200).json({ message: "Interview deleted successfully", refunded, data: { _id: data._id, roll_no: data.roll_no } });
};

const getAllInterviewDetails = async (req, res) => {
  const tenant_id = req.params.id;
  try {
    // parse optional date query param (YYYY-MM-DD)
    // The requested calendar day (or yesterday) in India, whatever the server's timezone.
    const { start: startOfDay, end: endOfDay } = istDayRange(req.query.date ? String(req.query.date) : null, -1);

    const InterviewDetails = await CompanyInterview.aggregate([
      // match start_date_time within the day
      {
        $match: {
          start_date_time: { $gte: startOfDay, $lte: endOfDay },
          $or: [{ tenant_id: new mongoose.Types.ObjectId(tenant_id) }, { tenant_id: { $exists: false } }],
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
          interview_status: 1,
          status: 1,
          evaluation_status: 1,
          evaluation_waiting_for_ai: 1,
          evaluation_error: 1,
          "attempt.started_at": 1
        }
      }
    ]);

    return res.status(200).json(decorate(InterviewDetails));
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("Error fetching interview details:", error);
    return res.status(500).json({ message: "Internal server error", ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }) });
  }
};


const getInterviewDetailsById = async (req, res) => {
  const { id } = req.params;
  await loadInterviewForAccess(req, "company", id);
  try {
    const interviewDetails = await CompanyInterview.aggregate([
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

const availableCompanyQuestions = async (req, res, next) => {
  const { company, type, round, tag } = req.body || {};
  if (!Array.isArray(company) || !Array.isArray(type) || !Array.isArray(round)) {
    return res.status(400).json({ message: "company, type and round must be lists" });
  }

  try {
    const result = await CompanyQuestion.aggregate([
      {
        $match: {
          company: { $in: company.map(id => new mongoose.Types.ObjectId(id)) },
          type: { $in: type },
          round: { $in: round },
          status: { $ne: 0 },
          ...(tag ? { tag: new mongoose.Types.ObjectId(String(tag)) } : {})
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
  addInterviewDetails: asyncHandler(addInterviewDetails),
  bulkAddInterviewDetails: asyncHandler(bulkAddInterviewDetails),
  updateCompanyInterview: asyncHandler(updateCompanyInterview),
  deleteCompanyInterviewDetails: asyncHandler(deleteCompanyInterviewDetails),
  getAllInterviewDetails: asyncHandler(getAllInterviewDetails),
  getInterviewDetailsById: asyncHandler(getInterviewDetailsById),
  availableCompanyQuestions: asyncHandler(availableCompanyQuestions),
};
