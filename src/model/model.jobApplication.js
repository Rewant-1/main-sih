const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    applicationDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: [
            "applied",
            "under review",
            "interview scheduled",
            "offered",
            "rejected",
        ],
        default: "applied",
    },
});

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
