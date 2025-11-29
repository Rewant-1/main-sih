const express = require("express");
const JobController = require("../controller/controller.job.js");

const router = express.Router();

router.post("/", JobController.createJob);
router.get("/", JobController.getJobs);
router.get("/:id", JobController.getJobById);
router.put("/:id", JobController.updateJob);
router.delete("/:id", JobController.deleteJob);
router.post("/:id/apply", JobController.applyToJob);

module.exports = router;
