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

const getPosts = async (adminId) => {
  try {
    // Build filter - if adminId is provided, filter by it; otherwise return all
    const filter = adminId ? { adminId } : {};
    const posts = await Post.find(filter).populate("postedBy").populate("likes").populate("comments.user");
    return posts;
  } catch (error) {
    throw error;
  }
};

const getPostById = async (postId, adminId) => {
  try {
    // Build filter - if adminId is provided, filter by it; otherwise just by id
    const filter = adminId ? { _id: postId, adminId } : { _id: postId };
    const post = await Post.findOne(filter).populate("postedBy").populate("likes").populate("comments.user");
    return post;
  } catch (error) {
    throw error;
  }
};

const updatePost = async (postId, postData, adminId) => {
  try {
    // Build filter - if adminId is provided, filter by it; otherwise just by id
    const filter = adminId ? { _id: postId, adminId } : { _id: postId };
    const updatedPost = await Post.findOneAndUpdate(
      filter,
      postData,
      { new: true }
    );
    return updatedPost;
  } catch (error) {
    throw error;
  }
};

const deletePost = async (postId, adminId) => {
  try {
    // Build filter - if adminId is provided, filter by it; otherwise just by id
    const filter = adminId ? { _id: postId, adminId } : { _id: postId };
    const deletedPost = await Post.findOneAndDelete(filter);
    return deletedPost;
  } catch (error) {
    throw error;
  }
};

const likePost = async (postId, userId, adminId) => {
  try {
    const post = await Post.findOne({ _id: postId, adminId });
    if (!post) {
      throw new Error("Post not found");
    }
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

const commentOnPost = async (postId, commentData, adminId) => {
  try {
    const post = await Post.findOne({ _id: postId, adminId });
    if (!post) {
      throw new Error("Post not found");
    }
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
