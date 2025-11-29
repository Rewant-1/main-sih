const express = require("express");
const EventController = require("../controller/controller.event.js");

const router = express.Router();

router.post("/", EventController.createEvent);
router.get("/", EventController.getEvents);
router.get("/:id", EventController.getEventById);
router.put("/:id", EventController.updateEvent);
router.delete("/:id", EventController.deleteEvent);

module.exports = router;
