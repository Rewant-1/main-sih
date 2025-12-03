const PostService = require("../service/service.post.js");

const createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author: req.user?.userId || req.body.author
    };
    const post = await PostService.createPost(postData);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await PostService.getPosts();
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await PostService.getPostById(req.params.id);
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
    const post = await PostService.updatePost(req.params.id, req.body);
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
    const post = await PostService.deletePost(req.params.id);
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
    const post = await PostService.likePost(req.params.id, req.user.userId);
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const commentData = {
      ...req.body,
      author: req.user?.userId || req.body.author
    };
    const post = await PostService.commentOnPost(req.params.id, commentData);
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
