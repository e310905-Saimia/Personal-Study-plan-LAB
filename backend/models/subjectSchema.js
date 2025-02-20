const mongoose = require("mongoose");

const outcomeSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  project: { type: String, required: true },
  credits: { type: Number, required: true },
  requirements: [{ type: String }], // ✅ Array of requirements
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  outcomes: [outcomeSchema], // ✅ Nested array of outcomes
});

module.exports = mongoose.model("Subject", subjectSchema);
