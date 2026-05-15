// =============================================
// server.js – CampusBot Backend (Node.js + Express)
// Beginner-friendly with step-by-step comments
// =============================================

// Step 1: Load required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Step 2: Load environment variables from .env file
dotenv.config();

// Step 3: Create the Express app (like creating a server)
const app = express();

// Step 4: Middleware – things that run on EVERY request
app.use(cors());                        // Allow requests from frontend (different port)
app.use(express.json());                // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// Step 5: Import our route files
const chatRoutes = require('./routes/chat');
const faqRoutes = require('./routes/faqs');
const logRoutes = require('./routes/logs');
const feedbackRoutes = require('./routes/feedback');

// Step 6: Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campusbot';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  // Seed sample data if database is empty
  require('./database/seeds/seedData');
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.log('💡 Starting without database (offline mode)...');
});

// Step 7: Register routes (URL paths)
// All chat routes will start with /api/chat
app.use('/api', chatRoutes);      // POST /api/chat, POST /api/log
app.use('/api/faqs', faqRoutes);  // GET/POST/DELETE /api/faqs
app.use('/api/logs', logRoutes);  // GET /api/logs
app.use('/api/feedback', feedbackRoutes); // GET/POST /api/feedback

// Step 8: Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const FAQ = require('./models/FAQ');
    const Log = require('./models/Log');
    const Feedback = require('./models/Feedback');

    const [faqs, conversations, feedbackItems] = await Promise.all([
      FAQ.countDocuments(),
      Log.countDocuments(),
      Feedback.find(),
    ]);

    const avgRating = feedbackItems.length
      ? (feedbackItems.reduce((s, f) => s + f.rating, 0) / feedbackItems.length).toFixed(1)
      : null;

    res.json({ faqs, conversations, feedbackCount: feedbackItems.length, avgRating });
  } catch (err) {
    res.json({ faqs: 8, conversations: 0, feedbackCount: 0, avgRating: null });
  }
});

// Step 9: Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CampusBot backend is running!',
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Step 10: Handle unknown routes (404)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Step 11: Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Step 12: Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CampusBot server running at http://localhost:${PORT}`);
  console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat API:   POST http://localhost:${PORT}/api/chat`);
});

module.exports = app;
