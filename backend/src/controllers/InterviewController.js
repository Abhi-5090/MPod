const mongoose = require("mongoose");
const Interview = require("../models/interview");
const CompanyInterview = require("../models/companyInterview");
const scheduling = require("../services/scheduling");
const { loadInterviewForAccess } = require("../services/interviewModels");
const { asyncHandler } = require("../lib/http");
const { decorate } = require("../services/interviewStatus");
const { istDayRange } = require("../lib/time");

// Technology ("ai generated") interviews: admin scheduling, lists and the student report.

const addInterviewDetails = async (req, res) => {
  const data = await scheduling.scheduleSingle(req, "ai generated");
  return res.status(201).json({ message: "Interview added successfully", data });
};

const addBulkInterviewDetails = async (req, res) => {
  const result = await scheduling.scheduleBulk(req, "ai generated");
  return res.status(207).json(result);
};

const editInterviewDetails = async (req, res) => {
  const data = await scheduling.updateScheduled(req, "ai generated", req.params.id);
  return res.status(200).json({ message: "Interview updated successfully", data });
};

const deleteInterviewDetails = async (req, res) => {
  const { refunded, data } = await scheduling.deleteScheduled(req, "ai generated", req.params.id);
  return res.status(200).json({ message: "Interview deleted successfully", refunded, data: { _id: data._id, roll_no: data.roll_no } });
};

const getAllInterviewDetails = async (req, res) => {
  try {
    const tenant_id = new mongoose.Types.ObjectId(req.params.id); // scoped by route middleware

    // date query param format expected: YYYY-MM-DD (e.g., 2025-12-03)
    // The requested calendar day (or yesterday) in India, whatever the server's timezone.
    const { start: startOfDay, end: endOfDay } = istDayRange(req.query.date ? String(req.query.date) : null, -1);

    const InterviewDetails = await Interview.aggregate([
      // match interviews whose start_date_time falls within the target day
      {
        $match: {
          start_date_time: { $gte: startOfDay, $lte: endOfDay },
          $or: [{ tenant_id: tenant_id }, { tenant_id: { $exists: false } }],
        },
      },
      // join with users to filter by tenant_id (roll_no -> users.roll_no)
      {
        $lookup: {
          from: "users",
          localField: "roll_no",
          foreignField: "roll_no",
          as: "userDetails",
        },
      },
      // ensure user belongs to tenant
      {
        $match: { "userDetails.tenant_id": tenant_id },
      },
      // other lookups
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseDetails",
        },
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
        $lookup: {
          from: "modules",
          localField: "module",
          foreignField: "_id",
          as: "moduleDetails",
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
      // transform fields and compute IST string, status, avg accuracy
      {
        $addFields: {
          first_name: { $first: "$userDetails.first_name" },
          gender: { $first: "$userDetails.gender" },
          college: { $first: "$userDetails.college" },
          course_name: { $first: "$courseDetails.course_name" },
          technology_name: { $first: "$technologyDetails.technology_name" },
          module_name: {
            $map: {
              input: "$moduleDetails",
              as: "m",
              in: "$$m.module_name",
            },
          },
          topic_name: {
            $map: {
              input: "$topicDetails",
              as: "t",
              in: "$$t.topic_name",
            },
          },
          start_date_time_ist: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata",
            },
          },
          interview_status: {
            $switch: {
              branches: [
                {
                  case: { $gt: [{ $size: "$question_details" }, 0] },
                  then: "Attempted",
                },
                {
                  case: { $lt: ["$start_date_time", new Date()] },
                  then: "Expired",
                },
              ],
              default: "Upcoming",
            },
          },
          average_accuracy: {
            $cond: {
              if: { $gt: [{ $size: "$question_details" }, 0] },
              then: {
                $avg: {
                  $map: {
                    input: "$question_details",
                    as: "q",
                    in: "$$q.accuracy",
                  },
                },
              },
              else: "-",
            },
          },
        },
      },
      {
        $project: {
          userDetails: 0,
          technologyDetails: 0,
          moduleDetails: 0,
          topicDetails: 0,
          courseDetails: 0,
          question_details: 0,
          "attempt.token_hash": 0, issued_questions: 0, answers: 0, idea_checks: 0,
        },
      },
    ]);

    res.status(200).json(decorate(InterviewDetails));
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("Error fetching interview details:", error);
    res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }),
    });
  }
};




