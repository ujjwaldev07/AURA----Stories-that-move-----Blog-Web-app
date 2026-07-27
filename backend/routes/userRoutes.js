const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const { jwtAuth } = require('../jwt');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');

const router = express.Router();
const editableFields = ['username', 'bio', 'avatar', 'coverImage'];
const publicFields = 'email username bio avatar coverImage createdAt';

function validateId(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid user id.', 400);
}

router.get('/', jwtAuth, asyncHandler(async (req, res) => {
  const query = String(req.query.search || '').trim();
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = query ? { $or: [
    { username: { $regex: escaped, $options: 'i' } },
    { email: { $regex: escaped, $options: 'i' } },
  ] } : {};
  const users = await User.find(filter).select(publicFields).sort({ username: 1, email: 1 }).limit(8).lean();
  return res.status(200).json({ success: true, users });
}));

router.get('/:id', jwtAuth, asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const user = await User.findById(req.params.id).select(publicFields);
  if (!user) throw new AppError('User not found.', 404);
  return res.status(200).json({ success: true, user });
}));

router.put('/:id', jwtAuth, asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (req.params.id !== req.user.id) throw new AppError('You do not have permission to update this user.', 403);
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => editableFields.includes(key)));
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
  if (!user) throw new AppError('User not found.', 404);
  return res.status(200).json({ success: true, response: user });
}));

router.delete('/:id', jwtAuth, asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (req.params.id !== req.user.id) throw new AppError('You do not have permission to delete this user.', 403);
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  return res.status(200).json({ success: true, message: 'User deleted successfully.' });
}));

module.exports = router;
