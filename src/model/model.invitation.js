const mongoose = require("mongoose");
const crypto = require("crypto");

const invitationSchema = new mongoose.Schema({
  // Recipient details
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  name: String,
  
  // Invitation type
  type: {
    type: String,
    required: true,
    enum: ["alumni", "student", "admin"]
  },
  
  // Token for verification
  token: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ["pending", "sent", "opened", "accepted", "expired", "cancelled"],
    default: "pending"
  },
  
  // Email tracking
  sentAt: Date,
  openedAt: Date,
  acceptedAt: Date,
  sendAttempts: {
    type: Number,
    default: 0
  },
  lastAttemptAt: Date,
  lastError: String,
  
  // Expiration
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  
  // Pre-filled data
  prefillData: {
    graduationYear: Number,
    department: String,
    degreeType: String,
    degreeName: String,
    phone: String
  },
  
  // Related entities
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College"
  },
  bulkImport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BulkImport"
  },
  
  // Result
  createdUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for token lookup
invitationSchema.index({ token: 1 });
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Check if invitation is valid
invitationSchema.methods.isValid = function() {
  return this.status === 'sent' && new Date() < this.expiresAt;
};

module.exports = mongoose.model("Invitation", invitationSchema);
