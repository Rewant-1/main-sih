const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    // Reference to the college/admin that this user belongs to
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    userType: { type: String, enum: ["Student", "Alumni", "Admin"], required: true },
    profileDetails: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "userType",
    },
    createdAt: { type: Date, default: Date.now },
});

// Indexes for performance
userSchema.index({ email: 1 }); // Already unique, but explicit index
userSchema.index({ collegeId: 1, userType: 1 }); // Query by college and type
userSchema.index({ createdAt: -1 }); // Sort by creation date

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
