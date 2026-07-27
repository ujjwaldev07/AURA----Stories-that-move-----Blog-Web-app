/**
 * One-time / ops helper: remove legacy password unique index,
 * ensure email is unique.
 *
 * Usage: node scripts/fixUserIndexes.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  const col = mongoose.connection.collection('users');

  const indexes = await col.indexes();
  console.log('Current indexes:', indexes.map((i) => i.name));

  if (indexes.some((i) => i.name === 'password_1')) {
    await col.dropIndex('password_1');
    console.log('Dropped legacy password_1 unique index');
  }

  // Deduplicate emails (keep oldest)
  const dups = await col
    .aggregate([
      { $group: { _id: '$email', ids: { $push: '$_id' }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
    ])
    .toArray();

  for (const d of dups) {
    await col.deleteMany({ _id: { $in: d.ids.slice(1) } });
    console.log(`Removed ${d.ids.length - 1} duplicate(s) for ${d._id}`);
  }

  await col.createIndex({ email: 1 }, { unique: true });
  console.log('Ensured unique email index');
  console.log('Done:', await col.indexes());
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
