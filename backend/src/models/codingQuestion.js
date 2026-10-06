
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const CodingQuestion = new schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company',
        index:true,
    },
    problem_name: {
        type: String,
        // required: true,
    },
    complexity: {
        type: String,
        // required: true,
    },
    time: {
        type: Number,
        // required: true,
    },
    description: {
        type: String,
        // required: true,
    },
    input: {
        type: String,
        // required: true,
    },
    output: {
        type: String,
        // required: true,
    },
    constraints: {
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
        collection: 'codingquestions'
    });

module.exports = mongoose.model("CodingQuestion", CodingQuestion);


