class ToneService {
  constructor() {
    this.toneProfiles = {
      friendly: {
        greeting: ["Hey there!", "Hello!", "Hi!"],
        responses: {
          positive: ["That's wonderful!", "I'm so happy for you!", "Awesome!"],
          negative: ["I'm sorry to hear that.", "That sounds tough.", "I'm here for you."],
          neutral: ["Interesting!", "Tell me more.", "I see."]
        },
        closings: ["Take care!", "Talk to you later!", "Have a great day!"]
      },
      professional: {
        greeting: ["Hello.", "Good day.", "Greetings."],
        responses: {
          positive: ["That is excellent.", "Very good.", "Positive development."],
          negative: ["I understand the difficulty.", "That is challenging.", "My condolences."],
          neutral: ["Understood.", "Please continue.", "Noted."]
        },
        closings: ["Best regards.", "Sincerely.", "Thank you."]
      },
      empathetic: {
        greeting: ["Hi, how are you feeling today?", "Hello, I'm here to listen.", "Hey, how's everything going?"],
        responses: {
          positive: ["That's so heartwarming to hear!", "Your happiness makes me smile!", "What beautiful news!"],
          negative: ["My heart goes out to you.", "That must be really hard.", "I'm holding space for you."],
          neutral: ["I'm listening.", "Thank you for sharing.", "I appreciate you telling me."]
        },
        closings: ["Be kind to yourself.", "Sending positive thoughts.", "You're not alone."]
      },
      playful: {
        greeting: ["Hey you! 😄", "What's cookin', good lookin'?", "Well hello there!"],
        responses: {
          positive: ["Woohoo! Party time! 🎉", "That's the spirit! ✨", "Boom! Amazing!"],
          negative: ["Aww, that's a bummer 😔", "Rough day? Let's turn it around!", "Sending virtual hugs 🤗"],
          neutral: ["Spill the tea! ☕", "Do go on...", "Color me intrigued!"]
        },
        closings: ["Catch you on the flip side!", "Stay awesome!", "Peace out! ✌️"]
      }
    };
    
    this.userTonePreferences = new Map(); // userId -> preferred tone
  }

  // Adapt response based on detected tone
  adaptResponse(response, detectedTone, userTonePreference) {
    const toneProfile = this.toneProfiles[userTonePreference] || this.toneProfiles.friendly;
    
    // If user is sad, be more empathetic regardless of preference
    if (detectedTone === 'sad') {
      return this.addEmpathy(response);
    }
    
    // If user is angry, be more calm and professional
    if (detectedTone === 'angry') {
      return this.calmResponse(response);
    }
    
    // Add tone-appropriate flavor
    return this.addToneFlavor(response, toneProfile);
  }

  addEmpathy(response) {
    const empathyPhrases = [
      "I understand that must be difficult.",
      "I'm here for you.",
      "That sounds really challenging.",
      "Take all the time you need.",
      "Your feelings are completely valid."
    ];
    
    const randomEmpathy = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
    return `${randomEmpathy} ${response}`;
  }

  calmResponse(response) {
    const calmStarters = [
      "I understand your frustration.",
      "Let's work through this calmly.",
      "I hear you.",
      "I appreciate you sharing your concerns.",
      "Let me help address this."
    ];
    
    const randomStarter = calmStarters[Math.floor(Math.random() * calmStarters.length)];
    return `${randomStarter} ${response}`;
  }

  addToneFlavor(response, toneProfile) {
    // Occasionally add a tone-appropriate starter
    if (Math.random() > 0.7) {
      const starters = toneProfile.responses.neutral;
      const randomStarter = starters[Math.floor(Math.random() * starters.length)];
      return `${randomStarter} ${response}`;
    }
    
    return response;
  }

  // Update user's tone preference
  updateUserTonePreference(userId, detectedTone) {
    if (!this.userTonePreferences.has(userId)) {
      this.userTonePreferences.set(userId, detectedTone);
    } else {
      // Gradually adapt to user's common tones
      const currentTone = this.userTonePreferences.get(userId);
      if (detectedTone !== currentTone && Math.random() > 0.8) {
        this.userTonePreferences.set(userId, detectedTone);
      }
    }
    
    return this.userTonePreferences.get(userId);
  }

  // Get greeting based on tone
  getGreeting(tone) {
    const profile = this.toneProfiles[tone] || this.toneProfiles.friendly;
    const greetings = profile.greeting;
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
}

module.exports = new ToneService();