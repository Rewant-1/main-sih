const express = require("express");
const router = express.Router();
const studentController = require("../controller/controller.student.js");

// router.get("/", studentController.getStudents);
// router.get("/:id", studentController.getStudentById);
// router.put("/:id", studentController.updateStudent);

router.post("/bulk-create", studentController.createStudents);

module.exports = router;
