const mongoose = require("mongoose");

// Pre-aggregated analytics for fast dashboard loading
const analyticsSummarySchema = new mongoose.Schema({
  // Time period
  periodType: {
    type: String,
    required: true,
    enum: ["hourly", "daily", "weekly", "monthly", "yearly"]
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  
  // Scope
  scope: {
    type: String,
    enum: ["global", "college", "department"],
    default: "global"
  },
  scopeId: mongoose.Schema.Types.ObjectId,
  
  // User metrics
  userMetrics: {
    totalUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    returningUsers: { type: Number, default: 0 },
    
    alumniCount: { type: Number, default: 0 },
    studentCount: { type: Number, default: 0 },
    verifiedAlumni: { type: Number, default: 0 }
  },
  
  // Engagement metrics
  engagementMetrics: {
    totalSessions: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    
    postsCreated: { type: Number, default: 0 },
    postLikes: { type: Number, default: 0 },
    postComments: { type: Number, default: 0 },
    
    messagesExchanged: { type: Number, default: 0 },
    chatsStarted: { type: Number, default: 0 }
  },
  
  // Connection metrics
  connectionMetrics: {
    requestsSent: { type: Number, default: 0 },
    requestsAccepted: { type: Number, default: 0 },
    requestsRejected: { type: Number, default: 0 },
    totalConnections: { type: Number, default: 0 }
  },
  
  // Job metrics
  jobMetrics: {
    jobsPosted: { type: Number, default: 0 },
    jobApplications: { type: Number, default: 0 },
    jobsViewed: { type: Number, default: 0 },
    applicationConversionRate: { type: Number, default: 0 }
  },
  
  // Event metrics
  eventMetrics: {
    eventsCreated: { type: Number, default: 0 },
    eventRegistrations: { type: Number, default: 0 },
    eventAttendance: { type: Number, default: 0 },
    attendanceRate: { type: Number, default: 0 }
  },
  
  // Campaign metrics
  campaignMetrics: {
    campaignsCreated: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    donationAmount: { type: Number, default: 0 },
    uniqueDonors: { type: Number, default: 0 },
    avgDonation: { type: Number, default: 0 }
  },
  
  // Survey metrics
  surveyMetrics: {
    surveysCreated: { type: Number, default: 0 },
    surveyResponses: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  
  // Success story metrics
  storyMetrics: {
    storiesCreated: { type: Number, default: 0 },
    storyViews: { type: Number, default: 0 },
    storyLikes: { type: Number, default: 0 }
  },
  
  // Heatmap data (for daily summaries)
  heatmapData: {
    hourlyActivity: [{ hour: Number, count: Number }],
    dailyActivity: [{ day: Number, count: Number }]
  },
  
  // Top performers
  topItems: {
    topPosts: [{ postId: mongoose.Schema.Types.ObjectId, engagement: Number }],
    topJobs: [{ jobId: mongoose.Schema.Types.ObjectId, applications: Number }],
    topEvents: [{ eventId: mongoose.Schema.Types.ObjectId, registrations: Number }],
    activeAlumni: [{ userId: mongoose.Schema.Types.ObjectId, score: Number }]
  },
  
  // Funnel data
  funnels: {
    onboarding: {
      signups: Number,
      profileComplete: Number,
      firstConnection: Number,
      firstPost: Number
    },
    donation: {
      campaignViews: Number,
      donationStarted: Number,
      donationCompleted: Number
    }
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

// Compound index for fast lookup
analyticsSummarySchema.index({ periodType: 1, periodStart: 1, scope: 1, scopeId: 1 }, { unique: true });

module.exports = mongoose.model("AnalyticsSummary", analyticsSummarySchema);
