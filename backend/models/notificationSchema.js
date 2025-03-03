const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    message: { 
        type: String, 
        required: true 
    },
    studentID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "student",
        required: true 
    },
    subjectID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Subject",
        required: true 
    },
    outcomeID: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    projectName: {
        type: String,
        required: false
    },
    creditRequested: {
        type: Number,
        required: false
    },
    read: { 
        type: Boolean, 
        default: false 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedCredits: {
        type: Number,
        default: 0
    },
    teacherComment: {
        type: String,
        default: ''
    },
    processedDate: {
        type: Date
    },
    // Fields to track who assessed the project
    assessedBy: {
        type: String
    },
    assessedDate: {
        type: Date
    },
    // Additional fields for project relationship
    projectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    // Fields for better search and filtering
    isProcessed: {
        type: Boolean,
        default: false
    },
    notificationType: {
        type: String,
        enum: ['project', 'announcement', 'system'],
        default: 'project'
    },
    // For real-time notifications
    recipients: [{
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'recipientModel'
        },
        recipientModel: {
            type: String,
            enum: ['Teacher', 'student']
        },
        read: {
            type: Boolean,
            default: false
        }
    }]
});

// Create an index for faster queries
notificationSchema.index({ studentID: 1, status: 1 });
notificationSchema.index({ date: -1 }); // For sorting by newest

module.exports = mongoose.model("Notification", notificationSchema);