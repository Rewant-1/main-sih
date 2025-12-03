const mongoose = require("mongoose");

const bulkImportSchema = new mongoose.Schema({
  // Import metadata
  fileName: {
    type: String,
    required: true
  },
  fileUrl: String,
  importType: {
    type: String,
    required: true,
    enum: ["students", "alumni", "events", "jobs"]
  },
  
  // Import status
  status: {
    type: String,
    enum: ["pending", "validating", "preview", "processing", "completed", "failed", "cancelled"],
    default: "pending"
  },
  
  // Statistics
  totalRows: {
    type: Number,
    default: 0
  },
  validRows: {
    type: Number,
    default: 0
  },
  invalidRows: {
    type: Number,
    default: 0
  },
  processedRows: {
    type: Number,
    default: 0
  },
  skippedRows: {
    type: Number,
    default: 0
  },
  
  // Validation results (for preview)
  validationResults: [{
    rowNumber: Number,
    data: mongoose.Schema.Types.Mixed,
    isValid: Boolean,
    errors: [{
      field: String,
      message: String,
      value: mongoose.Schema.Types.Mixed
    }],
    warnings: [{
      field: String,
      message: String
    }]
  }],
  
  // Processing results
  successRecords: [{
    rowNumber: Number,
    recordId: mongoose.Schema.Types.ObjectId,
    data: mongoose.Schema.Types.Mixed
  }],
  failedRecords: [{
    rowNumber: Number,
    data: mongoose.Schema.Types.Mixed,
    error: String
  }],
  
  // Import options
  options: {
    skipDuplicates: { type: Boolean, default: true },
    updateExisting: { type: Boolean, default: false },
    sendInvitations: { type: Boolean, default: false },
    validateOnly: { type: Boolean, default: false }
  },
  
  // Mapping configuration
  columnMapping: {
    type: Map,
    of: String
  },
  
  // Who initiated the import
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // College/University scope
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College"
  },
  
  // Timestamps
  startedAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for progress percentage
bulkImportSchema.virtual('progress').get(function() {
  if (this.totalRows === 0) return 0;
  return Math.round((this.processedRows / this.totalRows) * 100);
});

bulkImportSchema.set('toJSON', { virtuals: true });
bulkImportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("BulkImport", bulkImportSchema);
