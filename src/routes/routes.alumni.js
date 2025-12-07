const express = require("express");
const router = express.Router();
const alumniController = require("../controller/controller.alumni.js");
const { verifyAdmin } = require("../middleware/middleware.adminAuth.js");

// ALL routes require admin authentication for college isolation
router.use(verifyAdmin);

// Alumni routes - all protected by admin auth
router.get("/", alumniController.getAlumni);
router.get("/:id", alumniController.getAlumniById);
router.put("/:id", alumniController.updateAlumni);
router.post("/:id/verify", alumniController.verifyAlumni);
router.post("/bulk-create", alumniController.createAlumni);

module.exports = router;
