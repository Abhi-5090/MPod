const User = require("../models/user");
const Interview = require("../models/interview");
const CodingInterview = require("../models/codingInterview");
const CompanyInterview = require("../models/companyInterview");
const CodingQuestion = require("../models/codingQuestion");
const CompanyQuestion = require("../models/companyQuestion");
const Tenant = require("../models/tenant");

const mongoose = require('mongoose');
const { asyncHandler } = require("../lib/http");

const userStats = async (req, res, next) => {
  const tenant = req.params.tid;
  try {
    const users = await User.aggregate([
      {
        $match: {
          tenant_id: new mongoose.Types.ObjectId(tenant)
        }
      },
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 }
        }
      }
    ]);

    let stats = { male: 0, female: 0 };
    users.forEach(user => {
      if (user._id === 'male') stats.male = user.count;
      else if (user._id === 'female') stats.female = user.count;
    });

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error in userStats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getInterviewStats = async (req, res) => {
  try {
    const tenant_id = req.params.tid;
    const commonPipeline = [
      {
        $match: {
          status: 0
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
        $unwind: "$userDetails"
      },
      {
        $match: {
          "userDetails.tenant_id": new mongoose.Types.ObjectId(tenant_id),
        },
      },
      {
        $count: "total_interviews"
      }
    ];

    const interviewCount = await Interview.aggregate(commonPipeline);
    const codingInterviewCount = await CodingInterview.aggregate(commonPipeline)
    const companyInterviewCount = await CompanyInterview.aggregate(commonPipeline)
    const technologyTotal = interviewCount[0]?.total_interviews || 0;
    const codingTotal = codingInterviewCount[0]?.total_interviews || 0;
    const companyTotal = companyInterviewCount[0]?.total_interviews || 0;
    return res.status(200).json({ technologyInterviews: technologyTotal, codingInterviews: codingTotal, companyInterviews: companyTotal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }) });
  }
};
const getAssignedInterviewStats = async (req, res) => {
  try {
    const tenant_id = req.params.tid;
    const commonPipeline = [
      {
        $lookup: {
          from: "users",
          localField: "roll_no",
          foreignField: "roll_no",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails"
      },
      {
        $match: {
          "userDetails.tenant_id": new mongoose.Types.ObjectId(tenant_id),
        },
      },
      {
        $count: "total_interviews"
      }
    ];

    const interviewCount = await Interview.aggregate(commonPipeline);
    const codingInterviewCount = await CodingInterview.aggregate(commonPipeline)
    const companyInterviewCount = await CompanyInterview.aggregate(commonPipeline)
    const technologyTotal = interviewCount[0]?.total_interviews || 0;
    const codingTotal = codingInterviewCount[0]?.total_interviews || 0;
    const companyTotal = companyInterviewCount[0]?.total_interviews || 0;
    return res.status(200).json({ technologyInterviews: technologyTotal, codingInterviews: codingTotal, companyInterviews: companyTotal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }) });
  }
};
const getPlatformStats = async (req, res, next) => {
  const tenant = req.params.tid;

  try {
    const pipeline = [
      {
        $match: {
          status: 0
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
        $unwind: "$userDetails"
      },
      {
        $match: {
          "userDetails.tenant_id": new mongoose.Types.ObjectId(tenant),
        },
      },
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 }
        }
      }
    ];

    const interviewStats = await Interview.aggregate(pipeline);
    const codingStats = await CodingInterview.aggregate(pipeline);
    const companyStats = await CompanyInterview.aggregate(pipeline);

    // Combine counts from all collections
    const mergedStats = {};

    [interviewStats, codingStats, companyStats].flat().forEach(item => {
      const platform = item._id || "unknown";
      mergedStats[platform] = (mergedStats[platform] || 0) + item.count;
    });

    return res.status(200).json({
      mpod: mergedStats["mpod"] || 0,
      web: mergedStats["web"] || 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }) });
  }
};
const getCodingQuestionsCount = async (req, res, next) => {
  try {
    const counts = await CodingQuestion.aggregate([
      {
        $group: {
          _id: "$complexity",
          count: { $sum: 1 }
        }
      }
    ]);

    const formatted = { easy: 0, medium: 0, hard: 0 };

    counts.forEach(({ _id, count }) => {
      const key = _id?.toLowerCase();
      if (formatted.hasOwnProperty(key)) {
        formatted[key] = count;
      }
    });

    formatted.total = formatted.easy + formatted.medium + formatted.hard;

    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
const getCompanyQuestionsCount = async (req, res, next) => {
  try {
    const result = await CompanyQuestion.aggregate([
      {
        $group: {
          _id: "$company", // Group by company name
          count: { $sum: 1 } // Count of questions per company
        }
      }
    ]);

    const totalCompanies = result.length;
    const totalQuestions = result.reduce((sum, company) => sum + company.count, 0);

    return res.status(200).json({
      totalCompanies,
      totalQuestions
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getYesterdayAssignedInterviewStats = async (req, res) => {
  try {
    const tenant_id = req.params.tid;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(yesterday);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const getPipeline = () => ([
      {
        $lookup: {
          from: "users",
          localField: "roll_no",
          foreignField: "roll_no",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails"
      },
      {
        $match: {
          "userDetails.tenant_id": new mongoose.Types.ObjectId(tenant_id),
          start_date_time: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          }
        },
      },
      {
        $count: "total_interviews"
      }
    ]);

    // Execute aggregation with the custom pipeline
    const interviewCount = await Interview.aggregate(getPipeline());
    const codingInterviewCount = await CodingInterview.aggregate(getPipeline());
    const companyInterviewCount = await CompanyInterview.aggregate(getPipeline());

    const technologyTotal = interviewCount[0]?.total_interviews || 0;
    const codingTotal = codingInterviewCount[0]?.total_interviews || 0;
    const companyTotal = companyInterviewCount[0]?.total_interviews || 0;

    return res.status(200).json({
      technologyInterviews: technologyTotal,
      codingInterviews: codingTotal,
      companyInterviews: companyTotal
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "production" ? {} : { error: error.message })
    });
  }
};
const getYesterdayAttemptedInterviewStats = async (req, res) => {
  try {
    const tenant_id = req.params.tid;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(yesterday);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const getPipeline = () => ([
      {
        $match: {
          status: 0
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
        $unwind: "$userDetails"
      },
      {
        $match: {
          "userDetails.tenant_id": new mongoose.Types.ObjectId(tenant_id),
          start_date_time: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          }
        },
      },
      {
        $count: "total_interviews"
      }
    ]);

    // Execute aggregation with the custom pipeline
    const interviewCount = await Interview.aggregate(getPipeline());
    const codingInterviewCount = await CodingInterview.aggregate(getPipeline());
    const companyInterviewCount = await CompanyInterview.aggregate(getPipeline());

    const technologyTotal = interviewCount[0]?.total_interviews || 0;
    const codingTotal = codingInterviewCount[0]?.total_interviews || 0;
    const companyTotal = companyInterviewCount[0]?.total_interviews || 0;

    return res.status(200).json({
      technologyInterviews: technologyTotal,
      codingInterviews: codingTotal,
      companyInterviews: companyTotal
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "production" ? {} : { error: error.message })
    });
  }
};

const getYesterdayTechStats = async (req, res) => {
  try {
    const tenant_id = req.params.tid;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(yesterday);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          start_date_time: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          },
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
      { $unwind: "$userDetails" },
      {
        $match: {
          "userDetails.tenant_id": new mongoose.Types.ObjectId(tenant_id),
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
      { $unwind: "$technologyDetails" },
      {
        $group: {
          _id: "$technologyDetails.technology_name",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          technology: "$_id",
          count: 1,
        },
      },
      {
        $sort: { count: -1 }
      }
    ];

    const technologyWiseCounts = await Interview.aggregate(pipeline);

    return res.status(200).json({ technologyWiseCounts });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }),
    });
  }
};

