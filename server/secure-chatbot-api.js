const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();

// CORS configuration for your frontend
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://robert-herzig.github.io', // GitHub Pages
    'https://your-custom-domain.com' // Add your custom domain if you have one
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Enhanced rate limiting
const chatbotLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: parseInt(process.env.MAX_DAILY_REQUESTS) || 50,
  message: {
    error: 'Daily chat limit reached. Try again tomorrow.',
    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Cost tracking per user (use Redis or database in production)
const userCosts = new Map();
const MAX_DAILY_COST = parseFloat(process.env.MAX_DAILY_COST) || 0.50;

// Initialize OpenAI with environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Validate API key on startup
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY environment variable is not set!');
  console.error('Please create a .env file with your OpenAI API key.');
  process.exit(1);
}

// System prompts for different levels with vocabulary focus
const systemPrompts = {
  A2: "You are a friendly German language teacher for A2 (elementary) level students. Use simple vocabulary and basic grammar structures. Keep sentences short and clear. Use present tense primarily, with some past tense. When introducing new vocabulary, provide context and examples. Encourage the student and provide gentle corrections. Create simple stories or scenarios to make vocabulary memorable.",
  
  B1: "You are a German language teacher for B1 (intermediate) level students. Use intermediate vocabulary and more complex grammar including past, present, and future tenses. You can discuss everyday topics like work, travel, food, and education. When teaching vocabulary, use it in context and encourage students to practice with real-life scenarios. Provide explanations when introducing new concepts and create engaging conversations around the topic vocabulary.",
  
  B2: "You are a German language teacher for B2 (upper-intermediate) level students. Use advanced vocabulary and complex grammar structures including subjunctive mood, passive voice, and conditional sentences. Discuss abstract topics and provide detailed explanations. Challenge the student appropriately with sophisticated vocabulary usage. Create complex scenarios and stories that require higher-level thinking and vocabulary application. Encourage nuanced discussions about the topic."
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Main chat endpoint
app.post('/api/chat', chatbotLimiter, async (req, res) => {
  try {
    const { message, level, topic, vocabularyWords, userId } = req.body;
    
    // Validate input
    if (!message || !level || !topic) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate a simple user ID if not provided (for anonymous users)
    const effectiveUserId = userId || `anon_${req.ip.replace(/\./g, '_')}`;
    
    // Check daily cost limit
    const userDailyCost = userCosts.get(effectiveUserId) || 0;
    if (userDailyCost >= MAX_DAILY_COST) {
      return res.status(429).json({ 
        error: 'Daily cost limit reached',
        limit: MAX_DAILY_COST,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }
    
    // Build vocabulary context with story-based approach
    let vocabContext = '';
    if (vocabularyWords && vocabularyWords.length > 0) {
      const words = vocabularyWords.slice(0, 8); // Use first 8 words for context
      vocabContext = `Use vocabulary from the topic "${topic}". 
      
      Key vocabulary to incorporate naturally: ${words.join(', ')}.
      
      Encourage the student to use these words by:
      1. Using them yourself in conversation
      2. Asking questions that prompt their usage
      3. Providing positive reinforcement when they use them correctly
      4. Creating scenarios or stories that naturally require these words
      
      If this is the start of conversation, consider beginning with a short story or scenario using several of these vocabulary words.`;
    } else {
      vocabContext = `Focus on the topic "${topic}" and encourage practical conversation.`;
    }
    
    // Create context-aware prompt
    const systemPrompt = `${systemPrompts[level]} ${vocabContext} 
    
    Important guidelines:
    - Respond in German only
    - If the student makes mistakes, gently correct them by showing the correct version
    - Keep responses conversational and engaging
    - Ask follow-up questions to continue the conversation
    - Use stories, scenarios, or real-life examples to make vocabulary memorable
    - Adapt your complexity to the student's level: ${level}
    - Be encouraging and supportive`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // More cost-effective than gpt-3.5-turbo
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 200,
      temperature: 0.7
    });
    
    // Estimate cost (gpt-4o-mini: ~$0.00015 per 1K input tokens, ~$0.0006 per 1K output tokens)
    const inputCost = (response.usage.prompt_tokens / 1000) * 0.00015;
    const outputCost = (response.usage.completion_tokens / 1000) * 0.0006;
    const estimatedCost = inputCost + outputCost;
    
    // Update user cost tracking
    userCosts.set(effectiveUserId, userDailyCost + estimatedCost);
    
    // Log usage for monitoring (remove in production or use proper logging)
    console.log(`Chat request - User: ${effectiveUserId}, Cost: $${estimatedCost.toFixed(4)}, Total: $${(userDailyCost + estimatedCost).toFixed(4)}`);
    
    res.json({
      response: response.choices[0].message.content,
      usage: {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens
      },
      estimatedCost: estimatedCost,
      remainingBudget: MAX_DAILY_COST - (userDailyCost + estimatedCost)
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Don't expose internal errors to client
    if (error.code === 'insufficient_quota') {
      res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
    } else if (error.code === 'rate_limit_exceeded') {
      res.status(429).json({ error: 'API rate limit exceeded. Please try again in a moment.' });
    } else {
      res.status(500).json({ error: 'Failed to generate response' });
    }
  }
});

// Reset daily costs at midnight (basic implementation)
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    userCosts.clear();
    console.log('Daily costs reset');
  }
}, 60000); // Check every minute

const PORT = process.env.PORT || process.env.RAILWAY_PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chatbot API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Key configured: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`CORS origins: ${corsOptions.origin}`);
});

module.exports = app;
