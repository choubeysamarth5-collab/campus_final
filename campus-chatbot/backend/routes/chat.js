// =============================================
// routes/chat.js – Chat & Log API Routes
// =============================================

const express = require('express');
const router = express.Router();

// Import models
let FAQ, Log;
try {
  FAQ = require('../models/FAQ');
  Log = require('../models/Log');
} catch (e) {}

// ── MULTILINGUAL FALLBACK MESSAGES ──
const FALLBACKS = {
  en: "I'm sorry, I don't have information on that. Please contact helpdesk@college.edu or call +91 12345 67890.",
  hi: "मुझे खेद है, मेरे पास इस विषय पर जानकारी नहीं है। helpdesk@college.edu से संपर्क करें।",
  mr: "मला माफ करा, या विषयावर माहिती नाही. helpdesk@college.edu शी संपर्क करा.",
  ta: "மன்னிக்கவும், இதற்கான தகவல் என்னிடம் இல்லை. helpdesk@college.edu-ல் தொடர்பு கொள்ளுங்கள்.",
  te: "క్షమించండి, దాని గురించి నాకు సమాచారం లేదు. helpdesk@college.edu ని సంప్రదించండి.",
};

// ── INTENT MATCHING FUNCTION ──
// This is our "NLP engine" – simple keyword matching
function matchFAQ(text, faqs) {
  const lowerText = text.toLowerCase();
  let bestFaq = null;
  let bestScore = 0;

  faqs.forEach(faq => {
    let score = 0;
    (faq.keywords || []).forEach(kw => {
      if (lowerText.includes(kw.toLowerCase())) {
        score++;
        // Bonus score for exact intent phrase match
        if (lowerText === kw.toLowerCase()) score += 2;
      }
    });
    if (score > bestScore) {
      bestScore = score;
      bestFaq = faq;
    }
  });

  return bestScore > 0 ? bestFaq : null;
}

// ── POST /api/chat ──
// Main chat endpoint – receives user message, returns bot reply
router.post('/chat', async (req, res) => {
  try {
    const { message, lang = 'en', history = [] } = req.body;

    // Validate input
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    let reply = null;
    let intent = 'unknown';

    // Try to find answer in MongoDB
    if (FAQ) {
      const faqs = await FAQ.find({ isActive: true });
      const match = matchFAQ(message, faqs);

      if (match) {
        intent = match.intent;
        // Get answer in requested language, fallback to English
        reply = match.answers[lang] || match.answers.en;
      }
    }

    // If no match found, use fallback
    if (!reply) {
      reply = FALLBACKS[lang] || FALLBACKS.en;
    }

    // Respond to the frontend
    res.json({
      reply,
      intent,
      lang,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      reply: FALLBACKS[req.body?.lang || 'en'],
      error: 'Server error'
    });
  }
});

// ── POST /api/log ──
// Save a conversation to the database
router.post('/log', async (req, res) => {
  try {
    const { userMessage, botReply, lang = 'en', timestamp } = req.body;

    if (!userMessage || !botReply) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    if (Log) {
      const log = new Log({
        userMessage: userMessage.trim(),
        botReply,
        lang,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      });
      await log.save();
    }

    res.json({ success: true, message: 'Logged successfully' });
  } catch (error) {
    // Don't crash the app if logging fails
    console.error('Logging error:', error.message);
    res.json({ success: false });
  }
});

module.exports = router;
