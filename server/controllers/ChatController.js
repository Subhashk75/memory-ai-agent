const MemoryService = require('../services/MemoryService');
const GeminiService = require('../services/GeminiService');
const ToneService = require('../services/ToneService');
const { v4: uuidv4 } = require('uuid');

class ChatController {
  async handleMessage(req, res) {
    try {
      const { message, userId, sessionId: clientSessionId } = req.body;
      
      // Validate input
      if (!message || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Message and userId are required'
        });
      }
      
      // Generate or use session ID
      const sessionId = clientSessionId || `session_${uuidv4()}`;
      
      // Get or create user profile with memory
      const { user, shortTermMemory } = await MemoryService.getUserProfile(userId, sessionId);
      
      // Detect tone from user input
      const detectedTone = GeminiService.detectTone(message);
      
      // Update user's tone preference
      const userTone = ToneService.updateUserTonePreference(userId, detectedTone);
      
      // Get memory context
      const memoryContext = await MemoryService.getMemoryContext(userId);
      
      // Update short-term memory with user message
      MemoryService.updateShortTermMemory(sessionId, {
        role: 'user',
        content: message,
        tone: detectedTone,
        timestamp: new Date()
      });
      
      // Generate AI response
      const rawResponse = await GeminiService.generateResponse(
        message,
        memoryContext,
        userTone,
        shortTermMemory
      );
      
      // Adapt response based on tone
      const adaptedResponse = ToneService.adaptResponse(
        rawResponse,
        detectedTone,
        user.tonePreference
      );
      
      // Update short-term memory with AI response
      MemoryService.updateShortTermMemory(sessionId, {
        role: 'assistant',
        content: adaptedResponse,
        tone: userTone,
        timestamp: new Date()
      });
      
      // Extract and store facts from this exchange
      await MemoryService.extractAndStoreFacts(userId, message, adaptedResponse);
      
      // Get updated short-term memory
      const updatedShortTermMemory = MemoryService.shortTermMemory.get(sessionId) || [];
      
      // Prepare response
      const response = {
        success: true,
        sessionId,
        response: adaptedResponse,
        memory: {
          shortTerm: updatedShortTermMemory.slice(-3), // Last 3 messages
          longTerm: {
            name: user.name,
            preferences: user.preferences,
            tonePreference: user.tonePreference
          }
        },
        metadata: {
          detectedTone,
          userTone,
          hasMemory: memoryContext !== 'No significant memories yet.'
        }
      };
      console.log("chatbot end api" , response);
      res.json(response);
      
      // Periodically summarize conversation (every 10 messages)
      if (updatedShortTermMemory.length % 10 === 0) {
        setTimeout(async () => {
          await MemoryService.summarizeConversation(
            sessionId,
            userId,
            updatedShortTermMemory
          );
        }, 0);
      }
      
    } catch (error) {
      console.error('Error in handleMessage:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

 async getUserMemory(req, res) {
  try {
    const {userId} =  req.query; // Check both
    
    console.log("this is userId", userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    const memoryContext = await MemoryService.getMemoryContext(userId);
    console.log("inside memoryContext", memoryContext);
    
    res.json({
      success: true,
      userId,
      memory: memoryContext,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error in getUserMemory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve memory'
    });
  }
}

  async clearSession(req, res) {
    try {
      const { sessionId } = req.body;
      
      if (sessionId) {
        MemoryService.clearSessionMemory(sessionId);
      }
      console.log("session id in clearSession ",sessionId)
      res.json({
        success: true,
        message: 'Session memory cleared'
      });
    } catch (error) {
      console.error('Error clearing session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear session'
      });
    }
  }
  
  async getConversationHistory(req, res) {
    try {
      const { userId, limit = 10 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }
      
      // In production, fetch from Conversation model
      // For now, return empty or mock data
      console.log(userId);
      res.json({
        success: true,
        userId,
        conversations: [],
        message: 'Conversation history feature coming soon'
      });
    } catch (error) {
      console.error('Error getting history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve history'
      });
    }
  }
}

module.exports = new ChatController();