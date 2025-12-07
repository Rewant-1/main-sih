const SuccessStory = require("../model/model.successStory.js");

// Create story - requires adminId
const createStory = async (storyData, adminId) => {
  storyData.adminId = adminId;
  const story = new SuccessStory(storyData);
  return await story.save();
};

// Get stories - filtered by adminId (college isolation)
const getStories = async (adminId, filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = { adminId, ...filters };

  const stories = await SuccessStory.find(query)
    .populate('createdBy', 'name email')
    .populate('alumni', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SuccessStory.countDocuments(query);

  return {
    stories,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

// Get story by ID - verify adminId ownership
const getStoryById = async (id, adminId) => {
  return await SuccessStory.findOne({ _id: id, adminId })
    .populate('createdBy', 'name email')
    .populate('alumni', 'name email currentCompany jobTitle')
    .populate('likes', 'name');
};

// Update story - verify adminId ownership
const updateStory = async (id, updateData, adminId) => {
  updateData.updatedAt = new Date();
  return await SuccessStory.findOneAndUpdate(
    { _id: id, adminId },
    updateData,
    { new: true }
  );
};

// Delete story - verify adminId ownership
const deleteStory = async (id, adminId) => {
  return await SuccessStory.findOneAndDelete({ _id: id, adminId });
};

// Increment views - verify adminId ownership
const incrementViews = async (id, adminId) => {
  return await SuccessStory.findOneAndUpdate(
    { _id: id, adminId },
    { $inc: { views: 1 } }
  );
};

// Toggle like - verify story belongs to college
const toggleLike = async (storyId, userId, adminId) => {
  const story = await SuccessStory.findOne({ _id: storyId, adminId });
  if (!story) throw new Error("Story not found");

  const likeIndex = story.likes.indexOf(userId);
  if (likeIndex > -1) {
    story.likes.splice(likeIndex, 1);
  } else {
    story.likes.push(userId);
  }

  return await story.save();
};

// Verify story - admin action
const verifyStory = async (id, verifierId, adminId) => {
  return await SuccessStory.findOneAndUpdate(
    { _id: id, adminId },
    {
      isVerified: true,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
      status: 'published',
      publishedAt: new Date()
    },
    { new: true }
  );
};

// Get category stats - filtered by adminId
const getCategoryStats = async (adminId) => {
  return await SuccessStory.aggregate([
    { $match: { adminId, status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

module.exports = {
  createStory,
  getStories,
  getStoryById,
  updateStory,
  deleteStory,
  incrementViews,
  toggleLike,
  verifyStory,
  getCategoryStats
};
