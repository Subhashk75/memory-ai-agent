class Summarizer {
  constructor() {
    this.maxSummaryLength = 200;
  }

  // Create a simple summary (in production, use LLM)
  createSimpleSummary(messages) {
    const userMessages = messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 0) {
      return "Brief introductory conversation.";
    }
    
    // Extract key topics
    const topics = this.extractTopics(userMessages);
    
    // Count message types
    const questionCount = userMessages.filter(m => 
      m.content.includes('?')
    ).length;
    
    // Create summary
    let summary = `Conversation included ${userMessages.length} user messages`;
    
    if (topics.length > 0) {
      summary += ` about ${topics.slice(0, 3).join(', ')}`;
    }
    
    if (questionCount > 0) {
      summary += `. User asked ${questionCount} questions`;
    }
    
    return summary.length > this.maxSummaryLength 
      ? summary.substring(0, this.maxSummaryLength) + '...'
      : summary;
  }

  extractTopics(messages) {
    const topicKeywords = {
      'technology': ['code', 'programming', 'tech', 'computer', 'software', 'app', 'website'],
      'personal': ['family', 'friend', 'home', 'life', 'work', 'job', 'career'],
      'hobbies': ['game', 'movie', 'music', 'book', 'sport', 'anime', 'travel'],
      'emotions': ['happy', 'sad', 'angry', 'excited', 'worried', 'stress', 'love'],
      'learning': ['learn', 'study', 'course', 'skill', 'knowledge', 'education']
    };
    
    const foundTopics = new Set();
    const allText = messages.map(m => m.content.toLowerCase()).join(' ');
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      for (const keyword of keywords) {
        if (allText.includes(keyword)) {
          foundTopics.add(topic);
          break;
        }
      }
    }
    
    return Array.from(foundTopics);
  }

  // Update existing summary with new conversation
  updateSummary(existingSummary, newMessages) {
    if (!existingSummary || existingSummary.includes('New user')) {
      return this.createSimpleSummary(newMessages);
    }
    
    const newSummary = this.createSimpleSummary(newMessages);
    return `${existingSummary}. Recently: ${newSummary}`;
  }
}

module.exports = new Summarizer();