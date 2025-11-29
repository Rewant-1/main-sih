const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["student", "alumni", "admin"],
    required: true
  },

  // Common Fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  avatar: { type: String },

  // Student Fields
  branch: { type: String },
  year: { type: Number },
  skills: [{ type: String }],
  interests: [{ type: String }],
  resumeLink: { type: String },
  lookingFor: { type: String }, // internship / guidance / mentorship

  // Alumni Fields
  batch: { type: Number },
  currentCompany: { type: String },
  currentRole: { type: String },
  openTo: [{ type: String }], // hiring / mentoring / talks

  // Matching score or AI-based insights (optional)
  matchingScore: { type: Number, default: 0 },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
