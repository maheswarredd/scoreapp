const mongoose = require('mongoose');
const { setMongoConnected } = require('../data/store');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/crexscore';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
    setMongoConnected(true);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to local/remote MongoDB (${err.message}).`);
    console.log(`[Store] Operating in zero-config persistent storage mode (backend/data/matches.json).`);
    setMongoConnected(false);
  }
};

module.exports = connectDB;
