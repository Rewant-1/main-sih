const mongoose = require("mongoose");

const successStorySchema = new mongoose.Schema({
  // Alumni reference - support both field names
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alumni"
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alumni"
  },

  // Story content
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 150
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxLength: 300
  },

  // Category
  category: {
    type: String,
    enum: ["academic_excellence", "career_growth", "entrepreneurship", "research_innovation", "social_impact", "career", "research", "social-impact", "achievement", "other"],
    default: "career_growth"
  },

  // Static alumni info (from frontend-admin for display without population)
  alumniName: { type: String },
  alumniDesignation: { type: String },
  alumniCompany: { type: String },
  graduationYear: { type: Number },

  // Media
  coverImage: { type: String },
  images: [{ type: String }],
  videoUrl: { type: String },

  // Media gallery (from sih_2025_user)
  gallery: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['image', 'video']
    }
  }],

  // Tags
  tags: [{ type: String }],

  // Engagement
  views: { type: Number, default: 0 },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: { type: Number, default: 0 },

  // Comments (from sih_2025_user)
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Status - combined enum
  status: {
    type: String,
    enum: ["draft", "pending", "published", "approved", "rejected", "archived"],
    default: "draft"
  },
  isFeatured: { type: Boolean, default: false },
  featuredOrder: Number,
  rejectionReason: String,

  // Verification (from frontend-admin)
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verifiedAt: { type: Date },

  // Review (from sih_2025_user)
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admins"
  },
  reviewedAt: Date,

  // SEO (from sih_2025_user)
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  metaDescription: {
    type: String,
    maxLength: 160
  },

  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // College - support both refs
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },

  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate slug from title
successStorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  // Sync alumniId and alumni
  if (this.alumniId && !this.alumni) {
    this.alumni = this.alumniId;
  } else if (this.alumni && !this.alumniId) {
    this.alumniId = this.alumni;
  }

  // Generate slug if not exists
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }

  // Generate excerpt if not exists
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 297) + '...';
  }

  next();
});

// Virtual for like count
successStorySchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

successStorySchema.virtual('commentCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

successStorySchema.set('toJSON', { virtuals: true });
successStorySchema.set('toObject', { virtuals: true });

// Text index for search
successStorySchema.index({ title: 'text', content: 'text', tags: 'text' });

// Indexes
successStorySchema.index({ status: 1, publishedAt: -1 });
successStorySchema.index({ alumniId: 1, status: 1 });
successStorySchema.index({ slug: 1 });

module.exports = mongoose.model("SuccessStory", successStorySchema);
