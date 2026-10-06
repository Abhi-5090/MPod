const express = require('express');
const Router = express.Router();
const TechnologyController = require('../controllers/TechnologyController');
const multer = require("multer");
const path = require("path");
const fs = require("fs"); 

const uploadPath = "uploads/technology-icons/";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check if directory exists, if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // create nested directories if needed
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `tech_icon_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpg", "image/jpeg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });
Router.post('/api/add-technology', TechnologyController.addTechnology);
Router.get('/api/get-technologies', TechnologyController.gettechnologies);
Router.get('/api/get-technology-by-id/:id', TechnologyController.getTechnologyById)
Router.post("/api/update-technology/:id", upload.single("technology_icon"), TechnologyController.updateTechnology);


Router.delete('/api/delete-technology/:id', TechnologyController.deleteTechnology)


module.exports = Router;
