const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ins';
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB (ins)');
};

module.exports = connectDB;
