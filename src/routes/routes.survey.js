const express = require("express");
const router = express.Router();
const SurveyController = require("../controller/controller.survey.js");
const { authMiddleware } = require("../middleware/middleware.auth.js");

// Public routes
router.get("/", SurveyController.getSurveys);
router.get("/analytics", SurveyController.getOverallAnalytics);
router.get("/:id", SurveyController.getSurveyById);
router.get("/:id/analytics", SurveyController.getSurveyAnalytics);

// Protected routes
router.post("/", authMiddleware, SurveyController.createSurvey);
router.put("/:id", authMiddleware, SurveyController.updateSurvey);
router.delete("/:id", authMiddleware, SurveyController.deleteSurvey);
router.post("/:id/respond", SurveyController.submitResponse);

module.exports = router;
