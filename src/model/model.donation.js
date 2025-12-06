const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        required: true
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Donation type
    type: {
        type: String,
        enum: ['monetary', 'skill'],
        required: true
    },

    // For monetary donations
    amount: {
        type: Number,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },

    // Payment details (Razorpay)
    paymentDetails: {
        orderId: String,
        paymentId: String,
        signature: String,
        method: String // 'card', 'upi', 'netbanking', etc.
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },

    // For skill-based contributions
    skillDetails: {
        skill: String,
        hoursCommitted: Number,
        hoursCompleted: {
            type: Number,
            default: 0
        },
        description: String,
        status: {
            type: String,
            enum: ['committed', 'in-progress', 'completed', 'cancelled'],
            default: 'committed'
        },
        completedAt: Date
    },

    // Donor preferences
    isAnonymous: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        maxLength: 500
    },

    // Certificate
    certificate: {
        generated: {
            type: Boolean,
            default: false
        },
        url: String,
        certificateNumber: String,
        generatedAt: Date
    },

    // Receipt
    receipt: {
        number: String,
        url: String,
        generatedAt: Date
    },

    // Tax benefits (80G)
    taxBenefit: {
        eligible: {
            type: Boolean,
            default: false
        },
        certificateUrl: String
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
donationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for queries
donationSchema.index({ campaignId: 1, donorId: 1, paymentStatus: 1 });
donationSchema.index({ donorId: 1, createdAt: -1 });

const DonationModel = mongoose.model("Donation", donationSchema);

module.exports = DonationModel;
