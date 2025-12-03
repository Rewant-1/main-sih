const express = require("express");
const router = express.Router();
const studentController = require("../controller/controller.student.js");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth.js");

router.get("/", studentController.getStudents);
router.get("/:id", studentController.getStudentById);
router.put("/:id", authenticateToken, studentController.updateStudent);
router.post("/bulk-create", studentController.createStudents);

module.exports = router;