const getOverAllYesterdayAssignedInterviewStats = async (req, res) => {
  try {
    // const tenant_id = req.params.tid;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(yesterday);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const getPipeline = () => ([
      {
        $lookup: {
          from: "users",
          localField: "roll_no",
          foreignField: "roll_no",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails"
      },
      {
        $match: {
          // "userDetails.tenant_id": new mongoose.Types.ObjectId(tenant_id),
          start_date_time: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          }
        },
      },
      {
        $count: "total_interviews"
      }
    ]);

    // Execute aggregation with the custom pipeline
    const interviewCount = await Interview.aggregate(getPipeline());
    const codingInterviewCount = await CodingInterview.aggregate(getPipeline());
    const companyInterviewCount = await CompanyInterview.aggregate(getPipeline());

    const technologyTotal = interviewCount[0]?.total_interviews || 0;
    const codingTotal = codingInterviewCount[0]?.total_interviews || 0;
    const companyTotal = companyInterviewCount[0]?.total_interviews || 0;

    return res.status(200).json({
      technologyInterviews: technologyTotal,
      codingInterviews: codingTotal,
      companyInterviews: companyTotal
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "production" ? {} : { error: error.message })
    });
  }
};

const getYesterdayAttemptedTechStats = async (req, res) => {
  try {
    const tenant_id = req.params.tid;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(yesterday);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          status: 0,
          start_date_time: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          },
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
      { $unwind: "$userDetails" },
      {
        $match: {
          "userDetails.tenant_id": new mongoose.Types.ObjectId(tenant_id),
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
      { $unwind: "$technologyDetails" },
      {
        $group: {
          _id: "$technologyDetails.technology_name",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          technology: "$_id",
          count: 1,
        },
      },
      {
        $sort: { count: -1 }
      }
    ];

    const technologyWiseCounts = await Interview.aggregate(pipeline);

    return res.status(200).json({ technologyWiseCounts });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }),
    });
  }
};
const getAllTenantsYesterdayAssignedStats = async (req, res, next) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(yesterday);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const getTenantWisePipeline = () => [
      {
        $lookup: {
          from: "users",
          localField: "roll_no",
          foreignField: "roll_no",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $match: {
          start_date_time: { $gte: startOfYesterday, $lte: endOfYesterday },
        },
      },
      {
        $group: {
          _id: "$userDetails.tenant_id",
          total_interviews: { $sum: 1 },
        },
      },
      {
        $project: {
          tenant_id: "$_id",
          total_interviews: 1,
          _id: 0,
        },
      },
    ];

    const [techResults, codingResults, companyResults] = await Promise.all([
      Interview.aggregate(getTenantWisePipeline()),
      CodingInterview.aggregate(getTenantWisePipeline()),
      CompanyInterview.aggregate(getTenantWisePipeline()),
    ]);

    const tenantStats = {};

    const mergeResults = (results, type) => {
      results.forEach((r) => {
        const tid = r.tenant_id?.toString();
        if (!tenantStats[tid]) {
          tenantStats[tid] = {
            tenant_id: tid,
            technologyInterviews: 0,
            codingInterviews: 0,
            companyInterviews: 0,
          };
        }
        if (type === "tech") tenantStats[tid].technologyInterviews += r.total_interviews;
        if (type === "coding") tenantStats[tid].codingInterviews += r.total_interviews;
        if (type === "company") tenantStats[tid].companyInterviews += r.total_interviews;
      });
    };

    mergeResults(techResults, "tech");
    mergeResults(codingResults, "coding");
    mergeResults(companyResults, "company");

    const tenantIds = Object.keys(tenantStats).map((id) => new mongoose.Types.ObjectId(id));

    const tenants = await Tenant.find(
      { _id: { $in: tenantIds } },
      { _id: 1, organization_name: 1 }
    ).lean();

    const tenantNameMap = tenants.reduce((acc, t) => {
      acc[t._id.toString()] = t.organization_name;
      return acc;
    }, {});

    const resultArray = Object.values(tenantStats).map((t) => ({
      tenant_id: t.tenant_id,
      tenant_name: tenantNameMap[t.tenant_id] || "Unknown Tenant",
      technologyInterviews: t.technologyInterviews,
      codingInterviews: t.codingInterviews,
      companyInterviews: t.companyInterviews,
    }));

    return res.status(200).json({
      message: "Tenant-wise yesterday scheduled interview stats",
      data: resultArray,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }),
    });
  }
};

