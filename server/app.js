const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const chatRoutes = require('./routes/chatRoutes');

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    
    this.initializeMiddlewares();
    this.initializeDatabase();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Body parsing
    this.app.use(bodyParser.json({ limit: '10mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

async initializeDatabase() {
  try {
    // Log the sanitized URI for debugging (hides password)
    const uri = process.env.MONGODB_URI || '';
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`Attempting to connect to MongoDB at: ${maskedUri}`);

    // Connect WITHOUT the deprecated options
    await mongoose.connect(process.env.MONGODB_URI, {
      // These are the only options you typically need for Atlas
      serverSelectionTimeoutMS: 10000, // Fail after 10 seconds if no server is found
      // socketTimeoutMS: 45000,      // Optional: Close sockets after 45s of inactivity
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // (Keep your existing connection event listeners here)
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection FAILED:', error.message);
    // Consider if you want the app to exit on DB failure
    // process.exit(1);
  }
}

initializeRoutes() {
  // API routes
  this.app.use('/api', chatRoutes);
  
  // Root route
  this.app.get('/', (req, res) => {
    res.json({
      message: 'Memory AI Agent API',
      version: '1.0.0',
      endpoints: {
        chat: 'POST /api/chat',
        memory: 'GET /api/memory',
        health: 'GET /api/health'
      },
      documentation: '/docs'
    });
  });
  
  // 404 handler - FIXED
  this.app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  });
}

  initializeErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      
      res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on port ${this.port}`);
      console.log(`📝 API Documentation: http://localhost:${this.port}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
}

module.exports = App;