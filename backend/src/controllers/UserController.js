const nodemailer = require('nodemailer');
const User = require("../models/user");
const Interview = require("../models/interview");
const CodingInterview = require("../models/codingInterview");
const CompanyInterview = require("../models/companyInterview");

const axios = require("axios")
var bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken"); // Import JWT library
const unzipper = require('unzipper');
const path = require('path');
const fs = require('fs-extra');
const xlsx = require('xlsx');
const { handleFileUpload } = require('../utils/fileUploadUtil');
const { format, addMinutes } = require('date-fns');
const addUser = async (req, res) => {
  const { tenant_id, status } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const rollNos = data.map(row => String(row.roll_no).trim());

    const existingUsers = await User.find({ roll_no: { $in: rollNos } }).select('roll_no');
    const existingRollNos = existingUsers.map(user => String(user.roll_no).trim());

    const usersToInsert = data
      .filter(row => !existingRollNos.includes(String(row.roll_no).trim()))
      .map(row => ({
        first_name: row.first_name,
        roll_no: String(row.roll_no).trim(),
        mobile: row.mobile,
        email: row.email,
        gender: row.gender,
        college: row.college,
        branch: row.branch,
        passout_year: row.passout_year,
        role: row.role,
        tenant_id,
        // password:"$2a$10$CyTRrG7Acb5HgldRKHgyae5mvuRy6a4HMQ0JOrkqmt16EN6lHBbz2",
        password:row.password,

        status: status || 1,
        added_by: 'admin',
      }));

    if (usersToInsert.length > 0) {
      await User.insertMany(usersToInsert);
    }

    const message = `Inserted ${usersToInsert.length} new user(s). ${existingRollNos.length} user(s) already exist.`;

    res.status(200).json({
      message,
      existingRollNos,
    });

  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};


const uploadProfilePics = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const zipFilePath = req.file.path;
    const extractPath = path.resolve(__dirname, '../uploads/profile-pics/');

    console.log('ZIP File Path:', zipFilePath);
    console.log('Extract Path:', extractPath);

    await fs.ensureDir(extractPath);

    const directory = await unzipper.Open.file(zipFilePath);

    const updates = [];

    for (const file of directory.files) {
      if (!file.path.endsWith('/')) {
        const rollNo = path.parse(file.path).name;
        const fileExt = path.extname(file.path);
        const destFilePath = path.join(extractPath, `${rollNo}${fileExt}`);

        console.log(`Extracting file: ${file.path} -> ${destFilePath}`);

        await new Promise((resolve, reject) => {
          file.stream()
            .pipe(fs.createWriteStream(destFilePath))
            .on('finish', () => {
              console.log(`File written: ${destFilePath}`);
              resolve();
            })
            .on('error', (err) => {
              console.error(`Error writing file ${destFilePath}:`, err);
              reject(err);
            });
        });
      }
    }

    await Promise.all(updates);

    await fs.unlink(zipFilePath);

    res.status(200).json({ message: 'Profile pictures uploaded, extracted, and linked successfully!' });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload and extract profile pictures', error: error.message });
  }
};


const getUsers = async (req, res, next) => {
  const tenant = req.params.id;
  let users;
  try {
    users = await User.find({ tenant_id: tenant })

    return res.status(200).json(users)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "something went wrong" })
  }
}

