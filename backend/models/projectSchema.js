// backend/models/projectSchema.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        unique: true
    },
    projectNumber: {
        type: String,
        default: function() {
            const year = new Date().getFullYear();
            return `${year}-001`; // Default pattern, will be updated later
        }
    },
    stage: {
        type: String,
        enum: ['active', 'in-progress', 'closed'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
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