const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT",
      "VERIFY", "LOGIN", "LOGOUT", "BULK_IMPORT", "EXPORT",
      "INVITE_SENT", "PASSWORD_RESET", "KYC_SUBMIT", "KYC_APPROVE", "KYC_REJECT"
    ]
  },
  
  // Resource being acted upon
  resourceType: {
    type: String,
    required: true,
    enum: [
      "User", "Alumni", "Student", "Job", "Event", "Post",
      "Campaign", "Survey", "Newsletter", "SuccessStory",
      "Connection", "Chat", "Message", "BulkImport", "KYC"
    ]
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  
  // Actor details
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // System actions may not have an actor
  },
  actorType: {
    type: String,
    enum: ["User", "System", "Admin"],
    default: "User"
  },
  actorEmail: String,
  
  // Change details
  previousState: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newState: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  
  // Request metadata
  ipAddress: String,
  userAgent: String,
  requestId: String,
  
  // Additional context
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  notes: String,
  
  // Status
  status: {
    type: String,
    enum: ["success", "failure", "pending"],
    default: "success"
  },
  errorMessage: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for efficient querying
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
