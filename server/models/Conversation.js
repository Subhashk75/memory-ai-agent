const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  tone: {
    type: String,
    enum: ['neutral', 'happy', 'sad', 'angry', 'excited', 'calm'],
    default: 'neutral'
  },
  tokens: {
    type: Number,
    default: 0
  }
});

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  messages: [messageSchema],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  summary: String,
  emotionTrend: {
    type: [String],
    default: []
  },
  tokenCount: {
    type: Number,
    default: 0
  },
  metadata: {
    device: String,
    browser: String
  }
});

conversationSchema.index({ userId: 1, startTime: -1 });
conversationSchema.index({ sessionId: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;