const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    graduationYear: {
        type: Number,
        required: true,
    },
    skills: {
        type: [String],
        required: true,
    },
});

const AlumniModel = mongoose.model("Alumni", alumniSchema);

module.exports = AlumniModel;
