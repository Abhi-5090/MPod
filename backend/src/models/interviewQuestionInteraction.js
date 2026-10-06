//FILENAME : Interview.js
const mongoose = require("mongoose");

const InterviewQuestionInteractionSchema = mongoose.Schema({
  roll_no:{
    type:String,
    required:true
  },
  technology: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'technology'
  },
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'liteInterviewQuestion'
  },
  favorite: {
    type:Number
  },
  doubt:{
    type: Number,
  },
  status: {
    type: Number,
  },
},
  {
    timestamps: true
  },
  {
    collection: 'interviewquestioninteractions'
  });

// export model user with InterviewSchema
module.exports = mongoose.model("interviewquestioninteractions", InterviewQuestionInteractionSchema);