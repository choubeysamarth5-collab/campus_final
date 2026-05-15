# Database Schema Documentation

## MongoDB Structure

### Database Name
```
campusbot
```

### Collections
1. faqs
2. logs
3. feedbacks

---

## 1. FAQs Collection

### Purpose
Stores all question-answer pairs with multilingual support.

### Schema
```javascript
{
  _id: ObjectId,                              // MongoDB automatic ID
  keywords: [String],                         // Search keywords array
  category: String,                           // Category name
  intent: String,                             // Unique intent identifier
  answers: {
    en: String,                               // English answer (required)
    hi: String,                               // Hindi answer
    mr: String,                               // Marathi answer
    ta: String,                               // Tamil answer
    te: String                                // Telugu answer
  },
  isActive: Boolean,                          // Active/Inactive flag
  createdAt: Date,                            // Creation timestamp
  updatedAt: Date                             // Last update timestamp
}
```

### Example Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "keywords": ["fee", "fees", "payment", "deadline", "due date", "last date", "pay"],
  "category": "fees",
  "intent": "fee_deadline",
  "answers": {
    "en": "📅 **Fee Payment Deadlines:**\n• Semester 1: July 31\n• Semester 2: January 31\n• Late fee: ₹500\n• Portal: fees.college.edu",
    "hi": "📅 **शुल्क भुगतान की अंतिम तिथि:**\n• सेमेस्टर 1: 31 जुलाई\n• सेमेस्टर 2: 31 जनवरी\n• विलंब शुल्क: ₹500",
    "mr": "📅 **शुल्क भरण्याची मुदत:**\n• सेमिस्टर 1: 31 जुलै\n• सेमिस्टर 2: 31 जानेवारी\n• विलंब शुल्क: ₹500",
    "ta": "📅 **கட்டணம் செலுத்தும் கடைசி தேதி:**\n• பருவம் 1: ஜூலை 31\n• பருவம் 2: ஜனவரி 31\n• தாமத கட்டணம்: ₹500",
    "te": "📅 **ఫీ చెల్లింపు అంతిమ తేదీ:**\n• సెమిస్టర్ 1: జూలై 31\n• సెమిస్టర్ 2: జనవరి 31\n• ఆలస్య ఫీ: ₹500"
  },
  "isActive": true,
  "createdAt": ISODate("2026-05-07T08:00:00Z"),
  "updatedAt": ISODate("2026-05-07T08:00:00Z")
}
```

### Field Details

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| _id | ObjectId | Auto | MongoDB auto-generated |
| keywords | Array[String] | Yes | Used for matching user queries |
| category | String | Yes | Must be one of predefined categories |
| intent | String | Yes | Unique identifier for NLP |
| answers.en | String | Yes | English answer mandatory |
| answers.hi | String | No | Hindi (optional) |
| answers.mr | String | No | Marathi (optional) |
| answers.ta | String | No | Tamil (optional) |
| answers.te | String | No | Telugu (optional) |
| isActive | Boolean | No | Default: true |
| createdAt | Date | Auto | System generated |
| updatedAt | Date | Auto | System generated |

### Indexes
```javascript
// Text index for full-text search
db.faqs.createIndex({ "keywords": "text" })

// Index on category for faster filtering
db.faqs.createIndex({ "category": 1 })

// Index on intent for unique identification
db.faqs.createIndex({ "intent": 1 }, { unique: true })

// Index on active status
db.faqs.createIndex({ "isActive": 1 })
```

### Valid Categories
```
fees
admissions
exams
hostel
library
placements
scholarships
timetable
other
```

### Sample Queries
```javascript
// Find all FAQs
db.faqs.find({})

// Find by category
db.faqs.find({ category: "fees" })

// Find by intent
db.faqs.find({ intent: "fee_deadline" })

// Find active FAQs
db.faqs.find({ isActive: true })

// Text search on keywords
db.faqs.find({ $text: { $search: "fee payment" } })

// Update FAQ
db.faqs.updateOne(
  { _id: ObjectId("...") },
  { $set: { "answers.en": "New answer" } }
)

