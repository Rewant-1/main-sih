const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    graduationYear: {
        type: Number,
        required: true,
    },
    degreeUrl: {
        type: String,
        required: true,
    },
    skills: {
        type: [String],
    },
});

const AlumniModel = mongoose.model("Alumni", alumniSchema);

module.exports = AlumniModel;
