const express = require("express");
const UserController = require("../controller/controller.user.js");
const { authenticateToken, authorize } = require("../middleware/middleware.auth.js");

const router = express.Router();

// Protected routes - require authentication
router.get("/", authenticateToken, UserController.getUsers);
router.get("/:id", authenticateToken, UserController.getUserById);
router.put("/:id", authenticateToken, UserController.updateUser);
router.delete("/:id", authenticateToken, authorize('admin'), UserController.deleteUser);

module.exports = router;