const getOverAllYesterdayAttemptedInterviewStats = async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(yesterday);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // Aggregation pipeline for tenant-wise attempted interviews
    const getTenantWisePipeline = () => [
      {
        $match: {
          status: 0, // only attempted
          start_date_time: { $gte: startOfYesterday, $lte: endOfYesterday },
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
      { $unwind: "$userDetails" },
      {
        $group: {
          _id: "$userDetails.tenant_id",
          total_attempted: { $sum: 1 },
        },
      },
      {
        $project: {
          tenant_id: "$_id",
          total_attempted: 1,
          _id: 0,
        },
      },
    ];

    // Run all three interview collections in parallel
    const [techResults, codingResults, companyResults] = await Promise.all([
      Interview.aggregate(getTenantWisePipeline()),
      CodingInterview.aggregate(getTenantWisePipeline()),
      CompanyInterview.aggregate(getTenantWisePipeline()),
    ]);

    // Merge counts by tenant
    const tenantStats = {};

    const mergeResults = (results, type) => {
      results.forEach((r) => {
        const tid = r.tenant_id?.toString();
        if (!tenantStats[tid]) {
          tenantStats[tid] = {
            tenant_id: tid,
            technologyInterviews: 0,
            codingInterviews: 0,
            companyInterviews: 0,
          };
        }
        if (type === "tech") tenantStats[tid].technologyInterviews += r.total_attempted;
        if (type === "coding") tenantStats[tid].codingInterviews += r.total_attempted;
        if (type === "company") tenantStats[tid].companyInterviews += r.total_attempted;
      });
    };

    mergeResults(techResults, "tech");
    mergeResults(codingResults, "coding");
    mergeResults(companyResults, "company");

    // Get tenant names
    const tenantIds = Object.keys(tenantStats).map((id) => new mongoose.Types.ObjectId(id));
    const tenants = await Tenant.find(
      { _id: { $in: tenantIds } },
      { _id: 1, organization_name: 1 }
    ).lean();

    const tenantNameMap = tenants.reduce((acc, t) => {
      acc[t._id.toString()] = t.organization_name;
      return acc;
    }, {});

    // Combine results with tenant names
    const resultArray = Object.values(tenantStats).map((t) => ({
      tenant_id: t.tenant_id,
      tenant_name: tenantNameMap[t.tenant_id] || "Unknown Tenant",
      technologyInterviews: t.technologyInterviews,
      codingInterviews: t.codingInterviews,
      companyInterviews: t.companyInterviews,
    }));

    return res.status(200).json({
      message: "Tenant-wise yesterday attempted interview stats",
      data: resultArray,
    });
  } catch (error) {
    console.error("Error fetching attempted stats:", error);
    return res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "production" ? {} : { error: error.message }),
    });
  }
};
const overallStats = async (req, res) => {
  try {
    // ---------- Overall stats (no tenant filter) ----------
    const overallCommonPipeline = [
      {
        $facet: {
          assigned: [{ $count: "count" }],
          attempted: [
            { $match: { status: 0 } },
            { $count: "count" }
          ]
        }
      },
      {
        $project: {
          assigned: { $ifNull: [{ $arrayElemAt: ["$assigned.count", 0] }, 0] },
          attempted: { $ifNull: [{ $arrayElemAt: ["$attempted.count", 0] }, 0] }
        }
      }
    ];

    const overallTechStats = await Interview.aggregate(overallCommonPipeline);
    const overallCodingStats = await CodingInterview.aggregate(overallCommonPipeline);
    const overallCompanyStats = await CompanyInterview.aggregate(overallCommonPipeline);

    // ---------- Tenant-wise stats ----------
    const commonPipeline = [
      {
        $lookup: {
          from: "users",
          localField: "roll_no",
          foreignField: "roll_no",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $group: {
          _id: "$userDetails.tenant_id",
          totalAssigned: { $sum: 1 },
          totalAttempted: {
            $sum: {
              $cond: [{ $eq: ["$status", 0] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: "tenants",
          localField: "_id",
          foreignField: "_id",
          as: "tenant"
        }
      },
      { $unwind: "$tenant" },
      {
        $project: {
          tenant_id: "$_id",
          tenant_name: "$tenant.organization_name",
          totalAssigned: 1,
          totalAttempted: 1,
          _id: 0
        }
      }
    ];

    const tenantWiseTechstats = await Interview.aggregate(commonPipeline);
    const tenantWiseCodingstats = await CodingInterview.aggregate(commonPipeline);
    const tenantWiseCompanystats = await CompanyInterview.aggregate(commonPipeline);

    // ---------- Final Response ----------
    return res.status(200).json({
      overall: {
        overallTechStats: overallTechStats[0],
        overallCodingStats: overallCodingStats[0],
        overallCompanyStats: overallCompanyStats[0]
      },
      tenantwise: {
        tenantWiseTechstats,
        tenantWiseCodingstats,
        tenantWiseCompanystats
      }
    });

  } catch (error) {
    console.error("Stats Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const currentStats = async (req, res) => {
  try {
    // Today IST start & end
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = new Date(today);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const now = new Date(); // current time for upcoming check

    const getTenantWisePipeline = () => [
      {
        $match: {
          start_date_time: { $gte: startOfToday, $lte: endOfToday },
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
      { $unwind: "$userDetails" },
      {
        $group: {
          _id: "$userDetails.tenant_id",

          // total assigned for today
          assigned_count: { $sum: 1 },

          // attempted (status = 0)
          attempted_count: {
            $sum: { $cond: [{ $eq: ["$status", 0] }, 1, 0] },
          },

          // upcoming today (current time < interview start time)
          upcoming_count: {
            $sum: { $cond: [{ $gt: ["$start_date_time", now] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          tenant_id: "$_id",
          _id: 0,
          assigned_count: 1,
          attempted_count: 1,
          upcoming_count: 1,
        },
      },
    ];

    // Execute for all interview types
    const [techResults, codingResults, companyResults] = await Promise.all([
      Interview.aggregate(getTenantWisePipeline()),
      CodingInterview.aggregate(getTenantWisePipeline()),
      CompanyInterview.aggregate(getTenantWisePipeline()),
    ]);

    // Merge stats by tenant
    const tenantStats = {};

    const merge = (arr, type) => {
      arr.forEach((r) => {
        const t = r.tenant_id?.toString();
        if (!tenantStats[t]) {
          tenantStats[t] = {
            tenant_id: t,
            technologyInterviews: { assigned: 0, attempted: 0, upcoming: 0 },
            codingInterviews: { assigned: 0, attempted: 0, upcoming: 0 },
            companyInterviews: { assigned: 0, attempted: 0, upcoming: 0 },
          };
        }
        if (type === "tech") {
          tenantStats[t].technologyInterviews.assigned += r.assigned_count;
          tenantStats[t].technologyInterviews.attempted += r.attempted_count;
          tenantStats[t].technologyInterviews.upcoming += r.upcoming_count;
        }
        if (type === "coding") {
          tenantStats[t].codingInterviews.assigned += r.assigned_count;
          tenantStats[t].codingInterviews.attempted += r.attempted_count;
          tenantStats[t].codingInterviews.upcoming += r.upcoming_count;
        }
        if (type === "company") {
          tenantStats[t].companyInterviews.assigned += r.assigned_count;
          tenantStats[t].companyInterviews.attempted += r.attempted_count;
          tenantStats[t].companyInterviews.upcoming += r.upcoming_count;
        }
      });
    };

    merge(techResults, "tech");
    merge(codingResults, "coding");
    merge(companyResults, "company");

    // Fetch tenant names
    const tenantIds = Object.keys(tenantStats).map((id) => new mongoose.Types.ObjectId(id));
    const tenants = await Tenant.find(
      { _id: { $in: tenantIds } },
      { organization_name: 1 }
    ).lean();

    const tenantNameMap = tenants.reduce((a, t) => {
      a[t._id.toString()] = t.organization_name;
      return a;
    }, {});

    // Format output
    const result = Object.values(tenantStats).map((t) => ({
      tenant_id: t.tenant_id,
      tenant_name: tenantNameMap[t.tenant_id] || "Unknown Tenant",
      technologyInterviews: t.technologyInterviews,
      codingInterviews: t.codingInterviews,
      companyInterviews: t.companyInterviews,
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
const getDaywiseStats = async (req, res, next) => {
  try {
    const commonPipeline =[
      {
        $match: {
          start_date_time: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 10))
          },
          status:0
        }
      },
      {
        $addFields: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$start_date_time" }
          }
        }
      },
      {
        $group: {
          _id: "$date",
          assigned_count: { $sum: 1 },
          attempted_count: {
            $sum: {
              $cond: [{ $eq: ["$status", 0] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]
    const techResult = await Interview.aggregate(commonPipeline);
    const codingResult = await CodingInterview.aggregate(commonPipeline);
    const companyResult = await CompanyInterview.aggregate(commonPipeline);

    return res.status(200).json({
      message: "Last 10 active interview dates stats",
      technology: techResult,
      coding:codingResult,
      company:companyResult
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// MAIN CONTROLLER
module.exports = {
  userStats: asyncHandler(userStats),
  getInterviewStats: asyncHandler(getInterviewStats),
  getAssignedInterviewStats: asyncHandler(getAssignedInterviewStats),
  getPlatformStats: asyncHandler(getPlatformStats),
  getCodingQuestionsCount: asyncHandler(getCodingQuestionsCount),
  getCompanyQuestionsCount: asyncHandler(getCompanyQuestionsCount),
  getYesterdayAssignedInterviewStats: asyncHandler(getYesterdayAssignedInterviewStats),
  getOverAllYesterdayAssignedInterviewStats: asyncHandler(getOverAllYesterdayAssignedInterviewStats),
  getYesterdayAttemptedInterviewStats: asyncHandler(getYesterdayAttemptedInterviewStats),
  getOverAllYesterdayAttemptedInterviewStats: asyncHandler(getOverAllYesterdayAttemptedInterviewStats),
  getYesterdayTechStats: asyncHandler(getYesterdayTechStats),
  getYesterdayAttemptedTechStats: asyncHandler(getYesterdayAttemptedTechStats),
  getAllTenantsYesterdayAssignedStats: asyncHandler(getAllTenantsYesterdayAssignedStats),
  overallStats: asyncHandler(overallStats),
  currentStats: asyncHandler(currentStats),
  getDaywiseStats: asyncHandler(getDaywiseStats),
};
