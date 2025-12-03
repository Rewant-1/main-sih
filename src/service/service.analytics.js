const AnalyticsEvent = require("../model/model.analyticsEvent");
const AnalyticsSummary = require("../model/model.analyticsSummary");

class AnalyticsService {
  /**
   * Track an analytics event
   */
  async trackEvent({
    eventType,
    category,
    userId,
    userType,
    sessionId,
    resourceType,
    resourceId,
    properties = {},
    userContext = {},
    device = {},
    location = {},
    duration,
    source,
    medium,
    campaign
  }) {
    try {
      const event = new AnalyticsEvent({
        eventType,
        category,
        userId,
        userType,
        sessionId,
        resourceType,
        resourceId,
        properties,
        userContext,
        device,
        location,
        duration,
        source,
        medium,
        campaign
      });

      return await event.save();
    } catch (error) {
      console.error("Failed to track event:", error);
      return null;
    }
  }

  /**
   * Batch track multiple events
   */
  async trackEvents(events) {
    try {
      return await AnalyticsEvent.insertMany(events, { ordered: false });
    } catch (error) {
      console.error("Failed to batch track events:", error);
      return null;
    }
  }

  /**
   * Get events with filters
   */
  async getEvents({
    eventType,
    category,
    userId,
    resourceType,
    resourceId,
    startDate,
    endDate,
    page = 1,
    limit = 100
  }) {
    const query = {};

    if (eventType) query.eventType = eventType;
    if (category) query.category = category;
    if (userId) query.userId = userId;
    if (resourceType) query.resourceType = resourceType;
    if (resourceId) query.resourceId = resourceId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      AnalyticsEvent.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AnalyticsEvent.countDocuments(query)
    ]);

    return {
      events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  /**
   * Get event count by type
   */
  async getEventCounts({
    startDate,
    endDate,
    groupBy = "eventType",
    college
  }) {
    const match = {};

    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }

    if (college) {
      match["userContext.college"] = college;
    }

    const result = await AnalyticsEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: `$${groupBy}`,
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return result;
  }

  /**
   * Get engagement metrics over time
   */
  async getEngagementTimeSeries({
    startDate,
    endDate,
    granularity = "day", // hour, day, week, month
    eventTypes,
    college
  }) {
    const match = {};

    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }

    if (eventTypes && eventTypes.length) {
      match.eventType = { $in: eventTypes };
    }

    if (college) {
      match["userContext.college"] = college;
    }

    let dateGrouping;
    switch (granularity) {
      case "hour":
        dateGrouping = {
          year: "$year",
          month: "$month",
          day: { $dayOfMonth: "$timestamp" },
          hour: "$hour"
        };
        break;
      case "week":
        dateGrouping = {
          year: "$year",
          week: "$week"
        };
        break;
      case "month":
        dateGrouping = {
          year: "$year",
          month: "$month"
        };
        break;
      default: // day
        dateGrouping = {
          year: "$year",
          month: "$month",
          day: { $dayOfMonth: "$timestamp" }
        };
    }

    const result = await AnalyticsEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: dateGrouping,
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" }
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          uniqueUsers: { $size: "$uniqueUsers" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1, "_id.hour": 1 } }
    ]);

    return result;
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(userId, startDate, endDate) {
    const match = { userId };

    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }

    const [eventsByType, totalEvents, recentEvents] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$eventType",
            count: { $sum: 1 },
            lastOccurred: { $max: "$timestamp" }
          }
        },
        { $sort: { count: -1 } }
      ]),
      AnalyticsEvent.countDocuments(match),
      AnalyticsEvent.find(match)
        .sort({ timestamp: -1 })
        .limit(20)
        .lean()
    ]);

    return {
      userId,
      totalEvents,
      eventsByType,
      recentEvents
    };
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics({
    startDate,
    endDate,
    college,
    compareWithPrevious = true
  }) {
    const match = {};
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }
    if (college) {
      match["userContext.college"] = college;
    }

    // Calculate previous period for comparison
    let previousMatch = null;
    if (compareWithPrevious && startDate && endDate) {
      const periodDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
      const prevStart = new Date(new Date(startDate) - periodDays * 24 * 60 * 60 * 1000);
      previousMatch = {
        ...match,
        timestamp: {
          $gte: prevStart,
          $lt: new Date(startDate)
        }
      };
    }

    const aggregationPipeline = [
      { $match: match },
      {
        $facet: {
          totalEvents: [{ $count: "count" }],
          uniqueUsers: [
            { $group: { _id: "$userId" } },
            { $count: "count" }
          ],
          topEvents: [
            { $group: { _id: "$eventType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          byCategory: [
            { $group: { _id: "$category", count: { $sum: 1 } } }
          ],
          loginCount: [
            { $match: { eventType: "user_login" } },
            { $count: "count" }
          ],
          signupCount: [
            { $match: { eventType: "user_signup" } },
            { $count: "count" }
          ],
          jobViews: [
            { $match: { eventType: "job_view" } },
            { $count: "count" }
          ],
          jobApplications: [
            { $match: { eventType: "job_apply" } },
            { $count: "count" }
          ],
          eventRegistrations: [
            { $match: { eventType: "event_register" } },
            { $count: "count" }
          ],
          connectionsMade: [
            { $match: { eventType: "connection_accept" } },
            { $count: "count" }
          ]
        }
      }
    ];

    const [current] = await AnalyticsEvent.aggregate(aggregationPipeline);

    let previous = null;
    if (previousMatch) {
      aggregationPipeline[0].$match = previousMatch;
      [previous] = await AnalyticsEvent.aggregate(aggregationPipeline);
    }

    const extractCount = (arr) => arr[0]?.count || 0;

    const result = {
      current: {
        totalEvents: extractCount(current.totalEvents),
        uniqueUsers: extractCount(current.uniqueUsers),
        logins: extractCount(current.loginCount),
        signups: extractCount(current.signupCount),
        jobViews: extractCount(current.jobViews),
        jobApplications: extractCount(current.jobApplications),
        eventRegistrations: extractCount(current.eventRegistrations),
        connectionsMade: extractCount(current.connectionsMade),
        topEvents: current.topEvents,
        byCategory: current.byCategory
      }
    };

    if (previous) {
      result.previous = {
        totalEvents: extractCount(previous.totalEvents),
        uniqueUsers: extractCount(previous.uniqueUsers),
        logins: extractCount(previous.loginCount),
        signups: extractCount(previous.signupCount),
        jobViews: extractCount(previous.jobViews),
        jobApplications: extractCount(previous.jobApplications),
        eventRegistrations: extractCount(previous.eventRegistrations),
        connectionsMade: extractCount(previous.connectionsMade)
      };

      // Calculate changes
      result.changes = {};
      for (const key of Object.keys(result.current)) {
        if (typeof result.current[key] === "number" && result.previous[key] !== undefined) {
          const prev = result.previous[key] || 1;
          result.changes[key] = ((result.current[key] - prev) / prev * 100).toFixed(1);
        }
      }
    }

    return result;
  }

  /**
   * Get funnel analysis
   */
  async getFunnelAnalysis({
    funnelSteps,
    startDate,
    endDate,
    college
  }) {
    const match = {};
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }
    if (college) {
      match["userContext.college"] = college;
    }

    const results = [];

    for (let i = 0; i < funnelSteps.length; i++) {
      const stepMatch = { ...match, eventType: funnelSteps[i] };
      
      const [count, uniqueUsers] = await Promise.all([
        AnalyticsEvent.countDocuments(stepMatch),
        AnalyticsEvent.distinct("userId", stepMatch)
      ]);

      results.push({
        step: funnelSteps[i],
        stepNumber: i + 1,
        totalEvents: count,
        uniqueUsers: uniqueUsers.length,
        conversionRate: i === 0 ? 100 : 
          ((uniqueUsers.length / results[0].uniqueUsers) * 100).toFixed(2)
      });
    }

    return results;
  }

  /**
   * Get heatmap data for user activity
   */
  async getActivityHeatmap({ startDate, endDate, college }) {
    const match = {};
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }
    if (college) {
      match["userContext.college"] = college;
    }

    const result = await AnalyticsEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            dayOfWeek: "$dayOfWeek",
            hour: "$hour"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.dayOfWeek": 1, "_id.hour": 1 } }
    ]);

    // Transform to heatmap format
    const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));
    
    result.forEach(r => {
      if (r._id.dayOfWeek !== null && r._id.hour !== null) {
        heatmap[r._id.dayOfWeek][r._id.hour] = r.count;
      }
    });

    return heatmap;
  }

  /**
   * Generate daily summary (to be run by cron job)
   */
  async generateDailySummary(date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const metrics = await this.getDashboardMetrics({
      startDate: startOfDay,
      endDate: endOfDay,
      compareWithPrevious: false
    });

    const heatmap = await this.getActivityHeatmap({
      startDate: startOfDay,
      endDate: endOfDay
    });

    // Create or update daily summary
    await AnalyticsSummary.findOneAndUpdate(
      {
        periodType: "daily",
        periodStart: startOfDay,
        scope: "global"
      },
      {
        periodType: "daily",
        periodStart: startOfDay,
        periodEnd: endOfDay,
        scope: "global",
        userMetrics: {
          activeUsers: metrics.current.uniqueUsers,
          newUsers: metrics.current.signups
        },
        engagementMetrics: {
          totalSessions: metrics.current.logins,
          pageViews: metrics.current.totalEvents
        },
        connectionMetrics: {
          totalConnections: metrics.current.connectionsMade
        },
        jobMetrics: {
          jobsViewed: metrics.current.jobViews,
          jobApplications: metrics.current.jobApplications
        },
        eventMetrics: {
          eventRegistrations: metrics.current.eventRegistrations
        },
        heatmapData: {
          hourlyActivity: heatmap[startOfDay.getDay()]?.map((count, hour) => ({ hour, count })) || []
        },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return true;
  }

  /**
   * Get pre-aggregated summary
   */
  async getSummary({ periodType, startDate, endDate, scope, scopeId }) {
    const query = { periodType };

    if (startDate || endDate) {
      query.periodStart = {};
      if (startDate) query.periodStart.$gte = new Date(startDate);
      if (endDate) query.periodStart.$lte = new Date(endDate);
    }

    if (scope) query.scope = scope;
    if (scopeId) query.scopeId = scopeId;

    return AnalyticsSummary.find(query)
      .sort({ periodStart: 1 })
      .lean();
  }

  /**
   * Cleanup old events (keep summaries, delete raw events)
   */
  async cleanup(retentionDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await AnalyticsEvent.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return result.deletedCount;
  }
}

module.exports = new AnalyticsService();
