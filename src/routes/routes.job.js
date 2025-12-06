const express = require("express");
const JobController = require("../controller/controller.job.js");
const AuthMiddleware = require("../middleware/middleware.auth.js");

const router = express.Router();

// Public routes
router.get("/", JobController.getJobs);

// Protected routes (require authentication) - must come before /:id routes
router.get("/my/posted", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole(["Alumni", "Admin"]), JobController.getMyJobs);

// Dynamic ID routes - must come after static routes like /my/posted
router.get("/:id", JobController.getJobById);

// Protected routes (require authentication)
router.post("/", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole(["Alumni", "Admin"]), JobController.createJob);
router.put("/close-applications/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole(["Alumni", "Admin"]), JobController.closeJobApplications);
router.put("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole(["Alumni", "Admin"]), JobController.updateJob);
router.delete("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole(["Alumni", "Admin"]), JobController.deleteJob);
router.post("/:id/apply", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Student"), JobController.applyToJob);
router.patch("/:id/application-status", AuthMiddleware.authenticateToken, JobController.updateApplicationStatus);

module.exports = router;
