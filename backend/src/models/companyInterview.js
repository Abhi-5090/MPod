const mongoose = require("mongoose");

const CompanyInterviewSchema = mongoose.Schema({
  platform: {
    type: String,
    required: true
  },
  company: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
    index: true,
  }],
  roll_no: {
    type: String,
    required: true
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
  },
  type: [{
    type: String
  }],
  round: [{
    type: String,
  }],
  start_date_time: {
    type: Date,
    required: true
  },
  questions_count: {
    type: String
  },
  question_details: {
    type: Array,
  },
  overall_analysis: {
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
  },
},
  {
    timestamps: true,
    collection: 'companyinterviews'
  });

module.exports = mongoose.model("companyinterview", CompanyInterviewSchema);