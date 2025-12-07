const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    companyLogo: {
        type: String // Cloudinary URL
    },
    companyWebsite: {
        type: String
    },

    // Location
    location: {
        type: String
    },
    locationType: {
        type: String,
        enum: ['onsite', 'remote', 'hybrid'],
        default: 'onsite'
    },

    // Job type
    type: {
        type: String,
        enum: ["full-time", "part-time", "internship", "contract", "freelance"],
        required: true
    },

    // Description and requirements
    description: {
        type: String
    },
    responsibilities: [{
        type: String
    }],
    requirements: [{
        type: String
    }],
    skillsRequired: [{
        type: String
    }],

    // Experience and salary
    experienceLevel: {
        type: String,
        enum: ['fresher', 'junior', 'mid', 'senior', 'lead', 'executive'],
        default: 'fresher'
    },
    minExperience: {
        type: Number,
        default: 0
    },
    maxExperience: {
        type: Number
    },

    // Salary - support both formats
    salaryRange: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'INR'
        },
        period: {
            type: String,
            enum: ['hourly', 'monthly', 'yearly'],
            default: 'yearly'
        },
        isNegotiable: {
            type: Boolean,
            default: false
        }
    },
    // Legacy salary format for backward compatibility
    salary: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: "INR" },
    },

    // Opening status
    isOpen: {
        type: Boolean,
        default: true,
        required: true,
    },
    draft: {
        type: Boolean,
        default: false
    },

    // Deadline - support both field names
    applicationDeadline: {
        type: Date
    },
    deadline: {
        type: Date
    },

    // Approval workflow
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'open', 'closed', 'filled'],
        default: 'draft'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins"
    },
    approvedAt: Date,
    rejectionReason: String,

    // Applications - support both formats
    applications: [{
        applicantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        applicantAlumniId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Alumni"
        },
        resumeUrl: String,
        coverLetter: String,
        status: {
            type: String,
            enum: ['applied', 'viewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'under review', 'interview scheduled'],
            default: 'applied'
        },
        statusHistory: [{
            status: String,
            changedAt: {
                type: Date,
                default: Date.now
            },
            note: String
        }],
        notes: String,
        appliedAt: {
            type: Date,
            default: Date.now
        },
        lastUpdatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Legacy applicants format for backward compatibility
    applicants: [
        {
            student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            appliedAt: { type: Date, default: Date.now },
            status: {
                type: String,
                enum: ["applied", "under review", "interview scheduled", "offered", "rejected"],
                default: "applied",
            },
            coverLetter: { type: String },
            resume: { type: String },
        },
    ],

    // Referral tracking
    referrals: [{
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        referredUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        status: {
            type: String,
            enum: ['pending', 'applied', 'hired'],
            default: 'pending'
        },
        referredAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Stats
    viewCount: {
        type: Number,
        default: 0
    },
    applicationCount: {
        type: Number,
        default: 0
    },
    savedCount: {
        type: Number,
        default: 0
    },

    // Posted by - support both references
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postedByAlumni: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alumni"
    },
    postedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    adminId: {
        type: String,
        required: true,
        index: true
    },

    // Categorization
    department: {
        type: String
    },
    industry: {
        type: String
    },
    tags: [String],

    // Featured
    isFeatured: {
        type: Boolean,
        default: false
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

// Pre-save middleware
jobSchema.pre('save', async function () {
    this.updatedAt = Date.now();

    // Update application count
    if (this.applications) {
        this.applicationCount = this.applications.length;
    }

    // Auto-close if deadline passed
    const deadline = this.applicationDeadline || this.deadline;
    if (deadline && new Date() > deadline && this.isOpen) {
        this.isOpen = false;
        this.status = 'closed';
    }
});

// Indexes
jobSchema.index({ status: 1, isOpen: 1, createdAt: -1 });
jobSchema.index({ postedBy: 1, status: 1 });
jobSchema.index({ 'applications.applicantId': 1 });
jobSchema.index({ type: 1, experienceLevel: 1 });
jobSchema.index({ title: 'text', company: 'text', description: 'text' });

const JobModel = mongoose.model("Job", jobSchema);

module.exports = JobModel;
