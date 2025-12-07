const mongoose = require("mongoose");

const alumniCardSchema = new mongoose.Schema({
    // College Isolation - Required for multi-tenant support
    adminId: {
        type: String,
        required: true,
        index: true
    },

    alumniId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alumni",
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Card details
    cardNumber: {
        type: String,
        unique: true,
        required: true
    },

    // QR Code
    qrCode: {
        data: String, // QR code image data URL or Cloudinary URL
        generatedAt: {
            type: Date,
            default: Date.now
        }
    },

    // NFC Support
    nfc: {
        tagId: String,
        enabled: {
            type: Boolean,
            default: false
        },
        linkedAt: Date
    },

    // Card validity
    issuedAt: {
        type: Date,
        default: Date.now
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'expired', 'revoked', 'pending', 'suspended'],
        default: 'pending'
    },
    revokedReason: String,
    revokedAt: Date,
    revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins"
    },

    // Card type
    cardType: {
        type: String,
        enum: ['digital', 'physical', 'both'],
        default: 'digital'
    },

    // Physical card details (if applicable)
    physicalCard: {
        requested: {
            type: Boolean,
            default: false
        },
        requestedAt: Date,
        printedAt: Date,
        deliveryAddress: {
            street: String,
            city: String,
            state: String,
            pincode: String
        },
        trackingNumber: String,
        deliveredAt: Date
    },

    // Usage tracking
    lastUsedAt: Date,
    usageCount: {
        type: Number,
        default: 0
    },
    usageHistory: [{
        action: {
            type: String,
            enum: ['check-in', 'verification', 'access']
        },
        location: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }],

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate card number
alumniCardSchema.pre('save', async function () {
    this.updatedAt = Date.now();

    // Check expiry
    if (this.validUntil && new Date() > this.validUntil && this.status === 'active') {
        this.status = 'expired';
    }
});

// Static method to generate unique card number
alumniCardSchema.statics.generateCardNumber = async function (collegeCode = 'ALM') {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const cardNumber = `${collegeCode}-${year}-${randomPart}`;

    // Check if exists
    const exists = await this.findOne({ cardNumber });
    if (exists) {
        return this.generateCardNumber(collegeCode);
    }

    return cardNumber;
};

// Index
alumniCardSchema.index({ cardNumber: 1 });
alumniCardSchema.index({ alumniId: 1 });
alumniCardSchema.index({ status: 1, validUntil: 1 });

const AlumniCardModel = mongoose.model("AlumniCard", alumniCardSchema);

module.exports = AlumniCardModel;
