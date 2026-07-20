const mongoose = require('mongoose');

const connectDB = async (onConnected) => {
  try {
    const defaultAtlasUri = 'mongodb+srv://gunjan_admin:PulsePassword123@cluster0.ufglwsm.mongodb.net/projectpulse?appName=Cluster0&compressors=zlib';
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || defaultAtlasUri;
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    if (onConnected) await onConnected();
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
