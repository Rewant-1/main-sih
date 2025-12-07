const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // adminId: Links alumni to college (for quick filtering)
    adminId: {
        type: String,
        required: true,
        index: true,
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

    // Profile Enhancement
    photo: {
        type: String, // Cloudinary URL
    },
    bio: {
        type: String,
        maxLength: 500,
    },
    headline: {
        type: String,
        maxLength: 100,
    },

    // Academic details (from frontend-admin original)
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

    // Journey Timeline
    timeline: [{
        type: {
            type: String,
            enum: ['education', 'work', 'achievement', 'milestone']
        },
        title: String,
        organization: String,
        startDate: Date,
        endDate: Date,
        description: String,
        icon: String
    }],

    // Social Links (nested object from sih_2025_user)
    socialLinks: {
        linkedin: String,
        github: String,
        twitter: String,
        portfolio: String
    },

    // Top-level social links (from frontend-admin for backward compatibility)
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

    // Experience (from sih_2025_user)
    experience: [{
        title: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true
        },
        location: String,
        startDate: Date,
        endDate: Date,
        current: {
            type: Boolean,
            default: false
        },
        description: String,
        employmentType: {
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance']
        }
    }],

    // Education (from sih_2025_user)
    education: [{
        degree: {
            type: String,
            required: true
        },
        institution: {
            type: String,
            required: true
        },
        field: String,
        startYear: Number,
        endYear: Number,
        grade: String,
        description: String
    }],

    // Employment details (from frontend-admin for backward compatibility)
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

    // Location for map view
    location: {
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: {
            type: String,
            default: 'India'
        },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },

    // Contact (from frontend-admin)
    phone: {
        type: String,
        trim: true,
    },

    // Privacy settings (from sih_2025_user)
    privacySettings: {
        showEmail: {
            type: Boolean,
            default: false
        },
        showPhone: {
            type: Boolean,
            default: false
        },
        showLocation: {
            type: Boolean,
            default: true
        },
        profileVisibility: {
            type: String,
            enum: ['public', 'alumni-only', 'connections-only'],
            default: 'public'
        }
    },

    // Stats
    profileViews: {
        type: Number,
        default: 0
    },
    profileCompletion: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
alumniSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for performance optimization
alumniSchema.index({ userId: 1 }); // Unique user lookup
alumniSchema.index({ adminId: 1 }); // College filtering
alumniSchema.index({ verified: 1 }); // Filter verified alumni
alumniSchema.index({ graduationYear: 1 }); // Filter by batch
alumniSchema.index({ department: 1 }); // Filter by department
alumniSchema.index({ adminId: 1, verified: 1 }); // Verified per college
alumniSchema.index({ graduationYear: 1, department: 1 }); // Compound index
alumniSchema.index({ 'location.city': 1, 'location.state': 1 }); // Search by location
alumniSchema.index({ skills: 1 }); // Search by skills
alumniSchema.index({ verified: 1, graduationYear: -1 }); // Verified + recent first

const AlumniModel = mongoose.model("Alumni", alumniSchema);

module.exports = AlumniModel;
