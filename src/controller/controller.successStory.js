const SuccessStoryService = require("../service/service.successStory.js");

// Helper to extract college ID (adminId) from request
const getCollegeId = (req) => {
  return req.admin?.adminId || req.user?.adminId;
};

const createStory = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized." });

    // CreatedBy logic: Admin or User?
    // If Student submit story, createdBy is user. If Admin create, it's admin.
    const createdBy = req.user?.userId || req.admin?._id;

    const story = await SuccessStoryService.createStory({
      ...req.body,
      createdBy
    }, collegeId);
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStories = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized." });

    const { status, category, featured, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (featured === 'true') filters.isFeatured = true;

    const stories = await SuccessStoryService.getStories(collegeId, filters, page, limit);
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStoryById = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized." });

    const story = await SuccessStoryService.getStoryById(req.params.id, collegeId);
    if (story) {
      // Increment view count
      await SuccessStoryService.incrementViews(req.params.id, collegeId);
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
    const collegeId = getCollegeId(req);
    if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized." });

    const story = await SuccessStoryService.updateStory(req.params.id, req.body, collegeId);
    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized." });

    const story = await SuccessStoryService.deleteStory(req.params.id, collegeId);
    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const likeStory = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized." });

    const userId = req.user?.userId || req.body.userId;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    const story = await SuccessStoryService.toggleLike(req.params.id, userId, collegeId);
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyStory = async (req, res) => {
  try {
    // Usually Admin only, so use req.admin explicitly or check role? 
    // But getCollegeId allows minimal isolation check. verifyAdmin middleware handles role.
    const collegeId = getCollegeId(req);
    if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized." });

    const story = await SuccessStoryService.verifyStory(req.params.id, req.admin?._id, collegeId);
    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) return res.status(403).json({ success: false, message: "Unauthorized." });

    const categories = await SuccessStoryService.getCategoryStats(collegeId);
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
