const Technology = require("../models/technology");
const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path");
const Module = require("../models/module");
const { handleFileUpload } = require('../utils/fileUploadUtil');
const { TECH_ICONS_DIR } = require("../config/paths");
const { asyncHandler } = require("../lib/http");

const addTechnology = async (req, res, next) => {
  try {
    const { technology_name, technology_category } = req.body;
    if (!technology_name || !String(technology_name).trim() || !technology_category) {
      return res.status(400).json({ message: "Technology name and category are required." });
    }

    const technology = new Technology({
     
      technology_name: technology_name,
      
      technology_category: technology_category,
      status:1,
      added_by: req.auth.user.roll_no
    });
    const savedTechnology = await technology.save();
    if (savedTechnology) {
      return res.status(200).json(savedTechnology);
    } else {
      return res.status(500).json({ message: "Failed to save Technology." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};
const gettechnologies = async (req, res, next) => {
  try {
    const technologies = await Technology.find()
    if (technologies.length > 0) {
      return res.status(200).json(technologies);
    } else {
      return res.status(404).json({ message: "Technologies not found" });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error." });
  }
};


const getTechnologyById = async (req, res, next) => {
  const technologyId = req.params.id;
  try {
    const technology = await Technology.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(technologyId)
        }
      }
    ]);

    if (!technology || technology.length === 0) {
      return res.status(404).json({ message: "Technology not found" });
    }
    res.status(200).json(technology[0]);
  } catch (error) {
    console.error("Error fetching technology:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateTechnology = async (req, res, next) => {
  const technologyId = req.params.id;
  const { technology_name, status, technology_category } = req.body;

  try {
    const technology = await Technology.findById(technologyId);
    if (!technology) {
      return res.status(404).json({ message: "Technology not found" });
    }

    if (technology_name && technology_name !== "undefined") {
      technology.technology_name = technology_name;
    }

    if (technology_category && technology_category !== "undefined") {
      technology.technology_category = technology_category;
    }

    if (status !== undefined && status !== "undefined" && status !== "") {
      const st = parseInt(status, 10);
      if (![0, 1].includes(st)) return res.status(400).json({ message: "status must be 0 or 1" });
      technology.status = st;
    }

    if (req.file) {
      const stored = await handleFileUpload(req.file, TECH_ICONS_DIR);
      const old = technology.technology_icon && path.join(TECH_ICONS_DIR, path.basename(technology.technology_icon));
      if (old) fs.promises.unlink(old).catch(() => {});

      technology.technology_icon = stored;
    }

    await technology.save();

    return res.status(200).json({ message: "Technology updated successfully", technology });
  } catch (error) {
    console.error("Error updating Technology:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTechnology = async (req, res, next) => {
  const technologyId = req.params.id;

  try {
    if (await Module.exists({ technology: technologyId })) {
      return res.status(409).json({ message: "Delete this technology's modules first." });
    }
    const deleteTechnology = await Technology.findByIdAndDelete(technologyId);

    if (!deleteTechnology) {
      return res.status(404).json({ message: "Technology not found" });
    }

    return res.status(200).json({ message: "Technology deleted successfully" });
  } catch (error) {
    console.error("Error deleting Technology:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  addTechnology: asyncHandler(addTechnology),
  gettechnologies: asyncHandler(gettechnologies),
  getTechnologyById: asyncHandler(getTechnologyById),
  updateTechnology: asyncHandler(updateTechnology),
  deleteTechnology: asyncHandler(deleteTechnology),
};
