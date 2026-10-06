const nodemailer = require('nodemailer');
const Interview = require("../models/interview");
const Tenant = require("../models/tenant");
const User = require("../models/user");
const Technology = require("../models/technology");
const Module = require("../models/module");
const CodingInterview = require("../models/codingInterview");
const CompanyInterview = require("../models/companyInterview");
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
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});
// const addInterviewDetails = async (req, res) => {
//   try {
//     const {
//       platform,
//       roll_no,
//       course,
//       technology,
//       module,
//       topic,
//       start_date_time,
//       level,
//       questions_count,
//       created_by,
//       tenant_id
//     } = req.body;
//     const tenant = await Tenant.findOne({ _id: tenant_id });

//     if (!tenant) {
//       return res.status(404).json({ message: "Tenant not found" });
//     }

//     if (tenant.active_credits === 0) {
//       return res.status(400).json({ message: "Your credits are not enough to create an interview" });
//     }

//     const interviewStartTime = new Date(start_date_time);
//     const interviewEndTime = new Date(interviewStartTime.getTime() + 30 * 60000);


//     const existingInterview = await Interview.findOne({
//       roll_no,
//       start_date_time: {
//         $gte: new Date(interviewStartTime.getTime() - 30 * 60000),
//         $lte: interviewEndTime
//       }
//     });
//     const existingCodingInterview = await CodingInterview.findOne({
//       roll_no,
//       start_date_time: {
//         $gte: new Date(interviewStartTime.getTime() - 30 * 60000),
//         $lte: interviewEndTime
//       }
//     });
//     const existingCompanyInterview = await CompanyInterview.findOne({
//       roll_no,
//       start_date_time: {
//         $gte: new Date(interviewStartTime.getTime() - 30 * 60000),
//         $lte: interviewEndTime
//       }
//     });
//     if (existingInterview || existingCodingInterview || existingCompanyInterview) {
//       let tag
//       if (existingInterview) {
//         tag = "Technology interview"
//       } else if (existingCodingInterview) {
//         tag = "Coding Interview"
//       } else if (existingCompanyInterview) {
//         tag = "Company Interview"
//       }
//       return res.status(400).json({
//         message: `${tag} is already scheduled around this time. Please choose a different time.`
//       });
//     }

//     const newInterview = new Interview({
//       platform,
//       roll_no,
//       course,
//       technology,
//       module,
//       topic,
//       start_date_time,
//       level,
//       questions_count,
//       created_by,
//       status: 1
//     });

//     const savedInterview = await newInterview.save();
//     const user = await User.findOne({ roll_no });

//     const istDateTime = new Date(savedInterview.start_date_time).toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//     const message = `Hello ${user.name || ''},

//               Your Technology interview is scheduled on ${istDateTime} (IST).

//               Please make sure to log in at least 5 minutes before the scheduled time.

//               You will have a 5-minute grace period to begin the interview after the scheduled start time. If you fail to start within this period, the interview will expire and cannot be attempted.

//               All the best!

//               Thank you!`;
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: user.email,
//       subject: 'Interview Schedule',
//       text: message
//     };

//     await transporter.sendMail(mailOptions);
//     tenant.active_credits -= 1;
//     await tenant.save();

//     return res.status(201).json({
//       message: "Interview added successfully",
//       data: savedInterview
//     });

//   } catch (error) {
//     console.error("Error adding interview:", error);
//     return res.status(500).json({
//       message: "An error occurred while adding the interview",
//       error: error.message
//     });
//   }
// };



