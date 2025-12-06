const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  // Support both field naming conventions
  text: { type: String },
  questionText: { type: String },
  type: {
    type: String,
    enum: ["short", "long", "multiple_choice", "single_choice", "rating", "date", "text", "multiple-choice", "checkbox", "dropdown"]
  },
  questionType: {
    type: String,
    enum: ['text', 'multiple-choice', 'checkbox', 'rating', 'dropdown', "short", "long", "multiple_choice", "single_choice", "date"]
  },
  options: [{ type: String }], // For multiple/single choice
  isRequired: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
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
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  coverImage: { type: String },

  // Questions
  questions: [questionSchema],

  // Embedded Responses (from frontend-admin)
  responses: [responseSchema],

  // Target Audience - support both formats
  targetAudience: {
    type: String,
    enum: ["all", "alumni", "students", "specific_batch", "specific_department", "specific-batch"],
    default: "all"
  },
  targetBatch: { type: Number },
  specificBatch: { type: Number },
  targetDepartment: { type: String },

  // Schedule
  startDate: { type: Date },
  endDate: { type: Date },
  isScheduled: { type: Boolean, default: false },

  // Theme (from frontend-admin)
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

  // Stats (from sih_2025_user)
  responseCount: { type: Number, default: 0 },
  stats: {
    totalResponses: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },

  // Creator - support both refs
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // College - support both refs
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "admins" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Virtual for response count from embedded responses
surveySchema.virtual('responseCountVirtual').get(function () {
  return this.responses?.length || 0;
});

// Virtual for completion rate
surveySchema.virtual('completionRate').get(function () {
  if (!this.responses || this.responses.length === 0) return 0;
  const completed = this.responses.filter(r => r.completedAt).length;
  return Math.round((completed / this.responses.length) * 100);
});

surveySchema.set('toJSON', { virtuals: true });
surveySchema.set('toObject', { virtuals: true });

// Indexes
surveySchema.index({ status: 1, startDate: 1 });
surveySchema.index({ collegeId: 1, status: 1 });
surveySchema.index({ targetAudience: 1 });

module.exports = mongoose.model("Survey", surveySchema);
