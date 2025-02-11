const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
    },
    credits: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model("Subject", subjectSchema);
