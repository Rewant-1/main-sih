const CampaignService = require("../service/service.campaign.js");

// All controllers now use req.admin.adminId for college isolation

const createCampaign = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const campaign = await CampaignService.createCampaign({
      ...req.body,
      organizer: req.admin._id
    }, adminId);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error('[Campaigns] Error creating campaign:', error);
    // Return more informative error for validation issues
    const message = error.name === 'ValidationError'
      ? `Validation Error: ${Object.values(error.errors || {}).map(e => e.message).join(', ')}`
      : error.message;
    res.status(500).json({ success: false, message });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const { status, category, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;

    const campaigns = await CampaignService.getCampaigns(adminId, filters, page, limit);
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const campaign = await CampaignService.getCampaignById(req.params.id, adminId);
    if (campaign) {
      // Increment view count
      await CampaignService.incrementViews(req.params.id, adminId);
      res.status(200).json({ success: true, data: campaign });
    } else {
      res.status(404).json({ success: false, message: "Campaign not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const campaign = await CampaignService.updateCampaign(req.params.id, req.body, adminId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const campaign = await CampaignService.deleteCampaign(req.params.id, adminId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const donate = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const { amount, type, message, isAnonymous, donorId } = req.body;
    const campaign = await CampaignService.addDonation(req.params.id, {
      donor: donorId,
      amount,
      type,
      message,
      isAnonymous,
      paymentStatus: "completed"
    }, adminId);
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyCampaign = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const campaign = await CampaignService.verifyCampaign(req.params.id, req.admin._id, adminId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCampaignAnalytics = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const analytics = await CampaignService.getAnalytics(adminId);
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  donate,
  verifyCampaign,
  getCampaignAnalytics
};
