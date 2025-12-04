const express = require("express");
const JobController = require("../controller/controller.job.js");
const AuthMiddleware = require("../middleware/middleware.auth.js");

const router = express.Router();

// Public routes
router.get("/", JobController.getJobs);
router.get("/:id", JobController.getJobById);

// Protected routes (require authentication)
router.post("/", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.createJob);
router.put("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.updateJob);
router.delete("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.deleteJob);
router.post("/:id/apply", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Student"), JobController.applyToJob);
router.patch("/:id/application-status", AuthMiddleware.authenticateToken, JobController.updateApplicationStatus);
router.get("/my/posted", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.getMyJobs);
router.put("/close-applications/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.closeJobApplications);

module.exports = router;
