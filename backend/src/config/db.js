//FILENAME : db.js

const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const MONGOURI = process.env.MONGODB_URI;
const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true,
      // serverSelectionTimeoutMS: 120000, // Increase to 120 seconds
    });
    console.log("Connected to DB !!");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;