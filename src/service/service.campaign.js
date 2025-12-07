const Campaign = require("../model/model.campaign.js");

// Create campaign - requires adminId
const createCampaign = async (campaignData, adminId) => {
  campaignData.adminId = adminId;
  const campaign = new Campaign(campaignData);
  return await campaign.save();
};

// Get campaigns - filtered by adminId (college isolation)
const getCampaigns = async (adminId, filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = { adminId, ...filters };

  const campaigns = await Campaign.find(query)
    .populate('organizer', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Campaign.countDocuments(query);

  return {
    campaigns,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

// Get campaign by ID - verify adminId ownership
const getCampaignById = async (id, adminId) => {
  return await Campaign.findOne({ _id: id, adminId })
    .populate('organizer', 'name email')
    .populate('donations.donor', 'name email')
    .populate('teamMembers.user', 'name email');
};

// Update campaign - verify adminId ownership
const updateCampaign = async (id, updateData, adminId) => {
  updateData.updatedAt = new Date();
  return await Campaign.findOneAndUpdate(
    { _id: id, adminId },
    updateData,
    { new: true }
  );
};

// Delete campaign - verify adminId ownership
const deleteCampaign = async (id, adminId) => {
  return await Campaign.findOneAndDelete({ _id: id, adminId });
};

// Add donation - verify campaign belongs to college
const addDonation = async (campaignId, donationData, adminId) => {
  const campaign = await Campaign.findOne({ _id: campaignId, adminId });
  if (!campaign) throw new Error("Campaign not found");

  campaign.donations.push(donationData);
  campaign.raisedAmount += donationData.amount;
  campaign.supportersCount = new Set(campaign.donations.map(d => d.donor.toString())).size;

  return await campaign.save();
};

// Increment views - verify adminId ownership
const incrementViews = async (id, adminId) => {
  return await Campaign.findOneAndUpdate(
    { _id: id, adminId },
    { $inc: { views: 1 } }
  );
};

// Verify campaign - admin action
const verifyCampaign = async (id, verifierId, adminId) => {
  return await Campaign.findOneAndUpdate(
    { _id: id, adminId },
    {
      isVerified: true,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
      status: 'active'
    },
    { new: true }
  );
};

// Get analytics - filtered by adminId
const getAnalytics = async (adminId) => {
  const matchStage = { adminId };

  const totalCampaigns = await Campaign.countDocuments(matchStage);
  const activeCampaigns = await Campaign.countDocuments({ ...matchStage, status: 'active' });
  const completedCampaigns = await Campaign.countDocuments({ ...matchStage, status: 'completed' });

  const fundingStats = await Campaign.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRaised: { $sum: '$raisedAmount' },
        totalTarget: { $sum: '$targetAmount' },
        avgDonation: { $avg: '$raisedAmount' },
        totalSupporters: { $sum: '$supportersCount' }
      }
    }
  ]);

  const categoryStats = await Campaign.aggregate([
    { $match: matchStage },
    { $group: { _id: '$category', count: { $sum: 1 }, raised: { $sum: '$raisedAmount' } } },
    { $sort: { count: -1 } }
  ]);

  return {
    totalCampaigns,
    activeCampaigns,
    completedCampaigns,
    successRate: totalCampaigns > 0 ? Math.round((completedCampaigns / totalCampaigns) * 100) : 0,
    funding: fundingStats[0] || { totalRaised: 0, totalTarget: 0, avgDonation: 0, totalSupporters: 0 },
    categoryStats
  };
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  addDonation,
  incrementViews,
  verifyCampaign,
  getAnalytics
};
