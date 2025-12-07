const express = require("express");
const EventController = require("../controller/controller.event.js");
const { verifyAdmin } = require("../middleware/middleware.adminAuth.js");
const { authenticateToken } = require("../middleware/middleware.auth.js");

const router = express.Router();

// Shared routes (Student/Alumni/Admin) - require login
router.get("/", authenticateToken, EventController.getEvents);
router.get("/:id", authenticateToken, EventController.getEventById);
router.post("/:id/register", authenticateToken, EventController.registerForEvent);

// Admin Only routes
router.post("/", verifyAdmin, EventController.createEvent);
router.put("/:id", verifyAdmin, EventController.updateEvent);
router.delete("/:id", verifyAdmin, EventController.deleteEvent);

module.exports = router;
