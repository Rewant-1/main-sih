const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // KYC type
  type: {
    type: String,
    required: true,
    enum: ["alumni_verification", "degree_proof", "employment_proof", "identity_proof"]
  },

  // Status
  status: {
    type: String,
    enum: ["pending", "under_review", "approved", "rejected", "expired", "resubmission_required"],
    default: "pending"
  },

  // Documents
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ["degree_certificate", "marksheet", "id_card", "employment_letter", "other"]
    },
    url: {
      type: String,
      required: true
    },
    publicId: String, // Cloudinary public ID
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }],

  // Verification details
  verificationData: {
    // For alumni verification
    graduationYear: Number,
    rollNumber: String,
    department: String,
    degree: String,

    // For employment verification
    company: String,
    designation: String,
    employeeId: String,

    // Additional info
    additionalInfo: mongoose.Schema.Types.Mixed
  },

  // Review details
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  reviewedAt: Date,
  reviewNotes: String,
  rejectionReason: String,

  // Resubmission tracking
  resubmissionCount: {
    type: Number,
    default: 0
  },
  lastResubmittedAt: Date,

  // College context
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College"
  },

  // Priority
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal"
  },

  // Expiration (for time-sensitive documents)
  expiresAt: Date,

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
kycSchema.index({ user: 1, type: 1 });
kycSchema.index({ status: 1, createdAt: -1 });
kycSchema.index({ college: 1, status: 1 });

// Update timestamp on save
kycSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("KYC", kycSchema);
