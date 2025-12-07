const express = require("express");
const router = express.Router();

const AdminAuthController = require("../controller/controller.adminAuth");
const { verifyAdmin, verifyInternalApiKey } = require("../middleware/middleware.adminAuth");

// Public routes
router.post("/login", AdminAuthController.loginAdmin);

// Protected - Internal API key required (from admin backend or super admin)
router.post("/register", verifyInternalApiKey, AdminAuthController.registerAdmin);

// TEST ONLY - Public registration for testing (remove in production!)
router.post("/register-test", AdminAuthController.registerAdmin);

// Protected - Admin auth required
router.post("/reset-password", verifyAdmin, AdminAuthController.resetPassword);

module.exports = router;