// Soft delete FAQ
db.faqs.updateOne(
  { _id: ObjectId("...") },
  { $set: { isActive: false } }
)
```

---

## 2. Logs Collection

### Purpose
Records every chat conversation for analytics and audit trail.

### Schema
```javascript
{
  _id: ObjectId,                              // MongoDB automatic ID
  userMessage: String,                        // User's question
  botReply: String,                           // Bot's answer
  lang: String,                               // Language used (en/hi/mr/ta/te)
  intent: String,                             // Detected intent
  timestamp: Date,                            // When message was sent
  createdAt: Date,                            // Auto-generated
  updatedAt: Date                             // Auto-generated
}
```

### Example Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "userMessage": "What are the fees?",
  "botReply": "📅 **Fee Payment Deadlines:**\n• Semester 1: July 31...",
  "lang": "en",
  "intent": "fee_deadline",
  "timestamp": ISODate("2026-05-07T10:30:00Z"),
  "createdAt": ISODate("2026-05-07T10:30:00Z"),
  "updatedAt": ISODate("2026-05-07T10:30:00Z")
}
```

### Field Details

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| _id | ObjectId | Auto | MongoDB auto-generated |
| userMessage | String | Yes | User's input text |
| botReply | String | Yes | Bot's response |
| lang | String | No | Default: 'en' |
| intent | String | No | Default: 'unknown' |
| timestamp | Date | No | When msg was sent |
| createdAt | Date | Auto | System generated |
| updatedAt | Date | Auto | System generated |

### Indexes
```javascript
// Index on language for filtering
db.logs.createIndex({ "lang": 1 })

// Index on intent for analytics
db.logs.createIndex({ "intent": 1 })

// Index on timestamp for time-based queries
db.logs.createIndex({ "timestamp": 1 })

// Compound index for common queries
db.logs.createIndex({ "lang": 1, "intent": 1 })

// TTL index to auto-delete logs after 90 days (optional)
db.logs.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 7776000 })
```

### Sample Queries
```javascript
// Get all conversations
db.logs.find({})

// Get last 10 conversations
db.logs.find({}).sort({ timestamp: -1 }).limit(10)

// Get conversations in Hindi
db.logs.find({ lang: "hi" })

// Get fee-related conversations
db.logs.find({ intent: "fee_deadline" })

// Get conversations from last 7 days
db.logs.find({
  timestamp: { 
    $gte: ISODate("2026-04-30T00:00:00Z")
  }
})

// Count conversations by language
db.logs.aggregate([
  { $group: { _id: "$lang", count: { $sum: 1 } } }
])

// Get most common intents
db.logs.aggregate([
  { $group: { _id: "$intent", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])

// Get conversations by language and date
db.logs.find({
  lang: "en",
  timestamp: { $gte: ISODate("2026-05-01T00:00:00Z") }
})
```

---

## 3. Feedbacks Collection

### Purpose
Stores user ratings and comments about bot responses.

### Schema
```javascript
{
  _id: ObjectId,                              // MongoDB automatic ID
  rating: Number,                             // 1-5 star rating
  comment: String,                            // Optional user comment
  messageId: String,                          // Reference to message
  lang: String,                               // Language of session
  createdAt: Date,                            // Auto-generated
  updatedAt: Date                             // Auto-generated
}
```

### Example Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "rating": 5,
  "comment": "Very helpful! Got exactly what I needed.",
  "messageId": "msg_507f1f77bcf86cd799439012",
  "lang": "en",
  "createdAt": ISODate("2026-05-07T10:35:00Z"),
  "updatedAt": ISODate("2026-05-07T10:35:00Z")
}
```

### Field Details

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| _id | ObjectId | Auto | MongoDB auto-generated |
| rating | Number | Yes | 1-5 (required) |
| comment | String | No | Max 500 characters |
| messageId | String | No | Reference to log message |
| lang | String | No | Default: 'en' |
| createdAt | Date | Auto | System generated |
| updatedAt | Date | Auto | System generated |

### Indexes
```javascript
// Index on rating for filtering
db.feedbacks.createIndex({ "rating": 1 })

