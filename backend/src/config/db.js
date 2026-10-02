const mongoose = require('mongoose');
const getMongoUri = require('./mongoUri');

const connectDB = async () => {
  const mongoURI = getMongoUri();

  if (!mongoURI) {
    console.warn('No Mongo URI configured. Running in demo mode without MongoDB.');
    return false;
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed. Check your MONGO_URI:', error.message);
    return false;
  }
};

module.exports = connectDB;
