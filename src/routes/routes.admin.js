const express = require("express");
const router = express.Router();

const AdminController = require("../controller/controller.admin");
const { authenticateToken, checkRole, captureAdminAction } = require("../middleware/middleware.auth");

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(checkRole("Admin"));
router.use(captureAdminAction); // capture admin ID for audit logs

// Get all admin names (useful for dropdowns/assignments)
router.get("/names", AdminController.getAdminNames);

// Get admin by ID
router.get("/:id", AdminController.getAdminById);

// Update admin profile
router.put("/:id", AdminController.updateAdmin);

// Delete admin (super admin only in practice)
router.delete("/:id", AdminController.deleteAdmin);

module.exports = router;
