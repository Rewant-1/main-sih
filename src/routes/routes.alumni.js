const express = require("express");
const router = express.Router();
const alumniController = require("../controller/controller.alumni.js");

router.get("/", alumniController.getAlumni);
router.get("/:id", alumniController.getAlumniById);
router.put("/:id", alumniController.updateAlumni);

module.exports = router;
