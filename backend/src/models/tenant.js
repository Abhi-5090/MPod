// // Tenant schema
// const mongoose = require("mongoose");

// const TenantSchema = mongoose.Schema({
//   organization_name: {
//     type: String,
//     // require: true
//   },
//   contact_person: {
//     type: String,
//   },
//   email: {
//     type: String,
//     index:true,
//   },
//   active_credits: {
//     type : Number,
//   },
//   assigned_credits: {
//     type : Array,
//   },
//   status: {
//     type: Number,
//     default: 1,
//   }
// }, {
//   collection: 'tenants'
// });

// module.exports = mongoose.model("tenant", TenantSchema);

const mongoose = require("mongoose");

const TenantSchema = mongoose.Schema({
  organization_name: {
    type: String,
  },
  contact_person: {
    type: String,
  },
  email: {
    type: String,
    index: true,
  },
  active_credits: {
    type: Number,
  },
  assigned_credits: {
    type: Array,
  },
  status: {
    type: Number,
    default: 1,
  },
  interview_duration_minutes: {
    type: Number,
    default: 30, 
  },
  organization_code: {
    type: String,
    unique: true,
  }
}, {
  collection: 'tenants',
  timestamps: true // automatically adds createdAt and updatedAt
});

module.exports = mongoose.model("tenant", TenantSchema);
