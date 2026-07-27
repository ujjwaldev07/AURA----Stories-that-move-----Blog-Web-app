/* One-time data migration for the corrected post/comment foreign-key fields.
 * Usage: node scripts/migratePostSchema.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) throw new Error('MONGODB_URI is not configured');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const postResult = await db.collection('posts').updateMany(
    { tags: { $exists: false }, tages: { $exists: true } },
    [{ $set: { tags: '$tages' } }, { $unset: 'tages' }],
  );
  const commentResult = await db.collection('comments').updateMany(
    { post: { $exists: false }, blog: { $exists: true } },
    [{ $set: { post: '$blog' } }, { $unset: 'blog' }],
  );

  console.info('[migration] posts updated:', postResult.modifiedCount);
  console.info('[migration] comments updated:', commentResult.modifiedCount);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('[migration] failed:', error.message);
  process.exit(1);
});
