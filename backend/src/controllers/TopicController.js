const Topic = require("../models/topic");
const Module = require("../models/module");
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const { asyncHandler } = require("../lib/http");

const addTopic = async (req, res) => {
  const { module, technology } = req.body || {};
  if (!req.file) return res.status(400).json({ message: "Upload an Excel file with one topic per row." });
  if (!mongoose.Types.ObjectId.isValid(String(module)) || !mongoose.Types.ObjectId.isValid(String(technology))) {
    return res.status(400).json({ message: "Select a technology and module." });
  }
  if (!(await Module.exists({ _id: module, technology }))) {
    return res.status(400).json({ message: "The module does not belong to the selected technology." });
  }
  let wb;
  try {
    wb = xlsx.readFile(req.file.path, { sheetRows: 6000, cellFormula: false, cellHTML: false });
  } catch (_) {
    return res.status(400).json({ message: "Could not read the file." });
  }
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: "A" });
  const names = rows
    .map((row) => String(Object.values(row)[0] ?? "").trim().slice(0, 300))
    .filter(Boolean);
  if (!names.length) return res.status(400).json({ message: "No topics found in the file." });
  if (names.length > 2000) return res.status(400).json({ message: "A file can have at most 2000 topics." });
  const saved = await Topic.insertMany(
    names.map((topic_name) => ({ technology, module, topic_name, added_by: req.auth.user.roll_no }))
  );
  return res.status(200).json(saved);
};
const getTopics = async (req, res, next) => {
  try {
    const topics = await Topic.aggregate([
      {
        $lookup: {
          from: "modules",
          localField: "module",
          foreignField: "_id",
          as: "moduleInfo"
        }
      },
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
          module_name: { $arrayElemAt: ["$moduleInfo.module_name", 0] },
          technology_name: { $arrayElemAt: ["$technologyInfo.technology_name", 0] }
        }
      },
      {
        $project: {
          moduleInfo: 0
        }
      }
    ])
    if (topics.length > 0) {
      return res.status(200).json(topics);
    } else {
      return res.status(404).json({ message: "Topics not found" });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getTopicById = async (req, res, next) => {
  const topicId = req.params.id;
  try {
    const topic = await Topic.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(topicId)
        }
      }
    ]);

    if (!topic || topic.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }
    res.status(200).json(topic[0]);
  } catch (error) {
    console.error("Error fetching topic:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateTopic = async (req, res, next) => {
  const topicId = req.params.id;
  const { topic_name, module, technology, status } = req.body;
  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    const given = (v) => v !== undefined && v !== "undefined" && v !== "";
    if (given(topic_name)) topic.topic_name = String(topic_name).trim().slice(0, 300);
    if (given(module)) {
      if (!mongoose.Types.ObjectId.isValid(String(module))) return res.status(400).json({ message: "Invalid module" });
      topic.module = module;
    }
    if (given(technology)) {
      if (!mongoose.Types.ObjectId.isValid(String(technology))) return res.status(400).json({ message: "Invalid technology" });
      topic.technology = technology;
    }
    if (given(status)) topic.status = Number(status) === 0 ? 0 : 1;


    await topic.save();

    return res.status(200).json({ message: "Topic updated successfully", topic });
  } catch (error) {
    console.error("Error updating Topic:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
const deleteTopic = async (req, res, next) => {
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

const getTopicsByModule = async (req, res, next) => {
  let module_id = req.body.module_id;
  if (typeof (module_id) == "string" && req.body.module_id.length==24) {
    module_id = new mongoose.Types.ObjectId(req.body.module_id)
    try {
      const module = await Module.findById(module_id);
  
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      const topics = await Topic.find({ module: { $in: module._id } });
      res.status(200).json(topics);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }else{
    res.status(400).json({ message: "Invalid module id" })
  }
  
}

const getTopicsByMultiModules = async (req, res, next) => {
  let module_ids = req.body.module_ids;
  
  // Check if module_ids is an array
  if (Array.isArray(module_ids) && module_ids.every(id => mongoose.Types.ObjectId.isValid(id))) {
    module_ids = module_ids.map(id => new mongoose.Types.ObjectId(id));

    try {
      // Find topics for each module ID
      const topics = await Topic.find({ module: { $in: module_ids } });

      res.status(200).json(topics);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(400).json({ message: "Invalid module IDs provided" });
  }
};


module.exports = {
  addTopic: asyncHandler(addTopic),
  getTopics: asyncHandler(getTopics),
  getTopicById: asyncHandler(getTopicById),
  updateTopic: asyncHandler(updateTopic),
  deleteTopic: asyncHandler(deleteTopic),
  getTopicsByModule: asyncHandler(getTopicsByModule),
  getTopicsByMultiModules: asyncHandler(getTopicsByMultiModules),
};
