const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');

// Main chat endpoint
router.post('/chat', ChatController.handleMessage);

// Get user memory
router.get('/memory', ChatController.getUserMemory);

// Clear session memory
router.post('/session/clear', ChatController.clearSession);

// Get conversation history
router.get('/history', ChatController.getConversationHistory);

// ✅ ADD THIS: Health check endpoint
// router.get('/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     service: 'Chat API',
//     timestamp: new Date(),
//     endpoints: {
//       chat: 'POST /api/chat',
//       memory: 'GET /api/memory/:userId',
//       health: 'GET /api/health',
//       clear: 'POST /api/session/clear',
//       history: 'GET /api/history'
//     }
//   });
// });

module.exports = router;