const express = require("express");
const MessageController = require("../controller/controller.message.js");
const { authenticateToken } = require("../middleware/middleware.auth.js");

const router = express.Router();

// All message routes require authentication
router.use(authenticateToken);

router.post("/", MessageController.createMessage);
router.get("/", MessageController.getMessages);
router.get("/:id", MessageController.getMessageById);
router.put("/:id", MessageController.updateMessage);
router.delete("/:id", MessageController.deleteMessage);

module.exports = router;
