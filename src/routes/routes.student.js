const express = require("express");
const router = express.Router();
const studentController = require("../controller/controller.student.js");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth.js");
const { allowAdminOrInternal } = require("../middleware/middleware.adminAuth");

// Require either an admin token or internal API key for student routes
router.use(allowAdminOrInternal);

router.get("/", studentController.getStudents);
router.get("/:id", studentController.getStudentById);
router.put("/:id", studentController.updateStudent);
router.post("/bulk-create", studentController.createStudents);

module.exports = router;
