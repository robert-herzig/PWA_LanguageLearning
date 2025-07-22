# Backend Setup for Language Learning PWA Chatbot

## Overview
This guide shows how to set up a simple backend to handle OpenAI API calls securely for your language learning chatbot.

## Quick Setup (Node.js + Express)

### 1. Initialize Backend
```bash
mkdir server
cd server
npm init -y
npm install express cors dotenv express-rate-limit openai
```

### 2. Create Environment File
Create `.env` file in the server directory:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### 3. Complete Server Implementation
Use the provided `chatbot-api.js` file and create `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chatbotApi = require('./chatbot-api');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Use the chatbot API routes
app.use(chatbotApi);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### 4. Run the Server
```bash
cd server
node server.js
```

### 5. Update Frontend Configuration
In your PWA's `chatbot.js`, update the API endpoint:
```javascript
// Change this line in the getAIResponse method:
const response = await fetch('http://localhost:3001/api/chat', {
```

## Security Features Implemented

### ✅ Rate Limiting
- **50 requests per day per user**
- **IP-based tracking**
- **Automatic reset every 24 hours**

### ✅ Cost Control
- **$0.50 daily budget per user**
- **Token usage tracking**
- **Automatic cost calculation**

### ✅ API Key Security
- **Server-side storage only**
- **Environment variables**
- **Never exposed to frontend**

### ✅ Input Validation
- **Message length limits**
- **Required field validation**
- **Level and topic validation**

## Frontend Demo Mode

The frontend includes a **demo mode** that works without a backend:
- ✅ **No API key required**
- ✅ **Sample responses based on topic/level**
- ✅ **Full UI functionality**
- ✅ **Vocabulary integration**

## Production Deployment Options

### Option 1: Vercel (Recommended)
1. Push server code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Option 2: Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy with one click

### Option 3: Heroku
1. Create Heroku app
2. Add environment variables
3. Deploy from GitHub

## Cost Estimation

**GPT-3.5-Turbo Pricing:**
- **Input tokens:** ~$0.0005 per 1K tokens
- **Output tokens:** ~$0.0015 per 1K tokens
- **Average conversation:** ~200 tokens = ~$0.0003
- **Daily limit (50 messages):** ~$0.015
- **Monthly cost per active user:** ~$0.45

**Daily budget of $0.50 provides safe margin for usage spikes.**

## Testing the Chatbot

### 1. Start Local Server
```bash
cd server
npm install
node server.js
```

### 2. Test API Directly
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hallo, wie geht es dir?",
    "level": "B1",
    "topic": "work",
    "vocabularyWords": ["Arbeit", "Büro", "Kollege"],
    "userId": "test-user"
  }'
```

### 3. Use Demo Mode
- Access your PWA
- Navigate to chatbot
- Leave API key field empty
- Experience demo responses

## Features Implemented

### ✅ Level-Appropriate Responses
- **A2:** Simple vocabulary, present tense
- **B1:** Intermediate grammar, everyday topics  
- **B2:** Complex structures, abstract concepts

### ✅ Topic Integration
- **Vocabulary hints** from selected topic
- **Context-aware responses**
- **Word usage encouragement**

### ✅ German Language Focus
- **Native German responses**
- **Grammar corrections**
- **Cultural context**

Your chatbot is now ready for production use with proper security and cost controls! 🚀