// Index on language
db.feedbacks.createIndex({ "lang": 1 })

// Index on creation date
db.feedbacks.createIndex({ "createdAt": 1 })

// Compound index for common queries
db.feedbacks.createIndex({ "rating": 1, "lang": 1 })
```

### Sample Queries
```javascript
// Get all feedback
db.feedbacks.find({})

// Get 5-star reviews
db.feedbacks.find({ rating: 5 })

// Get negative feedback (1-2 stars)
db.feedbacks.find({ rating: { $lte: 2 } })

// Get feedback with comments
db.feedbacks.find({ comment: { $exists: true, $ne: "" } })

// Calculate average rating
db.feedbacks.aggregate([
  { $group: { _id: null, avgRating: { $avg: "$rating" } } }
])

// Rating distribution
db.feedbacks.aggregate([
  { $group: { _id: "$rating", count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])

// Average rating by language
db.feedbacks.aggregate([
  { $group: { 
      _id: "$lang", 
      avgRating: { $avg: "$rating" },
      count: { $sum: 1 }
    } 
  }
])

// Get latest feedback
db.feedbacks.find({}).sort({ createdAt: -1 }).limit(10)

// Feedback from last 30 days
db.feedbacks.find({
  createdAt: { 
    $gte: ISODate("2026-04-07T00:00:00Z")
  }
})
```

---

## Data Relationships

```
FAQs Collection
     ↓ (matched by keywords)
Logs Collection (userMessage → FAQ intent)
     ↓ (referenced by messageId)
Feedbacks Collection
```

### Example Flow
1. User asks: "What are the fees?"
2. System matches to FAQ with intent "fee_deadline"
3. Creates Log entry with intent
4. User rates the response
5. Creates Feedback entry referencing the Log

---

## Statistics Queries

### Total Statistics
```javascript
db.faqs.countDocuments()                    // Total FAQs
db.logs.countDocuments()                    // Total conversations
db.feedbacks.countDocuments()               // Total ratings
```

### Language Distribution
```javascript
db.logs.aggregate([
  { $group: { _id: "$lang", count: { $sum: 1 } } }
])
```

### Average Rating
```javascript
db.feedbacks.aggregate([
  { $group: { _id: null, avg: { $avg: "$rating" } } }
])
```

### Most Common Intents
```javascript
db.logs.aggregate([
  { $group: { _id: "$intent", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### FAQ Performance
```javascript
db.logs.aggregate([
  { $group: { 
      _id: "$intent", 
      count: { $sum: 1 },
      avgRating: { $avg: { /* join with feedback */ } }
    } 
  }
])
```

---

## Backup & Maintenance

### Backup Command
```bash
mongodump --db campusbot --out ./backup
```

### Restore Command
```bash
mongorestore --db campusbot ./backup/campusbot
```

### Export to CSV (for reporting)
```bash
mongoexport --db campusbot --collection logs --csv --fields userMessage,intent,lang > logs.csv
```

### Delete Old Logs (cleanup)
```javascript
// Delete logs older than 90 days
db.logs.deleteMany({
  createdAt: { 
    $lt: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000)
  }
})
```

---

## Connection String
```
mongodb://localhost:27017/campusbot

// For MongoDB Atlas Cloud:
mongodb+srv://username:password@cluster.mongodb.net/campusbot?retryWrites=true&w=majority
```

---

## Data Size Estimation

### Sample Data
- 8 FAQs × ~500 bytes = 4 KB
- 1000 logs × ~300 bytes = 300 KB
- 500 feedbacks × ~200 bytes = 100 KB

### Estimated Growth (1 year, 1000 users daily)
- FAQs: ~50-100 (growth: 10 KB)
- Logs: ~365,000 (growth: ~110 MB)
- Feedbacks: ~100,000 (growth: ~20 MB)

**Total estimated: ~130 MB/year**

---

## Performance Tips
1. Create indexes on frequently searched fields
2. Use pagination for large result sets
3. Archive old logs after 1 year
4. Monitor collection size with `db.collection.stats()`
5. Use TTL indexes for automatic cleanup