const addInterviewDetails = async (req, res) => {
  try {
    const {
      platform,
      roll_no,
      course,
      technology,
      module,
      topic,
      start_date_time,
      level,
      questions_count,
      created_by,
      tenant_id
    } = req.body;


    const tenant = await Tenant.findOne({ _id: tenant_id });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (tenant.active_credits === 0) {
      return res.status(400).json({ message: "Your credits are not enough to create an interview" });
    }

    // Use tenant's interview duration
    const interviewDuration = tenant.interview_duration_minutes || 30;
    const interviewStartTime = new Date(start_date_time);
    const interviewEndTime = new Date(interviewStartTime.getTime() + interviewDuration * 60000);


    const existingInterview = await Interview.findOne({
      roll_no,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - interviewDuration * 60000),
        $lte: interviewEndTime
      }
    });
    const existingCodingInterview = await CodingInterview.findOne({
      roll_no,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - interviewDuration * 60000),
        $lte: interviewEndTime
      }
    });
    const existingCompanyInterview = await CompanyInterview.findOne({
      roll_no,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - interviewDuration * 60000),
        $lte: interviewEndTime
      }
    });

    if (existingInterview || existingCodingInterview || existingCompanyInterview) {
      let tag;
      if (existingInterview) tag = "Technology interview";
      else if (existingCodingInterview) tag = "Coding Interview";
      else if (existingCompanyInterview) tag = "Company Interview";

      return res.status(400).json({
        message: `${tag} is already scheduled around this time. Please choose a different time.`
      });
    }

    // Save interview
    const newInterview = new Interview({
      platform,
      roll_no,
      course,
      technology,
      module,
      topic,
      start_date_time,
      level,
      questions_count,
      created_by,
      status: 1
    });
    const savedInterview = await newInterview.save();

    // Notify user
    // const user = await User.findOne({ roll_no });
    // const istDateTime = new Date(savedInterview.start_date_time).toLocaleString("en-IN", {
    //   timeZone: "Asia/Kolkata",
    //   year: "numeric",
    //   month: "long",
    //   day: "numeric",
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: true,
    // });
    // const message = `Hello ${user.name || ''},\n\nYour Technology interview is scheduled on ${istDateTime} (IST).\n\nPlease make sure to log in at least 5 minutes before the scheduled time.\nYou will have a 5-minute grace period to begin the interview after the scheduled start time. If you fail to start within this period, the interview will expire and cannot be attempted.\n\nAll the best!\n\nThank you!`;

    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: user.email,
    //   subject: 'Interview Schedule',
    //   text: message
    // };
    // await transporter.sendMail(mailOptions);

    // Deduct credit
    tenant.active_credits -= 1;
    await tenant.save();

    return res.status(201).json({
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

// const addBulkInterviewDetails = async (req, res) => {
//   try {
//     const {
//       platform,
//       roll_no,
//       course,
//       technology,
//       module,
//       topic,
//       start_date_time,
//       level,
//       questions_count,
//       created_by,
//       tenant_id,
//       type
//     } = req.body;
//     const tenant = await Tenant.findOne({ _id: tenant_id });
//     if (!tenant) {
//       return res.status(404).json({ message: "Tenant not found" });
//     }

//     if (tenant.active_credits === 0) {
//       return res.status(400).json({ message: "Your credits are not enough to create an interview" });
//     }

//     // For bulk interview (expects Excel file)
//     if (type === "bulk" && req.file) {
//       const workbook = xlsx.readFile(req.file.path);
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const data = xlsx.utils.sheet_to_json(sheet);

//       const results = [];
//       const alreadyScheduled = [];

//       for (const row of data) {
//         const rollNo = row.roll_no?.toString().trim();
//         if (!rollNo) {
//           results.push({ roll_no: null, status: "failed", reason: "Missing roll number" });
//           continue;
//         }

//         const result = await createInterview({
//           roll_no: rollNo,
//           platform,
//           course,
//           technology,
//           module,
//           topic,
//           start_date_time,
//           level,
//           questions_count,
//           created_by,
//           tenant
//         });

//         results.push({ roll_no: rollNo, status: result.status === 201 ? "success" : "failed", message: result.response.message });

//         if (
//           result.status === 400 &&
//           result.response.message?.includes("already scheduled")
//         ) {
//           alreadyScheduled.push(rollNo);
//         }
//       }
//       return res.status(207).json({
//         message: "Bulk processing completed",
//         total: data.length,
//         success: results.filter(r => r.status === "success").length,
//         failed: results.filter(r => r.status === "failed").length,
//         already_scheduled: alreadyScheduled,
//         results
//       });
//     }


//     return res.status(400).json({ message: "Invalid type or missing file" });

//   } catch (error) {
//     console.error("Error adding interview:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
// const createInterview = async ({
//   roll_no, platform, course, technology, module, topic,
//   start_date_time, level, questions_count, created_by, tenant
// }) => {
//   try {
//     const interviewStartTime = new Date(start_date_time);
//     const interviewEndTime = new Date(interviewStartTime.getTime() + 30 * 60000);

//     const existingInterview = await Interview.findOne({
//       roll_no,
//       start_date_time: { $gte: new Date(interviewStartTime.getTime() - 30 * 60000), $lte: interviewEndTime }
//     });
//     const existingCodingInterview = await CodingInterview.findOne({
//       roll_no,
//       start_date_time: { $gte: new Date(interviewStartTime.getTime() - 30 * 60000), $lte: interviewEndTime }
//     });
//     const existingCompanyInterview = await CompanyInterview.findOne({
//       roll_no,
//       start_date_time: { $gte: new Date(interviewStartTime.getTime() - 30 * 60000), $lte: interviewEndTime }
//     });

//     if (existingInterview || existingCodingInterview || existingCompanyInterview) {
//       let tag = existingInterview ? "Technology interview" :
//         existingCodingInterview ? "Coding Interview" : "Company Interview";
//       return {
//         status: 400,
//         response: { message: `${tag} is already scheduled around this time. Please choose a different time.` }
//       };
//     }
//     parsedModules = typeof module === 'string' ? JSON.parse(module) : module;
//     parsedTopics = typeof topic === 'string' ? JSON.parse(topic) : topic;

//     parsedModules = Array.isArray(parsedModules)
//       ? parsedModules.map(id => new mongoose.Types.ObjectId(id))
//       : [];

//     parsedTopics = Array.isArray(parsedTopics)
//       ? parsedTopics.map(id => new mongoose.Types.ObjectId(id))
//       : [];

//     const newInterview = new Interview({
//       platform,
//       roll_no,
//       course,
//       technology: new mongoose.Types.ObjectId(technology),
//       module: parsedModules,
//       topic: parsedTopics,
//       start_date_time,
//       level,
//       questions_count,
//       created_by,
//       status: 1
//     });

//     const savedInterview = await newInterview.save();
//     const user = await User.findOne({ roll_no });

//     if (user) {
//       const istDateTime = new Date(savedInterview.start_date_time).toLocaleString("en-IN", {
//         timeZone: "Asia/Kolkata",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });

//       const message = `Hello ${user.name || ''},

// Your Technology interview is scheduled on ${istDateTime} (IST).

// Please make sure to log in at least 5 minutes before the scheduled time.

// You will have a 5-minute grace period to begin the interview after the scheduled start time. If you fail to start within this period, the interview will expire and cannot be attempted.

// All the best!

// Thank you!`;
//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: user.email,
//         subject: 'Interview Schedule',
//         text: message
//       };
//       const sentMail = await transporter.sendMail(mailOptions);
//     }

//     tenant.active_credits -= 1;
//     await tenant.save();

//     return {
//       status: 201,
//       response: {
//         message: "Interview added successfully",
//         data: savedInterview
//       }
//     };

//   } catch (error) {
//     console.error("createInterview error:", error);
//     return {
//       status: 500,
//       response: { message: "Error scheduling interview", error: error.message }
//     };
//   }
// };


const addBulkInterviewDetails = async (req, res) => {
  try {
    const {
      platform,
      roll_no,
      course,
      technology,
      module,
      topic,
      start_date_time,
      level,
      questions_count,
      created_by,
      tenant_id,
      type
    } = req.body;

    const tenant = await Tenant.findOne({ _id: tenant_id });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (tenant.active_credits === 0) {
      return res.status(400).json({ message: "Your credits are not enough to create an interview" });
    }

    // For bulk interview (expects Excel file)
    if (type === "bulk" && req.file) {
      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      const results = [];
      const alreadyScheduled = [];

      for (const row of data) {
        const rollNo = row.roll_no?.toString().trim();
        if (!rollNo) {
          results.push({ roll_no: null, status: "failed", reason: "Missing roll number" });
          continue;
        }

        const result = await createInterview({
          roll_no: rollNo,
          platform,
          course,
          technology,
          module,
          topic,
          start_date_time,
          level,
          questions_count,
          created_by,
          tenant
        });

        results.push({ roll_no: rollNo, status: result.status === 201 ? "success" : "failed", message: result.response.message });

        if (result.status === 400 && result.response.message?.includes("already scheduled")) {
          alreadyScheduled.push(rollNo);
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

    return res.status(400).json({ message: "Invalid type or missing file" });

  } catch (error) {
    console.error("Error adding interview:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createInterview = async ({
  roll_no, platform, course, technology, module, topic,
  start_date_time, level, questions_count, created_by, tenant
}) => {
  try {
    const interviewDuration = tenant.interview_duration_minutes || 30; // Use dynamic value
    const interviewStartTime = new Date(start_date_time);
    const interviewEndTime = new Date(interviewStartTime.getTime() + interviewDuration * 60000);

    // Check overlapping interviews
    const existingInterview = await Interview.findOne({
      roll_no,
      start_date_time: { $gte: new Date(interviewStartTime.getTime() - interviewDuration * 60000), $lte: interviewEndTime }
    });
    const existingCodingInterview = await CodingInterview.findOne({
      roll_no,
      start_date_time: { $gte: new Date(interviewStartTime.getTime() - interviewDuration * 60000), $lte: interviewEndTime }
    });
    const existingCompanyInterview = await CompanyInterview.findOne({
      roll_no,
      start_date_time: { $gte: new Date(interviewStartTime.getTime() - interviewDuration * 60000), $lte: interviewEndTime }
    });

    if (existingInterview || existingCodingInterview || existingCompanyInterview) {
      let tag = existingInterview ? "Technology interview" :
        existingCodingInterview ? "Coding Interview" : "Company Interview";
      return {
        status: 400,
        response: { message: `${tag} is already scheduled around this time. Please choose a different time.` }
      };
    }

    parsedModules = typeof module === 'string' ? JSON.parse(module) : module;
    parsedTopics = typeof topic === 'string' ? JSON.parse(topic) : topic;

    parsedModules = Array.isArray(parsedModules)
      ? parsedModules.map(id => new mongoose.Types.ObjectId(id))
      : [];

    parsedTopics = Array.isArray(parsedTopics)
      ? parsedTopics.map(id => new mongoose.Types.ObjectId(id))
      : [];

    const newInterview = new Interview({
      platform,
      roll_no,
      course,
      technology: new mongoose.Types.ObjectId(technology),
      module: parsedModules,
      topic: parsedTopics,
      start_date_time,
      level,
      questions_count,
      created_by,
      status: 1
    });

    const savedInterview = await newInterview.save();
    const user = await User.findOne({ roll_no });

    if (user) {
      const istDateTime = new Date(savedInterview.start_date_time).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const message = `Hello ${user.name || ''},

Your Technology interview is scheduled on ${istDateTime} (IST).

Please make sure to log in at least 5 minutes before the scheduled time.

You will have a 5-minute grace period to begin the interview after the scheduled start time. If you fail to start within this period, the interview will expire and cannot be attempted.

All the best!

Thank you!`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Interview Schedule',
        text: message
      };
      await transporter.sendMail(mailOptions);
    }

    tenant.active_credits -= 1;
    await tenant.save();

    return {
      status: 201,
      response: {
        message: "Interview added successfully",
        data: savedInterview
      }
    };

  } catch (error) {
    console.error("createInterview error:", error);
    return {
      status: 500,
      response: { message: "Error scheduling interview", error: error.message }
    };
  }
};


const getIntervieweeDetails = async (req, res, next) => {
  const roll_no = req.body.roll_no;

  const now = new Date();
  const getPipeline = (type) => {
    const basePipeline = [
      {
        $addFields: {
          startDateTimePlus5Min: {
            $dateAdd: {
              startDate: "$start_date_time",
              unit: "minute",
              amount: 5,
            },
          },
          interview_type: type,
        },
      },
      {
        $match: {
          roll_no,
          platform: "mpod",
          start_date_time: { $lte: now },
          startDateTimePlus5Min: { $gte: now },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "roll_no",
          foreignField: "roll_no",
          as: "userDetails",
        },
      },
      {
        $addFields: {
          first_name: { $arrayElemAt: ["$userDetails.first_name", 0] },
          gender: { $arrayElemAt: ["$userDetails.gender", 0] },
        },
      },
    ];

    const unsets = ["userDetails"];

    if (type === "ai generated") {
      basePipeline.push(
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
          $lookup: {
            from: "topics",
            localField: "topic",
            foreignField: "_id",
            as: "topicDetails",
          },
        },
        {
          $addFields: {
            module_details: {
              $map: {
                input: "$moduleDetails",
                as: "module",
                in: {
                  _id: "$$module._id",
                  module_name: "$$module.module_name",
                  topic_names: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$topicDetails",
                          as: "topic",
                          cond: { $eq: ["$$topic.module", "$$module._id"] },
                        },
                      },
                      as: "topic",
                      in: "$$topic.topic_name",
                    },
                  },
                },
              },
            },
          },
        }
      );
      unsets.push("technologyDetails", "moduleDetails", "topicDetails");
    }

    if (type === "company") {
      basePipeline.push(
        {
          $lookup: {
            from: "companies",
            localField: "company",
            foreignField: "_id",
            as: "companyDetails",
          },
        },
        {
          $addFields: {
            company_details: {
              $map: {
                input: "$companyDetails",
                as: "company",
                in: {
                  _id: "$$company._id",
                  company_name: "$$company.company_name",
                },
              },
            },
          },
        }
      );
      unsets.push("companyDetails");
    }

    basePipeline.push({ $unset: unsets });
    return basePipeline;
  };

  try {
    const interviewee = await Interview.aggregate(getPipeline("ai generated"));
    if (interviewee.length > 0) return res.status(200).json(interviewee[0]);

    const companyInterviewee = await CompanyInterview.aggregate(getPipeline("company"));
    console.log(companyInterviewee)
    if (companyInterviewee.length > 0) return res.status(200).json(companyInterviewee[0]);

    const codingInterviewee = await CodingInterview.aggregate(getPipeline("coding"));
    if (codingInterviewee.length > 0) return res.status(200).json(codingInterviewee[0]);

    return res.status(200).json(null);
  } catch (error) {
    console.error("Interviewee Fetch Error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const getAllInterviewDetails = async (req, res) => {
  try {
    const tenant_id = new mongoose.Types.ObjectId(req.params.id);

    // date query param format expected: YYYY-MM-DD (e.g., 2025-12-03)
    let dateParam = req.query.date;
    let targetDate;
    if (dateParam) {
      // parse provided date (assume server timezone or treat as midnight UTC)
      targetDate = new Date(dateParam);
    } else {
      // default to yesterday
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - 1);
    }

    // Build day start/end (00:00:00.000 -> 23:59:59.999) in server timezone
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const InterviewDetails = await Interview.aggregate([
      // match interviews whose start_date_time falls within the target day
      {
        $match: {
          start_date_time: { $gte: startOfDay, $lte: endOfDay },
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
        },
      },
    ]);

    res.status(200).json(InterviewDetails);
  } catch (error) {
    console.error("Error fetching interview details:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};



const editInterviewDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    const {
      platform,
      roll_no,
      course,
      technology,
      module,
      topic,
      start_date_time,
      level,
      questions_count,
      created_by,
    } = req.body;

    // Ensure request body is not empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    // Ensure arrays are correctly formatted
    const updateFields = {
      platform,
      roll_no,
      course,
      technology,
      module: Array.isArray(module) ? module : [],
      topic: Array.isArray(topic) ? topic : [],
      start_date_time,
      level,
      questions_count,
      created_by,
    };

    // Remove undefined fields to avoid overwriting existing values with null
    Object.keys(updateFields).forEach(
      (key) => updateFields[key] === undefined && delete updateFields[key]
    );

    // Update document
    const updatedInterview = await Interview.findByIdAndUpdate(
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
// const getAccuracy = async (req, res, next) => {
//   const { questions, roll_no, emotions } = req.body; // Array of questions
//   let results = []; // To store results for all questions

//   try {
//     // Loop through each question in the array
//     for (let i = 0; i < questions.length; i++) {
//       const { question, answer, id, time } = questions[i];

//       let jsonResponse = {
//         given_question: question,
//         given_answer: answer,
//         accuracy: 0,
//         analysis: "",
//         improvements: "",
//         confidence_level: "none",
//         time: time
//       };

//       // If the answer is empty, push predefined response and continue
//       if (!answer || answer.trim() === "") {
//         results.push(jsonResponse);
//         continue; // Skip OpenAI API call
//       }

//       // Call OpenAI API for individual question analysis
//       const response = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content:
//               "You will be provided with a question and an answer. Your task is to check the correctness of the given answer strictly as it is, without assuming any additional context. If the answer is completely irrelevant or incorrect, provide an accuracy of 0%. Then provide an analysis and suggestions for improvement.",
//           },
//           {
//             role: "user",
//             content: `Check the given answer exactly as written: "${answer}" for the question: "${question}". Provide the response in JSON format with keys: given_question, given_answer, accuracy (percentage number only, no % symbol), analysis, and improvements. Do NOT generate a new or corrected answer.`,
//           }
//         ],
//         temperature: 0.7,
//         max_tokens: 1024,
//         top_p: 1,
//       });

//       const apiResponse = response.choices[0].message.content;

//       try {
//         jsonResponse = JSON.parse(apiResponse);
//         jsonResponse["time"] = time;

//         // Ensure accuracy is a number (remove % if mistakenly included)
//         if (typeof jsonResponse.accuracy === "string") {
//           jsonResponse.accuracy = parseFloat(jsonResponse.accuracy.replace("%", "")) || 0;
//         }

//         jsonResponse.confidence_level = determineConfidenceLevel(jsonResponse.accuracy);
//         results.push(jsonResponse);
//       } catch (err) {
//         console.error("Error parsing GPT response:", err);
//         results.push({ error: "Error parsing GPT response" });
//       }
//     }

//     const overallAnalysis = await getOverallAnalysis(results);
//     const interviewee = await Interview.findOne({ roll_no, status: 1 });
//     if (interviewee) {
//       await Interview.updateOne(
//         { roll_no, status: 1 },
//         {
//           $set: { overall_analysis: overallAnalysis, emotions: emotions, status: 0, updatedAt: Date.now() },
//           $push: { question_details: { $each: results } },
//         }
//       );
//     }

//     // Return the results along with the overall analysis
//     return res.status(200).json({ results, overallAnalysis });
//   } catch (err) {
//     console.error("Error:", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const getAccuracy = async (req, res, next) => {
  const { questions, roll_no, emotions, interview_type, platform, id } = req.body; // Array of questions
  let results = []; // To store results for all questions

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
        model: "gpt-4o",
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
        let cleaned = apiResponse.trim();

        // Remove markdown code fences that GPT-4o often returns
        cleaned = cleaned
          .replace(/^```json/i, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim();

        // Remove hidden control characters
        cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        jsonResponse = JSON.parse(cleaned);
        console.log(jsonResponse)
        jsonResponse["time"] = time;

        // Ensure accuracy is a number
        if (typeof jsonResponse.accuracy === "string") {
          jsonResponse.accuracy = parseFloat(jsonResponse.accuracy.replace("%", "")) || 0;
        }

        // **Enforce 0% for completely wrong answers**
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
    if (interview_type == "ai generated") {
      const interviewee = await Interview.findOne({ _id: id, roll_no, status: 1 });
      if (interviewee) {
        await Interview.updateOne(
          { _id: id, roll_no, status: 1 },
          {
            $set: { overall_analysis: overallAnalysis, emotions: emotions, status: 0, updatedAt: Date.now() },
            $push: { question_details: { $each: results } },
          }
        );
      }
    } else if (interview_type == "company") {
      const interviewee = await CompanyInterview.findOne({ _id: id, roll_no, status: 1 });
      if (interviewee) {
        await CompanyInterview.updateOne(
          { _id: id, roll_no, status: 1 },
          {
            $set: { overall_analysis: overallAnalysis, emotions: emotions, status: 0, updatedAt: Date.now() },
            $push: { question_details: { $each: results } },
          }
        );
      }
    }

    return res.status(200).json({ results, overallAnalysis });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAccuracyTemporary = async (req, res, next) => {
  const { questions, roll_no, technology, module, topic, complexity, questions_count } = req.body;
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
        model: "gpt-4o",
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
    return res.status(200).json({ results, overallAnalysis });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
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
    let openai_input;
    if (technology_name != "Placements") {
      // OpenAI input prompt with instructions for single, simple questions
      openai_input = `Generate ${questions_count} ${level} level interview questions for the technology "${technology_name}". 
Each question should:
- Avoid combining multiple questions into one.
- Follow a clear and simple format.
- Give only verbal questions without coding problems.
- must not contain more than 25 words.
- Do not include any programming code in the questions.

Topics to cover:\n\n${shuffled_modules.join("\n")}

Ensure each question is concise and independent. Session ID: ${session_id}.`;
    } else {
      // OpenAI input prompt with instructions for single, simple questions
      openai_input = `Generate ${questions_count} ${level} level interview questions for a graduated fresher hiring". 
Each question should:
- Avoid combining multiple questions into one.
- Follow a clear and simple format.
- must not contain more than 25 words

Topics to cover:\n\n${shuffled_modules.join("\n")}

Ensure each question is concise and independent. Session ID: ${session_id}.`;
    }

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


// const generateQuestions = async (req, res, next) => {
//   const technology = new mongoose.Types.ObjectId(req.body.technology);
//   const modules = req.body.module.map((mod) => new mongoose.Types.ObjectId(mod)); // Convert module IDs to ObjectId
//   const topics = req.body.topic.map((topic) => new mongoose.Types.ObjectId(topic)); // Convert topic IDs to ObjectId
//   const technology_name = req.body.technology_name;
//   const level = req.body.level;
//   const questions_count = req.body.questions_count;

//   try {
//     // Fetch module and topic details
//     const module_details = await Module.aggregate([
//       {
//         $match: {
//           _id: { $in: modules }, // Match modules from the array
//         },
//       },
//       {
//         $lookup: {
//           from: "topics", // Lookup the topics collection
//           localField: "_id", // Module ID in the Module collection
//           foreignField: "module", // Module ID in the Topics collection
//           as: "topicDetails",
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           module_name: 1,
//           topicDetails: {
//             $filter: {
//               input: "$topicDetails",
//               as: "topic",
//               cond: { $in: ["$$topic._id", topics] }, // Match topics from the array
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           topic_names: {
//             $map: {
//               input: "$topicDetails",
//               as: "topic",
//               in: "$$topic.topic_name", // Extract only topic_name
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           module_name: 1,
//           topic_names: 1, // Include only the extracted topic names
//         },
//       },
//     ]);

//     const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

//     const shuffled_modules = shuffleArray(
//       module_details.map(
//         (module) => `${module.module_name}: ${module.topic_names.join(", ")}`
//       )
//     );

//     const session_id = new Date().getTime(); // Use a timestamp as session ID for uniqueness
//     const openai_input = `Create ${questions_count} ${level} technical interview questions based on the following concepts and topics in the respective concepts:\n\n${shuffled_modules.join(
//       "\n"
//     )}\nin the technology "${technology_name}". Include diverse topics for session ID: ${session_id}.`;


//     let response;
//     try {
//       response = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "user",
//             content: openai_input,
//           },
//         ],
//         temperature: 0.7, // Increase temperature for more diverse responses
//         max_tokens: 1024,
//         top_p: 0.9, // Adjust top_p for better sampling
//       });
//     } catch (error) {
//       console.error("Error generating interview questions:", error);
//     }

//     return res.status(200).json({
//       technology,
//       module: req.body.module,
//       topic: req.body.topic,
//       module_details,
//       level,
//       questions_count,
//       technology_name,
//       response: response,
//     });
//   } catch (error) {
//     console.error("Error in generating questions:", error);
//     return res.status(500).json({ error: "An error occurred while generating questions." });
//   }
// };

const getInterviewDetailsById = async (req, res) => {
  const { id } = req.params;
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
          module_name: "$moduleDetails.module_name"
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
          topic_name: "$topicDetails.topic_name"
        }
      },
      {
        $unset: [
          "userDetails",
          "technologyDetails",
          "moduleDetails",
          "topicDetails"
        ]
      }
    ]);
    if (interviewDetails.length === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.status(200).json(interviewDetails[0]); // Return the single interview details
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
const getQuestionDetails = async (req, res, next) => {
  const { id, interview_type, roll_no } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid interview ID' });
  }
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
      getDetails(CompanyInterview, false, true);
    } else {
      getDetails(Interview, true, false);
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
const submitEmotions = async (req, res, next) => {
  try {

    const { roll_no, emotions, start_date_time } = req.body;

    // Parse start_date_time into a Date object from the request
    const startDate = new Date(
      start_date_time.replace(/(\d+)-(\d+)-(\d+)/, "$2/$1/$3")
    ); // Convert "DD-MM-YYYY" to "MM/DD/YYYY" format

    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ message: "Invalid start_date_time format" });
    }

    // Get today's date range (start and end of the current day)
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Find the interviewee using MongoDB $expr and $dateFromString
    const interviewee = await Interview.findOne({
      roll_no,
      status: 0,
      $expr: {
        $and: [
          {
            $gte: [
              {
                $dateFromString: {
                  dateString: "$start_date_time", // Convert the string to a Date
                  format: "%d-%m-%Y %H:%M", // Match your input format
                },
              },
              startOfToday,
            ],
          },
          {
            $lte: [
              {
                $dateFromString: {
                  dateString: "$start_date_time",
                  format: "%d-%m-%Y %H:%M",
                },
              },
              endOfToday,
            ],
          },
        ],
      },
    });


    if (!interviewee) {
      return res
        .status(404)
        .json({ message: "Interviewee not found for the given roll_no and date." });
    }

    // Update the emotions field and updatedAt timestamp
    const result = await Interview.updateOne(
      { _id: interviewee._id }, // Use the interviewee's ID for the update
      {
        $set: {
          emotions: emotions,
          updatedAt: Date.now(),
        },
      }
    );


    return res.status(200).json({ message: "Emotions updated successfully", result });
  } catch (error) {
    console.error("Error in submitEmotions:", error);
    next(error);
  }
};


const getEmotionsData = async (req, res, next) => {
  console.log("Interviewee emotions details")
  console.log(req.body)
}

const deleteInterviewDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInterview = await Interview.findByIdAndDelete(id);

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


const getTechnologyWiseMpodInterviewsSubmissionsStatisticsFromDateAndToDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    // Parse DD-MM-YYYY safely
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format. Use DD-MM-YYYY" });
    }

    // Full-day range
    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);

    const tenant_id = new mongoose.Types.ObjectId("67b56f81fbc58ef79a0b1392");
    const technology_id = new mongoose.Types.ObjectId("67f76c627bb0c598887e3320");

    const interviews = await Interview.aggregate([
      {
        $match: {
          technology: technology_id,
          start_date_time: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          question_details: { $exists: true, $ne: [] } // Attempted only
        }
      },
      {
        $lookup: {
          from: "technologies",
          localField: "technology",
          foreignField: "_id",
          as: "technology"
        }
      },
      {
        $addFields: {
          technology_name: { $first: "$technology.technology_name" }
        }
      },
      {
        $project: {
          technology: 0
        }
      },
      {
        $lookup: {
          from: "users",
          let: { rollNo: "$roll_no" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$roll_no", "$$rollNo"] },
                tenant_id: tenant_id
              }
            },
            {
              $project: {
                _id: 0,
                first_name: 1,
                gender: 1,
                college: 1,
                branch: 1
              }
            }
          ],
          as: "user"
        }
      },

      { $match: { user: { $ne: [] } } },

      {
        $addFields: {
          first_name: { $first: "$user.first_name" },
          gender: { $first: "$user.gender" },
          college: { $first: "$user.college" },
          branch: { $first: "$user.branch" },
          interview_date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$start_date_time",
              timezone: "Asia/Kolkata"
            }
          }
        }
      },

      { $project: { user: 0, question_details: 0 } },

      {
        $group: {
          _id: {
            roll_no: "$roll_no",
            date: "$interview_date"
          },
          first_name: { $first: "$first_name" },
          gender: { $first: "$gender" },
          college: { $first: "$college" },
          branch: { $first: "$branch" },
          attempted_count: { $sum: 1 },
          technology_name: { $first: "$technology_name" },
        }
      },

      {
        $group: {
          _id: "$_id.roll_no",
          first_name: { $first: "$first_name" },
          gender: { $first: "$gender" },
          college: { $first: "$college" },
          branch: { $first: "$branch" },
          technology_name: { $first: "$technology_name" },
          dateWiseAttempts: {
            $push: {
              k: "$_id.date",
              v: "$attempted_count"
            }
          },
          total_attempted: { $sum: "$attempted_count" }
        }
      },

      {
        $addFields: {
          dateWiseAttempts: { $arrayToObject: "$dateWiseAttempts" }
        }
      },

      {
        $project: {
          _id: 0,
          roll_no: "$_id",
          first_name: 1,
          gender: 1,
          branch: 1,
          college: 1,
          technology_name: 1,
          dateWiseAttempts: 1,
          total_attempted: 1
        }
      }
    ]);

    if (!interviews.length) {
      return res.status(404).json({
        message: "No data available for the selected date range",
        interviews: []
      });
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      interviews
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const addInterviewDetailsReplica = async (req, res) => {
  try {
    const {
      platform,
      roll_no,
      course,
      technology,
      module,
      topic,
      start_date_time,
      level,
      questions_count,
      created_by,
      tenant_id
    } = req.body;


    const tenant = await Tenant.findOne({ _id: tenant_id });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (tenant.active_credits === 0) {
      return res.status(400).json({ message: "Your credits are not enough to create an interview" });
    }

    // Use tenant's interview duration
    const interviewDuration = 10;
    const interviewStartTime = new Date(start_date_time);
    const interviewEndTime = new Date(interviewStartTime.getTime() + interviewDuration * 60000);


    const existingInterview = await Interview.findOne({
      roll_no,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - interviewDuration * 60000),
        $lte: interviewEndTime
      }
    });
    const existingCodingInterview = await CodingInterview.findOne({
      roll_no,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - interviewDuration * 60000),
        $lte: interviewEndTime
      }
    });
    const existingCompanyInterview = await CompanyInterview.findOne({
      roll_no,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - interviewDuration * 60000),
        $lte: interviewEndTime
      }
    });

    if (existingInterview || existingCodingInterview || existingCompanyInterview) {
      let tag;
      if (existingInterview) tag = "Technology interview";
      else if (existingCodingInterview) tag = "Coding Interview";
      else if (existingCompanyInterview) tag = "Company Interview";

      return res.status(400).json({
        message: `${tag} is already scheduled around this time. Please choose a different time.`
      });
    }

    // Save interview
    const newInterview = new Interview({
      platform,
      roll_no,
      course,
      technology,
      module,
      topic,
      start_date_time,
      level,
      questions_count,
      created_by,
      status: 1
    });
    const savedInterview = await newInterview.save();

    // Notify user
    // const user = await User.findOne({ roll_no });
    // const istDateTime = new Date(savedInterview.start_date_time).toLocaleString("en-IN", {
    //   timeZone: "Asia/Kolkata",
    //   year: "numeric",
    //   month: "long",
    //   day: "numeric",
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: true,
    // });
    // const message = `Hello ${user.name || ''},\n\nYour Technology interview is scheduled on ${istDateTime} (IST).\n\nPlease make sure to log in at least 5 minutes before the scheduled time.\nYou will have a 5-minute grace period to begin the interview after the scheduled start time. If you fail to start within this period, the interview will expire and cannot be attempted.\n\nAll the best!\n\nThank you!`;

    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: user.email,
    //   subject: 'Interview Schedule',
    //   text: message
    // };
    // await transporter.sendMail(mailOptions);

    // Deduct credit
    tenant.active_credits -= 1;
    await tenant.save();

    return res.status(201).json({
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

module.exports = {
  addInterviewDetails,
  addInterviewDetailsReplica,
  addBulkInterviewDetails,
  getIntervieweeDetails,
  getAllInterviewDetails,
  getAccuracy,
  generateQuestions,
  editInterviewDetails,
  getInterviewDetailsById,
  getQuestionDetails,
  submitEmotions,
  getEmotionsData,
  deleteInterviewDetails,
  getAccuracyTemporary,
  getTechnologyWiseMpodInterviewsSubmissionsStatisticsFromDateAndToDate,
};
