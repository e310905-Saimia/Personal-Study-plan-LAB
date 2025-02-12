const mongoose = require('mongoose');

const outcomeSchema = new mongoose.Schema({
    topic: String,
    project: String,
    credits: Number,
});

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    outcomes: [outcomeSchema]  
});

module.exports = mongoose.model("Subject", subjectSchema);
