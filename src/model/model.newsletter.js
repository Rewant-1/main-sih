const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema({
  // College Isolation - Required for multi-tenant support
  adminId: {
    type: String,
    required: true,
    index: true,
  },

  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  content: { type: String, required: true }, // HTML content
  htmlContent: { type: String }, // Rich HTML version
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

  // Recipients - support both field names
  targetAudience: {
    type: String,
    enum: ["all", "alumni", "students", "specific_batch", "specific_department", "specific-batch"],
    default: "all"
  },
  recipients: {
    type: String,
    enum: ['all', 'alumni', 'students', 'specific-batch', 'specific_batch'],
    default: 'all'
  },
  targetBatch: { type: Number },
  specificBatch: { type: Number },
  targetDepartment: { type: String },
  recipientCount: { type: Number, default: 0 },

  // Schedule - support both field names
  scheduledAt: { type: Date },
  scheduledFor: { type: Date },
  sentAt: { type: Date },

  // Analytics - support both formats
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  unsubscribeCount: { type: Number, default: 0 },
  stats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 }
  },

  // Status
  status: {
    type: String,
    enum: ["draft", "scheduled", "sent", "cancelled"],
    default: "draft"
  },

  // Category/Tags (from sih_2025_user)
  category: {
    type: String,
    enum: ['announcement', 'update', 'event', 'achievement', 'general'],
    default: 'general'
  },
  tags: [String],

  // Featured (from sih_2025_user)
  isFeatured: { type: Boolean, default: false },

  // Comments (from sih_2025_user)
  allowComments: { type: Boolean, default: false },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

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

// Pre-save to sync field aliases
newsletterSchema.pre('save', async function () {
  // Sync scheduledAt and scheduledFor
  if (this.scheduledAt && !this.scheduledFor) {
    this.scheduledFor = this.scheduledAt;
  } else if (this.scheduledFor && !this.scheduledAt) {
    this.scheduledAt = this.scheduledFor;
  }

  // Sync targetAudience and recipients
  if (this.targetAudience && !this.recipients) {
    this.recipients = this.targetAudience;
  } else if (this.recipients && !this.targetAudience) {
    this.targetAudience = this.recipients;
  }

  // Sync targetBatch and specificBatch
  if (this.targetBatch && !this.specificBatch) {
    this.specificBatch = this.targetBatch;
  } else if (this.specificBatch && !this.targetBatch) {
    this.targetBatch = this.specificBatch;
  }
});

// Virtual for open rate
newsletterSchema.virtual('openRate').get(function () {
  if (!this.recipientCount || this.recipientCount === 0) return 0;
  const opens = this.openCount || (this.stats && this.stats.opened) || 0;
  return Math.round((opens / this.recipientCount) * 100);
});

newsletterSchema.set('toJSON', { virtuals: true });
newsletterSchema.set('toObject', { virtuals: true });

// Indexes
newsletterSchema.index({ status: 1, sentAt: -1 });
newsletterSchema.index({ collegeId: 1, status: 1 });
newsletterSchema.index({ category: 1 });
newsletterSchema.index({ tags: 1 });

module.exports = mongoose.model("Newsletter", newsletterSchema);
