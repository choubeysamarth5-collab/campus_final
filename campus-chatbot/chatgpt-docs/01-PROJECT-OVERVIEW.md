# CampusBot - Project Overview

## What is CampusBot?
A **Multilingual College Assistant Chatbot** that answers student questions about:
- Fees and payment deadlines
- Admission procedures
- Exam schedules
- Hostel facilities
- Library timings and rules
- Placement information
- Scholarships
- Timetables

## Supported Languages
- English (EN)
- Hindi (HI)
- Marathi (MR)
- Tamil (TA)
- Telugu (TE)

## Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (Dark/Light themes)
- **Vanilla JavaScript** - No frameworks, pure JS
- **Local Storage** - Store chat history

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database (NoSQL)
- **Mongoose** - ODM (Object Data Mapper)
- **CORS** - Cross-Origin requests
- **dotenv** - Environment variables

## Project Structure
```
campus-chatbot/
├── frontend/
│   ├── index.html           (Main UI)
│   ├── admin.html           (Admin panel)
│   ├── css/
│   │   └── style.css        (All styling)
│   └── js/
│       ├── app.js           (Main logic)
│       └── translations.js  (5 languages)
├── backend/
│   ├── server.js            (Server setup)
│   ├── package.json         (Dependencies)
│   ├── .env.example         (Config template)
│   ├── models/
│   │   ├── FAQ.js           (FAQ schema)
│   │   ├── Log.js           (Chat logs schema)
│   │   └── Feedback.js      (Ratings schema)
│   └── routes/
│       ├── chat.js          (Chat API)
│       ├── faqs.js          (FAQ CRUD)
│       ├── logs.js          (History API)
│       └── feedback.js      (Feedback API)
└── database/
    └── seeds/
        └── seedData.js      (Sample data)
```

## How It Works

### User Interaction Flow
1. User opens `index.html`
2. User types a question
3. JavaScript sends request to Backend: `POST /api/chat`
4. Backend receives message → searches FAQs
5. Matches keywords from user question
6. Returns answer in selected language
7. Frontend displays answer + suggestion for rating
8. User can rate (1-5 stars)
9. Chat is saved in local storage

### Data Flow
```
Frontend (Browser)
    ↓ HTTP POST /api/chat
Backend (Node.js + Express)
    ↓ Keyword matching
MongoDB (FAQ Collection)
    ↓ Returns matching FAQ
Backend processes language
    ↓ HTTP Response with answer
Frontend displays + stores in localStorage
```

## Main Features

### For Users
✅ Real-time chat interface
✅ Multiple language support
✅ Dark/Light theme toggle
✅ Quick topic suggestions
✅ Star rating system
✅ Local chat history
✅ Mobile responsive

### For Admin
✅ Add/Edit/Delete FAQs
✅ View chat statistics
✅ Monitor user feedback
✅ Manage categories
✅ Multi-language answers

## Database Collections

### FAQ Collection
```json
{
  "_id": ObjectId,
  "keywords": ["fee", "payment"],
  "category": "fees",
  "intent": "fee_deadline",
  "answers": {
    "en": "Fee deadline is July 31",
    "hi": "शुल्क की deadline 31 जुलाई है",
    "mr": "...",
    "ta": "...",
    "te": "..."
  },
  "isActive": true,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Log Collection
```json
{
  "_id": ObjectId,
  "userMessage": "What are the fees?",
  "botReply": "Fee deadline is...",
  "lang": "en",
  "intent": "fee_deadline",
  "timestamp": Date,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Feedback Collection
```json
{
  "_id": ObjectId,
  "rating": 4,
  "comment": "Very helpful",
  "messageId": "msg_123",
  "lang": "en",
  "createdAt": Date,
  "updatedAt": Date
}
```

## API Endpoints

### Chat API
- `POST /api/chat` - Send message, get reply
- `POST /api/log` - Save conversation

### FAQ Management
- `GET /api/faqs` - Get all FAQs
- `POST /api/faqs` - Add new FAQ
- `PUT /api/faqs/:id` - Update FAQ
- `DELETE /api/faqs/:id` - Delete FAQ

### Chat History
- `GET /api/logs` - Get all conversations
- `GET /api/logs?lang=hi` - Filter by language

### Feedback
- `GET /api/feedback` - Get all ratings
- `POST /api/feedback` - Submit new rating

### System
- `GET /api/health` - Server status
- `GET /api/stats` - Statistics

## Running the Project

### Prerequisites
- Node.js >= 16.0.0
- MongoDB running locally or cloud connection
- npm or yarn

### Setup Backend
```bash
cd backend
npm install
npm start          # Runs on port 5000
npm run dev        # With auto-reload (nodemon)
```

### Setup Frontend
```bash
cd frontend
# Serve static files (use live-server or similar)
# Open http://localhost:3000 or serve via backend
```

### Environment Variables (.env)
```
MONGO_URI=mongodb://localhost:27017/campusbot
PORT=5000
NODE_ENV=development
```

## Key Files Explained

| File | Purpose |
|------|---------|
| `server.js` | Main Express server, connects all routes |
| `app.js` | Frontend logic, handles user input |
| `chat.js` | Chatbot logic, keyword matching |
| `FAQ.js` | Database schema for FAQs |
| `translations.js` | UI translations for 5 languages |
| `seedData.js` | Pre-populates DB with sample FAQs |

## Current Sample Data
8 pre-loaded FAQs:
1. Fee deadlines
2. Scholarships
3. Admissions
4. Exam schedules
5. Hostel info
6. Library details
7. Placements
8. Timetables

Each has translations in 5 languages.
