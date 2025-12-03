const CampaignService = require("../service/service.campaign.js");

const createCampaign = async (req, res) => {
  try {
    const campaign = await CampaignService.createCampaign({
      ...req.body,
      organizer: req.user.userId
    });
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    
    const campaigns = await CampaignService.getCampaigns(filters, page, limit);
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const campaign = await CampaignService.getCampaignById(req.params.id);
    if (campaign) {
      // Increment view count
      await CampaignService.incrementViews(req.params.id);
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
    const campaign = await CampaignService.updateCampaign(req.params.id, req.body);
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    await CampaignService.deleteCampaign(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const donate = async (req, res) => {
  try {
    const { amount, type, message, isAnonymous } = req.body;
    const campaign = await CampaignService.addDonation(req.params.id, {
      donor: req.user.userId,
      amount,
      type,
      message,
      isAnonymous,
      paymentStatus: "completed"
    });
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyCampaign = async (req, res) => {
  try {
    const campaign = await CampaignService.verifyCampaign(req.params.id, req.user.userId);
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCampaignAnalytics = async (req, res) => {
  try {
    const analytics = await CampaignService.getAnalytics();
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
