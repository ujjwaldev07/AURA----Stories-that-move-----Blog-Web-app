const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user');
const { jwtAuth, generateJWT } = require('../jwt');
const { validate } = require('../middleware/validate');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookies.js');
const { verifyGoogleCredential } = require('../services/googleAuthService.js');

const router = express.Router();

const registerRules = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must include a letter')
    .matches(/[0-9]/)
    .withMessage('Password must include a number'),
];

const loginRules = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

function publicUser(user) {
  return {
    _id: user._id,
    email: user.email,
    username: user.username || undefined,
    bio: user.bio || '',
    avatar: user.avatar || '',
    coverImage: user.coverImage || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// POST /api/auth/register
router.post('/register', registerRules, validate, async (req, res) => {
  try {
    const email = String(req.body.email).toLowerCase().trim();
    const password = String(req.body.password);

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const user = await User.create({ email, password });
    const token = generateJWT({ id: user._id.toString(), email: user.email });
    setAuthCookie(res, token);

    return res.status(201).json({
      message: 'Account created successfully',
      user: publicUser(user),
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Unable to create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', loginRules, validate, async (req, res) => {
  try {
    const email = String(req.body.email).toLowerCase().trim();
    const password = String(req.body.password);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const token = generateJWT({ id: user._id.toString(), email: user.email });
    setAuthCookie(res, token);

    return res.status(200).json({
      message: 'Logged in successfully',
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Unable to sign in. Please try again.' });
  }
});

// POST /api/auth/google — Google Identity Services ID token exchange.
// The server verifies the signature, audience, issuer, expiry, and email verification.
router.post('/google', body('credential').isString().notEmpty(), validate, async (req, res) => {
  try {
    const identity = await verifyGoogleCredential(req.body.credential);
    let user = await User.findOne({ googleId: identity.googleId });

    if (!user) {
      user = await User.findOne({ email: identity.email });
      if (user) {
        // A verified Google email can safely link to the matching local account.
        user.googleId = identity.googleId;
        if (!user.avatar && identity.avatar) user.avatar = identity.avatar;
        if (!user.username && identity.username) user.username = identity.username;
        await user.save();
      } else {
        user = await User.create({
          email: identity.email,
          googleId: identity.googleId,
          username: identity.username,
          avatar: identity.avatar,
        });
      }
    }

    const token = generateJWT({ id: user._id.toString(), email: user.email });
    setAuthCookie(res, token);
    return res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully.',
      user: publicUser(user),
    });
  } catch (err) {
    const status = err.statusCode || 500;
    if (status >= 500) console.error('Google authentication error:', err);
    return res.status(status).json({
      success: false,
      message: status >= 500 ? 'Unable to sign in with Google. Please try again.' : err.message,
    });
  }
});

// POST /api/auth/logout  (+ GET for backward compatibility)
async function logoutHandler(_req, res) {
  clearAuthCookie(res);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

router.post('/logout', logoutHandler);

router.get('/csrf', (_req, res) => res.status(200).json({ csrfToken: res.locals.csrfToken }));

// GET /api/auth/refetch — restore session from cookie or Bearer token
router.get('/refetch', async (req, res) => {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
    const token = bearer || req.signedCookies?.token || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const expired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        message: expired
          ? 'Session expired. Please sign in again.'
          : 'Unauthorized. Invalid token.',
        code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      });
    }

    const userId = decoded.id || decoded.userData?.id;
    const email = decoded.email || decoded.userData?.email;

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }
    if (!user && email) {
      user = await User.findOne({ email: String(email).toLowerCase() });
    }

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json({
      user: publicUser(user),
      // backward-compatible shape used by older frontend mapping
      userData: { email: user.email, id: user._id.toString() },
      id: user._id.toString(),
      email: user.email,
    });
  } catch (err) {
    console.error('Refetch error:', err);
    return res.status(500).json({ message: 'Unable to restore session.' });
  }
});

// GET /api/auth/me — authenticated current user
router.get('/me', jwtAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ message: 'Unable to fetch profile.' });
  }
});

// GET /api/auth/ — list users (public emails only)
module.exports = router;
