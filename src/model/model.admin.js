const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    adminType: {
        type: String,
        required: true,
        default: 'college',
        enum: ['school', 'college', 'university'],
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
    verified: {
        type: Boolean,
        default: true, // Admins are verified by default
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const AdminModel = mongoose.model('Admin', adminSchema);

module.exports = AdminModel;
