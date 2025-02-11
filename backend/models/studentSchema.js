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
    teacherID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "teacher",
        required: false,
    },
});

module.exports = mongoose.model("student", studentSchema);
