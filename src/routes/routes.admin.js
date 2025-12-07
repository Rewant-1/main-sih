const express = require("express");
const router = express.Router();

const AdminController = require("../controller/controller.admin");
const { verifyAdmin } = require("../middleware/middleware.adminAuth");

// All admin routes require admin authentication
router.use(verifyAdmin);

// Get all admin names (useful for dropdowns/assignments)
router.get("/names", AdminController.getAdminNames);

// Get admin by ID
router.get("/:id", AdminController.getAdminById);

// Update admin profile
router.put("/:id", AdminController.updateAdmin);

// Delete admin (super admin only in practice)
router.delete("/:id", AdminController.deleteAdmin);

// Admin-managed User CRUD (create Student/Alumni)
router.post("/users", AdminController.createUser);
router.put("/users/:id", AdminController.updateUserById);
router.delete("/users/:id", AdminController.deleteUserById);

// Award Moksha coins and tags
router.post("/award-moksha", AdminController.awardMokshaCoins);
router.post("/award-tag", AdminController.awardTag);

module.exports = router;
