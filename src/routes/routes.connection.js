const express = require("express");
const router = express.Router();
const ConnectionController = require("../controller/controller.connection.js");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth.js");

router.post("/send-request", authenticateToken, checkRole("Student"), ConnectionController.sendRequest);
router.post("/accept-request", authenticateToken, checkRole("Alumni"), ConnectionController.acceptRequest);
router.post("/reject-request", authenticateToken, checkRole("Alumni"), ConnectionController.rejectRequest);
router.get("/connections", authenticateToken, ConnectionController.getConnections);

module.exports = router;