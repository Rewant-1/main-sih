const auditLogService = require("../service/service.auditLog");

// Get audit logs with filters
const getAuditLogs = async (req, res) => {
  try {
    const {
      action,
      resourceType,
      resourceId,
      actor,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const result = await auditLogService.getLogs({
      action,
      resourceType,
      resourceId,
      actor,
      status,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message
    });
  }
};

// Get audit log history for a specific resource
const getResourceHistory = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;

    const logs = await auditLogService.getResourceHistory(resourceType, resourceId);

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error("Get resource history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resource history",
      error: error.message
    });
  }
};

// Get activity for a specific user
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const logs = await auditLogService.getUserActivity(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: logs
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

// Get audit log statistics
const getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await auditLogService.getStats(startDate, endDate);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get audit stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit statistics",
      error: error.message
    });
  }
};

// Cleanup old audit logs (admin only)
const cleanupAuditLogs = async (req, res) => {
  try {
    const { retentionDays = 90 } = req.body;

    const deletedCount = await auditLogService.cleanup(parseInt(retentionDays));

    res.status(200).json({
      success: true,
      message: `Deleted ${deletedCount} old audit log entries`,
      deletedCount
    });
  } catch (error) {
    console.error("Cleanup audit logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup audit logs",
      error: error.message
    });
  }
};

module.exports = {
  getAuditLogs,
  getResourceHistory,
  getUserActivity,
  getAuditStats,
  cleanupAuditLogs
};
