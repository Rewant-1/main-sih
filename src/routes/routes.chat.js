const express = require("express");
const ChatController = require("../controller/controller.chat.js");
const { authenticateToken } = require("../middleware/middleware.auth.js");

const router = express.Router();

// All chat routes require authentication
router.use(authenticateToken);

router.post("/", ChatController.createChat);
router.get("/", ChatController.getChats);
router.get("/:id", ChatController.getChatById);
router.put("/:id", ChatController.updateChat);
router.delete("/:id", ChatController.deleteChat);

module.exports = router;
