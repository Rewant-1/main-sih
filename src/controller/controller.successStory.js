const SuccessStoryService = require("../service/service.successStory.js");

const createStory = async (req, res) => {
  try {
    const story = await SuccessStoryService.createStory({
      ...req.body,
      createdBy: req.user.userId
    });
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStories = async (req, res) => {
  try {
    const { status, category, featured, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (featured === 'true') filters.isFeatured = true;
    
    const stories = await SuccessStoryService.getStories(filters, page, limit);
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStoryById = async (req, res) => {
  try {
    const story = await SuccessStoryService.getStoryById(req.params.id);
    if (story) {
      // Increment view count
      await SuccessStoryService.incrementViews(req.params.id);
      res.status(200).json({ success: true, data: story });
    } else {
      res.status(404).json({ success: false, message: "Story not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const story = await SuccessStoryService.updateStory(req.params.id, req.body);
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    await SuccessStoryService.deleteStory(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const likeStory = async (req, res) => {
  try {
    const story = await SuccessStoryService.toggleLike(req.params.id, req.user.userId);
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyStory = async (req, res) => {
  try {
    const story = await SuccessStoryService.verifyStory(req.params.id, req.user.userId);
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await SuccessStoryService.getCategoryStats();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createStory,
  getStories,
  getStoryById,
  updateStory,
  deleteStory,
  likeStory,
  verifyStory,
  getCategories
};
