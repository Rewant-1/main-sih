const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  targetAmount: { type: Number },
  targetDate: { type: Date },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  // Alias fields from sih_2025_user
  achieved: { type: Boolean, default: false },
  achievedAt: Date
});

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ["money", "skills", "resources", "monetary", "skill"],
    default: "money"
  },
  message: { type: String },
  isAnonymous: { type: Boolean, default: false },
  transactionId: { type: String },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

const campaignSchema = new mongoose.Schema({
  // College Isolation - Required for multi-tenant support
  adminId: {
    type: String,
    required: true,
    index: true,
  },

  // Basic Details
  title: { type: String, required: true, trim: true },
  tagline: { type: String },
  description: { type: String, required: true },
  shortDescription: { type: String, maxLength: 200 },
  category: {
    type: String,
    enum: ["infrastructure", "scholarship", "research", "sustainability", "sports", "general", "events", "library", "other"],
    default: "general"
  },
  subcategory: { type: String },

  // Financial Details - support both field names
  targetAmount: { type: Number },
  goalAmount: { type: Number },
  raisedAmount: { type: Number, default: 0 },
  minimumDonation: { type: Number, default: 100 },
  currency: { type: String, default: "INR" },
  donorCount: { type: Number, default: 0 },

  // Timeline
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  // Milestones
  milestones: [milestoneSchema],

  // Embedded Donations (from frontend-admin)
  donations: [donationSchema],
  supportersCount: { type: Number, default: 0 },

  // Skill-based contributions (from sih_2025_user)
  skillsNeeded: [{
    skill: String,
    description: String,
    hoursNeeded: Number,
    hoursFulfilled: {
      type: Number,
      default: 0
    }
  }],

  // Updates/News (from sih_2025_user)
  updates: [{
    title: String,
    content: String,
    image: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Impact & Goals
  beneficiaries: { type: String },
  expectedOutcomes: [{ type: String }],
  impactDescription: { type: String },

  // Media
  coverImage: { type: String },
  images: [{ type: String }],
  documents: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  videoUrl: { type: String },

  // Team - support both field names
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  teamMembers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String }
  }],

  // Status
  status: {
    type: String,
    enum: ["draft", "pending", "active", "completed", "cancelled"],
    default: "draft"
  },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verifiedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admins" },
  approvedAt: Date,

  // College/University - support both refs
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "admins" },

  // Tags for search (from sih_2025_user)
  tags: [String],

  // Featured (from sih_2025_user)
  isFeatured: { type: Boolean, default: false },

  // Analytics
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update milestones when raised amount changes
campaignSchema.pre('save', async function () {
  this.updatedAt = Date.now();

  // Sync targetAmount and goalAmount
  if (this.goalAmount && !this.targetAmount) {
    this.targetAmount = this.goalAmount;
  } else if (this.targetAmount && !this.goalAmount) {
    this.goalAmount = this.targetAmount;
  }

  // Sync organizer and createdBy
  if (this.createdBy && !this.organizer) {
    this.organizer = this.createdBy;
  } else if (this.organizer && !this.createdBy) {
    this.createdBy = this.organizer;
  }

  // Auto-update milestone status
  if (this.milestones && this.milestones.length > 0) {
    this.milestones.forEach(milestone => {
      if (!milestone.achieved && this.raisedAmount >= milestone.targetAmount) {
        milestone.achieved = true;
        milestone.achievedAt = new Date();
        milestone.isCompleted = true;
        milestone.completedAt = new Date();
      }
    });
  }

  // Mark as completed if goal reached
  const goal = this.goalAmount || this.targetAmount;
  if (this.raisedAmount >= goal && this.status === 'active') {
    this.status = 'completed';
  }
});

// Virtual for progress percentage
campaignSchema.virtual('progress').get(function () {
  const target = this.targetAmount || this.goalAmount;
  if (!target) return 0;
  return Math.min(100, Math.round((this.raisedAmount / target) * 100));
});

campaignSchema.virtual('progressPercentage').get(function () {
  const goal = this.goalAmount || this.targetAmount;
  if (!goal || goal === 0) return 0;
  return Math.min(100, Math.round((this.raisedAmount / goal) * 100));
});

// Virtual for days remaining
campaignSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

// Index for search
campaignSchema.index({ status: 1, category: 1, startDate: -1 });

module.exports = mongoose.model("Campaign", campaignSchema);
