const nodemailer = require('nodemailer');
const Interview = require("../models/codingInterview");
const Technology = require("../models/technology");
const Module = require("../models/module");
const CodingQuestion = require("../models/codingQuestion");
const Tenant = require("../models/tenant");
const User = require("../models/user");
const CompanyInterview = require("../models/companyInterview");
const TechnologyInterview = require("../models/interview");
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
const { platform } = require("os");
// Function to add a new interview
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});
const addInterviewDetails = async (req, res) => {
  try {
    const {
      platform,
      roll_no,
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
    const interviewStartTime = new Date(start_date_time);
    const interviewEndTime = new Date(interviewStartTime.getTime() + 30 * 60000);


    const existingInterview = await TechnologyInterview.findOne({
      roll_no,
      status: 1,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - 30 * 60000),
        $lte: interviewEndTime
      }
    });
    const existingCodingInterview = await Interview.findOne({
      roll_no,
      status: 1,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - 30 * 60000),
        $lte: interviewEndTime
      }
    });
    const existingCompanyInterview = await CompanyInterview.findOne({
      roll_no,
      status: 1,
      start_date_time: {
        $gte: new Date(interviewStartTime.getTime() - 30 * 60000),
        $lte: interviewEndTime
      }
    });
    if (existingInterview || existingCodingInterview || existingCompanyInterview) {
      let tag
      if (existingInterview) {
        tag = "Technology interview"
      } else if (existingCodingInterview) {
        tag = "Coding Interview"
      } else if (existingCompanyInterview) {
        tag = "Company Interview"
      }
      return res.status(400).json({
        message: `${tag} is already scheduled around this time. Please choose a different time.`
      });
    }
    const newInterview = new Interview({
      platform,
      roll_no,
      start_date_time,
      level,
      questions_count,
      created_by,
      status: 1
    });
    const user = await User.findOne({ roll_no });

    // Save the interview to the database
    const savedInterview = await newInterview.save();
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
    tenant.active_credits -= 1;
    await tenant.save();
    return res.status(200).json({
      message: 'Interview added successfully',
      data: savedInterview
    });
  } catch (error) {
    console.error('Error adding interview:', error);
    return res.status(500).json({
      message: 'An error occurred while adding the interview',
      error: error.message
    });
  }
};

