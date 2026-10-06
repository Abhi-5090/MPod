const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  first_name: {
    type: String,
  },
  roll_no: {
    type: String,
    index:true,
  },
  mobile: {
    type: Number,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  gender: {
    type: String,
  },
  loginStatus:{
    type:String,
  },
  college: {
    type: String,
    index: true,
  },
  branch: {
    type: String,
    index: true,
  },
  passout_year: {
    type: Number,
    index:true,
  },
  role: {
    type: String
  },
  profile_pic: {
    type: String
  },
  status: {
    type: Number,
    default: 1,
  },
  sessionToken: {
    type: String
  },
  tenant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tenant'
  },
  otp: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: Date.now()
  },
  updated_at: {
    type: Date,
    default: Date.now()
  },
}, {
  collection: 'users'
});

module.exports = mongoose.model("user", UserSchema);
