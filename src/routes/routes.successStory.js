const express = require("express");
const router = express.Router();
const SuccessStoryController = require("../controller/controller.successStory.js");
const { authMiddleware } = require("../middleware/middleware.auth.js");

// Public routes
router.get("/", SuccessStoryController.getStories);
router.get("/categories", SuccessStoryController.getCategories);
router.get("/:id", SuccessStoryController.getStoryById);

// Protected routes
router.post("/", authMiddleware, SuccessStoryController.createStory);
router.put("/:id", authMiddleware, SuccessStoryController.updateStory);
router.delete("/:id", authMiddleware, SuccessStoryController.deleteStory);
router.post("/:id/like", authMiddleware, SuccessStoryController.likeStory);
router.post("/:id/verify", authMiddleware, SuccessStoryController.verifyStory);

module.exports = router;
