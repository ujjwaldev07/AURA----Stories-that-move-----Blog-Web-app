const express = require('express');
const fs = require('fs/promises');
const { jwtAuth } = require('../jwt');
const { uploadImage } = require('../config/multer');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');

const router = express.Router();

function hasExpectedImageSignature(buffer, mimeType) {
  if (mimeType === 'image/jpeg') return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (mimeType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === 'image/gif') return buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a';
  if (mimeType === 'image/webp') return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
}

router.post('/', jwtAuth, uploadImage.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided.' });
  const header = await fs.readFile(req.file.path, { encoding: null }).then((file) => file.subarray(0, 12));
  if (!hasExpectedImageSignature(header, req.file.mimetype)) {
    await fs.unlink(req.file.path).catch(() => undefined);
    throw new AppError('Image content does not match its declared type.', 400);
  }
  const path = `/images/${req.file.filename}`;
  return res.status(201).json({
    success: true,
    file: { filename: req.file.filename, path, mimetype: req.file.mimetype, size: req.file.size },
  });
}));

module.exports = router;
