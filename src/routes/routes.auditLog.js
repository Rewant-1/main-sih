const express = require("express");
const router = express.Router();
const auditLogController = require("../controller/controller.auditLog");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth");

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(checkRole(["Admin"]));

// Get audit logs with filters
router.get("/", auditLogController.getAuditLogs);

// Get audit statistics
router.get("/stats", auditLogController.getAuditStats);

// Get resource history
router.get("/resource/:resourceType/:resourceId", auditLogController.getResourceHistory);

// Get user activity
router.get("/user/:userId", auditLogController.getUserActivity);

// Cleanup old logs
router.post("/cleanup", auditLogController.cleanupAuditLogs);

module.exports = router;
