//FILENAME : Interview.js
const mongoose = require("mongoose");

const LiteInterviewSchema = mongoose.Schema({

  roll_no:{
    type:String,
    required:true
  },
  technology: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'technology'
  },
  module: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'module'
  },
  topic: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'topic'
  },
  level: {
    type: String,
    required: true
  },
  questions_count: {
    type: String
  },
  question_details:{
    type: Array,
  },
  overall_analysis:{
    type: Array,
  },
  created_by: {
    type: String,
  },
  status: {
    type: Number,
    // required: true
  },
},
  {
    timestamps: true
  },
  {
    collection: 'liteinterviews'
  });

// export model user with InterviewSchema
module.exports = mongoose.model("liteinterview", LiteInterviewSchema);