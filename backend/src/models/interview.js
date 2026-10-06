//FILENAME : Interview.js
const mongoose = require("mongoose");

const InterviewSchema = mongoose.Schema({
  platform: {
    type: String,
    required: true
  },
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
  start_date_time: {
    type: Date,
    required: true
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
  emotions: {
    seen_left: String,
    seen_right: String,
    seen_center: String,
    blinks: String,
    time_straight: String,
    time_left: String,
    time_right: String,
    emotions: {
      angry: Number,
      disgust: Number,
      fear: Number,
      happy: Number,
      sad: Number,
      surprise: Number,
      neutral: Number,
    },
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
    collection: 'interviews'
  });

// export model user with InterviewSchema
module.exports = mongoose.model("interview", InterviewSchema);