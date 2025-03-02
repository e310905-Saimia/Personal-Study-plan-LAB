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
    }
});

module.exports = mongoose.model("Notification", notificationSchema);