const express = require("express");
const ChatController = require("../controller/controller.chat.js");

const router = express.Router();

router.post("/", ChatController.createChat);
router.get("/", ChatController.getChats);
router.get("/:id", ChatController.getChatById);
router.put("/:id", ChatController.updateChat);
router.delete("/:id", ChatController.deleteChat);

module.exports = router;
