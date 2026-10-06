
const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const schema = mongoose.Schema;
const Company = new schema({
    company_name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
    },   
    added_date:{
        type:String,
        required:true,
        minlength:2,
        maxlength:500
    },
    update_date:{
        type:String,
        // required:true,
        minlength:2,
        maxlength:500
    },
    added_by:{
        type:String,
        required:true,
        minlength:2,
        maxlength:20
    },
    status:{
        type:Number,
        required:true,
        minlength:1,
        maxlength:2
    },
   
});

module.exports = mongoose.model("Company", Company);


