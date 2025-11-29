const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  type: { type: String, enum: ["full-time", "internship"] },

  description: { type: String },
  skillsRequired: [{ type: String }],

  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true // alumni
  },

  applicants: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      resume: { type: String },
      appliedAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", jobSchema);
