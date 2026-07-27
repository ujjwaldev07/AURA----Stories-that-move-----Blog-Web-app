const express = require('express');
const mongoose = require('mongoose');
const { body } = require('express-validator');
const Comment = require('../models/comment');
const Post = require('../models/post');
const { jwtAuth } = require('../jwt');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');

const router = express.Router();
const authorSelect = 'email username avatar bio';
const validId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError(`Invalid ${label} id.`, 400);
};

router.post('/create', jwtAuth, [
  body('content').isString().trim().isLength({ min: 2, max: 1000 }),
  body('post').optional().isMongoId(),
  body('blog').optional().isMongoId(),
  body('parentId').optional({ nullable: true }).isMongoId(),
], validate, asyncHandler(async (req, res) => {
  const postId = req.body.post || req.body.blog;
  validId(postId, 'post');
  if (!await Post.exists({ _id: postId })) throw new AppError('Post not found.', 404);
  const comment = await Comment.create({ content: req.body.content, post: postId, parentId: req.body.parentId || null, author: req.user.id });
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
  return res.status(201).json({ success: true, savedComment: await comment.populate('author', authorSelect) });
}));

router.get('/post/:id', asyncHandler(async (req, res) => {
  validId(req.params.id, 'post');
  const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: 1 }).populate('author', authorSelect).lean();
  return res.status(200).json({ success: true, comments });
}));

router.put('/:id', jwtAuth, [body('content').isString().trim().isLength({ min: 2, max: 1000 })], validate, asyncHandler(async (req, res) => {
  validId(req.params.id, 'comment');
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError('Comment not found.', 404);
  if (comment.author.toString() !== req.user.id) throw new AppError('You do not have permission to update this comment.', 403);
  comment.content = req.body.content;
  await comment.save();
  return res.status(200).json({ success: true, response: await comment.populate('author', authorSelect) });
}));

router.delete('/:id', jwtAuth, asyncHandler(async (req, res) => {
  validId(req.params.id, 'comment');
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError('Comment not found.', 404);
  if (comment.author.toString() !== req.user.id) throw new AppError('You do not have permission to delete this comment.', 403);
  await Promise.all([
    comment.deleteOne(),
    Post.findByIdAndUpdate(comment.post, [
      { $set: { commentsCount: { $max: [0, { $subtract: [{ $ifNull: ['$commentsCount', 0] }, 1] }] } } },
    ]),
  ]);
  return res.status(200).json({ success: true, message: 'Comment deleted successfully.' });
}));

module.exports = router;
