const express = require("express");
const EventController = require("../controller/controller.event.js");
const { authenticateToken } = require("../middleware/middleware.auth.js");

const router = express.Router();

// Public routes
router.get("/", EventController.getEvents);
router.get("/:id", EventController.getEventById);

// Protected routes
router.post("/", authenticateToken, EventController.createEvent);
router.put("/:id", authenticateToken, EventController.updateEvent);
router.delete("/:id", authenticateToken, EventController.deleteEvent);
router.post("/:id/register", authenticateToken, EventController.registerForEvent);

module.exports = router;
