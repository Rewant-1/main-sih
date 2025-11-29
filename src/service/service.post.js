const Post = require("../model/model.post.js");

const createPost = async (postData) => {
  try {
    const newPost = new Post(postData);
    const savedPost = await newPost.save();
    return savedPost;
  } catch (error) {
    throw error;
  }
};

const getPosts = async () => {
  try {
    const posts = await Post.find().populate("postedBy").populate("likes").populate("comments.user");
    return posts;
  } catch (error) {
    throw error;
  }
};

const getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId).populate("postedBy").populate("likes").populate("comments.user");
    return post;
  } catch (error) {
    throw error;
  }
};

const updatePost = async (postId, postData) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(postId, postData, {
      new: true,
    });
    return updatedPost;
  } catch (error) {
    throw error;
  }
};

const deletePost = async (postId) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(postId);
    return deletedPost;
  } catch (error) {
    throw error;
  }
};

const likePost = async (postId, userId) => {
    try {
        const post = await Post.findById(postId);
        if (post.likes.includes(userId)) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }
        await post.save();
        return post;
    } catch (error) {
        throw error;
    }
}

const commentOnPost = async (postId, commentData) => {
    try {
        const post = await Post.findById(postId);
        post.comments.push(commentData);
        await post.save();
        return post;
    } catch (error) {
        throw error;
    }
}

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentOnPost,
};
