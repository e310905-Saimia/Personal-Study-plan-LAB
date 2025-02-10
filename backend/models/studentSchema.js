const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        default: "Student",
    },
});

module.exports = mongoose.model("student", studentSchema);
