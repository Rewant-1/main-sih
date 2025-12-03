const express = require("express");
const JobController = require("../controller/controller.job.js");
const AuthMiddleware = require("../middleware/middleware.auth.js");

const router = express.Router();

router.post("/", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.createJob);
router.get("/", AuthMiddleware.authenticateToken, JobController.getJobs);
router.get("/:id", AuthMiddleware.authenticateToken, JobController.getJobById);
router.put("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.updateJob);
router.delete("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.deleteJob);
router.put("/close-applications/:id", AuthMiddleware.authenticateToken, AuthMiddleware.checkRole("Alumni"), JobController.closeJobApplications);

module.exports = router;
