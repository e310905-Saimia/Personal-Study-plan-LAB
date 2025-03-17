const mongoose = require("mongoose");

const outcomeSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  project: { type: String, required: true },
  credits: { type: Number, required: true },
  maxCredits: { type: Number },
  compulsory: { type: Boolean, default: true },
  requirements: [{ type: String }], // ✅ Array of requirements
});

// Create a compound index for topic and project within an outcome to prevent duplicates
outcomeSchema.index({ topic: 1, project: 1 });

const subjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    // Adding uniqueness constraint to prevent duplicate subject names
    unique: true,
    // Adding collation for case-insensitive uniqueness check
    collation: { locale: 'en', strength: 2 }
  },
  credits: { type: Number, required: true },
  outcomes: [outcomeSchema], // ✅ Nested array of outcomes
});

module.exports = mongoose.model("Subject", subjectSchema);