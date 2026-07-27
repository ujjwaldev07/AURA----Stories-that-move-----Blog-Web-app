const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { uploadDirectory } = require('../config/multer');
const { AppError } = require('../utils/appError');

const AUTHOR_SELECT = 'email username avatar bio';
const MAX_PAGE_SIZE = 50;

function normalizeCoverImage(value) {
  if (!value) return '';
  if (typeof value !== 'string' || !/^\/images\/[a-f0-9-]+\.(?:jpg|png|webp|gif)$/i.test(value)) {
    throw new AppError('coverImage must be the image path returned by the upload endpoint.', 400);
  }
  return value;
}

function parsePagination(query) {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 20;
  return {
    page: Math.max(page, 1),
    limit: Math.min(Math.max(limit, 1), MAX_PAGE_SIZE),
  };
}

function buildListFilter(query) {
  const filter = { status: 'published' };
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const category = typeof query.category === 'string' ? query.category.trim() : '';

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { content: { $regex: escaped, $options: 'i' } },
      { tags: { $regex: escaped, $options: 'i' } },
      // Legacy data written before the `tages` typo was corrected remains searchable.
      { tages: { $regex: escaped, $options: 'i' } },
    ];
  }
  if (category) filter.category = category;
  return filter;
}

async function listPosts(query) {
  const filter = buildListFilter(query);
  const { page, limit } = parsePagination(query);
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', AUTHOR_SELECT)
      .lean(),
    Post.countDocuments(filter),
  ]);
  return { posts, page, limit, total, hasMore: page * limit < total, filter };
}

async function getPostById(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid post id.', 400);
  const post = await Post.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
    .populate('author', AUTHOR_SELECT);
  if (!post) throw new AppError('Post not found.', 404);
  return post;
}

async function getUserPosts(userId) {
  if (!mongoose.isValidObjectId(userId)) throw new AppError('Invalid user id.', 400);
  return Post.find({ author: userId }).sort({ createdAt: -1 }).populate('author', AUTHOR_SELECT).lean();
}

async function createPost(payload, userId) {
  const { tages, ...safePayload } = payload;
  const post = await Post.create({
    ...safePayload,
    coverImage: normalizeCoverImage(safePayload.coverImage),
    tags: safePayload.tags || tages,
    author: userId,
  });
  return post.populate('author', AUTHOR_SELECT);
}

async function updatePost(id, payload, userId) {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid post id.', 400);
  const post = await Post.findById(id);
  if (!post) throw new AppError('Post not found.', 404);
  if (post.author.toString() !== userId) throw new AppError('You do not have permission to update this post.', 403);
  const allowedFields = ['title', 'content', 'excerpt', 'coverImage', 'category', 'tags', 'status', 'slug'];
  const updates = Object.fromEntries(Object.entries(payload).filter(([key]) => allowedFields.includes(key)));
  if (payload.tages && !updates.tags) updates.tags = payload.tages;
  if ('coverImage' in updates) updates.coverImage = normalizeCoverImage(updates.coverImage);
  Object.assign(post, updates);
  await post.save();
  return post.populate('author', AUTHOR_SELECT);
}

async function deletePost(id, userId) {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid post id.', 400);
  const post = await Post.findById(id);
  if (!post) throw new AppError('Post not found.', 404);
  if (post.author.toString() !== userId) throw new AppError('You do not have permission to delete this post.', 403);
  await Promise.all([post.deleteOne(), Comment.deleteMany({ post: id })]);
  if (/^\/images\/[a-f0-9-]+\.(?:jpg|png|webp|gif)$/i.test(post.coverImage || '')) {
    const filename = path.basename(post.coverImage);
    try {
      await fs.unlink(path.join(uploadDirectory, filename));
    } catch (error) {
      if (error.code !== 'ENOENT') console.error('[posts] failed to remove cover image', error);
    }
  }
}

async function toggleLike(id, userId) {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid post id.', 400);
  const post = await Post.findById(id);
  if (!post) throw new AppError('Post not found.', 404);
  const liked = post.likes.some((like) => like.toString() === userId);
  post.likes = liked ? post.likes.filter((like) => like.toString() !== userId) : [...post.likes, userId];
  await post.save();
  return { post: await post.populate('author', AUTHOR_SELECT), liked: !liked };
}

module.exports = { listPosts, getPostById, getUserPosts, createPost, updatePost, deletePost, toggleLike };
