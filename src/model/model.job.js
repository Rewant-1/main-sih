const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  type: { type: String, enum: ["full-time", "part-time", "internship", "contract"] },

  description: { type: String },
  requirements: { type: String },
  skillsRequired: [{ type: String }],
  
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: "INR" }
  },

  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true 
  },

  applicants: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["applied", "under review", "interview scheduled", "offered", "rejected"],
      default: "applied"
    },
    coverLetter: { type: String },
    resume: { type: String }
  }],

  status: {
    type: String,
    enum: ["open", "closed", "filled"],
    default: "open"
  },

  deadline: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for searching jobs
jobSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model("Job", jobSchema);