const login = async (req, res) => {
  const { roll_no, password, confirmLogout } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ roll_no });
    if (!user) return res.status(400).json({ message: "Invalid roll number" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.sessionToken) {
      if (!confirmLogout) {
        return res.status(403).json({
          message: "User already logged in. Do you want to logout from the previous session and continue?"
        });
      }
      user.sessionToken = null;
      await user.save();
    }

    const newSessionToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const cookieName ="userSessionToken";

    res.cookie(cookieName, newSessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    user.sessionToken = newSessionToken;
    await user.save();

    res.status(200).json({ message: "Login successful" });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const adminLogin = async (req, res) => {
  const { roll_no, password, confirmLogout } = req.body;
  let upperRollno=roll_no.toUpperCase();
  try {
    const user = await User.findOne({ roll_no:upperRollno });
    if (!user) return res.status(400).json({ message: "Invalid roll number" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // if (user.sessionToken) {
    //   if (!confirmLogout) {
    //     return res.status(403).json({
    //       message: "User already logged in. Do you want to logout from the previous session and continue?"
    //     });
    //   }
    //   user.sessionToken = null;
    //   await user.save();
    // }

    const newSessionToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const cookieName ="adminSessionToken";

    res.cookie(cookieName, newSessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    user.sessionToken = newSessionToken;
    await user.save();

    res.status(200).json({ message: "Login successful" });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const logout = async (req, res) => {
  try {
    const { roll_no, slug } = req.params;

    const user = await User.findOne({ roll_no });
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findOneAndUpdate({ roll_no }, { $unset: { sessionToken: "" } });

    if (slug === "user") {
      res.clearCookie("userSessionToken");
    } else {
      res.clearCookie("adminSessionToken");
    }

    res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getCurrentUser = async (req, res) => {
  try {
    const sessionToken = req.cookies.userSessionToken;

    if (!sessionToken) {
      return res.status(401).json({ message: "Unauthorized: No session token" });
    }

    const user = await User.findOne({ sessionToken });

    if (user) {
      const data = {
        roll_no: user.roll_no,
        first_name: user.first_name,
        college: user.college,
        branch: user.branch,
        role: user.role,
        gender:user.gender,
        t_id: user.tenant_id
      };
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getAdminCurrentUser = async (req, res) => {
  try {
    const sessionToken = req.cookies.adminSessionToken;
    if (!sessionToken) {
      return res.status(401).json({ message: "Unauthorized: No session token" });
    }

    const user = await User.aggregate([
      {
        $match: { sessionToken: sessionToken }
      },
      {
        $lookup: {
          from: "tenants",
          localField: "tenant_id",
          foreignField: "_id",
          as: "tenantInfo"
        }
      },
      {
        $addFields: {
          organization: { $arrayElemAt: ["$tenantInfo.organization_name", 0] }
        }
      }
    ]);

    if (user.length > 0) {
      const userData = user[0]; // Extract first object from array
      const data = {
        roll_no: userData.roll_no,
        first_name: userData.first_name,
        college: userData.college,
        branch: userData.branch,
        role: userData.role,
        t_id: userData.tenant_id,
        organization: userData.organization // Include organization field
      };
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error); // Log the actual error
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAssignedInterviews = async (req, res, next) => {
  const roll_no = req.params.id;
  const nowUTC = new Date();
  const pastTimeUTC = new Date(nowUTC.getTime() - 5 * 60000);

  try {
    const commonPipeline = [
      {
        $match: {
          roll_no: roll_no,
          start_date_time: { $gte: pastTimeUTC }
        }
      },
      {
        $match: {
          $or: [
            { question_details: { $exists: false } },
            { question_details: { $size: 0 } }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          start_date_time: 1,
          platform: 1,
          interview_type: 1,
        }
      }
    ];

    const interviews = await Interview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "ai generated",
          startDate: "$start_date_time",
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

    const companyInterviews = await CompanyInterview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "company",
          startDate: "$start_date_time",
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

    const codingInterviews = await CodingInterview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "coding",
          startDate: "$start_date_time",
          start_date_time: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata"
            }
          },
        }
      }
    ]);
    let finalInterviewsList = [
      ...interviews,
      ...codingInterviews,
      ...companyInterviews
    ].filter(Boolean);
    return res.status(200).json(finalInterviewsList);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
const getTraineePastInterviews = async (req, res, next) => {
  const roll_no = req.params.id;
    const nowUTC = new Date();
  const pastTimeUTC = new Date(nowUTC.getTime() - 5 * 60000);
  try {
    const commonPipeline = [
      {
        $match: {
          roll_no: roll_no,
          start_date_time: { $lte: pastTimeUTC }
        }
      },
      {
        $project: {
          _id: 1,
          start_date_time: 1,
          platform: 1,
          interview_type: 1,
          status: 1,
          question_details: 1,
          is_question_empty: {
            $or: [
              { $eq: ["$question_details", null] },
              { $eq: [{ $size: "$question_details" }, 0] }
            ]
          }
        }
      }
    ];

    const interviews = await Interview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "ai generated",
          interview_status: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$is_question_empty", true] },
                  { $eq: ["$status", 1] }
                ]
              },
              then: "expired",
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$is_question_empty", false] },
                      { $eq: ["$status", 0] }
                    ]
                  },
                  then: "attended",
                  else: null
                }
              }
            }
          },
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


    const companyInterviews = await CompanyInterview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "company",
          interview_status: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$is_question_empty", true] },
                  { $eq: ["$status", 1] }
                ]
              },
              then: "expired",
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$is_question_empty", false] },
                      { $eq: ["$status", 0] }
                    ]
                  },
                  then: "attended",
                  else: null
                }
              }
            }
          },
          start_date_time: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata" // Convert to IST for response
            }
          }
        }
      }
    ]);
    const codingInterviews = await CodingInterview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "coding",
          interview_status: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$is_question_empty", true] },
                  { $eq: ["$status", 1] }
                ]
              },
              then: "expired",
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$is_question_empty", false] },
                      { $eq: ["$status", 0] }
                    ]
                  },
                  then: "attended",
                  else: null
                }
              }
            }
          },
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

    let finalInterviewsList = [
      ...interviews,
      ...codingInterviews,
      ...companyInterviews
    ].filter(Boolean);
    finalInterviewsList.sort((a, b) => {
      const dateA = a.start_date_time.split(" ")[0].split("-").reverse().join("-") + " " + a.start_date_time.split(" ")[1];
      const dateB = b.start_date_time.split(" ")[0].split("-").reverse().join("-") + " " + b.start_date_time.split(" ")[1];
    
      return new Date(dateB) - new Date(dateA); 
    });
    
    return res.status(200).json(finalInterviewsList);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
