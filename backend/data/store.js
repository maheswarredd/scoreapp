const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const MATCHES_FILE = path.join(__dirname, 'matches.json');
const ADMINS_FILE = path.join(__dirname, 'admins.json');

// Ensure files exist
if (!fs.existsSync(MATCHES_FILE)) {
  fs.writeFileSync(MATCHES_FILE, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(ADMINS_FILE)) {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify([], null, 2), 'utf8');
}

let isMongoConnected = false;

function setMongoConnected(status) {
  isMongoConnected = status;
}

function getMongoConnected() {
  return isMongoConnected;
}

// File system helpers
function readMatches() {
  try {
    const data = fs.readFileSync(MATCHES_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function writeMatches(matches) {
  fs.writeFileSync(MATCHES_FILE, JSON.stringify(matches, null, 2), 'utf8');
}

// Unified Match Store
const MatchStore = {
  async getAll() {
    if (isMongoConnected) {
      const Match = mongoose.model('Match');
      return await Match.find().sort({ createdAt: -1 });
    }
    const matches = readMatches();
    return matches.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  async getById(id) {
    if (isMongoConnected) {
      const Match = mongoose.model('Match');
      return await Match.findById(id);
    }
    const matches = readMatches();
    return matches.find(m => m._id === id || m.id === id) || null;
  },

  async create(matchData) {
    if (isMongoConnected) {
      const Match = mongoose.model('Match');
      const match = new Match(matchData);
      return await match.save();
    }
    const matches = readMatches();
    const newMatch = {
      ...matchData,
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    matches.unshift(newMatch);
    writeMatches(matches);
    return newMatch;
  },

  async update(id, updateData) {
    if (isMongoConnected) {
      const Match = mongoose.model('Match');
      // Controllers sometimes pass a whole Mongoose document back in - convert to a
      // plain object and drop immutable fields so MongoDB never rejects the update.
      const plain = updateData && typeof updateData.toObject === 'function'
        ? updateData.toObject()
        : { ...updateData };
      delete plain._id;
      delete plain.__v;
      delete plain.createdAt;
      delete plain.updatedAt;
      return await Match.findByIdAndUpdate(id, plain, { new: true });
    }
    const matches = readMatches();
    const index = matches.findIndex(m => m._id === id || m.id === id);
    if (index === -1) return null;
    
    matches[index] = {
      ...matches[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeMatches(matches);
    return matches[index];
  },

  async delete(id) {
    if (isMongoConnected) {
      const Match = mongoose.model('Match');
      return await Match.findByIdAndDelete(id);
    }
    let matches = readMatches();
    const match = matches.find(m => m._id === id || m.id === id);
    matches = matches.filter(m => m._id !== id && m.id !== id);
    writeMatches(matches);
    return match || null;
  }
};

module.exports = {
  MatchStore,
  setMongoConnected,
  getMongoConnected
};
