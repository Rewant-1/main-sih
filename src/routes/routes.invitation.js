const express = require("express");
const router = express.Router();
const invitationController = require("../controller/controller.invitation");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth");

// Public routes (no auth required)
// Validate invitation token
router.get("/validate/:token", invitationController.validateToken);

// Accept invitation (register via invitation)
router.post("/accept/:token", invitationController.acceptInvitation);

// Track email open (pixel)
router.get("/track/:token/open.gif", invitationController.trackOpen);

// Protected routes
router.use(authenticateToken);

// Get invitations list
router.get("/", invitationController.getInvitations);

// Get invitation statistics
router.get("/stats", checkRole(["Admin"]), invitationController.getInvitationStats);

// Create single invitation
router.post("/", checkRole(["Admin"]), invitationController.createInvitation);

// Create bulk invitations
router.post("/bulk", checkRole(["Admin"]), invitationController.createBulkInvitations);

// Resend invitation
router.post("/:invitationId/resend", checkRole(["Admin"]), invitationController.resendInvitation);

// Cancel invitation
router.delete("/:invitationId", checkRole(["Admin"]), invitationController.cancelInvitation);

module.exports = router;
