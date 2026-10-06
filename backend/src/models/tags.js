const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const schema = mongoose.Schema;
const Tag = new schema({
    tag_name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
    },
    createdAt: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 500
    },
    updatedAt: {
        type: String,
        // required:true,
        minlength: 2,
        maxlength: 500
    },
    added_by: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    status: {
        type: Number,
        required: true,
        minlength: 1,
        maxlength: 2
    },

},
    {
        collection: 'tags'
    });

module.exports = mongoose.model("Tag", Tag);
