const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema({
  // Event identification
  eventType: {
    type: String,
    required: true,
    enum: [
      // User events
      "user_login", "user_logout", "user_signup", "profile_view", "profile_update",
      // Connection events
      "connection_request", "connection_accept", "connection_reject",
      // Job events
      "job_view", "job_apply", "job_create", "job_share",
      // Event events
      "event_view", "event_register", "event_attend", "event_create",
      // Post events
      "post_view", "post_create", "post_like", "post_comment", "post_share",
      // Message events
      "message_send", "chat_start",
      // Campaign events
      "campaign_view", "campaign_donate", "campaign_share",
      // Survey events
      "survey_view", "survey_respond", "survey_complete",
      // Success story events
      "story_view", "story_like", "story_share",
      // Newsletter events
      "newsletter_open", "newsletter_click", "newsletter_unsubscribe",
      // Search events
      "search_alumni", "search_jobs", "search_events",
      // Mentorship events
      "mentor_request", "mentor_accept", "mentor_session",
      // Admin events
      "admin_action", "report_generate", "bulk_import"
    ],
    index: true
  },

  // Event category for grouping
  category: {
    type: String,
    enum: ["engagement", "conversion", "navigation", "social", "admin"],
    required: true
  },

  // Actor (who triggered the event)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  userType: {
    type: String,
    enum: ["Alumni", "Student", "Admin", "Anonymous"]
  },

  // Session tracking
  sessionId: String,

  // Resource details
  resourceType: String,
  resourceId: mongoose.Schema.Types.ObjectId,

  // Event properties (flexible data)
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // User context
  userContext: {
    department: String,
    graduationYear: Number,
    college: mongoose.Schema.Types.ObjectId,
    skills: [String]
  },

  // Device & location info
  device: {
    type: {
      type: String,
      enum: ["desktop", "mobile", "tablet"]
    },
    os: String,
    browser: String,
    screenSize: String
  },
  location: {
    country: String,
    region: String,
    city: String
  },

  // Timing
  duration: Number, // For time-based events (in seconds)

  // Attribution
  source: String, // referrer, campaign, direct
  medium: String, // email, social, organic
  campaign: String, // specific campaign name

  // Timestamp with time components for easy aggregation
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  hour: Number,
  dayOfWeek: Number,
  week: Number,
  month: Number,
  year: Number
});

// Pre-save hook to set time components
analyticsEventSchema.pre('save', async function () {
  const date = this.timestamp || new Date();
  this.hour = date.getHours();
  this.dayOfWeek = date.getDay();
  this.week = getWeekNumber(date);
  this.month = date.getMonth() + 1;
  this.year = date.getFullYear();
});

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Indexes for efficient aggregation queries
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ category: 1, timestamp: -1 });
analyticsEventSchema.index({ year: 1, month: 1, eventType: 1 });
analyticsEventSchema.index({ 'userContext.college': 1, eventType: 1 });

module.exports = mongoose.model("AnalyticsEvent", analyticsEventSchema);
