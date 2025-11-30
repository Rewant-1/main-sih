const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    userType: { type: String, enum: ["student", "alumni"], required: true },
    profileDetails: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "userTypeDetails",
    },
    userTypeDetails: {
        type: String,
        required: true,
        enum: ["Student", "Alumni"],
    },

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
