const PostService = require("../service/service.post.js");

// Helper to extract college ID (adminId) from request
const getCollegeId = (req) => {
  return req.admin?.adminId || req.user?.adminId;
};

const createPost = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) {
      return res.status(403).json({ success: false, message: "Unauthorized: No college ID found" });
    }

    const postData = {
      ...req.body,
      postedBy: req.user?.userId || req.body.postedBy || req.body.author,
      adminId: collegeId
    };
    const post = await PostService.createPost(postData);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) {
      return res.status(403).json({ success: false, message: "Unauthorized: No college ID found" });
    }
    const posts = await PostService.getPosts(collegeId);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) {
      return res.status(403).json({ success: false, message: "Unauthorized: No college ID found" });
    }
    const post = await PostService.getPostById(req.params.id, collegeId);
    if (post) {
      res.status(200).json({ success: true, data: post });
    } else {
      res.status(404).json({ success: false, message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) {
      return res.status(403).json({ success: false, message: "Unauthorized: No college ID found" });
    }
    const post = await PostService.updatePost(req.params.id, req.body, collegeId);
    if (post) {
      res.status(200).json({ success: true, data: post });
    } else {
      res.status(404).json({ success: false, message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) {
      return res.status(403).json({ success: false, message: "Unauthorized: No college ID found" });
    }
    const post = await PostService.deletePost(req.params.id, collegeId);
    if (post) {
      res.status(200).json({ success: true, message: "Post deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) {
      return res.status(403).json({ success: false, message: "Unauthorized: No college ID found" });
    }
    const userId = req.user?.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const post = await PostService.likePost(req.params.id, userId, collegeId);
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const collegeId = getCollegeId(req);
    if (!collegeId) {
      return res.status(403).json({ success: false, message: "Unauthorized: No college ID found" });
    }
    const userId = req.user?.userId || req.body.author || req.body.userId;

    const commentData = {
      ...req.body,
      user: userId,
      author: userId
    };
    const post = await PostService.commentOnPost(req.params.id, commentData, collegeId);
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentOnPost,
};
