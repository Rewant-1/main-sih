const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Notification type
    type: {
        type: String,
        enum: [
            'connection_request',
            'connection_accepted',
            'message',
            'job_posted',
            'job_application',
            'job_status',
            'event_reminder',
            'event_registration',
            'campaign_update',
            'donation_received',
            'donation_thankyou',
            'story_approved',
            'story_rejected',
            'approval_pending',
            'card_issued',
            'general'
        ],
        required: true
    },

    // Content
    title: {
        type: String,
        required: true,
        maxLength: 100
    },
    message: {
        type: String,
        maxLength: 500
    },
    icon: {
        type: String // Icon name or URL
    },

    // Reference to related document
    reference: {
        model: {
            type: String,
            enum: ['User', 'Job', 'Event', 'Campaign', 'Donation', 'SuccessStory', 'Connection', 'Chat']
        },
        id: {
            type: mongoose.Schema.Types.ObjectId
        }
    },

    // Action link
    link: {
        type: String
    },

    // Status
    read: {
        type: Boolean,
        default: false
    },
    readAt: Date,

    // Priority
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },

    // Email/Push notification status
    emailSent: {
        type: Boolean,
        default: false
    },
    pushSent: {
        type: Boolean,
        default: false
    },

    // Expiry
    expiresAt: Date,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-delete old read notifications after 30 days
notificationSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { read: true } }
);

// Index for queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function ({
    userId,
    type,
    title,
    message,
    reference,
    link,
    priority = 'medium'
}) {
    return await this.create({
        userId,
        type,
        title,
        message,
        reference,
        link,
        priority
    });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
    return await this.countDocuments({ userId, read: false });
};

const NotificationModel = mongoose.model("Notification", notificationSchema);

module.exports = NotificationModel;
