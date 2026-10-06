const mongoose = require('mongoose');

const companysSchema = new mongoose.Schema({
    company_name: {
        type: String
        
    },
    company_big_Logo: {
        type: String
    },
    Role: [{
        role: {
            type: String
        },
        package: {
            type: String
        }
    }],
    percentage: {
        type: String
    },
    backlogs: {
        type: String
    },
    branches: {
        type: String
    },
    Section_process: [{
        round: {
            type: String
        }
    }],
    skillset: [{
        skill: {
            type: String
        }
    }],
    industry: {
        type: String
    },

    higest_package:{
      type: String
    },
    job_description:{
      type: String
    },
    company_link:{
     type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    addedby: {
        type: String
    },
    status: {
        type: Number,
        default: 1,
    },
    updated_at: {
        type: Date,
        default: Date.now()
      },
} );

module.exports = mongoose.model('Companies_info', companysSchema);
