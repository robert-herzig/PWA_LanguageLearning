# Secure API Setup Guide

## Overview
This setup allows you to host the chatbot with your API key securely on the server side, so testers can use the full functionality without needing their own API keys or seeing yours.

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your actual OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   PORT=3001
   NODE_ENV=production
   MAX_DAILY_REQUESTS=50
   MAX_DAILY_COST=0.50
   ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000,https://your-domain.com
   ```

### 3. Development Testing
Start both frontend and backend:
```bash
npm run dev:full
```

This will start:
- Frontend on http://localhost:8000 (Python server)
- Backend API on http://localhost:3001 (Node.js server)

### 4. Production Deployment

#### Option A: Simple VPS/Cloud Server
1. Upload your project to your server
2. Install Node.js and Python
3. Set up environment variables
4. Start the services:
   ```bash
   # Start API server
   node server/secure-chatbot-api.js &
   
   # Start frontend (use nginx in production)
   python -m http.server 8000
   ```

#### Option B: Platform as a Service (Recommended)

**For the API (Node.js backend):**
- Deploy to **Heroku**, **Railway**, **Render**, or **Vercel**
- Set environment variables in the platform's dashboard
- The API will be accessible at `https://your-api-domain.com`

**For the Frontend:**
- Deploy to **Netlify**, **Vercel**, or **GitHub Pages**
- Update the API URL in the chatbot if needed

### 5. Update Frontend for Production
If your API is on a different domain, update the chatbot to use the full URL:

```javascript
// In js/chatbot.js, replace '/api/chat' with your full API URL
const apiResponse = await fetch('https://your-api-domain.com/api/chat', {
```

## Security Features

✅ **API Key Protection**: Your OpenAI API key never leaves the server  
✅ **Rate Limiting**: 50 requests per day per user  
✅ **Cost Control**: $0.50 daily limit per user  
✅ **CORS Protection**: Only your domains can access the API  
✅ **Error Handling**: No internal errors exposed to users  

## Cost Management

With gpt-4o-mini pricing:
- ~$0.00015 per 1K input tokens
- ~$0.0006 per 1K output tokens
- Typical chat message: ~$0.001-0.003
- Daily limit: $0.50 per user = ~150-500 messages

## Monitoring

The server logs usage for monitoring:
```
Chat request - User: anon_192_168_1_100, Cost: $0.0023, Total: $0.0156
```

## Testing the Setup

1. Start the services: `npm run dev:full`
2. Go to http://localhost:8000
3. Navigate to the chatbot
4. Try sending a message
5. Check the browser console for "Used secure API with hosted key"

## Fallback Behavior

The chatbot has three levels of fallback:
1. **Secure API** (your hosted key) - Primary method
2. **User API Key** - If they provide their own key
3. **Demo Mode** - If neither API is available

This ensures testers always have a working experience!

## Production Checklist

- [ ] Environment variables set correctly
- [ ] API key working (test with health check: GET /api/health)
- [ ] CORS origins updated for your domain
- [ ] Rate limiting configured appropriately
- [ ] Error monitoring set up
- [ ] Frontend updated with production API URL (if different domain)
