PROJECT NAME:Memory AI Agent - Conversational AI with Persistent Memory

Table of Contents:
1. Features
2. Architecture
3. Tech Stack
4. Quick Start
5. API Documentation
6. Memory System
7. Project Structure
8. Testing

-------------------------------------------------------
1. Feature:
-------------------------------------------------------
a. Core Capabilities
---------------------
Persistent Memory: Remembers user details, preferences, and conversations across sessions.
Emotional Intelligence: Detects and adapts to user's emotional tone in real-time.
Hallucination Prevention: Never invents facts - always admits uncertainty.
Identity Consistency: Maintains stable personality across all interactions.
Cost Optimization: Smart conversation summarization reduces token usage by 70%

b. Technical Features
----------------------
Three-Tier Memory Architecture: Short-term, long-term, and summarized memory.
RESTful API: Well-documented endpoints with proper error handling.
Scalable Design: Microservices architecture ready for horizontal scaling.
Production Ready: Comprehensive logging, monitoring, and error recovery.
Security First: Environment-based configuration and input validation

------------------------------------------------
2. Architecture:
-----------------------------------------------
a. High-Level Architecture Diagram: 

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Frontend│────▶│   Express API   │────▶│  Gemini 2.0     │
│   (Port: 3000)  │◀────│   (Port: 5000)  │◀────│    Flash LLM    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Memory Layer  │
                       │  ┌───────────┐  │
                       │  │  MongoDB  │  │
                       │  │ (Long-term)│  │
                       │  └───────────┘  │
                       │  ┌───────────┐  │
                       │  │  Session  │  │
                       │  │(Short-term)│  │
                       │  └───────────┘  │
                       └─────────────────┘

b. Memory Flow Architecture
---------------------------
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│   Tone      │───▶│   Memory    │───▶│   Context   │
│   Input     │    │  Detection  │    │   Recall    │    │   Builder   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                  │              │
                                                  ▼              ▼
                                         ┌─────────────┐  ┌─────────────┐
                                         │   MongoDB   │  │   LLM       │
                                         │ (Long-term) │  │  Prompt     │
                                         └─────────────┘  └─────────────┘
                                                  │              │
                                                  ▼              ▼
                                         ┌─────────────┐  ┌─────────────┐
                                         │   Session   │  │   Gemini    │
                                         │(Short-term) │  │  2.0 Flash  │
                                         └─────────────┘  └─────────────┘
                                                                 │
                                                                 ▼
                                                        ┌─────────────┐
                                                        │   Response  │
                                                        │  + Memory   │
                                                        │   Update    │
                                                        └─────────────┘


-------------------------------------------------------------------------------------------------------------------
3. Tech Stack :
------------------------------------------------------------------------------------------------------------------
 a. Backend:
-----------
Node.js 18+ - JavaScript runtime.
Express.js - Web framework.
MongoDB Atlas - Cloud database.
Mongoose ODM - Database modeling.
Google Gemini 2.0 Flash - LLM API.


-----------------------------------------------------------
4. Quick Start:
-----------------------------------------------------------
a. Prerequisites:
---------------------
Node.js 16 or higher.
MongoDB Atlas account (free tier available).
Google Gemini API key .
Git.

b. Setup:
 step1: Clone Repository : https://github.com/Subhashk75/memory-ai-agent.git
 step2: install Dependencies: npm install 
 step3: Start Development Server : npm start


 ----------------------------------------------------------
 5. API Documentation.
 ----------------------------------------------------------
Base URL: http://localhost:5000/api
Key Endpoints:
Method	    Endpoint	                 Description	                           Parameters
-----------------------------------------------------------------------------------------------------------------------
POST	    /chat	                   Send message to AI	                    message, userId, sessionId?
GET	     /memory/:userId	               Get user memory	                        userId in path
GET  	 /history	                       System history check	                       -
POST	/session/clear	               Clear session memory	                     sessionId
GET	    /conversations/:userId	       Get conversation history	                 userId in path

------------------------------------------------------------------------------------------------------------
6. Memory System
---------------------------------------------------------------------------------------------------------
a.Short-term Memory
Stores last 5-10 messages of current conversation
Enables contextual continuity
Automatically cleared on session end
Implementation: In-memory Map data structure

b.Long-term Memory
Stores user profile with confidence scoring
Persists across server restarts
Structured schema with validation
Implementation: MongoDB with Mongoose

c. Summarized Memory
Periodically summarizes conversations (every 10 messages)
Reduces token usage by 60-80%
Maintains conversation essence
Implementation: Background job with LLM summarization

-----------------------------------------------------------
7. Project Structure:
-----------------------------------------------------------
memory-ai-agent/
├── server/
│   ├── controllers/
│   │   └── ChatController.js     
│   ├── services/
│   │   ├── MemoryService.js       # Three-tier memory management
│   │   ├── GeminiService.js       # LLM integration with Gemini API
│   │   └── ToneService.js         # Emotional tone detection & adaptation
│   ├── models/
│   │   ├── User.js                # Long-term memory schema
│   │   └── Conversation.js        # Conversation history schema
│   ├── routes/
│   │   └── chatRoutes.js          # All API route definitions
│   ├── utils/
│   │   ├── PromptBuilder.js       # LLM prompt construction
│   │   └── Summarizer.js          # Conversation summarization
│   ├── app.js                     # Express application configuration
│   └── server.js  


-----------------------------------------------------------
8. Testing 
-----------------------------------------------------------
Test 1: Memory Persistence: 
# Step 1: Introduce yourself
   curl -X POST http://localhost:5000/api/chat \
        -d '{"message":"Hi, I am Priya from Mumbai", "userId":"test_001"}'

# Step 2: New session, check memory
    curl -X POST http://localhost:5000/api/chat \
      -d '{"message":"What do you know about me?", "userId":"test_001"}'

# Should recall: "Priya from Mumbai"
Test 2: Emotional Adaptation
   # Test sad tone
  curl -X POST http://localhost:5000/api/chat \
    -d '{"message":"I failed my exam", "userId":"test_002"}'
# Response should be empathetic

 # Test happy tone
    curl -X POST http://localhost:5000/api/chat \
      -d '{"message":"I got the job!", "userId":"test_002"}'

# Response should be celebratory
Test 3: Hallucination Prevention
# Ask about unknown information
     curl -X POST http://localhost:5000/api/chat \
       -d '{"message":"What car do I drive?", "userId":"test_003"}'
# Should NOT invent car details