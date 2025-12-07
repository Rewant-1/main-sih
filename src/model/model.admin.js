const mongoose = require('mongoose');

// Admin Model - Standalone (matches sih_2025_admin reference)
// NO User dependency - admins are separate entities
// Multiple admins can belong to same college (grouped by adminId)
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    adminType: {
        type: String,
        required: true,
        default: 'college',
        enum: ['school', 'college', 'university'],
    },
    // College/Institute name
    instituteName: {
        type: String,
        required: true,
        trim: true,
    },
    // adminId: Groups multiple admins of same college
    // All admins with same adminId see same students/alumni
    adminId: {
        type: String,
        required: true,
        index: true,
    },
    address: {
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            default: 'India',
        },
    },
    phone: {
        type: String,
        required: true,
    },
    connections: {
        type: Number,
        default: 0,
    },
    bio: {
        type: String,
        default: '',
    },
    // Super admin flag (future scope)
    isSuperAdmin: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    verified: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes
adminSchema.index({ email: 1 }); // Unique lookup
adminSchema.index({ adminId: 1 }); // Group by college
adminSchema.index({ adminId: 1, isActive: 1 }); // Active admins per college
adminSchema.index({ isSuperAdmin: 1 }); // Super admin queries

// Update timestamp
adminSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

const AdminModel = mongoose.model('Admin', adminSchema);

module.exports = AdminModel;
