const { GoogleGenerativeAI } = require('@google/generative-ai');
const PromptBuilder = require('../utils/PromptBuilder');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    this.promptBuilder = new PromptBuilder();
  }

  async generateResponse(userInput, memoryContext, tone, sessionMemory) {
    try {
      // Build the complete prompt
      const prompt = this.promptBuilder.buildPrompt(
        userInput,
        memoryContext,
        tone,
        sessionMemory
      );

      // Generate response
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Clean and validate response
      return this.validateResponse(response);
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      
      // Fallback responses
      const fallbacks = [
        "I apologize, but I'm having trouble processing that right now. Could you try again?",
        "Let me think about that... Actually, could you rephrase your question?",
        "I want to make sure I understand you correctly. Could you elaborate a bit?"
      ];
      
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }

  validateResponse(response) {
    // Remove any AI disclosure phrases
    const disclosurePhrases = [
      'as an ai',
      'as an artificial intelligence',
      'i am an ai',
      'i am ai',
      'i am a language model',
      'i cannot',
      'i don\'t have',
      'i don\'t possess'
    ];
    
    let cleanResponse = response;
    
    for (const phrase of disclosurePhrases) {
      if (cleanResponse.toLowerCase().includes(phrase)) {
        // Replace with human-like alternatives
        cleanResponse = cleanResponse.replace(
          new RegExp(phrase, 'gi'),
          (match) => {
            if (match.includes('cannot')) return "I'm not able to";
            if (match.includes("don't have")) return "I don't currently have access to";
            return "Let me share what I know";
          }
        );
      }
    }
    
    return cleanResponse.trim();
  }

  // Detect tone from user input
  detectTone(userInput) {
    const input = userInput.toLowerCase();
    
    const tonePatterns = {
      sad: ['sad', 'depressed', 'unhappy', 'lonely', 'miss', 'lost'],
      happy: ['happy', 'excited', 'great', 'awesome', 'wonderful', 'yay'],
      angry: ['angry', 'mad', 'hate', 'annoyed', 'frustrated', 'upset'],
      casual: ['hey', 'hi', 'hello', 'what\'s up', 'sup', 'yo'],
      formal: ['please', 'could you', 'would you', 'thank you', 'kindly'],
      playful: ['lol', 'haha', 'funny', 'joke', 'roast', 'tease']
    };
    
    for (const [tone, keywords] of Object.entries(tonePatterns)) {
      for (const keyword of keywords) {
        if (input.includes(keyword)) {
          return tone;
        }
      }
    }
    
    return 'neutral';
  }
}

module.exports = new GeminiService();