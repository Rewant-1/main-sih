const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  targetAmount: { type: Number },
  targetDate: { type: Date },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
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
    enum: ["money", "skills", "resources"],
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
  // Basic Details
  title: { type: String, required: true },
  tagline: { type: String },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["infrastructure", "scholarship", "research", "sustainability", "sports", "general", "other"],
    default: "general"
  },
  subcategory: { type: String },
  
  // Financial Details
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  minimumDonation: { type: Number, default: 100 },
  currency: { type: String, default: "INR" },
  
  // Timeline
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Milestones
  milestones: [milestoneSchema],
  
  // Donations
  donations: [donationSchema],
  supportersCount: { type: Number, default: 0 },
  
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
  
  // Team
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
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
  
  // College/University
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  
  // Analytics
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual for progress percentage
campaignSchema.virtual('progress').get(function() {
  return Math.min(100, Math.round((this.raisedAmount / this.targetAmount) * 100));
});

// Virtual for days remaining
campaignSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Campaign", campaignSchema);
