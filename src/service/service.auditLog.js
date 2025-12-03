const AuditLog = require("../model/model.auditLog");

class AuditLogService {
  /**
   * Create an audit log entry
   */
  async log({
    action,
    resourceType,
    resourceId,
    actor,
    actorType = "User",
    actorEmail,
    previousState,
    newState,
    changes,
    ipAddress,
    userAgent,
    requestId,
    metadata,
    notes,
    status = "success",
    errorMessage
  }) {
    try {
      const auditLog = new AuditLog({
        action,
        resourceType,
        resourceId,
        actor,
        actorType,
        actorEmail,
        previousState,
        newState,
        changes,
        ipAddress,
        userAgent,
        requestId,
        metadata,
        notes,
        status,
        errorMessage
      });
      
      return await auditLog.save();
    } catch (error) {
      // Don't fail silently - log the error but don't throw
      console.error("Failed to create audit log:", error);
      return null;
    }
  }

  /**
   * Calculate changes between two states
   */
  calculateChanges(previousState, newState) {
    const changes = [];
    if (!previousState || !newState) return changes;

    const allKeys = new Set([
      ...Object.keys(previousState),
      ...Object.keys(newState)
    ]);

    for (const key of allKeys) {
      if (key.startsWith('_') || key === 'updatedAt') continue;
      
      const oldVal = previousState[key];
      const newVal = newState[key];
      
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          oldValue: oldVal,
          newValue: newVal
        });
      }
    }

    return changes;
  }

  /**
   * Get audit logs with filters
   */
  async getLogs({
    action,
    resourceType,
    resourceId,
    actor,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    sort = { createdAt: -1 }
  }) {
    const query = {};

    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (resourceId) query.resourceId = resourceId;
    if (actor) query.actor = actor;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("actor", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get logs for a specific resource
   */
  async getResourceHistory(resourceType, resourceId) {
    return AuditLog.find({ resourceType, resourceId })
      .populate("actor", "name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get logs for a specific user
   */
  async getUserActivity(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    return AuditLog.find({ actor: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Get summary statistics
   */
  async getStats(startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await AuditLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            action: "$action",
            resourceType: "$resourceType"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.action",
          resources: {
            $push: {
              type: "$_id.resourceType",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      },
      { $sort: { total: -1 } }
    ]);

    return stats;
  }

  /**
   * Cleanup old audit logs
   */
  async cleanup(retentionDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    return result.deletedCount;
  }
}

module.exports = new AuditLogService();
