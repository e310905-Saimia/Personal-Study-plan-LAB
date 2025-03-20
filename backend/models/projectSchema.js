// backend/models/projectSchema.js

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        default: "" 
    },
    defaultCredits: { 
        type: Number, 
        default: 1,
        min: 0.1,
        max: 10
    },
    category: { 
        type: String, 
        default: "General" 
    },
    teacherID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Teacher",
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Add a compound index for name and isDeleted to ensure uniqueness of active projects
projectSchema.index({ name: 1, isDeleted: 1 });

module.exports = mongoose.model("Project", projectSchema);