const getInterviewDetailsById = async (req, res) => {
  const { id } = req.params;
  await loadInterviewForAccess(req, "ai generated", id);
  try {
    const interviewDetails = await Interview.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "roll_no",
          foreignField: "roll_no",
          as: "userDetails"
        }
      },
      {
        $addFields: {
          first_name: {
            $arrayElemAt: [
              "$userDetails.first_name",
              0
            ]
          },
          gender: {
            $arrayElemAt: ["$userDetails.gender", 0]
          }
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseDetails"
        }
      },
      {
        $addFields: {
          couse_name: {
            $arrayElemAt: [
              "$courseDetails.course_name",
              0
            ]
          }
        }
      },
      {
        $lookup: {
          from: "technologies",
          localField: "technology",
          foreignField: "_id",
          as: "technologyDetails"
        }
      },
      {
        $addFields: {
          technology_name: {
            $arrayElemAt: [
              "$technologyDetails.technology_name",
              0
            ]
          }
        }
      },
      {
        $lookup: {
          from: "modules",
          localField: "module",
          foreignField: "_id",
          as: "moduleDetails"
        }
      },
      {
        $addFields: {
          module_name: "$moduleDetails.module_name",
          module_details: { $map: { input: "$moduleDetails", as: "m", in: { _id: "$$m._id", module_name: "$$m.module_name" } } }
        }
      },
      {
        $lookup: {
          from: "topics",
          localField: "topic",
          foreignField: "_id",
          as: "topicDetails"
        }
      },
      {
        $addFields: {
          topic_name: "$topicDetails.topic_name",
          topic_details: { $map: { input: "$topicDetails", as: "t", in: { _id: "$$t._id", topic_name: "$$t.topic_name" } } }
        }
      },
      {
        $unset: [
          "userDetails",
          "technologyDetails",
          "moduleDetails",
          "topicDetails",
          "courseDetails",
          "attempt.token_hash",
          "issued_questions",
          "answers",
          "idea_checks"
        ]
      }
    ]);
    if (interviewDetails.length === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.status(200).json(interviewDetails[0]); // Return the single interview details
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }) });
  }
};

const getQuestionDetails = async (req, res, next) => {
  const { id, interview_type, roll_no } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid interview ID' });
  }
  if (!["ai generated", "company", "technology"].includes(interview_type)) {
    return res.status(400).json({ error: 'Invalid interview type' });
  }
  const accessDoc = await loadInterviewForAccess(req, interview_type, id, "roll_no tenant_id");
  if (accessDoc.roll_no !== roll_no) return res.status(404).json({ error: 'Interviewee not found' });
  try {
    const getDetails = async (Model, isStandardInterview, isCompanyInterview) => {
      const interviewee = await Model.aggregate([
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
            // same college only (roll numbers can repeat across colleges)
            let: { t: "$tenant_id" },
            pipeline: [
              { $match: { $expr: { $or: [{ $eq: [{ $type: "$$t" }, "missing"] }, { $eq: ["$tenant_id", "$$t"] }] } } },
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

        ...(isStandardInterview
          ? [
            {
              $lookup: {
                from: "technologies",
                localField: "technology",
                foreignField: "_id",
                as: "technologyInfo"
              }
            },
            {
              $addFields: {
                technology_name: { $arrayElemAt: ["$technologyInfo.technology_name", 0] }
              }
            },
            {
              $lookup: {
                from: "modules",
                localField: "module",
                foreignField: "_id",
                as: "moduleInfo"
              }
            },
            {
              $addFields: {
                module_names: "$moduleInfo.module_name"
              }
            },
            {
              $lookup: {
                from: "topics",
                localField: "topic",
                foreignField: "_id",
                as: "topicInfo"
              }
            },
            {
              $addFields: {
                topic_names: "$topicInfo.topic_name"
              }
            }
          ]
          : []),

        ...(isCompanyInterview
          ? [
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
                company_names: "$companyInfo.company_name"
              }
            }
          ]
          : []),

        {
          $addFields: {
            start_date_time: {
              $dateToString: {
                format: "%d-%m-%Y %H:%M",
                date: "$start_date_time",
                timezone: "Asia/Kolkata"
              }
            }
          }
        }
      ]);

      if (!interviewee || interviewee.length === 0) {
        return res.status(404).json({ error: 'Interviewee not found' });
      }
      const interviewData = interviewee[0];
      return res.status(200).json({
        user_details: interviewData.userInfo?.[0] || null,
        question_details: interviewData.question_details || [],
        overall_analysis: interviewData.overall_analysis?.[0] || null,
        emotions: interviewData.emotions || null,
        start_date_time: interviewData.start_date_time,
        level: interviewData.level,
        questions_count: interviewData.questions_count,
        ...(isStandardInterview && {
          technology_name: interviewData.technology_name || null,
          module_names: interviewData.module_names || [],
          topic_names: interviewData.topic_names || [],
          interview_type: interview_type

        }),
        ...(isCompanyInterview && {
          company_names: interviewData.company_names || [],
          type: interviewData.type || [],
          round: interviewData.round || [],
          interview_type: interview_type

        })
      });
    };

    if (interview_type === "company") {
      return await getDetails(CompanyInterview, false, true);
    }
    return await getDetails(Interview, true, false);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


module.exports = {
  addInterviewDetails: asyncHandler(addInterviewDetails),
  addBulkInterviewDetails: asyncHandler(addBulkInterviewDetails),
  editInterviewDetails: asyncHandler(editInterviewDetails),
  deleteInterviewDetails: asyncHandler(deleteInterviewDetails),
  getAllInterviewDetails: asyncHandler(getAllInterviewDetails),
  getInterviewDetailsById: asyncHandler(getInterviewDetailsById),
  getQuestionDetails: asyncHandler(getQuestionDetails),
};
