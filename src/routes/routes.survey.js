const express = require("express");
const router = express.Router();
const SurveyController = require("../controller/controller.survey.js");
const { verifyAdmin } = require("../middleware/middleware.adminAuth.js");

// ALL routes require admin authentication for college isolation
router.use(verifyAdmin);

// Survey routes - all protected by admin auth
router.get("/", SurveyController.getSurveys);
router.get("/analytics", SurveyController.getOverallAnalytics);
router.get("/:id", SurveyController.getSurveyById);
router.get("/:id/analytics", SurveyController.getSurveyAnalytics);
router.post("/", SurveyController.createSurvey);
router.put("/:id", SurveyController.updateSurvey);
router.delete("/:id", SurveyController.deleteSurvey);
router.post("/:id/respond", SurveyController.submitResponse);

module.exports = router;
