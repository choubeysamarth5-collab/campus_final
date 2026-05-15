# API Endpoints Documentation

## Base URL
```
http://localhost:5000/api
```

---

## 1. CHAT ENDPOINTS

### POST /api/chat
**Purpose:** Send user message and get bot reply

**Request:**
```json
{
  "message": "What are the fees?",
  "lang": "en",
  "history": []
}
```

**Response (Success):**
```json
{
  "reply": "📅 **Fee Payment Deadlines:**\n• Semester 1: July 31\n• Late fee: ₹500",
  "intent": "fee_deadline",
  "lang": "en"
}
```

**Response (No Match):**
```json
{
  "reply": "I'm sorry, I don't have information on that. Please contact helpdesk@college.edu",
  "intent": "unknown",
  "lang": "en"
}
```

**Parameters:**
- `message` (required): User's question
- `lang` (optional): Language code (en, hi, mr, ta, te) - Default: en
- `history` (optional): Previous conversation history array

**Status Codes:**
- `200` - Success
- `400` - Bad request (empty message)
- `500` - Server error

---

### POST /api/log
**Purpose:** Save a conversation to logs

**Request:**
```json
{
  "userMessage": "What are the fees?",
  "botReply": "Fee deadline is July 31",
  "lang": "en",
  "intent": "fee_deadline"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userMessage": "What are the fees?",
  "botReply": "Fee deadline is July 31",
  "lang": "en",
  "intent": "fee_deadline",
  "timestamp": "2026-05-07T10:30:00Z",
  "createdAt": "2026-05-07T10:30:00Z"
}
```

---

## 2. FAQ ENDPOINTS

### GET /api/faqs
**Purpose:** Get all FAQs

**Query Parameters:**
```
?category=fees          - Filter by category
?active=true           - Show only active FAQs
?lang=en              - Language preference
?limit=10             - Limit results
?skip=0               - Pagination offset
```

**Response:**
```json
{
  "faqs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "keywords": ["fee", "payment", "deadline"],
      "category": "fees",
      "intent": "fee_deadline",
      "answers": {
        "en": "Fee deadline is July 31",
        "hi": "शुल्क की deadline 31 जुलाई है"
      },
      "isActive": true,
      "createdAt": "2026-05-07T10:30:00Z",
      "updatedAt": "2026-05-07T10:30:00Z"
    }
  ],
  "total": 8,
  "page": 1
}
```

---

### POST /api/faqs
**Purpose:** Create a new FAQ

**Request (Admin):**
```json
{
  "keywords": ["fee", "payment", "deadline"],
  "category": "fees",
  "intent": "fee_deadline",
  "answers": {
    "en": "Fee deadline is July 31",
    "hi": "शुल्क की deadline 31 जुलाई है",
    "mr": "शुल्क मुदत 31 जुलै आहे",
    "ta": "கட்டணம் கடைசி தேதி ஜூலை 31",
    "te": "ఫీ చివరి తేదీ జూలై 31"
  }
}
```

