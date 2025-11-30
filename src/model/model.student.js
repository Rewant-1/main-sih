const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
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

const StudentModel = mongoose.model("Student", studentSchema);

module.exports = StudentModel;
