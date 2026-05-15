# Complete Setup Guide

## Prerequisites

### Software Required
- **Node.js** (version 16 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version` and `npm --version`

- **MongoDB** (version 4.4 or higher)
  - Download: https://www.mongodb.com/try/download/community
  - OR use MongoDB Atlas (Cloud): https://www.mongodb.com/cloud/atlas

- **Git** (optional but recommended)
  - Download: https://git-scm.com/

- **Code Editor** (VS Code recommended)
  - Download: https://code.visualstudio.com/

### System Requirements
- Windows, macOS, or Linux
- Minimum 4GB RAM
- 500MB disk space
- Internet connection (for npm packages)

---

## Step 1: MongoDB Setup

### Option A: Local MongoDB

#### Windows
```bash
# Download installer from https://www.mongodb.com/try/download/community

# Run installer (msi file)
# Choose "Install MongoD as a Windows Service"
# Verify installation
mongod --version
mongo --version
```

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongo --version
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongod

# Verify
mongod --version
```

### Option B: MongoDB Atlas (Cloud - Recommended for Production)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account (free tier available)
3. Create cluster
4. Create database user (username + password)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/campusbot?retryWrites=true&w=majority`
6. Keep this string safe - you'll need it in .env

---

## Step 2: Project Setup

### Clone or Extract Project
```bash
# Option 1: If using Git
git clone <repository-url>
cd campus-chatbot

# Option 2: If you have zip file
# Extract the zip file and navigate to folder
cd campus-chatbot
```

### Folder Structure After Setup
```
campus-chatbot/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── models/
│   ├── routes/
│   └── ...
├── frontend/
│   ├── index.html
│   ├── admin.html
│   ├── css/
│   ├── js/
│   └── ...
└── database/
```

---

## Step 3: Backend Setup

### Navigate to Backend
```bash
cd backend
```

### Install Dependencies
```bash
npm install
```

**This installs:**
- express
- mongoose
- cors
- dotenv
- nodemon (dev dependency)

### Create Environment File
```bash
# Copy example file
cp .env.example .env

# Or create new .env file with:
```

### .env File Content
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/campusbot

# OR if using MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campusbot?retryWrites=true&w=majority

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

### Test Backend Connection
```bash
# Start backend (will auto-connect to MongoDB)
npm start

# You should see:
# ✅ MongoDB connected successfully!
# 🚀 CampusBot server running at http://localhost:5000
# ✅ Seeded 8 FAQs into MongoDB
```

### If MongoDB Connection Fails
```
💡 Starting without database (offline mode)...
```
- This means MongoDB isn't running
- Start MongoDB service (see Step 1)
- Restart backend with `npm start`

---

## Step 4: Frontend Setup

### Navigate to Frontend
```bash
cd ../frontend
```

### Method A: Using Python Server (Windows)
```bash
# Python 3.x
python -m http.server 3000

# Open browser: http://localhost:3000
```

### Method B: Using Node.js (Recommended)
```bash
# Install http-server globally (one-time)
npm install -g http-server

# Start server
http-server -p 3000

# Open browser: http://localhost:3000
```

### Method C: Using VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Opens automatically in browser (usually port 5500)

### Verify Frontend Works
- Browser should show chatbot interface
- Language selector visible (EN, हि, म, த, తె)
- Input field says "Ask me anything about your college..."
- Sidebar shows quick topics

---

## Step 5: Test the System

### Test Chat Endpoint
```bash
# Open terminal/PowerShell and run:
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the fees?","lang":"en"}'

# Should return:
# {
#   "reply": "📅 **Fee Payment Deadlines:**...",
#   "intent": "fee_deadline",
#   "lang": "en"
# }
```

### Test Health Endpoint
```bash
curl http://localhost:5000/api/health

# Should return:
# {
#   "status": "OK",
#   "dbStatus": "Connected",
#   "timestamp": "..."
# }
```

### Test in Browser
1. Open Frontend (http://localhost:3000)
2. Type "What are the fees?" in input box
3. Click Send or press Enter
4. Bot should reply with fee information
5. Try rating the response (1-5 stars)

---

## Step 6: Admin Panel

### Access Admin Panel
1. Frontend: http://localhost:3000
2. Click Admin link (⚙️) in top right
3. Or directly: http://localhost:3000/admin.html

### Admin Features
- **View FAQs** - See all Q&A pairs
- **Add FAQ** - Create new question
- **Edit FAQ** - Update existing Q&A
- **Delete FAQ** - Remove Q&A
- **Statistics** - View chat stats
- **Feedback** - See user ratings

---

## Step 7: Test Multilingual Support

### Test Different Languages
1. Frontend: http://localhost:3000
2. Click language button (EN, हि, म, த, తె)
3. UI should change to that language
4. Chat in that language
5. Bot should respond in same language

### Example Test Cases
```
English:  "What are the fees?"
Hindi:    "होस्टल की जानकारी क्या है?"
Marathi:  "परीक्षा का समय क्या है?"
Tamil:    "நூலகம் எப்போது திறக்கிறது?"
Telugu:   "ప్లేసమెంట్ సమాచారం ఏమిటి?"
```

---

## Step 8: Development Workflow

### Auto-Reload Backend
```bash
cd backend
npm run dev

# Uses nodemon - auto-restarts when files change
```

### Edit API Routes
- File: `backend/routes/chat.js`
- Changes auto-reload with `npm run dev`
- Restart if issues occur

### Edit Frontend
- File: `frontend/js/app.js` or `frontend/index.html`
- Refresh browser to see changes (usually auto-refreshes with Live Server)

### Add New FAQ
- Option 1: Use Admin Panel (http://localhost:3000/admin.html)
- Option 2: Edit `database/seeds/seedData.js` and restart backend

---

## Common Issues & Solutions

### Issue 1: MongoDB Connection Error
```
❌ MongoDB connection failed: connect ECONNREFUSED
```
**Solution:**
- Check if MongoDB is running
- Windows: Services → MongoDB Server (start)
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Change PORT in .env file (e.g., PORT=5001)
- Or kill process: `lsof -i :5000` → `kill -9 <PID>`

### Issue 3: CORS Error in Browser
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Backend CORS already configured in `server.js`
- Restart backend: `npm start`
- Clear browser cache (Ctrl+Shift+Delete)

### Issue 4: Frontend Can't Reach Backend
```
Failed to fetch at http://localhost:5000/api/chat
```
**Solution:**
- Check if backend is running: `npm start` in `backend/` folder
- Verify correct port (5000)
- Check frontend is calling correct URL in `app.js`

### Issue 5: No FAQs Appear
```
Empty chat (bot always says "I don't have information")
```
**Solution:**
- Check MongoDB connection
- Seed data: run `npm run seed` in backend folder
- Verify FAQs in MongoDB: `db.faqs.find()`

### Issue 6: Language Not Switching
```
Frontend still shows English after clicking other language
```
**Solution:**
- Clear localStorage: F12 → Application → Local Storage → Clear
- Refresh page
- Check `translations.js` is loaded

---

## Testing Checklist

```
Backend:
□ MongoDB connected (✅ message on startup)
□ Health endpoint works: GET /api/health
□ Chat endpoint works: POST /api/chat
□ 8 sample FAQs seeded

Frontend:
□ UI loads at http://localhost:3000
□ Language selector works
□ Theme toggle works
□ Can type and send message
□ Bot replies
□ Can rate response
□ Works in all 5 languages

Admin Panel:
□ Opens at /admin.html
□ Can view FAQs
□ Statistics display
□ Can add/edit/delete FAQs

Database:
□ faqs collection has 8 documents
□ logs collection records chat
□ feedbacks collection stores ratings
```

---

## Production Deployment

### Before Deploying
1. Change `NODE_ENV=production` in .env
2. Use MongoDB Atlas (cloud) instead of local
3. Enable HTTPS
4. Change CORS settings to specific domain
5. Add authentication for admin routes
6. Set proper error logging

### Deployment Options
- **Frontend:** Netlify, Vercel, GitHub Pages
- **Backend:** Heroku, AWS, Google Cloud, Azure
- **Database:** MongoDB Atlas (free tier available)

### Example Heroku Deployment
```bash
# Create Procfile in backend/
# echo "web: node server.js" > Procfile

# Deploy
git push heroku main
```

---

## Development Commands

### Backend Commands
```bash
npm start         # Start server
npm run dev       # Start with auto-reload
npm run seed      # Seed sample FAQs
npm test          # Run tests (if available)
npm install       # Install dependencies
npm update        # Update dependencies
```

### Frontend Commands
```bash
npm install -g http-server    # Install HTTP server globally
http-server -p 3000           # Start on port 3000
```

### Database Commands (MongoDB)
```bash
mongod                         # Start MongoDB daemon
mongo                          # Connect to MongoDB shell
mongodump                      # Backup database
mongorestore                   # Restore database
mongoexport                    # Export to JSON/CSV
```

---

## Quick Start Summary

```bash
# 1. Start MongoDB (in separate terminal)
mongod

# 2. Setup Backend (in Terminal 1)
cd backend
npm install
cp .env.example .env
npm start
# Wait for: ✅ MongoDB connected successfully!

# 3. Setup Frontend (in Terminal 2)
cd frontend
http-server -p 3000
# Opens automatically or go to http://localhost:3000

# 4. Test in browser
# Type "What are the fees?"
# Bot should reply

# Done! 🎉
```

---

## File Locations for Reference

| Component | Location |
|-----------|----------|
| Backend Server | backend/server.js |
| Environment Variables | backend/.env |
| Chat Logic | backend/routes/chat.js |
| FAQ Data | MongoDB: database campusbot, collection faqs |
| Frontend UI | frontend/index.html |
| Admin Panel | frontend/admin.html |
| Frontend Logic | frontend/js/app.js |
| Translations | frontend/js/translations.js |
| Styling | frontend/css/style.css |
| Sample Data | database/seeds/seedData.js |

---

## Next Steps

1. **Customize FAQs** - Add your college's actual information
2. **Branding** - Change colors, logo, name
3. **Testing** - Test all 5 languages thoroughly
4. **Deployment** - Deploy to production server
5. **Monitoring** - Setup logging and analytics

---

## Support & Documentation

- Node.js: https://nodejs.org/docs/
- Express: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- Mongoose: https://mongoosejs.com/docs/
- Frontend: Vanilla JavaScript (MDN docs)

---

## Project Contact

For issues or questions:
- Email: helpdesk@college.edu
- Phone: +91 12345 67890
- Documentation: See README.md
