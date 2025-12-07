const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // adminId: Links student to college (for quick filtering)
    adminId: {
        type: String,
        required: true,
        index: true,
    },
    // Optional student identifier (kept to align with other services)
    student_id: { type: String },
    academic: {
        entryDate: { type: Date, default: Date.now },
        expectedGraduationDate: { type: Date },
        degreeType: {
            type: String,
            required: true,
        },
        degreeName: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        completionDate: { type: Date },
        currentYear: { type: Number, default: 1 },
    },
});

// Indexes
studentSchema.index({ userId: 1 }); // User lookup
studentSchema.index({ adminId: 1 }); // College filtering

const StudentModel = mongoose.model("Student", studentSchema);

module.exports = StudentModel;
