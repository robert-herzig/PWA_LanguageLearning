// Chatbot functionality for Language Learning PWA
class LanguageChatbot {
    constructor() {
        this.currentLevel = null;
        this.currentTopic = null;
        this.vocabularyWords = [];
        this.apiKey = null;
        this.isDemo = true;
        this.dailyUsage = this.loadDailyUsage();
        this.dailyCost = this.loadDailyCost();
        this.maxDailyMessages = 50;
        this.maxDailyCost = 0.50;
        this.userId = this.getUserId();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadTopics();
        this.updateUsageDisplay();
    }
    
    setupEventListeners() {
        // Level selection
        document.querySelectorAll('.level-btn-chat').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectLevel(e.target.dataset.level);
            });
        });
        
        // Topic selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('topic-btn-chat')) {
                this.selectTopic(e.target.dataset.topic);
            }
        });
        
        // Start chatting
        document.getElementById('start-chatting')?.addEventListener('click', () => {
            this.startChatting();
        });
        
        // Send message
        document.getElementById('send-message')?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key to send
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Reset chat
        document.getElementById('reset-chat')?.addEventListener('click', () => {
            this.resetChat();
        });
        
        // Vocabulary chip clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('vocab-chip')) {
                this.insertVocabWord(e.target.textContent);
            }
        });
    }
    
    selectLevel(level) {
        this.currentLevel = level;
        
        // Update UI
        document.querySelectorAll('.level-btn-chat').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-level="${level}"]`).classList.add('selected');
        
        // Show topic selection
        document.getElementById('topic-step').style.display = 'block';
        
        console.log(`Selected level: ${level}`);
    }
    
    async loadTopics() {
        try {
            // Get available topics from the topical vocabulary system
            const topics = [
                { id: 'work', name: 'Arbeit', level: 'B1' },
                { id: 'travel', name: 'Reisen', level: 'B1' },
                { id: 'food', name: 'Essen', level: 'B1' },
                { id: 'technology', name: 'Technologie', level: 'B2' },
                { id: 'health', name: 'Gesundheit', level: 'B2' },
                { id: 'environment', name: 'Umwelt', level: 'B2' }
            ];
            
            const topicContainer = document.getElementById('chat-topic-buttons');
            topicContainer.innerHTML = '';
            
            topics.forEach(topic => {
                const button = document.createElement('button');
                button.className = 'topic-btn-chat';
                button.dataset.topic = topic.id;
                button.innerHTML = `${topic.name} <span class="topic-level">(${topic.level})</span>`;
                topicContainer.appendChild(button);
            });
            
        } catch (error) {
            console.error('Error loading topics:', error);
        }
    }
    
    async selectTopic(topicId) {
        this.currentTopic = topicId;
        
        // Update UI
        document.querySelectorAll('.topic-btn-chat').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-topic="${topicId}"]`).classList.add('selected');
        
        // Load vocabulary for this topic
        await this.loadTopicVocabulary(topicId);
        
        // Show API configuration
        document.getElementById('api-step').style.display = 'block';
        
        console.log(`Selected topic: ${topicId}`);
    }
    
    async loadTopicVocabulary(topicId) {
        try {
            // Determine the appropriate level folder
            const level = this.currentLevel === 'A2' ? 'b1' : this.currentLevel.toLowerCase();
            const language = 'spanish'; // Assuming Spanish-German learning
            
            const response = await fetch(`./data/word_lists/${language}/${level}/${topicId}.json`);
            if (response.ok) {
                const data = await response.json();
                this.vocabularyWords = data.words.slice(0, 15); // Limit to 15 words
                console.log(`Loaded ${this.vocabularyWords.length} vocabulary words for ${topicId}`);
            }
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            this.vocabularyWords = [];
        }
    }
    
    startChatting() {
        // Get API key if provided
        const apiKeyInput = document.getElementById('api-key-input');
        this.apiKey = apiKeyInput.value.trim();
        this.isDemo = !this.apiKey;
        
        // Check daily limits
        if (this.dailyUsage >= this.maxDailyMessages || this.dailyCost >= this.maxDailyCost) {
            this.showLimitReached();
            return;
        }
        
        // Hide setup and show chat interface
        document.getElementById('chatbot-setup').style.display = 'none';
        document.getElementById('chatbot-interface').style.display = 'block';
        
        // Update chat header
        document.getElementById('chat-level').textContent = this.currentLevel;
        document.getElementById('chat-topic').textContent = this.getTopicDisplayName(this.currentTopic);
        document.getElementById('topic-name').textContent = this.getTopicDisplayName(this.currentTopic);
        
        // Load vocabulary hints
        this.loadVocabularyHints();
        
        // Focus input
        document.getElementById('chat-input').focus();
    }
    
    loadVocabularyHints() {
        const vocabContainer = document.getElementById('vocab-chips');
        vocabContainer.innerHTML = '';
        
        // Show first 8 vocabulary words as hints
        this.vocabularyWords.slice(0, 8).forEach(wordObj => {
            const chip = document.createElement('span');
            chip.className = 'vocab-chip';
            chip.textContent = wordObj.word;
            chip.title = `Klicken zum Einfügen: ${wordObj.word}`;
            vocabContainer.appendChild(chip);
        });
    }
    
    insertVocabWord(word) {
        const input = document.getElementById('chat-input');
        const currentText = input.value;
        const cursorPos = input.selectionStart;
        
        const beforeCursor = currentText.substring(0, cursorPos);
        const afterCursor = currentText.substring(cursorPos);
        
        // Add space before word if needed
        const needsSpaceBefore = beforeCursor.length > 0 && !beforeCursor.endsWith(' ');
        const spacePrefix = needsSpaceBefore ? ' ' : '';
        
        const newText = beforeCursor + spacePrefix + word + ' ' + afterCursor;
        input.value = newText;
        
        // Move cursor to after the inserted word
        const newCursorPos = cursorPos + spacePrefix.length + word.length + 1;
        input.setSelectionRange(newCursorPos, newCursorPos);
        input.focus();
    }
    
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Check limits
        if (this.dailyUsage >= this.maxDailyMessages) {
            this.showLimitReached();
            return;
        }
        
        // Clear input and show user message
        input.value = '';
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Get AI response
        try {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
            
            // Update usage
            this.incrementUsage();
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Entschuldigung, ich konnte nicht antworten. Bitte versuche es später noch einmal.', 'ai', true);
            console.error('Error getting AI response:', error);
        }
    }
    
    async getAIResponse(message) {
        if (this.isDemo) {
            // Demo responses for testing
            return this.getDemoResponse(message);
        }
        
        // Real API call (would need backend)
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    level: this.currentLevel,
                    topic: this.currentTopic,
                    vocabularyWords: this.vocabularyWords.map(w => w.word),
                    userId: this.userId
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }
            
            const data = await response.json();
            
            // Update cost tracking
            this.dailyCost += data.estimatedCost;
            this.saveDailyCost();
            this.updateUsageDisplay();
            
            return data.response;
            
        } catch (error) {
            console.error('API Error:', error);
            return this.getDemoResponse(message);
        }
    }
    
    getDemoResponse(message) {
        // Demo responses based on topic and level
        const responses = {
            work: [
                "Das ist interessant! Erzähle mir mehr über deine Arbeit. Welchen Beruf übst du aus?",
                "Arbeit ist ein wichtiges Thema. Hast du viel Stress im Büro oder magst du deinen Job?",
                "Sehr gut! Du benutzt schöne Wörter. Möchtest du über deinen Arbeitsplatz sprechen?"
            ],
            travel: [
                "Reisen ist wunderbar! Wohin möchtest du als nächstes fahren?",
                "Das klingt spannend! Welche Länder hast du schon besucht?",
                "Toll! Du sprichst sehr gut über das Reisen. Fliegst du gern oder fährst du lieber mit dem Zug?"
            ],
            food: [
                "Essen ist mein Lieblingsthema! Was isst du gern zum Frühstück?",
                "Sehr interessant! Kochst du gern oder gehst du lieber ins Restaurant?",
                "Das hört sich lecker an! Welche deutsche Spezialität möchtest du probieren?"
            ]
        };
        
        // Add vocabulary word suggestions
        const topicResponses = responses[this.currentTopic] || responses.work;
        const randomResponse = topicResponses[Math.floor(Math.random() * topicResponses.length)];
        
        // Add a vocabulary suggestion
        if (this.vocabularyWords.length > 0) {
            const randomWord = this.vocabularyWords[Math.floor(Math.random() * this.vocabularyWords.length)];
            return `${randomResponse} Kannst du das Wort "${randomWord.word}" in einem Satz verwenden?`;
        }
        
        return randomResponse;
    }
    
    addMessage(content, sender, isError = false) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message ${isError ? 'error-message' : ''}`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${content}</p>
            </div>
            <div class="message-time">${timeString}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showTypingIndicator() {
        document.getElementById('chat-status').style.display = 'flex';
    }
    
    hideTypingIndicator() {
        document.getElementById('chat-status').style.display = 'none';
    }
    
    resetChat() {
        // Clear messages except the initial one
        const messagesContainer = document.getElementById('chat-messages');
        const initialMessage = messagesContainer.querySelector('.ai-message');
        messagesContainer.innerHTML = '';
        messagesContainer.appendChild(initialMessage);
        
        // Clear input
        document.getElementById('chat-input').value = '';
        
        // Focus input
        document.getElementById('chat-input').focus();
    }
    
    incrementUsage() {
        this.dailyUsage++;
        this.saveDailyUsage();
        this.updateUsageDisplay();
    }
    
    updateUsageDisplay() {
        document.getElementById('daily-usage').textContent = `${this.dailyUsage}/${this.maxDailyMessages} Nachrichten heute`;
        document.getElementById('cost-info').textContent = `Budget: $${(this.maxDailyCost - this.dailyCost).toFixed(3)}`;
    }
    
    showLimitReached() {
        alert('Du hast dein Tageslimit erreicht. Versuche es morgen wieder!');
    }
    
    getTopicDisplayName(topicId) {
        const topicNames = {
            work: 'Arbeit',
            travel: 'Reisen', 
            food: 'Essen',
            technology: 'Technologie',
            health: 'Gesundheit',
            environment: 'Umwelt'
        };
        return topicNames[topicId] || topicId;
    }
    
    // Storage methods
    getUserId() {
        let userId = localStorage.getItem('chatbot-user-id');
        if (!userId) {
            userId = 'user-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatbot-user-id', userId);
        }
        return userId;
    }
    
    loadDailyUsage() {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('chatbot-daily-usage');
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date === today) {
                return data.count;
            }
        }
        return 0;
    }
    
    saveDailyUsage() {
        const today = new Date().toDateString();
        localStorage.setItem('chatbot-daily-usage', JSON.stringify({
            date: today,
            count: this.dailyUsage
        }));
    }
    
    loadDailyCost() {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('chatbot-daily-cost');
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date === today) {
                return data.cost;
            }
        }
        return 0;
    }
    
    saveDailyCost() {
        const today = new Date().toDateString();
        localStorage.setItem('chatbot-daily-cost', JSON.stringify({
            date: today,
            cost: this.dailyCost
        }));
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageChatbot = new LanguageChatbot();
});
