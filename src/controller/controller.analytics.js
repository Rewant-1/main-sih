const analyticsService = require("../service/service.analytics");

// Track an event
const trackEvent = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userType = req.user?.userType;
    const {
      eventType,
      category,
      resourceType,
      resourceId,
      properties,
      duration,
      source,
      medium,
      campaign
    } = req.body;

    if (!eventType || !category) {
      return res.status(400).json({
        success: false,
        message: "eventType and category are required"
      });
    }

    // Extract device and location info from request
    const userAgent = req.headers["user-agent"] || "";
    const device = {
      type: /mobile/i.test(userAgent) ? "mobile" : 
            /tablet/i.test(userAgent) ? "tablet" : "desktop",
      browser: extractBrowser(userAgent),
      os: extractOS(userAgent)
    };

    await analyticsService.trackEvent({
      eventType,
      category,
      userId,
      userType,
      sessionId: req.sessionID || req.headers["x-session-id"],
      resourceType,
      resourceId,
      properties,
      device,
      duration,
      source,
      medium,
      campaign
    });

    res.status(200).json({
      success: true,
      message: "Event tracked"
    });
  } catch (error) {
    console.error("Track event error:", error);
    // Don't fail the request for analytics errors
    res.status(200).json({
      success: true,
      message: "Event tracking attempted"
    });
  }
};

// Batch track events
const trackEvents = async (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        message: "events array is required"
      });
    }

    await analyticsService.trackEvents(events);

    res.status(200).json({
      success: true,
      message: `Tracked ${events.length} events`
    });
  } catch (error) {
    console.error("Batch track error:", error);
    res.status(200).json({
      success: true,
      message: "Batch tracking attempted"
    });
  }
};

// Get dashboard metrics
const getDashboardMetrics = async (req, res) => {
  try {
    const { startDate, endDate, college } = req.query;

    // Default to last 30 days if not specified
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end - 30 * 24 * 60 * 60 * 1000);

    const metrics = await analyticsService.getDashboardMetrics({
      startDate: start,
      endDate: end,
      college,
      compareWithPrevious: true
    });

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error("Get dashboard metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard metrics",
      error: error.message
    });
  }
};

// Get engagement time series
const getEngagementTimeSeries = async (req, res) => {
  try {
    const { startDate, endDate, granularity = "day", eventTypes, college } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end - 30 * 24 * 60 * 60 * 1000);

    const data = await analyticsService.getEngagementTimeSeries({
      startDate: start,
      endDate: end,
      granularity,
      eventTypes: eventTypes ? eventTypes.split(",") : null,
      college
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Get time series error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch time series data",
      error: error.message
    });
  }
};

// Get event counts grouped by type
const getEventCounts = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "eventType", college } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end - 30 * 24 * 60 * 60 * 1000);

    const data = await analyticsService.getEventCounts({
      startDate: start,
      endDate: end,
      groupBy,
      college
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Get event counts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event counts",
      error: error.message
    });
  }
};

// Get user activity
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const data = await analyticsService.getUserActivity(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user activity",
      error: error.message
    });
  }
};

// Get funnel analysis
const getFunnelAnalysis = async (req, res) => {
  try {
    const { steps, startDate, endDate, college } = req.query;

    if (!steps) {
      return res.status(400).json({
        success: false,
        message: "steps parameter is required (comma-separated event types)"
      });
    }

    const funnelSteps = steps.split(",");
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end - 30 * 24 * 60 * 60 * 1000);

    const data = await analyticsService.getFunnelAnalysis({
      funnelSteps,
      startDate: start,
      endDate: end,
      college
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Get funnel analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch funnel analysis",
      error: error.message
    });
  }
};

// Get activity heatmap
const getActivityHeatmap = async (req, res) => {
  try {
    const { startDate, endDate, college } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end - 30 * 24 * 60 * 60 * 1000);

    const data = await analyticsService.getActivityHeatmap({
      startDate: start,
      endDate: end,
      college
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Get heatmap error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity heatmap",
      error: error.message
    });
  }
};

// Get pre-aggregated summary
const getSummary = async (req, res) => {
  try {
    const { periodType, startDate, endDate, scope, scopeId } = req.query;

    if (!periodType) {
      return res.status(400).json({
        success: false,
        message: "periodType is required (hourly, daily, weekly, monthly, yearly)"
      });
    }

    const data = await analyticsService.getSummary({
      periodType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      scope,
      scopeId
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch summary",
      error: error.message
    });
  }
};

// Trigger summary generation (admin/cron)
const generateSummary = async (req, res) => {
  try {
    const { date } = req.body;

    await analyticsService.generateDailySummary(date ? new Date(date) : new Date());

    res.status(200).json({
      success: true,
      message: "Summary generated"
    });
  } catch (error) {
    console.error("Generate summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate summary",
      error: error.message
    });
  }
};

// Export data (for PDF/Excel generation)
const exportAnalytics = async (req, res) => {
  try {
    const { format = "json", startDate, endDate, college } = req.query;

    const metrics = await analyticsService.getDashboardMetrics({
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
      college,
      compareWithPrevious: true
    });

    const timeSeries = await analyticsService.getEngagementTimeSeries({
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
      granularity: "day",
      college
    });

    const heatmap = await analyticsService.getActivityHeatmap({
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
      college
    });

    const exportData = {
      generatedAt: new Date().toISOString(),
      period: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: endDate || new Date().toISOString()
      },
      metrics: metrics.current,
      changes: metrics.changes,
      timeSeries,
      heatmap
    };

    if (format === "json") {
      res.status(200).json({
        success: true,
        data: exportData
      });
    } else {
      // For PDF/Excel, return structured data that frontend can process
      res.status(200).json({
        success: true,
        format,
        data: exportData
      });
    }
  } catch (error) {
    console.error("Export analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export analytics",
      error: error.message
    });
  }
};

// Helper functions
function extractBrowser(userAgent) {
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  if (/edge/i.test(userAgent)) return "Edge";
  if (/msie|trident/i.test(userAgent)) return "IE";
  return "Other";
}

function extractOS(userAgent) {
  if (/windows/i.test(userAgent)) return "Windows";
  if (/macintosh|mac os/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone|ipad/i.test(userAgent)) return "iOS";
  return "Other";
}

module.exports = {
  trackEvent,
  trackEvents,
  getDashboardMetrics,
  getEngagementTimeSeries,
  getEventCounts,
  getUserActivity,
  getFunnelAnalysis,
  getActivityHeatmap,
  getSummary,
  generateSummary,
  exportAnalytics
};
