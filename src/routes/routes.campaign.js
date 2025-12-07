const express = require("express");
const router = express.Router();
const CampaignController = require("../controller/controller.campaign.js");
const { verifyAdmin } = require("../middleware/middleware.adminAuth.js");

// ALL routes require admin authentication for college isolation
router.use(verifyAdmin);

// Campaign routes - all protected by admin auth
router.get("/", CampaignController.getCampaigns);
router.get("/analytics", CampaignController.getCampaignAnalytics);
router.get("/:id", CampaignController.getCampaignById);
router.post("/", CampaignController.createCampaign);
router.put("/:id", CampaignController.updateCampaign);
router.delete("/:id", CampaignController.deleteCampaign);
router.post("/:id/donate", CampaignController.donate);
router.post("/:id/verify", CampaignController.verifyCampaign);

module.exports = router;
