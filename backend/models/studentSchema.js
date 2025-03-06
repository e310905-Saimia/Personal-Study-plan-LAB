const mongoose = require('mongoose');

// Define schema for student projects
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  requestedCredit: { type: Number, required: true },
  approvedCredit: { type: Number },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  submissionDate: { type: Date, default: Date.now },
  assessedBy: { type: String },
  assessment: { type: String }
});

// Define schema for an outcome within an assigned subject
const assignedOutcomeSchema = new mongoose.Schema({
  outcomeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "outcome"
  },
  topic: { type: String, required: true },
  project: { type: String, required: true },
  credits: { type: Number, required: true },
  compulsory: { type: Boolean, default: true },
  requirements: [{ type: String }],
  completed: { type: Boolean, default: false },
  // Projects array to store student submissions for this specific outcome
  projects: [projectSchema]
});

// Define schema for an assigned subject
const assignedSubjectSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject"
  },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  outcomes: [assignedOutcomeSchema],
  assignedDate: { type: Date, default: Date.now }
});

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
    // Assigned subjects array stores snapshots of subjects specific to this student
    assignedSubjects: [assignedSubjectSchema],
    // Keep existing examResult field for backward compatibility
    examResult: [{
        subName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subject",
        },
        marksObtained: {
            type: Number,
            default: 0
        }
    }]
});

module.exports = mongoose.model("student", studentSchema);