const express = require("express");
const router = express.Router();
const CampaignController = require("../controller/controller.campaign.js");
const { authMiddleware } = require("../middleware/middleware.auth.js");

// Public routes
router.get("/", CampaignController.getCampaigns);
router.get("/analytics", CampaignController.getCampaignAnalytics);
router.get("/:id", CampaignController.getCampaignById);

// Protected routes
router.post("/", authMiddleware, CampaignController.createCampaign);
router.put("/:id", authMiddleware, CampaignController.updateCampaign);
router.delete("/:id", authMiddleware, CampaignController.deleteCampaign);
router.post("/:id/donate", authMiddleware, CampaignController.donate);
router.post("/:id/verify", authMiddleware, CampaignController.verifyCampaign);

module.exports = router;
