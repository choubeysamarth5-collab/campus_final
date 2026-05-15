// =============================================
// app.js – CampusBot Frontend Logic
// Step-by-step comments for beginners
// =============================================

// ── State: keeps track of everything ──
const state = {
  lang: 'en',          // current language
  theme: 'dark',       // current theme
  messages: [],        // chat history
  lastBotMsgId: null,  // for feedback
  pendingRating: null, // star rating
};

// ── Backend API URL (change if deploying) ──
const API_BASE = 'http://localhost:5000/api';

// ── DOM Shortcuts ──
const $ = (id) => document.getElementById(id);
const chatMessages = $('chatMessages');
const userInput = $('userInput');
const sendBtn = $('sendBtn');
const topicList = $('topicList');
const chipsRow = $('chipsRow');
const feedbackModal = $('feedbackModal');
const themeToggle = $('themeToggle');

// ── Utility: Format time ──
function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Utility: Parse markdown-like bold (**text**) ──
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

// ── Utility: Generate unique ID ──
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ──────────────────────────────────────────
//  RENDER FUNCTIONS
// ──────────────────────────────────────────

// Render the sidebar topics based on current language
function renderTopics() {
  const t = TRANSLATIONS[state.lang];
  const icons = ['💰','🎓','📅','🏠','📚','💼','🏆','🗓'];
  const intents = ['fee_deadline','admission','exam_schedule','hostel','library','placement','scholarship','timetable'];

  topicList.innerHTML = t.topics.map((topic, i) => `
    <button class="topic-btn" data-intent="${intents[i]}" onclick="handleTopicClick('${intents[i]}')">
      ${topic}
    </button>
  `).join('');
}

// Render suggestion chips below chat
function renderChips() {
  const t = TRANSLATIONS[state.lang];
  chipsRow.innerHTML = t.chips.map(chip => `
    <button class="chip" onclick="handleChipClick('${chip}')">${chip}</button>
  `).join('');
}

// Append a message bubble to the chat window
function appendMessage(role, text, id = null) {
  const msgId = id || uid();
  const isBot = role === 'bot';
  const t = TRANSLATIONS[state.lang];

  const row = document.createElement('div');
  row.className = `msg-row ${role}`;
  row.id = `msg-${msgId}`;

  row.innerHTML = `
    <div class="msg-avatar">${isBot ? '🎓' : '👤'}</div>
    <div>
      <div class="bubble">${parseMarkdown(text)}</div>
      <div class="bubble-meta">
        <span>${getTime()}</span>
        ${isBot ? `<button class="feedback-btn" onclick="openFeedback('${msgId}')" title="Rate this answer">⭐</button>` : ''}
      </div>
    </div>
  `;

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight; // auto-scroll

  // Save to in-memory history
  state.messages.push({ role, text, id: msgId, time: Date.now() });

  return msgId;
}

