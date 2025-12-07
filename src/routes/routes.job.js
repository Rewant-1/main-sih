const express = require("express");
const JobController = require("../controller/controller.job.js");
const { authenticateToken } = require("../middleware/middleware.auth.js");

const router = express.Router();

// Shared routes (Student/Alumni/Admin)
router.get("/", authenticateToken, JobController.getJobs);
router.get("/my/posted", authenticateToken, JobController.getMyJobs);
router.get("/:id", authenticateToken, JobController.getJobById);
router.post("/", authenticateToken, JobController.createJob);
router.post("/:id/apply", authenticateToken, JobController.applyToJob);

// Management (Alumni/Admin)
router.put("/close-applications/:id", authenticateToken, JobController.closeJobApplications);
router.put("/:id", authenticateToken, JobController.updateJob);
router.delete("/:id", authenticateToken, JobController.deleteJob);
router.patch("/:id/application-status", authenticateToken, JobController.updateApplicationStatus);

module.exports = router;
