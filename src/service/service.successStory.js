const SuccessStory = require("../model/model.successStory.js");

const createStory = async (storyData) => {
  const story = new SuccessStory(storyData);
  return await story.save();
};

const getStories = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const stories = await SuccessStory.find(filters)
    .populate('createdBy', 'name email')
    .populate('alumni', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await SuccessStory.countDocuments(filters);
  
  return {
    stories,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

const getStoryById = async (id) => {
  return await SuccessStory.findById(id)
    .populate('createdBy', 'name email')
    .populate('alumni', 'name email currentCompany jobTitle')
    .populate('likes', 'name');
};

const updateStory = async (id, updateData) => {
  updateData.updatedAt = new Date();
  return await SuccessStory.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteStory = async (id) => {
  return await SuccessStory.findByIdAndDelete(id);
};

const incrementViews = async (id) => {
  return await SuccessStory.findByIdAndUpdate(id, { $inc: { views: 1 } });
};

const toggleLike = async (storyId, userId) => {
  const story = await SuccessStory.findById(storyId);
  if (!story) throw new Error("Story not found");
  
  const likeIndex = story.likes.indexOf(userId);
  if (likeIndex > -1) {
    story.likes.splice(likeIndex, 1);
  } else {
    story.likes.push(userId);
  }
  
  return await story.save();
};

const verifyStory = async (id, verifierId) => {
  return await SuccessStory.findByIdAndUpdate(id, {
    isVerified: true,
    verifiedBy: verifierId,
    verifiedAt: new Date(),
    status: 'published',
    publishedAt: new Date()
  }, { new: true });
};

const getCategoryStats = async () => {
  return await SuccessStory.aggregate([
    { $match: { status: 'published' } },
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
