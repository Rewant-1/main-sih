const mongoose = require("mongoose");

const successStorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String }, // Short summary
  
  // Category
  category: {
    type: String,
    enum: ["academic_excellence", "career_growth", "entrepreneurship", "research_innovation", "social_impact", "other"],
    default: "career_growth"
  },
  
  // Featured Alumni
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alumni"
  },
  alumniName: { type: String },
  alumniDesignation: { type: String },
  alumniCompany: { type: String },
  graduationYear: { type: Number },
  
  // Media
  coverImage: { type: String },
  images: [{ type: String }],
  videoUrl: { type: String },
  
  // Tags
  tags: [{ type: String }],
  
  // Engagement
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  shares: { type: Number, default: 0 },
  
  // Status
  status: {
    type: String,
    enum: ["draft", "pending", "published", "archived"],
    default: "draft"
  },
  isFeatured: { type: Boolean, default: false },
  
  // Verification
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verifiedAt: { type: Date },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // College
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Text index for search
successStorySchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model("SuccessStory", successStorySchema);
