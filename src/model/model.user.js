const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    // adminId: Links user to college (matches Admin.adminId)
    // All users with same adminId belong to same college
    adminId: {
        type: String,
        required: true,
        index: true,
    },
    // userType: Only Student or Alumni (NO Admin)
    userType: { type: String, enum: ["Student", "Alumni"], required: true },
    profileDetails: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "userType",
    },
    // Moksha coins awarded by admin
    mokshaCoins: {
        type: Number,
        default: 0,
    },
    // Tags awarded by admin
    tags: [{
        name: { type: String },
        awardedBy: { type: String }, // adminId of who awarded
        awardedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
});

// Indexes for performance
userSchema.index({ email: 1 }); // Unique lookup
userSchema.index({ adminId: 1 }); // Filter by college
userSchema.index({ adminId: 1, userType: 1 }); // Query by college and type
userSchema.index({ createdAt: -1 }); // Sort by creation date

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
