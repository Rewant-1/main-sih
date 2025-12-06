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
    // NEW: Academic details for filtering
    degree: {
        type: String,
        enum: ["B.Tech", "M.Tech", "MBA", "BBA", "B.Sc", "M.Sc", "Ph.D", "Other"],
        default: "B.Tech",
    },
    department: {
        type: String,
        enum: ["Computer Science", "Electronics", "Mechanical", "Civil", "Chemical", "Electrical", "IT", "Other"],
        default: "Computer Science",
    },
    enrollmentNumber: {
        type: String,
        trim: true,
    },
    // NEW: Employment details for analytics
    employmentStatus: {
        type: String,
        enum: ["employed", "self-employed", "freelancer", "student", "unemployed", "retired"],
        default: "employed",
    },
    currentCompany: {
        type: String,
        trim: true,
    },
    designation: {
        type: String,
        trim: true,
    },
    industry: {
        type: String,
        trim: true,
    },
    // NEW: Social links for profile
    linkedIn: {
        type: String,
        trim: true,
    },
    github: {
        type: String,
        trim: true,
    },
    twitter: {
        type: String,
        trim: true,
    },
    portfolio: {
        type: String,
        trim: true,
    },
    // NEW: Location for map visualization
    location: {
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, default: "India" },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number },
        },
    },
    // NEW: Contact (optional, separate from User email)
    phone: {
        type: String,
        trim: true,
    },
    // NEW: Profile completion tracking
    profileCompletion: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
});

const AlumniModel = mongoose.model("Alumni", alumniSchema);

module.exports = AlumniModel;
