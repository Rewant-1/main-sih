const express = require("express");
const router = express.Router();
const analyticsController = require("../controller/controller.analytics");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth");

// Track event (public - can be used without auth for anonymous tracking)
router.post("/track", analyticsController.trackEvent);
router.post("/track/batch", analyticsController.trackEvents);

// Protected routes
router.use(authenticateToken);

// Dashboard metrics
router.get("/dashboard", checkRole(["Admin"]), analyticsController.getDashboardMetrics);

// Time series data
router.get("/timeseries", checkRole(["Admin"]), analyticsController.getEngagementTimeSeries);

// Event counts
router.get("/events", checkRole(["Admin"]), analyticsController.getEventCounts);

// User activity
router.get("/users/:userId", checkRole(["Admin"]), analyticsController.getUserActivity);

// Funnel analysis
router.get("/funnel", checkRole(["Admin"]), analyticsController.getFunnelAnalysis);

// Activity heatmap
router.get("/heatmap", checkRole(["Admin"]), analyticsController.getActivityHeatmap);

// Pre-aggregated summaries
router.get("/summary", checkRole(["Admin"]), analyticsController.getSummary);

// Generate summary (for cron/admin)
router.post("/summary/generate", checkRole(["Admin"]), analyticsController.generateSummary);

// Export data
router.get("/export", checkRole(["Admin"]), analyticsController.exportAnalytics);

module.exports = router;
