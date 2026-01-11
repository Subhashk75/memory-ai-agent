const User = require('../models/User');
const Conversation = require('../models/Conversation');

class MemoryService {
  constructor() {
    this.shortTermMemory = new Map(); // sessionId -> messages
    this.maxShortTermMessages = parseInt(process.env.MAX_MEMORY_MESSAGES) || 10;
  }

  // Get or create user profile
  async getUserProfile(userId, sessionId) {
    try {
      let user = await User.findOne({ userId });
      
      if (!user) {
        user = new User({
          userId,
          sessionCount: 1
        });
        await user.save();
      } else {
        user.sessionCount += 1;
        user.lastSession = new Date();
        await user.save();
      }

      // Initialize short-term memory for this session
      if (!this.shortTermMemory.has(sessionId)) {
        this.shortTermMemory.set(sessionId, []);
      }

      return {
        user,
        shortTermMemory: this.shortTermMemory.get(sessionId)
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  // Update short-term memory
  updateShortTermMemory(sessionId, message) {
    if (!this.shortTermMemory.has(sessionId)) {
      this.shortTermMemory.set(sessionId, []);
    }
    
    const memory = this.shortTermMemory.get(sessionId);
    memory.push(message);
    
    // Keep only last N messages
    if (memory.length > this.maxShortTermMessages) {
      memory.shift();
    }
    
    return memory;
  }

  // Extract and store facts from conversation
  async extractAndStoreFacts(userId, userMessage, aiResponse) {
    try {
      const user = await User.findOne({ userId });
      if (!user) return;

      // Simple fact extraction (in production, use NLP here)
      const facts = this.extractPotentialFacts(userMessage);
      
      for (const fact of facts) {
        const existingIndex = user.memoryFragments.findIndex(
          m => m.key === fact.key
        );
        
        if (existingIndex >= 0) {
          // Update confidence
          user.memoryFragments[existingIndex].confidence += 0.1;
          user.memoryFragments[existingIndex].lastAccessed = new Date();
        } else {
          // Add new fact
          user.memoryFragments.push({
            key: fact.key,
            value: fact.value,
            confidence: 0.7,
            lastAccessed: new Date()
          });
        }
      }
      
      await user.save();
    } catch (error) {
      console.error('Error extracting facts:', error);
    }
  }

  extractPotentialFacts(message) {
    const facts = [];
    const lowerMessage = message.toLowerCase();
    
    // Name detection
    if (lowerMessage.includes('my name is') || lowerMessage.includes("i'm") || lowerMessage.includes('i am')) {
      const nameMatch = message.match(/(?:my name is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (nameMatch && nameMatch[1]) {
        facts.push({ key: 'name', value: nameMatch[1] });
      }
    }
    
    // Location detection
    if (lowerMessage.includes('from') || lowerMessage.includes('live in') || lowerMessage.includes('located')) {
      const locationKeywords = ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'london', 'new york'];
      for (const location of locationKeywords) {
        if (lowerMessage.includes(location)) {
          facts.push({ key: 'location', value: location });
          break;
        }
      }
    }
    
    // Preference detection
    const preferenceKeywords = {
      anime: ['anime', 'naruto', 'one piece', 'attack on titan'],
      football: ['football', 'soccer', 'premier league', 'fifa'],
      backend: ['backend', 'server', 'api', 'node.js', 'database'],
      frontend: ['frontend', 'react', 'javascript', 'ui'],
      music: ['music', 'song', 'band', 'artist'],
      movies: ['movie', 'film', 'cinema', 'netflix']
    };
    
    for (const [key, keywords] of Object.entries(preferenceKeywords)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          facts.push({ key: 'preference', value: key });
          break;
        }
      }
    }
    
    return facts;
  }

  // Get memory context for prompt
  async getMemoryContext(userId) {
    try {
      const user = await User.findOne({ userId });
      if (!user) return 'New user. No memories yet.';
      
      const contextParts = [];
      
      // Basic info
      if (user.name !== 'Friend') {
        contextParts.push(`User's name is ${user.name}.`);
      }
      
      if (user.location !== 'Unknown') {
        contextParts.push(`User is from ${user.location}.`);
      }
      
      // Preferences
      if (user.preferences.length > 0) {
        contextParts.push(`User likes: ${user.preferences.join(', ')}.`);
      }
      
      // High-confidence memory fragments
      const highConfidenceMemories = user.memoryFragments
        .filter(m => m.confidence > 0.8)
        .slice(0, 5);
      
      if (highConfidenceMemories.length > 0) {
        const memories = highConfidenceMemories.map(m => `${m.key}: ${m.value}`).join('; ');
        contextParts.push(`Remember: ${memories}`);
      }
      
      // Conversation summary
      if (user.conversationSummary && user.conversationSummary !== 'New user. No previous conversations.') {
        contextParts.push(`Previous conversation summary: ${user.conversationSummary}`);
      }
      
      return contextParts.join(' ') || 'No significant memories yet.';
    } catch (error) {
      console.error('Error getting memory context:', error);
      return 'Error accessing memories.';
    }
  }

  // Summarize conversation for long-term storage
  async summarizeConversation(sessionId, userId, messages) {
    try {
      const conversationText = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');
      
      // In production, use LLM for summarization
      // For now, create a simple summary
      const summary = `Conversation covered various topics. User expressed ${
        messages.filter(m => m.role === 'user').length
      } thoughts.`;
      
      const user = await User.findOne({ userId });
      if (user) {
        user.conversationSummary = summary;
        await user.save();
      }
      
      // Save full conversation
      const conversation = new Conversation({
        sessionId,
        userId,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          tone: m.tone || 'neutral'
        })),
        summary,
        endTime: new Date()
      });
      
      await conversation.save();
      
      return summary;
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      return 'Conversation summarized with some topics discussed.';
    }
  }

  // Clear short-term memory for session
  clearSessionMemory(sessionId) {
    this.shortTermMemory.delete(sessionId);
  }
}

module.exports = new MemoryService();