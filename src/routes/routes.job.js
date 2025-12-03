const express = require("express");
const JobController = require("../controller/controller.job.js");
const { authenticateToken, checkRole } = require("../middleware/middleware.auth.js");

const router = express.Router();

// Public routes
router.get("/", JobController.getJobs);
router.get("/:id", JobController.getJobById);

// Protected routes
router.post("/", authenticateToken, checkRole("Alumni"), JobController.createJob);
router.put("/:id", authenticateToken, JobController.updateJob);
router.delete("/:id", authenticateToken, JobController.deleteJob);
router.post("/:id/apply", authenticateToken, checkRole("Student"), JobController.applyToJob);
router.patch("/:id/application-status", authenticateToken, JobController.updateApplicationStatus);
router.get("/my/posted", authenticateToken, checkRole("Alumni"), JobController.getMyJobs);

module.exports = router;
