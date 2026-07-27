const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (!uri) {
      throw new Error('MONGODB_URI (or legacy MONGODB_URL) is not configured');
    }
    mongoose.set('sanitizeFilter', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || 10,
      minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE) || 1,
    });
    console.info('[startup] MongoDB connected', {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    });
  } catch (error) {
    console.error('[startup] MongoDB connection failed');
    console.error(error instanceof Error ? error.message : error);
    throw error;
  }
};

module.exports = connectDB;
