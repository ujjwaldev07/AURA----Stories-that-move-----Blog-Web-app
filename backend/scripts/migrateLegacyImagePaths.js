/* Normalizes legacy image values after moving legacy files to their referenced names.
 * Usage: node scripts/migrateLegacyImagePaths.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/post');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URL);
  const posts = await Post.find({ coverImage: { $type: 'string', $ne: '' } });
  let updated = 0;
  for (const post of posts) {
    if (!post.coverImage.startsWith('/images/')) {
      post.coverImage = `/images/${post.coverImage.replace(/^\/+/, '')}`;
      await post.save();
      updated += 1;
    }
  }
  console.info(`[migration] normalized ${updated} legacy image path(s).`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('[migration] failed:', error.message);
  process.exit(1);
});
