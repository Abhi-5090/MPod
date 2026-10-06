
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const CompanyQuestion = new schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
        index:true,
    },
    type: {
        type: String,
        // required: true,
    },
    round: {
        type: String,
        // required: true,
    },
    year: {
        type: String,
        // required: true,
    },
    tag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tag'
        // required: true,
    },
    question: {
        type: String,
        // required: true,
    },
    added_by: {
        type: String,
        // required: true,
    },
    status: {
        type: Number,
        default: 1,
    },
},
    {
        timestamps: true
    },
    {
        collection: 'companyquestions'
    });

module.exports = mongoose.model("CompanyQuestion", CompanyQuestion);


