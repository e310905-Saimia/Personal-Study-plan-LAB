const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        unique: true
    },
    teacherID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Teacher",
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Add a compound index for name and isDeleted to ensure uniqueness of active projects
projectSchema.index({ name: 1, isDeleted: 1 });

module.exports = mongoose.model("Project", projectSchema);