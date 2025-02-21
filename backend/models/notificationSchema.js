const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    studentID: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    subjectID: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
