const express = require("express");
const PostController = require("../controller/controller.post.js");
const { authenticateToken } = require("../middleware/middleware.auth.js");

const router = express.Router();

// Public routes
router.get("/", PostController.getPosts);
router.get("/:id", PostController.getPostById);

// Protected routes
router.post("/", authenticateToken, PostController.createPost);
router.put("/:id", authenticateToken, PostController.updatePost);
router.delete("/:id", authenticateToken, PostController.deletePost);
router.post("/:id/like", authenticateToken, PostController.likePost);
router.post("/:id/comment", authenticateToken, PostController.commentOnPost);

module.exports = router;
