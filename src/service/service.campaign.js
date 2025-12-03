const Campaign = require("../model/model.campaign.js");

const createCampaign = async (campaignData) => {
  const campaign = new Campaign(campaignData);
  return await campaign.save();
};

const getCampaigns = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const campaigns = await Campaign.find(filters)
    .populate('organizer', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Campaign.countDocuments(filters);
  
  return {
    campaigns,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

const getCampaignById = async (id) => {
  return await Campaign.findById(id)
    .populate('organizer', 'name email')
    .populate('donations.donor', 'name email')
    .populate('teamMembers.user', 'name email');
};

const updateCampaign = async (id, updateData) => {
  updateData.updatedAt = new Date();
  return await Campaign.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteCampaign = async (id) => {
  return await Campaign.findByIdAndDelete(id);
};

const addDonation = async (campaignId, donationData) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("Campaign not found");
  
  campaign.donations.push(donationData);
  campaign.raisedAmount += donationData.amount;
  campaign.supportersCount = new Set(campaign.donations.map(d => d.donor.toString())).size;
  
  return await campaign.save();
};

const incrementViews = async (id) => {
  return await Campaign.findByIdAndUpdate(id, { $inc: { views: 1 } });
};

const verifyCampaign = async (id, verifierId) => {
  return await Campaign.findByIdAndUpdate(id, {
    isVerified: true,
    verifiedBy: verifierId,
    verifiedAt: new Date(),
    status: 'active'
  }, { new: true });
};

const getAnalytics = async () => {
  const totalCampaigns = await Campaign.countDocuments();
  const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
  const completedCampaigns = await Campaign.countDocuments({ status: 'completed' });
  
  const fundingStats = await Campaign.aggregate([
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
