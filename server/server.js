const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chatbotApi = require('./chatbot-api');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8000', 
    'https://robert-herzig.github.io'
  ]
}));
app.use(express.json());

// Use the chatbot API routes
app.use(chatbotApi);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Language Learning PWA Chatbot API'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🤖 Chatbot API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
});
