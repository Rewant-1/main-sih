const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Activity type
    type: {
        type: String,
        enum: [
            'job_posted',
            'job_applied',
            'job_closed',
            'event_created',
            'event_registered',
            'event_attended',
            'donation_made',
            'skill_contributed',
            'story_submitted',
            'story_published',
            'connection_made',
            'referral_given',
            'referral_received',
            'profile_updated',
            'card_generated',
            'post_created',
            'comment_made',
            'achievement_unlocked'
        ],
        required: true
    },

    // Reference to related document
    referenceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    referenceModel: {
        type: String,
        enum: ['Job', 'Event', 'Campaign', 'Donation', 'SuccessStory', 'Connection', 'Post', 'User', 'AlumniCard']
    },

    // Activity details
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed // Flexible field for additional data
    },

    // Points/Karma (for gamification)
    points: {
        type: Number,
        default: 0
    },

    // Visibility
    isPublic: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for queries
activitySchema.index({ userId: 1, type: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

// Points configuration
const ACTIVITY_POINTS = {
    job_posted: 50,
    job_applied: 5,
    event_created: 30,
    event_registered: 5,
    event_attended: 15,
    donation_made: 25,
    skill_contributed: 40,
    story_submitted: 20,
    story_published: 50,
    connection_made: 10,
    referral_given: 30,
    profile_updated: 5,
    post_created: 10,
    comment_made: 2
};

// Pre-save to add points
activitySchema.pre('save', function (next) {
    if (this.isNew && ACTIVITY_POINTS[this.type]) {
        this.points = ACTIVITY_POINTS[this.type];
    }
    next();
});

// Static method to log activity
activitySchema.statics.logActivity = async function ({
    userId,
    type,
    title,
    description,
    referenceId,
    referenceModel,
    metadata,
    isPublic = true
}) {
    return await this.create({
        userId,
        type,
        title,
        description,
        referenceId,
        referenceModel,
        metadata,
        isPublic
    });
};

// Static method to get user's total points
activitySchema.statics.getTotalPoints = async function (userId) {
    const result = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalPoints: { $sum: '$points' } } }
    ]);
    return result.length > 0 ? result[0].totalPoints : 0;
};

// Static method to get activity summary
activitySchema.statics.getActivitySummary = async function (userId) {
    return await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
};

const ActivityModel = mongoose.model("Activity", activitySchema);

module.exports = ActivityModel;
