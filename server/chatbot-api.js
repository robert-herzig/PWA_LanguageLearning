// Chatbot API Handler - Server-side component
// This would typically run on a backend server (Node.js/Express)
// For demo purposes, this shows the structure

const express = require('express');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');

const app = express();
app.use(express.json());

// Rate limiting: max 50 requests per day per user
const chatbotLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Daily chat limit reached. Try again tomorrow.',
    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
});

// Cost tracking per user (in-memory for demo, use database in production)
const userCosts = new Map();
const MAX_DAILY_COST = 0.50; // $0.50 per user per day

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Stored securely in environment variables
});

// System prompts for different levels with vocabulary focus
const systemPrompts = {
  A2: "You are a friendly German language teacher for A2 (elementary) level students. Use simple vocabulary and basic grammar structures. Keep sentences short and clear. Use present tense primarily, with some past tense. When introducing new vocabulary, provide context and examples. Encourage the student and provide gentle corrections. Create simple stories or scenarios to make vocabulary memorable.",
  
  B1: "You are a German language teacher for B1 (intermediate) level students. Use intermediate vocabulary and more complex grammar including past, present, and future tenses. You can discuss everyday topics like work, travel, food, and education. When teaching vocabulary, use it in context and encourage students to practice with real-life scenarios. Provide explanations when introducing new concepts and create engaging conversations around the topic vocabulary.",
  
  B2: "You are a German language teacher for B2 (upper-intermediate) level students. Use advanced vocabulary and complex grammar structures including subjunctive mood, passive voice, and conditional sentences. Discuss abstract topics and provide detailed explanations. Challenge the student appropriately with sophisticated vocabulary usage. Create complex scenarios and stories that require higher-level thinking and vocabulary application. Encourage nuanced discussions about the topic."
};

app.post('/api/chat', chatbotLimiter, async (req, res) => {
  try {
    const { message, level, topic, vocabularyWords, userId } = req.body;
    
    // Validate input
    if (!message || !level || !topic) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check daily cost limit
    const userDailyCost = userCosts.get(userId) || 0;
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
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 200,
      temperature: 0.7
    });
    
    // Estimate cost (GPT-3.5-turbo: ~$0.002 per 1K tokens)
    const estimatedCost = (response.usage.total_tokens / 1000) * 0.002;
    userCosts.set(userId, userDailyCost + estimatedCost);
    
    res.json({
      response: response.choices[0].message.content,
      usage: response.usage,
      estimatedCost: estimatedCost,
      remainingBudget: MAX_DAILY_COST - (userDailyCost + estimatedCost)
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

module.exports = app;