const getInterviewDetailsById = async (req, res, next) => {
  const { roll_no, id, platform, type } = req.body;
  try {
    if (type == "ai generated") {
      const result = await Interview.aggregate([
        {
          $addFields: {
            dateOnly: { $substr: ["$start_date_time", 0, 10] },
            interview_type: "ai generated"
          },
        },
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            platform: platform,
            roll_no: roll_no
          }
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
      ])
      if (result) {
        return res.status(200).json(result[0])
      } else {
        return res.status(404).json({ message: "Interview not forund" })
      }
    } else if (type == "company") {
      const result = await CompanyInterview.aggregate([
        {
          $addFields: {
            dateOnly: { $substr: ["$start_date_time", 0, 10] },
            interview_type: "company"
          },
        },
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            platform: platform,
            roll_no: roll_no
          }
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
        },
        {
          $unset: ["userDetails", "companyDetails"],
        },
      ])
      console.log(result)
      if (result) {
        return res.status(200).json(result[0])
      } else {
        return res.status(404).json({ message: "Interview not forund" })
      }
    } else if (type == "coding") {
      const result = await CodingInterview.aggregate([
        {
          $addFields: {
            dateOnly: { $substr: ["$start_date_time", 0, 10] },
            interview_type: "coding"
          },
        },
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            platform: platform,
            roll_no: roll_no
          }
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
          $unset: ["userDetails"],
        },
      ])
      if (result) {
        return res.status(200).json(result[0])
      } else {
        return res.status(404).json({ message: "Interview not forund" })
      }
    }
  } catch (error) {
    return res.status(500).json({ messgae: "Internal server error" })
  }
}
const findSessionToken = async(req, res, next) =>{
  const roll_no=req.params.id;
  const sessionToken = req.cookies.userSessionToken;
  try {
    const user= await User.findOne({roll_no:roll_no})
    if (!user) {
      return res.status(400).json({ message: "No valid session found" });
    }
    return res.status(200).json({sessionToken:user.sessionToken,cookieToken:sessionToken})
  } catch(error) {
    return res.status(500).json({message:"Internal server error"})
  }
}
const updateSessionToken = async (req, res) => {
const roll_no = req.body.roll_no
  const user = await User.findOne({ roll_no: roll_no });

  if (!user) {
    return res.status(400).json({ message: "No valid session found" });
  }

  try {
    await User.findByIdAndUpdate(user._id, { $unset: { sessionToken: "" } });

    res.clearCookie("userSessionToken");
    res.clearCookie("adminSessionToken");

    return res.status(200).json({ message: "Session cleared" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


const attemptedInterviewsCount = async (req, res, next) => {
  const roll_no = req.params.id;
  try {
    const interviewCounts = await Interview.aggregate([
      {
        $match: {
          roll_no: roll_no,
          question_details: {
            $ne: null,
            $not: { $size: 0 }
          }
        }
      },
      {
        $count: "count"
      }
    ]);
    const codingCounts = await CodingInterview.aggregate([
      {
        $match: {
          roll_no: roll_no,
          question_details: {
            $ne: null,
            $not: { $size: 0 }
          }
        }
      },
      {
        $count: "count"
      }
    ])
    const companyCounts = await CompanyInterview.aggregate([
      {
        $match: {
          roll_no: roll_no,
          question_details: {
            $ne: null,
            $not: { $size: 0 }
          }
        }
      },
      {
        $count: "count"
      }
    ])
    const count = interviewCounts.length > 0 ? interviewCounts[0].count : 0;
    const codingCount = codingCounts.length > 0 ? codingCounts[0].count : 0;
    const companyCount = companyCounts.length > 0 ? companyCounts[0].count : 0
    return res.status(200).json({ aiCount: count, codingCount: codingCount, companyCount: companyCount });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const platformInterviewsCount = async (req, res, next) => {
  const roll_no = req.params.id;
  try {
    const getPlatformCounts = async (Model) => {
      const result = await Model.aggregate([
        {
          $match: {
            roll_no: roll_no,
            question_details: { $ne: null },
            $expr: { $gt: [{ $size: "$question_details" }, 0] } // Ensure not empty
          }
        },
        {
          $group: {
            _id: "$platform",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            platform: "$_id",
            count: 1
          }
        }
      ]);

      return {
        web: result.find((item) => item.platform === "web")?.count || 0,
        mpod: result.find((item) => item.platform === "mpod")?.count || 0
      };
    };

    const aiCount = await getPlatformCounts(Interview);
    const codingCount = await getPlatformCounts(CodingInterview);
    const companyCount = await getPlatformCounts(CompanyInterview);
    const mpodCount = aiCount.mpod + codingCount.mpod + companyCount.mpod;
    const webCount = aiCount.web + codingCount.web + companyCount.web;
    return res.status(200).json({
      mpodCount,
      webCount,

    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getDashboardAccuracies = async (req, res, next) => {
  const roll_no = req.params.id;
  try {
    const accuracy = await Interview.aggregate([
      {
        $match: {
          roll_no: roll_no,
          question_details: {
            $ne: null,
            $not: { $size: 0 }
          }
        }
      }
    ])
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" })
  }
}
const overallAccuracy = async (req, res, next) => {
  const roll_no = req.params.id;

  try {
    const getAccuracies = async (model) => {
      const accuracy = await model.aggregate([
        {
          $match: { roll_no: roll_no, status: 0 }
        },
        {
          $addFields: {
            question_details: {
              $ifNull: ["$question_details", []]
            }
          }
        },
        {
          $unwind: {
            path: "$question_details",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$_id", // Group by interview
            avgAccuracyPerInterview: {
              $avg: {
                $convert: {
                  input: "$question_details.accuracy",
                  to: "double",
                  onError: 0,
                  onNull: 0
                }
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            overallAvgAccuracy: { $avg: "$avgAccuracyPerInterview" }
          }
        }
      ]);
      

      return accuracy.length > 0 ? Math.ceil(accuracy[0].overallAvgAccuracy) : 0;
    };

    const [technologyAvg, codingAvg, companyAvg] = await Promise.all([
      getAccuracies(Interview),
      getAccuracies(CodingInterview),
      getAccuracies(CompanyInterview)
    ]);

    const overallAvgAccuracy = Math.ceil(
      (technologyAvg + codingAvg + companyAvg) / 3
    );

    const accuracyData = [
      { label: "Technology", value: technologyAvg, color: "#4caf50" },
      { label: "Company", value: companyAvg, color: "#ff9800" },
      { label: "Coding", value: codingAvg, color: "#2196f3" }
    ];

    return res.json({
      accuracyData: accuracyData,
      overall: overallAvgAccuracy
    });
  } catch (error) {
    console.error("Error in overallAccuracy:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  },
});
const sendOtp = async (req, res, next) => {
  const { roll_no } = req.body;
  try {
    const user = await User.findOne({ roll_no });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your OTP Code',
      text: `Hello ${user.name || ''},\n\nYour OTP code to reset password of mPOD is: ${otp}\n\nThank you!`
    };

    await transporter.sendMail(mailOptions);

    console.log(`OTP for ${roll_no} is: ${otp}`);
    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const checkOtp = async (req, res, next) => {
  const { roll_no, otp } = req.body;

  try {
    const user = await User.findOne({ roll_no });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user.otp) === String(otp)) {
      return res.status(200).json({ message: "OTP matched" });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const resetPassword = async (req, res, next) => {
  const { roll_no, otp, new_password } = req.body;

  try {
    const user = await User.findOne({ roll_no });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password = hashedPassword;
    user.otp = null; 
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addUser,
  logout,
  uploadProfilePics,
  getUsers,
  login,
  getAssignedInterviews,
  getCurrentUser,
  getInterviewDetailsById,
  updateSessionToken,
  getTraineePastInterviews,
  attemptedInterviewsCount,
  platformInterviewsCount,
  getDashboardAccuracies,
  overallAccuracy,
  getAdminCurrentUser,
  findSessionToken,
  adminLogin,
  checkOtp,
  resetPassword,
  sendOtp
}
