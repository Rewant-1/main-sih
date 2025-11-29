const express = require("express");
const MessageController = require("../controller/controller.message.js");

const router = express.Router();

router.post("/", MessageController.createMessage);
router.get("/", MessageController.getMessages);
router.get("/:id", MessageController.getMessageById);
router.put("/:id", MessageController.updateMessage);
router.delete("/:id", MessageController.deleteMessage);

module.exports = router;
