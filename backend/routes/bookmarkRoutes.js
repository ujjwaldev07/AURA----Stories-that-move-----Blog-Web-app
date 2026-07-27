const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const { jwtAuth } = require('../jwt');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');

const router = express.Router();

router.get('/', jwtAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('bookmarks').lean();
  return res.status(200).json({ bookmarks: (user?.bookmarks || []).map(String) });
}));

router.post('/:postId', jwtAuth, asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!mongoose.isValidObjectId(postId)) throw new AppError('Invalid post id.', 400);
  if (!await Post.exists({ _id: postId })) throw new AppError('Post not found.', 404);
  const user = await User.findById(req.user.id).select('bookmarks');
  if (!user) throw new AppError('User not found.', 404);
  const bookmarked = user.bookmarks.some((id) => id.toString() === postId);
  await User.findByIdAndUpdate(req.user.id, bookmarked
    ? { $pull: { bookmarks: postId } }
    : { $addToSet: { bookmarks: postId } });
  return res.status(200).json({ bookmarked: !bookmarked });
}));

module.exports = router;