**Response:**
```json
{
  "_id": "new_id_generated",
  "keywords": ["fee", "payment", "deadline"],
  "category": "fees",
  "intent": "fee_deadline",
  "answers": {...},
  "isActive": true,
  "createdAt": "2026-05-07T10:30:00Z",
  "updatedAt": "2026-05-07T10:30:00Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `500` - Server error

---

### PUT /api/faqs/:id
**Purpose:** Update an existing FAQ

**Parameters:**
- `:id` - FAQ MongoDB ID

**Request:**
```json
{
  "keywords": ["fee", "payment", "new_keyword"],
  "answers": {
    "en": "Updated answer..."
  }
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "keywords": ["fee", "payment", "new_keyword"],
  "category": "fees",
  "intent": "fee_deadline",
  "answers": {
    "en": "Updated answer...",
    "hi": "..."
  },
  "isActive": true,
  "updatedAt": "2026-05-07T11:00:00Z"
}
```

---

### DELETE /api/faqs/:id
**Purpose:** Delete/Deactivate an FAQ

**Parameters:**
- `:id` - FAQ MongoDB ID

**Response:**
```json
{
  "message": "FAQ deleted successfully",
  "deletedFAQ": {
    "_id": "507f1f77bcf86cd799439011",
    "keywords": ["fee", "payment", "deadline"],
    "isActive": false
  }
}
```

**Note:** Soft delete - sets `isActive` to `false`

---

## 3. LOGS ENDPOINTS

### GET /api/logs
**Purpose:** Get chat history/logs

**Query Parameters:**
```
?lang=en                    - Filter by language
?intent=fee_deadline        - Filter by intent
?startDate=2026-05-01      - Start date filter
?endDate=2026-05-07        - End date filter
?limit=50                  - Limit results
?skip=0                    - Pagination
?sortBy=timestamp          - Sort field
?order=desc                - asc or desc
```

**Response:**
```json
{
  "logs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userMessage": "What are the fees?",
      "botReply": "Fee deadline is July 31",
      "lang": "en",
      "intent": "fee_deadline",
      "timestamp": "2026-05-07T10:30:00Z",
      "createdAt": "2026-05-07T10:30:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "pages": 4
}
```

---

### GET /api/logs/stats
**Purpose:** Get chat statistics

**Response:**
```json
{
  "totalConversations": 156,
  "languageDistribution": {
    "en": 95,
    "hi": 45,
    "mr": 12,
    "ta": 3,
    "te": 1
  },
  "intentDistribution": {
    "fee_deadline": 45,
    "admission": 30,
    "exam_schedule": 25,
    "placement": 20,
    "scholarship": 15,
    "unknown": 21
  },
  "topQuestions": [
    "What are the fees?",
    "When is exam?",
    "How to apply?"
  ],
  "avgResponseTime": "45ms",
  "successRate": 86.5
}
```

---

### GET /api/logs?lang=en&intent=fee_deadline
**Purpose:** Advanced filtering

**Example Response:**
```json
{
  "logs": [...],
  "total": 45,
  "filters": {
    "lang": "en",
    "intent": "fee_deadline"
  }
}
```

---

## 4. FEEDBACK ENDPOINTS

### GET /api/feedback
**Purpose:** Get all user feedback/ratings

**Query Parameters:**
```
?lang=en               - Filter by language
?minRating=3           - Minimum rating
?maxRating=5           - Maximum rating
?limit=50              - Limit results
?sortBy=rating         - Sort by field
?order=desc            - asc or desc
```

**Response:**
```json
{
  "feedback": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "rating": 5,
      "comment": "Very helpful!",
      "messageId": "msg_123",
      "lang": "en",
      "createdAt": "2026-05-07T10:30:00Z"
    }
  ],
  "total": 78,
  "averageRating": 4.2,
  "page": 1
}
```

---

### POST /api/feedback
**Purpose:** Submit user feedback/rating

**Request:**
```json
{
  "rating": 5,
  "comment": "Very helpful and fast!",
  "messageId": "msg_123",
  "lang": "en"
}
```

**Response:**
```json
{
  "_id": "new_feedback_id",
  "rating": 5,
  "comment": "Very helpful and fast!",
  "messageId": "msg_123",
  "lang": "en",
  "createdAt": "2026-05-07T10:30:00Z"
}
```

**Validation:**
- `rating` must be 1-5
- `comment` max 500 characters
- `lang` must be one of: en, hi, mr, ta, te

---

### GET /api/feedback/stats
**Purpose:** Get feedback statistics

**Response:**
```json
{
  "totalFeedback": 78,
  "averageRating": 4.2,
  "ratingDistribution": {
    "1": 2,
    "2": 5,
    "3": 8,
    "4": 25,
    "5": 38
  },
  "ratingByLanguage": {
    "en": 4.3,
    "hi": 4.1,
    "mr": 4.0,
    "ta": 3.8,
    "te": 4.2
  },
  "commonThemes": {
    "helpful": 35,
    "fast": 28,
    "accurate": 22,
    "multilingual": 15
  }
}
```

---

## 5. SYSTEM ENDPOINTS

### GET /api/health
**Purpose:** Check server health/status

**Response:**
```json
{
  "status": "OK",
  "message": "CampusBot backend is running!",
  "dbStatus": "Connected",
  "timestamp": "2026-05-07T10:30:00Z",
  "uptime": "2h 30m"
}
```

---

### GET /api/stats
**Purpose:** Get overall application statistics

**Response:**
```json
{
  "faqs": 8,
  "conversations": 156,
  "feedbackCount": 78,
  "avgRating": 4.2,
  "activeUsers": 42,
  "dbStatus": "Connected",
  "serverStatus": "Running"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Message cannot be empty",
  "code": "INVALID_INPUT"
}
```

### 404 Not Found
```json
{
  "error": "FAQ not found",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details here",
  "code": "SERVER_ERROR"
}
```

---

## Language Codes
- `en` - English
- `hi` - हिंदी (Hindi)
- `mr` - मराठी (Marathi)
- `ta` - தமிழ் (Tamil)
- `te` - తెలుగు (Telugu)

---

## Categories
- `fees` - Financial information
- `admissions` - Admission process
- `exams` - Examination information
- `hostel` - Hostel facilities
- `library` - Library services
- `placements` - Placement information
- `scholarships` - Scholarship details
- `timetable` - Class schedule

---

## Common Intents
- `fee_deadline` - Fee payment deadline
- `admission` - Admission process
- `exam_schedule` - Exam dates
- `hostel` - Hostel information
- `library` - Library services
- `placement` - Placement statistics
- `scholarship` - Scholarship info
- `timetable` - Class timetable
- `unknown` - No match found

---

## Testing with cURL

### Test Chat
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the fees?","lang":"en"}'
```

### Test Health
```bash
curl http://localhost:5000/api/health
```

### Get All FAQs
```bash
curl http://localhost:5000/api/faqs
```

### Submit Feedback
```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Great!","lang":"en"}'
```

---

## Rate Limiting
- Currently: No rate limiting
- Recommended: 100 requests/minute per IP
- Contact support if needed: helpdesk@college.edu

---

## Authentication
- Currently: None (public API)
- Admin endpoints should be protected with API key
- Recommended: Add JWT authentication for admin routes

---

## CORS Policy
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Currently allows all origins (use '*')
- Change to specific domain in production
