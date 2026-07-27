const postService = require('../services/postService');

function requestUserId(req) {
  return req.user?.id || req.user?._id;
}

async function listPosts(req, res) {
  const result = await postService.listPosts(req.query);
  return res.status(200).json({ success: true, posts: result.posts, meta: {
    page: result.page, limit: result.limit, total: result.total, hasMore: result.hasMore,
  } });
}

async function getPost(req, res) {
  const post = await postService.getPostById(req.params.id);
  return res.status(200).json({ success: true, post });
}

async function getUserPosts(req, res) {
  const posts = await postService.getUserPosts(req.params.id);
  return res.status(200).json({ success: true, posts });
}

async function createPost(req, res) {
  const post = await postService.createPost(req.body, requestUserId(req));
  return res.status(201).json({ success: true, savedPost: post });
}

async function updatePost(req, res) {
  const post = await postService.updatePost(req.params.id, req.body, requestUserId(req));
  return res.status(200).json({ success: true, response: post });
}

async function deletePost(req, res) {
  await postService.deletePost(req.params.id, requestUserId(req));
  return res.status(200).json({ success: true, message: 'Post deleted successfully.' });
}

async function toggleLike(req, res) {
  const result = await postService.toggleLike(req.params.id, requestUserId(req));
  return res.status(200).json({ success: true, ...result });
}

module.exports = { listPosts, getPost, getUserPosts, createPost, updatePost, deletePost, toggleLike };
