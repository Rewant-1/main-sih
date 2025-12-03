const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true }, // HTML content
  previewText: { type: String },
  
  // Template
  template: {
    type: String,
    enum: ["default", "announcement", "event", "campaign", "digest"],
    default: "default"
  },
  
  // Media
  coverImage: { type: String },
  attachments: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  
  // Recipients
  targetAudience: {
    type: String,
    enum: ["all", "alumni", "students", "specific_batch", "specific_department"],
    default: "all"
  },
  targetBatch: { type: Number },
  targetDepartment: { type: String },
  recipientCount: { type: Number, default: 0 },
  
  // Schedule
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  
  // Analytics
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  unsubscribeCount: { type: Number, default: 0 },
  
  // Status
  status: {
    type: String,
    enum: ["draft", "scheduled", "sent", "cancelled"],
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

// Virtual for open rate
newsletterSchema.virtual('openRate').get(function() {
  if (!this.recipientCount || this.recipientCount === 0) return 0;
  return Math.round((this.openCount / this.recipientCount) * 100);
});

newsletterSchema.set('toJSON', { virtuals: true });
newsletterSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Newsletter", newsletterSchema);
