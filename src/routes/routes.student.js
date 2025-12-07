const express = require("express");
const router = express.Router();
const studentController = require("../controller/controller.student.js");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth.js");

// Use authenticateToken for all routes - controller handles adminId optionally
router.use(authenticateToken);

router.get("/", studentController.getStudents);
router.get("/:id", studentController.getStudentById);
router.put("/:id", studentController.updateStudent);
router.post("/bulk-create", checkRole("Admin"), studentController.createStudents);

module.exports = router;
