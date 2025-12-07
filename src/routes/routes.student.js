const express = require("express");
const router = express.Router();
const studentController = require("../controller/controller.student.js");
const { verifyAdmin } = require("../middleware/middleware.adminAuth.js");

// ALL routes require admin authentication for college isolation
router.use(verifyAdmin);

// Student routes - all protected by admin auth
router.get("/", studentController.getStudents);
router.get("/:id", studentController.getStudentById);
router.put("/:id", studentController.updateStudent);
router.post("/bulk-create", studentController.createStudents);

module.exports = router;
