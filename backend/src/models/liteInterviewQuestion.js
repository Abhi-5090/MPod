//FILENAME : Interview.js
const mongoose = require("mongoose");

const LiteInterviewQuestionSchema = mongoose.Schema({
  technology: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'technology'
  },
  question:{
    type: String,
  },
  answer:{
    type: String,
  },
  company: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company' // assuming your company model is named 'company'
  }],  
  previous_asked_status:{
    type:Number
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
    collection: 'liteinterviewquestions'
  });

// export model user with InterviewSchema
module.exports = mongoose.model("liteinterviewquestions", LiteInterviewQuestionSchema);