// Show typing animation (3 bouncing dots)
function showTyping() {
  const row = document.createElement('div');
  row.className = 'msg-row bot';
  row.id = 'typing-indicator';
  row.innerHTML = `
    <div class="msg-avatar">🎓</div>
    <div class="bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  const el = $('typing-indicator');
  if (el) el.remove();
}

// Show welcome message
function showWelcome() {
  const t = TRANSLATIONS[state.lang];
  appendMessage('bot', t.welcome);
}

// ──────────────────────────────────────────
//  NLP / INTENT MATCHING
// ──────────────────────────────────────────

// Simple keyword-based intent recognition
// Returns the best matching FAQ entry or null
function matchIntent(userText) {
  const lowerText = userText.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  FAQ_DB.forEach(faq => {
    let score = 0;
    faq.keywords.forEach(kw => {
      if (lowerText.includes(kw.toLowerCase())) {
        score++;
      }
    });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  });

  // Only return match if at least 1 keyword matched
  return bestScore > 0 ? bestMatch : null;
}

// Get the bot's response for a given user message
async function getBotResponse(userText) {
  // 1. Try to match from local FAQ_DB first (instant)
  const match = matchIntent(userText);

  if (match) {
    const lang = state.lang;
    // Return the answer in current language, fallback to English
    return match.answers[lang] || match.answers['en'];
  }

  // 2. If no local match, try backend API
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        lang: state.lang,
        history: state.messages.slice(-6), // last 6 msgs for context
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.reply;
    }
  } catch (err) {
    // Backend not available - use fallback
    console.log('Backend unavailable, using local fallback');
  }

  // 3. Fallback response
  return TRANSLATIONS[state.lang].fallback;
}

// ──────────────────────────────────────────
//  SEND MESSAGE FLOW
// ──────────────────────────────────────────

async function sendMessage(text) {
  const msg = (text || userInput.value).trim();
  if (!msg) return;

  // Clear input
  userInput.value = '';
  userInput.focus();

  // Disable send during processing
  sendBtn.disabled = true;

  // Show user message
  appendMessage('user', msg);

  // Hide chips after first message
  chipsRow.style.display = 'none';

  // Show typing...
  await new Promise(r => setTimeout(r, 300));
  showTyping();

  // Simulate thinking time (300-800ms) for natural feel
  const thinkTime = 400 + Math.random() * 400;
  await new Promise(r => setTimeout(r, thinkTime));

  hideTyping();

  // Get and show bot response
  const reply = await getBotResponse(msg);
  const msgId = appendMessage('bot', reply);
  state.lastBotMsgId = msgId;

  sendBtn.disabled = false;

  // Log to backend (fire-and-forget, don't block UI)
  logConversation(msg, reply);
}

// ──────────────────────────────────────────
//  TOPIC + CHIP CLICK HANDLERS
// ──────────────────────────────────────────

function handleTopicClick(intent) {
  // Find the FAQ for this intent and directly show the answer
  const faq = FAQ_DB.find(f => f.intent === intent);
  if (!faq) return;

  const questionMap = {
    fee_deadline: 'What are the fee payment deadlines?',
    admission: 'How do I apply for admission?',
    exam_schedule: 'When are the exams scheduled?',
    hostel: 'Tell me about the hostel.',
    library: 'What are the library timings?',
    placement: 'Tell me about placement opportunities.',
    scholarship: 'What scholarships are available?',
    timetable: 'Where can I find the class timetable?',
  };

  sendMessage(questionMap[intent] || intent);

  // Highlight active topic
  document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-intent="${intent}"]`)?.classList.add('active');
}

function handleChipClick(chip) {
  sendMessage(chip);
}

// ──────────────────────────────────────────
//  FEEDBACK SYSTEM
// ──────────────────────────────────────────

function openFeedback(msgId) {
  state.lastBotMsgId = msgId;
  state.pendingRating = 0;
  // Reset stars
  document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
  $('feedbackText').value = '';
  feedbackModal.style.display = 'flex';
}

// Star rating logic
document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', () => {
    const val = parseInt(star.dataset.val);
    state.pendingRating = val;
    document.querySelectorAll('.star').forEach((s, i) => {
      s.classList.toggle('active', i < val);
    });
  });
});

$('submitFeedback').addEventListener('click', async () => {
  if (!state.pendingRating) {
    alert('Please select a star rating!');
    return;
  }
  try {
    await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: state.pendingRating,
        comment: $('feedbackText').value,
        messageId: state.lastBotMsgId,
        lang: state.lang,
      }),
    });
  } catch (e) { /* offline mode */ }

  feedbackModal.style.display = 'none';
  appendMessage('bot', `✅ Thank you for your ${state.pendingRating}⭐ rating!`);
});

$('closeFeedback').addEventListener('click', () => {
  feedbackModal.style.display = 'none';
});

// ──────────────────────────────────────────
//  LANGUAGE SWITCHING
// ──────────────────────────────────────────

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const newLang = btn.dataset.lang;
    if (newLang === state.lang) return;

    state.lang = newLang;

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update placeholder
    userInput.placeholder = TRANSLATIONS[newLang].placeholder;

    // Re-render sidebar and chips
    renderTopics();
    chipsRow.style.display = 'flex';
    renderChips();

    // Send language-change greeting
    appendMessage('bot', TRANSLATIONS[newLang].welcome);
  });
});

// ──────────────────────────────────────────
//  THEME TOGGLE
// ──────────────────────────────────────────

themeToggle.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = state.theme;
  themeToggle.querySelector('.theme-icon').textContent = state.theme === 'dark' ? '☀️' : '🌙';
});

// ──────────────────────────────────────────
//  KEYBOARD: Send on Enter
// ──────────────────────────────────────────

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener('click', () => sendMessage());

// ──────────────────────────────────────────
//  BACKEND LOGGING (non-blocking)
// ──────────────────────────────────────────

async function logConversation(userMsg, botReply) {
  try {
    await fetch(`${API_BASE}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: userMsg,
        botReply,
        lang: state.lang,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) { /* silent fail when offline */ }
}

// ──────────────────────────────────────────
//  INIT: Run when page loads
// ──────────────────────────────────────────

function init() {
  renderTopics();
  renderChips();
  showWelcome();
  userInput.focus();
}

// Start the app!
init();
