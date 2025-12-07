const express = require("express");
const router = express.Router();
const alumniController = require("../controller/controller.alumni.js");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth.js");

router.get("/", alumniController.getAlumni);
router.get("/:id", alumniController.getAlumniById);
router.put("/:id", alumniController.updateAlumni);
router.post("/:id/verify", authenticateToken, checkRole("Admin"), alumniController.verifyAlumni);
router.post("/bulk-create", authenticateToken, checkRole("Admin"), alumniController.createAlumni);

module.exports = router;
