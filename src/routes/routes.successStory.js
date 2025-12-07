const express = require("express");
const router = express.Router();
const SuccessStoryController = require("../controller/controller.successStory.js");
const { verifyAdmin } = require("../middleware/middleware.adminAuth.js");
const { authenticateToken } = require("../middleware/middleware.auth.js");

// Shared routes (Student/Alumni/Admin)
router.get("/", authenticateToken, SuccessStoryController.getStories);
router.get("/categories", authenticateToken, SuccessStoryController.getCategories);
router.get("/:id", authenticateToken, SuccessStoryController.getStoryById);
router.post("/", authenticateToken, SuccessStoryController.createStory);
router.post("/:id/like", authenticateToken, SuccessStoryController.likeStory);

// Admin Only routes
router.put("/:id", verifyAdmin, SuccessStoryController.updateStory);
router.delete("/:id", verifyAdmin, SuccessStoryController.deleteStory);
router.post("/:id/verify", verifyAdmin, SuccessStoryController.verifyStory);

module.exports = router;
