const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
    // Support both new format (sender/receiver) and legacy format (studentId/alumniId)
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    // Legacy fields for backward compatibility
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
    },
    alumniId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alumni",
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    connectionDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Index for performance
connectionSchema.index({ sender: 1, receiver: 1 });
connectionSchema.index({ studentId: 1, alumniId: 1 });

const ConnectionModel = mongoose.model("Connection", connectionSchema);

module.exports = ConnectionModel;
