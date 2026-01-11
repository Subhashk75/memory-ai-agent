const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: 'Friend'
  },
  preferences: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  tonePreference: {
    type: String,
    enum: ['friendly', 'professional', 'casual', 'empathetic', 'playful'],
    default: 'friendly'
  },
  conversationSummary: {
    type: String,
    default: 'New user. No previous conversations.'
  },
  personalityTraits: {
    type: [String],
    default: ['curious', 'helpful']
  },
  memoryFragments: [{
    key: String,
    value: String,
    confidence: Number,
    lastAccessed: Date
  }],
  sessionCount: {
    type: Number,
    default: 0
  },
  lastSession: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userSchema.index({ userId: 1 });
userSchema.index({ 'memoryFragments.key': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;