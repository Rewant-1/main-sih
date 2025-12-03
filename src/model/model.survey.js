const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ["short", "long", "multiple_choice", "single_choice", "rating", "date"],
    required: true
  },
  options: [{ type: String }], // For multiple/single choice
  isRequired: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
});

const responseSchema = new mongoose.Schema({
  respondent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId },
    answer: { type: mongoose.Schema.Types.Mixed } // Can be string, array, number
  }],
  completedAt: { type: Date, default: Date.now },
  timeSpent: { type: Number }, // in seconds
  device: { type: String } // desktop, mobile, tablet
});

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  
  // Questions
  questions: [questionSchema],
  
  // Responses
  responses: [responseSchema],
  
  // Target Audience
  targetAudience: {
    type: String,
    enum: ["all", "alumni", "students", "specific_batch", "specific_department"],
    default: "all"
  },
  targetBatch: { type: Number },
  targetDepartment: { type: String },
  
  // Schedule
  startDate: { type: Date },
  endDate: { type: Date },
  isScheduled: { type: Boolean, default: false },
  
  // Theme
  theme: {
    primaryColor: { type: String, default: "#3b82f6" },
    backgroundColor: { type: String, default: "#ffffff" }
  },
  
  // Settings
  isAnonymous: { type: Boolean, default: false },
  allowMultipleResponses: { type: Boolean, default: false },
  showResults: { type: Boolean, default: false },
  
  // Status
  status: {
    type: String,
    enum: ["draft", "active", "closed", "archived"],
    default: "draft"
  },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // College
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual for response count
surveySchema.virtual('responseCount').get(function() {
  return this.responses?.length || 0;
});

// Virtual for completion rate
surveySchema.virtual('completionRate').get(function() {
  if (!this.responses || this.responses.length === 0) return 0;
  const completed = this.responses.filter(r => r.completedAt).length;
  return Math.round((completed / this.responses.length) * 100);
});

surveySchema.set('toJSON', { virtuals: true });
surveySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Survey", surveySchema);
