const express = require('express');
const { body } = require('express-validator');
const { jwtAuth } = require('../jwt');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const postController = require('../controllers/postController');

const router = express.Router();
const postRules = [
  body('title').isString().trim().isLength({ min: 4, max: 200 }),
  body('content').isString().trim().isLength({ min: 20 }),
  body('category').optional().isString().trim().isLength({ max: 80 }),
  body('author').optional().custom(() => { throw new Error('Author is assigned from the authenticated user.'); }),
];
const updateRules = [
  body('title').optional().isString().trim().isLength({ min: 4, max: 200 }),
  body('content').optional().isString().trim().isLength({ min: 20 }),
  body('excerpt').optional().isString().trim().isLength({ max: 300 }),
  body('category').optional().isString().trim().isLength({ max: 80 }),
  body('tags').optional().isArray({ max: 10 }),
  body('tags.*').optional().isString().trim().isLength({ min: 1, max: 40 }),
  body('status').optional().isIn(['draft', 'published']),
];

router.get('/', asyncHandler(postController.listPosts));
router.post('/create', jwtAuth, postRules, validate, asyncHandler(postController.createPost));
router.get('/user/:id', asyncHandler(postController.getUserPosts));
router.get('/:id', asyncHandler(postController.getPost));
router.put('/:id', jwtAuth, updateRules, validate, asyncHandler(postController.updatePost));
router.delete('/:id', jwtAuth, asyncHandler(postController.deletePost));
router.post('/:id/like', jwtAuth, asyncHandler(postController.toggleLike));

module.exports = router;