const addBulkInterviewDetails = async (req, res) => {
  try {
    const {
      platform,
      roll_no,
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
          start_date_time,
          level,
          questions_count,
          created_by,
          tenant
        });

        results.push({ roll_no: rollNo, status: result.status === 201 ? "success" : "failed", message: result.response.message });

        if (
          result.status === 400 &&
          result.response.message?.includes("already scheduled")
        ) {
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
  roll_no, platform,
  start_date_time, level, questions_count, created_by, tenant
}) => {
  try {
    const interviewStartTime = new Date(start_date_time);
    const interviewEndTime = new Date(interviewStartTime.getTime() + 30 * 60000);

    const existingInterview = await TechnologyInterview.findOne({
      roll_no,
      start_date_time: { $gte: new Date(interviewStartTime.getTime() - 30 * 60000), $lte: interviewEndTime }
    });
    const existingCodingInterview = await Interview.findOne({
      roll_no,
      start_date_time: { $gte: new Date(interviewStartTime.getTime() - 30 * 60000), $lte: interviewEndTime }
    });
    const existingCompanyInterview = await CompanyInterview.findOne({
      roll_no,
      start_date_time: { $gte: new Date(interviewStartTime.getTime() - 30 * 60000), $lte: interviewEndTime }
    });

    if (existingInterview || existingCodingInterview || existingCompanyInterview) {
      let tag = existingInterview ? "Technology interview" :
        existingCodingInterview ? "Coding Interview" : "Company Interview";
      return {
        status: 400,
        response: { message: `${tag} is already scheduled around this time. Please choose a different time.` }
      };
    }

    const newInterview = new Interview({
      platform,
      roll_no,
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
  const currentDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  try {
    const details = await Interview.aggregate([
      {
        $addFields: {
          dateOnly: { $substr: ["$start_date_time", 0, 10] },
        },
      },
      {
        $match: {
          roll_no: roll_no,
          dateOnly: currentDate,
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
      },
      {
        $unset: ["userDetails", "technologyDetails", "moduleDetails", "topicDetails"],
      },
    ]);

    return res.status(200).json(details[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getAllCodingInterviewDetails = async (req, res) => {
  const tenant_id = req.params.id
  try {
    const InterviewDetails = await Interview.aggregate([{
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
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
const updateInterviewDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }

    const {
      roll_no,
      platform,
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
      roll_no,
      platform,
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
}
const getInterviewDetailsById = async (req, res) => {
  const { id } = req.params;
  try {
    const interviewDetails = await Interview.aggregate([
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
const generateCodingQuestions = async (req, res, next) => {
  const { level, questions_count } = req.body;

  try {
    const questions = await CodingQuestion.aggregate([
      {
        $match: {
          complexity: level
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
const analyzeIdea = async (req, res, next) => {
  const { description, idea } = req.body;

  if (!description || !idea) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert evaluator for technical interview answers. Your job is to evaluate the correctness and completeness of an idea to a given description.
          
          - If the idea is **completely incorrect, irrelevant, or unrelated**, **give an accuracy of 0**.
          - If the idea has **partial correct sentences with spelling mistakes**, **give an accuracy between 10-20**.
          - If the idea is **partially correct with no spelling mistakes**, assign a score between **40-70**.
          - If the idea is **mostly correct**, assign a score between **70-90**.
          - If the idea is **fully correct and well-explained**, assign a score between **90-100**.
          
          Your response must be in **valid JSON format** with these keys:  
          - accuracy (integer, between 0-100)
          
          Do NOT generate a new or corrected answer. Simply analyze the given one.`,
        },
        {
          role: "user",
          content: `Evaluate the following:
           **Description:** "${description}"
          **Idea:** "${idea}"
          
          Provide the JSON response strictly in this format:
          {
            "accuracy": 85
          }`,
        },
      ],
      temperature: 0.5,
      max_tokens: 100,
      top_p: 1,
    });

    let content = response.choices[0].message.content.trim();

    content = content.replace(/```json|```/g, "").trim();

    const result = JSON.parse(content);

    return res.status(200).json(result);
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const submitCodingInterview = async (req, res, next) => {
  const { questions, roll_no, interview_type, platform, id, emotions } = req.body;
  try {
    let results = [];

    for (let i = 0; i < questions.length; i++) {
      const { question, answer, description, problem, timer, idea, matched_accuracy, optimizedAnswer, idea_check } = questions[i];
      let jsonResponse = {
        problem: problem,
        question: question,
        description: description,
        given_answer: answer,
        optimized_answer: optimizedAnswer,
        idea: idea,
        idea_check: idea_check,
        matched_accuracy: matched_accuracy,
        accuracy: "0",
        efficiency: {
          time_complexity: "Unknown",
          space_complexity: "Unknown",
        },
        code_quality: {
          readability: "Unknown",
          variable_naming: "Unknown",
        },
        logical_approach: "Unknown",
        output_format: "Unknown",
        observations: [],
        time: timer,
        optimized_result: {
          time_complexity: "Unknown",
          space_complexity: "Unknown",
          memory_usage: "Unknown",
          optimization_comment: "Unknown",
        },
      };

      if (!answer || answer.trim() === "") {
        results.push(jsonResponse);
        continue;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert evaluator for coding interview answers.

First, determine if the provided answer is actual code in any programming language (e.g., JavaScript, Python, Java, C++, etc.). If it is not code (i.e., it's an explanation, paragraph, or unclear text), respond with the following JSON:
{
  "is_code": false,
  "message": "The provided answer is not code, so evaluation metrics like accuracy and efficiency cannot be calculated."
}

If it **is** code, then proceed to evaluate it against the description and return the following JSON:
{
  "is_code": true,
  "accuracy": "85",
  "efficiency": {
    "time_complexity": "O(n log n)",
    "space_complexity": "O(n)"
  },
  "code_quality": {
    "readability": "High",
    "variable_naming": "Descriptive"
  },
  "logical_approach": "Correct",
  "output_format": "Correct",
  "observations": [
    "Variable names could be more descriptive.",
    "No input validation present.",
    "Handles basic edge cases but not all scenarios."
  ],
  "analysis": "Detailed explanation of correctness based on the description."
}

Return only the JSON response.`
          },
          {
            role: "user",
            content: `Evaluate the following:
      
**Description:** "${description}"
**Answer:** "${answer}"

Provide only the JSON response as specified.`
          }
        ],
        temperature: 0.5,
        max_tokens: 2048,
        top_p: 1
      });


      const apiResponse = response.choices[0].message.content;
      const cleaned = cleanJSONResponse(apiResponse);


      try {
        const parsedResponse = JSON.parse(cleaned);

        // Now analyze the optimized answer if provided
        let optimizedResponse = {
          optimized_percentage: "Unknown",
          time_complexity: "Unknown",
          space_complexity: "Unknown",
          memory_usage_kb: "Unknown",
          optimization_comment: "Unknown"
        };

        if (optimizedAnswer && optimizedAnswer.trim() !== "") {
          if (answer.trim() === optimizedAnswer.trim()) {
            optimizedResponse = {
              optimized_percentage: 0,
              time_complexity: "O(n)",
              space_complexity: "O(1)",
              memory_usage_kb: 64,
              optimization_comment: "No optimization made, answers are identical."
            };
          } else {
            const optimizedEvaluationResponse = await openai.chat.completions.create({
              model: "gpt-4-turbo",
              messages: [
                {
                  role: "system",
                  content: `You are an expert evaluator for optimized coding interview answers... Evaluate how optimized the following optimizedAnswer is compared to the provided answer and return a JSON object with the following fields:
                            - optimized_percentage (a number from 0 to 100 representing how much the optimizedAnswer improved over the answer in terms of efficiency, performance, output and optimization. 100 means fully optimized, 0 means no improvement.)
                            - time_complexity (string indicating the time complexity of the optimized answer)
                            - space_complexity (string indicating the space complexity of the optimized answer)
                            - memory_usage_kb (estimated memory utilized during execution in kilobytes (KB), as a numeric value only)
                            - optimization_comment (comment on how optimized the answer is compared to the original answer)
                            If the optimized answer is exactly the same as the original answer, return the optimized_percentage as 0 and explain that no optimization has occurred.
                            Provide only the JSON response.`
                },
                {
                  role: "user",
                  content: `Evaluate the following optimization:

                          **Original Answer:** "${answer}"
                          **Optimized Answer:** "${optimizedAnswer}"

                          Provide the JSON response strictly in this format:
                          {
                            "optimized_percentage": "85",
                            "time_complexity": "O(n)",
                            "space_complexity": "O(1)",
                            "memory_usage_kb": 64,
                            "optimization_comment": "The optimized version improves time complexity by reducing unnecessary iterations."
                          }`
                }
              ],
              temperature: 0.5,
              max_tokens: 2048,
              top_p: 1,
            });

            const optimizedApiResponse = optimizedEvaluationResponse.choices[0].message.content;

            try {
              const parsedOptimizedResponse = JSON.parse(optimizedApiResponse);
              optimizedResponse = parsedOptimizedResponse;
            } catch (error) {
              console.error("Optimized Answer JSON Parsing Error:", error);
            }
          }
        }


        jsonResponse = {
          ...jsonResponse,
          ...parsedResponse,
          optimized_result: optimizedResponse,
        };

        results.push(jsonResponse);
      } catch (error) {
        console.error("JSON Parsing Error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    const interviewee = await Interview.findOne({ _id: id, roll_no, status: 1 });
    if (interviewee) {
      await Interview.updateOne(
        { _id: id, roll_no, status: 1 },
        {
          $set: { status: 0, emotions: emotions, updatedAt: Date.now() },
          $push: { question_details: { $each: results } },
        }
      );
    }

    return res.json({ results });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

function cleanJSONResponse(content) {
  // Remove markdown JSON code block formatting
  return content
    .replace(/```json\s*/i, '') // remove ```json
    .replace(/```/g, '')        // remove ```
    .trim();                    // remove leading/trailing whitespace
}

const getCodingReportDetails = async (req, res, next) => {
  const { id, interview_type, roll_no } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid interview ID' });
  }
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
              date: {
                $dateAdd: {
                  startDate: {
                    $dateAdd: {
                      startDate: "$start_date_time",
                      unit: "hour",
                      amount: 5, // Add 5 hours
                    },
                  },
                  unit: "minute",
                  amount: 30, // Add 30 minutes
                },
              },
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
const deleteCodingInterviewDetails = async (req, res) => {
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

module.exports = {
  addInterviewDetails,
  addBulkInterviewDetails,
  getIntervieweeDetails,
  getAllCodingInterviewDetails,
  updateInterviewDetails,
  getInterviewDetailsById,
  generateCodingQuestions,
  analyzeIdea,
  submitCodingInterview,
  getCodingReportDetails,
  deleteCodingInterviewDetails
};
