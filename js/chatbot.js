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
            const topicBtn = e.target.closest('.topic-btn-chat');
            if (topicBtn) {
                this.selectTopic(topicBtn.dataset.topic);
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
        
        // Switch topic
        document.getElementById('switch-topic')?.addEventListener('click', () => {
            this.switchTopic();
        });
        
        // Vocabulary chip clicks
        document.addEventListener('click', (e) => {
            const vocabChip = e.target.closest('.vocab-chip');
            if (vocabChip) {
                const wordText = vocabChip.textContent.replace('🔊', '').trim();
                this.insertVocabWord(wordText);
                this.speakText(wordText); // Add TTS
            }
        });
        
        // Message click for TTS
        document.addEventListener('click', (e) => {
            const message = e.target.closest('.message');
            if (message && message.classList.contains('ai-message')) {
                const messageContent = message.querySelector('.message-content p');
                if (messageContent) {
                    this.speakText(messageContent.textContent);
                }
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
            // Dynamically discover available topics from vocabulary files
            const topics = await this.discoverAvailableTopics();
            
            const topicContainer = document.getElementById('chat-topic-buttons');
            topicContainer.innerHTML = '';
            
            // Filter topics by current level if selected
            const filteredTopics = this.currentLevel 
                ? topics.filter(topic => topic.level === this.currentLevel.toLowerCase())
                : topics;
            
            if (filteredTopics.length === 0) {
                topicContainer.innerHTML = '<p class="no-topics">Keine Themen für dieses Level verfügbar.</p>';
                return;
            }
            
            filteredTopics.forEach(topic => {
                const button = document.createElement('button');
                button.className = 'topic-btn-chat';
                button.dataset.topic = topic.id;
                button.innerHTML = `
                    <div class="topic-info">
                        <span class="topic-name">${topic.name}</span>
                        <span class="topic-level">(${topic.level.toUpperCase()})</span>
                        <span class="topic-words">${topic.wordCount} Wörter</span>
                    </div>
                `;
                topicContainer.appendChild(button);
            });
            
        } catch (error) {
            console.error('Error loading topics:', error);
            // Fallback to hardcoded topics
            this.loadFallbackTopics();
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
        
        // Check if we're in production with secure API
        const isProduction = window.location.hostname.includes('github.io');
        
        if (isProduction) {
            // In production, skip API key step and go straight to chat
            console.log('Production environment detected - using secure API');
            this.startChatting();
        } else {
            // In development, show API configuration
            document.getElementById('api-step').style.display = 'block';
        }
        
        console.log(`Selected topic: ${topicId}`);
    }
    
    async loadTopicVocabulary(topicId) {
        try {
            // Determine the appropriate level folder
            const level = this.currentLevel === 'A2' ? 'b1' : this.currentLevel.toLowerCase();
            
            // Try different languages in order of preference
            const languages = ['spanish', 'english', 'russian'];
            let vocabularyData = null;
            
            for (const language of languages) {
                try {
                    const response = await fetch(`./data/word_lists/${language}/${level}/${topicId}.json`);
                    if (response.ok) {
                        vocabularyData = await response.json();
                        console.log(`Loaded vocabulary from ${language}/${level}/${topicId}.json`);
                        break;
                    }
                } catch (err) {
                    continue; // Try next language
                }
            }
            
            if (vocabularyData && Array.isArray(vocabularyData)) {
                this.vocabularyWords = vocabularyData.slice(0, 20); // Get first 20 words
                console.log(`Loaded ${this.vocabularyWords.length} vocabulary words for ${topicId}`);
            } else {
                this.vocabularyWords = [];
                console.warn(`No vocabulary data found for topic: ${topicId}`);
            }
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            this.vocabularyWords = [];
        }
    }
    
    // Discover available topics by scanning the vocabulary files
    async discoverAvailableTopics() {
        const topics = [];
        const levels = ['b1', 'b2'];
        const languages = ['spanish', 'english', 'russian'];
        
        for (const level of levels) {
            for (const language of languages) {
                try {
                    // Try to load the index.json file first
                    const indexResponse = await fetch(`./data/word_lists/${language}/${level}/index.json`);
                    if (indexResponse.ok) {
                        const topicIds = await indexResponse.json();
                        
                        // Load each topic file to get word count and details
                        for (const topicId of topicIds) {
                            try {
                                const topicResponse = await fetch(`./data/word_lists/${language}/${level}/${topicId}.json`);
                                if (topicResponse.ok) {
                                    const topicData = await topicResponse.json();
                                    
                                    // Check if we already have this topic
                                    const existingTopic = topics.find(t => t.id === topicId && t.level === level);
                                    if (!existingTopic) {
                                        topics.push({
                                            id: topicId,
                                            name: this.formatTopicName(topicId),
                                            level: level,
                                            wordCount: Array.isArray(topicData) ? topicData.length : 0,
                                            language: language
                                        });
                                    }
                                }
                            } catch (err) {
                                console.warn(`Could not load topic ${topicId}:`, err);
                            }
                        }
                        break; // Found topics for this level, no need to check other languages
                    }
                } catch (err) {
                    continue; // Try next language
                }
            }
        }
        
        return topics.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Format topic ID into human-readable name
    formatTopicName(topicId) {
        const topicNames = {
            // Spanish topics with proper German translations
            '1._dimensión_física': 'Körperliche Dimension',
            '2._dimensión_perceptiva_y_anímica': 'Wahrnehmung und Gefühle', 
            '3._identidad_personal': 'Persönliche Identität',
            '4._relaciones_personales': 'Persönliche Beziehungen',
            '5._alimentación': 'Ernährung',
            '6._educación': 'Bildung',
            '7._trabajo': 'Arbeit',
            '8._ocio_y_tiempo_libre': 'Freizeit',
            '9._información_y_medios_de_comunicación': 'Information und Medien',
            '10._vivienda': 'Wohnen',
            '11._servicios': 'Dienstleistungen',
            '12._compras,_tiendas_y_establecimientos': 'Einkaufen und Geschäfte',
            '13._salud_e_higiene': 'Gesundheit und Hygiene',
            '14._viajes,_alojamiento_y_transporte': 'Reisen und Transport',
            '15._economía_e_industria': 'Wirtschaft und Industrie',
            '16._ciencia_y_tecnología': 'Wissenschaft und Technologie',
            '17._gobierno,_política_y_sociedad': 'Politik und Gesellschaft',
            '18._actividades_artísticas': 'Künstlerische Aktivitäten',
            '19._religión_y_filosofía': 'Religion und Philosophie',
            '20._geografía_y_naturaleza': 'Geografie und Natur',
            
            // Without prefixes
            'dimensión_física': 'Körperliche Dimension',
            'dimensión_perceptiva_y_anímica': 'Wahrnehmung und Gefühle',
            'identidad_personal': 'Persönliche Identität',
            'relaciones_personales': 'Persönliche Beziehungen',
            'alimentación': 'Ernährung',
            'educación': 'Bildung',
            'trabajo': 'Arbeit',
            'ocio_y_tiempo_libre': 'Freizeit',
            'información_y_medios_de_comunicación': 'Information und Medien',
            'vivienda': 'Wohnen',
            'servicios': 'Dienstleistungen',
            'compras,_tiendas_y_establecimientos': 'Einkaufen und Geschäfte',
            'salud_e_higiene': 'Gesundheit und Hygiene',
            'viajes,_alojamiento_y_transporte': 'Reisen und Transport',
            'economía_e_industria': 'Wirtschaft und Industrie',
            'ciencia_y_tecnología': 'Wissenschaft und Technologie',
            'gobierno,_política_y_sociedad': 'Politik und Gesellschaft',
            'actividades_artísticas': 'Künstlerische Aktivitäten',
            'religión_y_filosofía': 'Religion und Philosophie',
            'geografía_y_naturaleza': 'Geografie und Natur',
            
            // English topics
            'work': 'Arbeit',
            'travel': 'Reisen',
            'food': 'Essen',
            'technology': 'Technologie',
            'health': 'Gesundheit',
            'environment': 'Umwelt',
            'education': 'Bildung',
            'family': 'Familie',
            'sports': 'Sport',
            'culture': 'Kultur',
            'business': 'Geschäft',
            'shopping': 'Einkaufen',
            'transportation': 'Transport',
            'hobbies': 'Hobbys',
            'weather': 'Wetter',
            'clothing': 'Kleidung',
            'home': 'Zuhause',
            'emotions': 'Gefühle',
            
            // Russian topics (transliterated)
            'работа': 'Arbeit',
            'путешествия': 'Reisen',
            'еда': 'Essen',
            'семья': 'Familie',
            'здоровье': 'Gesundheit',
            'образование': 'Bildung',
            'спорт': 'Sport',
            'культура': 'Kultur'
        };
        
        // Clean up the topic ID (remove prefixes, underscores, etc.)
        let cleanId = topicId.replace(/^#+\s*\d*\.?\s*/, '').replace(/_/g, ' ').toLowerCase().trim();
        let originalId = topicId.toLowerCase().trim();
        
        // Try to find exact matches first
        if (topicNames[originalId]) {
            return topicNames[originalId];
        }
        
        if (topicNames[cleanId]) {
            return topicNames[cleanId];
        }
        
        // Try without number prefix
        const withoutPrefix = originalId.replace(/^\d+\._/, '');
        if (topicNames[withoutPrefix]) {
            return topicNames[withoutPrefix];
        }
        
        // Fallback: capitalize first letter and clean up underscores
        return cleanId.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ').replace(/[,_]/g, '');
    }
    
    // Fallback topics if dynamic discovery fails
    loadFallbackTopics() {
        const topics = [
            { id: 'work', name: 'Arbeit', level: 'b1', wordCount: 25 },
            { id: 'travel', name: 'Reisen', level: 'b1', wordCount: 30 },
            { id: 'food', name: 'Essen', level: 'b1', wordCount: 35 },
            { id: 'technology', name: 'Technologie', level: 'b2', wordCount: 28 },
            { id: 'health', name: 'Gesundheit', level: 'b2', wordCount: 32 },
            { id: 'environment', name: 'Umwelt', level: 'b2', wordCount: 27 }
        ];
        
        const topicContainer = document.getElementById('chat-topic-buttons');
        topicContainer.innerHTML = '';
        
        topics.forEach(topic => {
            const button = document.createElement('button');
            button.className = 'topic-btn-chat';
            button.dataset.topic = topic.id;
            button.innerHTML = `
                <div class="topic-info">
                    <span class="topic-name">${topic.name}</span>
                    <span class="topic-level">(${topic.level.toUpperCase()})</span>
                    <span class="topic-words">${topic.wordCount} Wörter</span>
                </div>
            `;
            topicContainer.appendChild(button);
        });
    }
    
    startChatting() {
        // Check if we're in production (using secure API)
        const isProduction = window.location.hostname.includes('github.io');
        
        if (isProduction) {
            // In production, we use the secure API with hosted key
            this.apiKey = null; // No user API key needed
            this.isDemo = false; // Not demo mode - we have secure API
            console.log('Using secure API in production');
        } else {
            // In development, get API key if provided
            const apiKeyInput = document.getElementById('api-key-input');
            this.apiKey = apiKeyInput?.value.trim() || null;
            this.isDemo = !this.apiKey;
            console.log('Development mode:', this.isDemo ? 'Demo mode' : 'User API key');
        }
        
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
        
        // Generate and display opening story
        this.generateOpeningStory();
        
        // Focus input
        document.getElementById('chat-input').focus();
    }
    
    switchTopic() {
        // Hide chat interface and show topic selection
        document.getElementById('chatbot-interface').style.display = 'none';
        document.getElementById('chatbot-setup').style.display = 'block';
        
        // Reset current topic
        this.currentTopic = null;
        this.vocabularyWords = [];
        
        // Clear any selected topic buttons
        document.querySelectorAll('.topic-btn-chat').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Refresh topics if needed
        this.loadTopics();
        
        console.log('Switched back to topic selection');
    }
    
    loadVocabularyHints() {
        const vocabContainer = document.getElementById('vocab-chips');
        vocabContainer.innerHTML = '';
        
        // Show first 8 vocabulary words as hints
        this.vocabularyWords.slice(0, 8).forEach(wordObj => {
            const chip = document.createElement('span');
            chip.className = 'vocab-chip clickable-chip';
            chip.innerHTML = `${wordObj.word} <span class="tts-icon">🔊</span>`;
            chip.title = `Klicken zum Einfügen und Vorlesen: ${wordObj.word} (${wordObj.translation})`;
            vocabContainer.appendChild(chip);
        });
    }
    
    // Generate opening story using vocabulary words
    generateOpeningStory() {
        if (this.vocabularyWords.length === 0) {
            // Fallback if no vocabulary loaded
            this.addMessage('Hallo! Ich bin dein Deutschlehrer. Lass uns über das Thema sprechen!', 'ai');
            return;
        }
        
        const story = this.createStoryForTopic(this.currentTopic, this.currentLevel);
        this.addMessage(story.text, 'ai');
        
        // Add follow-up question
        setTimeout(() => {
            this.addMessage(story.question, 'ai');
        }, 1500);
    }
    
    // Create contextual stories based on topic and level
    createStoryForTopic(topicId, level) {
        // Determine target language based on vocabulary
        const targetLanguage = this.getTargetLanguage();
        
        const stories = {
            'spanish': {
                'alimentación': {
                    'b1': {
                        text: 'Hoy fui al supermercado y compré diferentes alimentos. Vi verduras frescas como espinacas y garbanzos. En la carnicería había chorizo y lomo. Para el desayuno elegí magdalenas y un bizcocho.',
                        question: '¿Qué te gusta comer en el desayuno? ¿También usas nata o margarina en tu pan?'
                    },
                    'b2': {
                        text: 'La alimentación saludable es un tema complejo. Una alimentación equilibrada incluye nutrientes importantes como proteínas, vitaminas y fibra. Muchas personas prefieren productos naturales y evitan alimentos pesados. El equilibrio correcto entre calorías y actividad física es crucial.',
                        question: '¿Qué tan importante es para ti una alimentación saludable? ¿Prestas atención a las calorías de tu comida?'
                    }
                },
                'educación': {
                    'b1': {
                        text: 'Mi amigo estudia en la universidad. El campus es muy grande y moderno. Solicitó una beca y quiere hacer un máster. Sus clases teóricas son interesantes, pero le gustan más las materias prácticas.',
                        question: '¿También estudias? ¿Qué materias te gustan más - las teóricas o las prácticas?'
                    },
                    'b2': {
                        text: 'El sistema educativo experimenta cambios constantes. Desde la registration hasta el doctorate, los estudiantes deben superar varios desafíos. Las scholarships permiten a muchos acceder a la educación superior. El equilibrio entre administration y libertad académica es un tema importante.',
                        question: '¿Qué piensas sobre el sistema educativo actual? ¿Deberían estar disponibles más scholarships?'
                    }
                },
                'relaciones_personales': {
                    'b1': {
                        text: 'Las relaciones personales son muy importantes en la vida. Tengo muchos amigos y familiares que me apoyan. Mi mejor amigo es muy divertido y siempre me hace reír. También tengo una buena relación con mis padres.',
                        question: '¿Cómo son tus relaciones familiares? ¿Tienes un mejor amigo o amiga?'
                    }
                }
            },
            'english': {
                'work': {
                    'b1': {
                        text: 'I work in an office downtown. My job is interesting but sometimes stressful. I have meetings with colleagues and clients every week. I like my boss - she is very supportive and understanding.',
                        question: 'What kind of work do you do? Do you enjoy your job?'
                    },
                    'b2': {
                        text: 'The modern workplace is rapidly evolving. Remote work has become increasingly popular, offering flexibility but also presenting challenges for collaboration. Companies are investing in digital transformation and employee development programs.',
                        question: 'How has remote work affected your productivity? What do you think about the future of work?'
                    }
                }
            },
            'russian': {
                'работа': {
                    'b1': {
                        text: 'Я работаю в офисе в центре города. Моя работа интересная, но иногда стрессовая. У меня есть встречи с коллегами и клиентами каждую неделю. Мне нравится мой начальник - она очень поддерживающая.',
                        question: 'Какую работу вы делаете? Вам нравится ваша работа?'
                    }
                }
            }
        };
        
        // Get specific story or create generic one
        const languageStories = stories[targetLanguage];
        if (languageStories && languageStories[topicId] && languageStories[topicId][level.toLowerCase()]) {
            return languageStories[topicId][level.toLowerCase()];
        }
        
        // Generate generic story using available vocabulary
        return this.generateGenericStory();
    }
    
    // Generate generic story when no specific template exists
    generateGenericStory() {
        const targetLanguage = this.getTargetLanguage();
        
        if (this.vocabularyWords.length < 3) {
            const greetings = {
                'spanish': {
                    text: `¡Hola! Hoy vamos a hablar sobre ${this.getTopicNameInTargetLanguage(this.currentTopic, targetLanguage)}. ¡Es un tema muy interesante!`,
                    question: '¿Qué sabes ya sobre este tema? ¡Cuéntame!'
                },
                'english': {
                    text: `Hello! Today we're going to talk about ${this.getTopicNameInTargetLanguage(this.currentTopic, targetLanguage)}. It's a very interesting topic!`,
                    question: 'What do you already know about this topic? Tell me about it!'
                },
                'russian': {
                    text: `Привет! Сегодня мы поговорим о ${this.getTopicNameInTargetLanguage(this.currentTopic, targetLanguage)}. Это очень интересная тема!`,
                    question: 'Что вы уже знаете об этой теме? Расскажите мне!'
                }
            };
            
            return greetings[targetLanguage] || greetings['spanish'];
        }
        
        // Use first few vocabulary words to create a simple story
        const words = this.vocabularyWords.slice(0, 5);
        const targetWords = words.map(w => w.word).join(', ');
        
        const storyTemplates = {
            'spanish': {
                'b1': `¡Hablemos sobre ${this.getTopicNameInTargetLanguage(this.currentTopic, targetLanguage)}! Hoy he pensado en diferentes palabras: ${targetWords}. Estas palabras son muy importantes para nuestro tema.`,
                'b2': `El tema de ${this.getTopicNameInTargetLanguage(this.currentTopic, targetLanguage)} es muy variado. Cuando consideramos términos como ${targetWords}, vemos la complejidad de este campo. Cada palabra tiene su propio significado y contexto.`
            },
            'english': {
                'b1': `Let's talk about ${this.getTopicNameInTargetLanguage(this.currentTopic, targetLanguage)}! Today I've been thinking about different words: ${targetWords}. These words are very important for our topic.`,
                'b2': `The topic of ${this.getTopicNameInTargetLanguage(this.currentTopic, targetLanguage)} is very diverse. When we consider terms like ${targetWords}, we see the complexity of this field. Each word has its own meaning and context.`
            },
            'russian': {
                'b1': `Давайте поговорим о ${this.getTopicNameInTargetLanguage(this.currentTopic, targetLanguage)}! Сегодня я думал о разных словах: ${targetWords}. Эти слова очень важны для нашей темы.`,
                'b2': `Тема ${this.getTopicNameInTargetLanguage(this.currentTopic, targetLanguage)} очень разнообразна. Когда мы рассматриваем такие термины, как ${targetWords}, мы видим сложность этой области.`
            }
        };
        
        const languageTemplates = storyTemplates[targetLanguage] || storyTemplates['spanish'];
        const text = languageTemplates[this.currentLevel.toLowerCase()] || languageTemplates['b1'];
        
        const questions = {
            'spanish': '¿Cuál es tu opinión sobre este tema? ¿Conoces otras palabras importantes?',
            'english': 'What is your opinion on this topic? Do you know other important words?',
            'russian': 'Какое у вас мнение по этой теме? Знаете ли вы другие важные слова?'
        };
        
        return {
            text: text,
            question: questions[targetLanguage] || questions['spanish']
        };
    }
    
    // Get topic name in the target language (not German)
    getTopicNameInTargetLanguage(topic, targetLanguage) {
        const topicTranslations = {
            'food': {
                'spanish': 'comida',
                'english': 'food',
                'russian': 'еда'
            },
            'travel': {
                'spanish': 'viaje',
                'english': 'travel', 
                'russian': 'путешествие'
            },
            'work': {
                'spanish': 'trabajo',
                'english': 'work',
                'russian': 'работа'
            },
            'environment': {
                'spanish': 'medio ambiente',
                'english': 'environment',
                'russian': 'окружающая среда'
            },
            'health': {
                'spanish': 'salud',
                'english': 'health',
                'russian': 'здоровье'
            },
            'technology': {
                'spanish': 'tecnología',
                'english': 'technology',
                'russian': 'технология'
            }
        };
        
        return topicTranslations[topic]?.[targetLanguage] || topic;
    }
    
    // Determine target language based on loaded vocabulary
    getTargetLanguage() {
        if (this.vocabularyWords.length === 0) {
            return 'spanish'; // Default fallback
        }
        
        // Check the structure of vocabulary to determine language
        const firstWord = this.vocabularyWords[0];
        
        // Spanish words typically have Spanish characters or are in Spanish files
        if (this.currentTopic && this.currentTopic.includes('_')) {
            return 'spanish';
        }
        
        // Check if word contains Spanish characters
        if (firstWord.word && /[ñáéíóúü]/i.test(firstWord.word)) {
            return 'spanish';
        }
        
        // Check if word contains Cyrillic characters
        if (firstWord.word && /[а-яё]/i.test(firstWord.word)) {
            return 'russian';
        }
        
        // Default to English if no specific markers found
        return 'english';
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
    
    // Text-to-Speech functionality
    speakText(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set language based on target language
            const targetLanguage = this.getTargetLanguage();
            const languageCodes = {
                'spanish': 'es-ES',
                'english': 'en-US',
                'russian': 'ru-RU'
            };
            
            utterance.lang = languageCodes[targetLanguage] || 'es-ES';
            utterance.rate = 0.9; // Slightly slower for learning
            utterance.pitch = 1.0;
            
            // Try to find a voice in the target language
            const voices = speechSynthesis.getVoices();
            const targetVoice = voices.find(voice => 
                voice.lang.startsWith(languageCodes[targetLanguage].split('-')[0])
            );
            
            if (targetVoice) {
                utterance.voice = targetVoice;
            }
            
            speechSynthesis.speak(utterance);
        } else {
            console.warn('Text-to-speech not supported in this browser');
        }
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
        // Determine API URL based on environment
        const isProduction = window.location.hostname.includes('github.io');
        const apiBaseUrl = isProduction 
            ? 'https://pwa-language-learning-api-production.up.railway.app' // Your deployed API URL
            : 'http://localhost:3001';
        
        console.log('Environment check:', {
            hostname: window.location.hostname,
            isProduction: isProduction,
            apiBaseUrl: apiBaseUrl
        });
        
        // Try to use the secure API first (your hosted API with your key)
        try {
            console.log('Attempting to call secure API:', `${apiBaseUrl}/api/chat`);
            
            // Ensure we have required fields
            const level = this.currentLevel || 'beginner';
            const topic = this.currentTopic || 'general';
            
            console.log('API request data:', {
                message: message,
                level: level,
                topic: topic,
                vocabularyWords: this.vocabularyWords?.length || 0,
                userId: this.userId
            });
            
            const apiResponse = await fetch(`${apiBaseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    level: level,
                    topic: topic,
                    vocabularyWords: this.vocabularyWords?.map(w => w.word) || [],
                    userId: this.userId
                })
            });
            
            if (apiResponse.ok) {
                const data = await apiResponse.json();
                
                // Update cost tracking
                this.dailyCost += data.estimatedCost;
                this.saveDailyCost();
                this.updateUsageDisplay();
                
                console.log('Used secure API with hosted key, cost:', data.estimatedCost);
                return data.response;
            } else {
                const errorText = await apiResponse.text();
                console.error('API Error:', {
                    status: apiResponse.status,
                    statusText: apiResponse.statusText,
                    error: errorText
                });
                throw new Error(`API request failed: ${apiResponse.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Secure API error, falling back:', error.message);
        }
        
        // Fallback to user's API key if provided
        if (!this.isDemo && this.apiKey) {
            try {
                console.log('Using user-provided API key');
                const response = await this.callOpenAIDirectly(message);
                return response;
            } catch (error) {
                console.error('User API key error:', error);
            }
        }
        
        // Final fallback to demo mode
        console.log('Using demo mode');
        return this.getDemoResponse(message);
    }
    
    async callOpenAIDirectly(message) {
        // This would only be used if the secure API is not available
        // and the user has provided their own API key
        const targetLanguage = this.getTargetLanguage();
        const languageNames = {
            'spanish': 'Spanish',
            'english': 'English', 
            'russian': 'Russian'
        };
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { 
                        role: 'system', 
                        content: `You are a friendly ${languageNames[targetLanguage]} language teacher for ${this.currentLevel} level students. Focus on the topic "${this.currentTopic}". Respond ONLY in ${languageNames[targetLanguage]} and be encouraging. Help students practice ${languageNames[targetLanguage]} conversation.` 
                    },
                    { role: 'user', content: message }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }
        
        const data = await response.json();
        
        // Estimate cost for user tracking
        const estimatedCost = (data.usage.total_tokens / 1000) * 0.002;
        this.dailyCost += estimatedCost;
        this.saveDailyCost();
        this.updateUsageDisplay();
        
        return data.choices[0].message.content;
    }
    
    getDemoResponse(message) {
        // Enhanced demo responses that adapt to the loaded vocabulary
        const responses = this.generateContextualResponses();
        
        // Select appropriate response based on message content and vocabulary
        let selectedResponse;
        
        // Check if user used any vocabulary words
        const usedVocabWords = this.vocabularyWords.filter(wordObj => 
            message.toLowerCase().includes(wordObj.word.toLowerCase()) ||
            message.toLowerCase().includes(wordObj.translation.toLowerCase())
        );
        
        if (usedVocabWords.length > 0) {
            // Positive reinforcement for using vocabulary
            const word = usedVocabWords[0];
            selectedResponse = this.getVocabularyPraiseResponse(word);
        } else {
            // General topic-based response
            const topicResponses = responses[this.currentTopic] || responses.general;
            selectedResponse = topicResponses[Math.floor(Math.random() * topicResponses.length)];
        }
        
        // Add vocabulary encouragement
        if (this.vocabularyWords.length > 0 && Math.random() > 0.5) {
            const randomWord = this.vocabularyWords[Math.floor(Math.random() * Math.min(5, this.vocabularyWords.length))];
            selectedResponse += ` Versuche auch das Wort "${randomWord.word}" (${randomWord.translation}) zu verwenden!`;
        }
        
        return selectedResponse;
    }
    
    // Generate contextual responses based on current topic and vocabulary
    generateContextualResponses() {
        const targetLanguage = this.getTargetLanguage();
        
        const baseResponses = {
            'spanish': {
                general: [
                    "¡Eso es muy interesante! Cuéntame más sobre eso.",
                    "¡Bien dicho! ¿Qué piensas sobre eso?",
                    "Lo entiendo. ¿Cuál es tu opinión?",
                    "¡Muy bien! ¿Puedes explicar más?"
                ]
            },
            'english': {
                general: [
                    "That's very interesting! Tell me more about that.",
                    "Well said! What do you think about that?",
                    "I understand. What's your opinion?",
                    "Very good! Can you explain more?"
                ]
            },
            'russian': {
                general: [
                    "Это очень интересно! Расскажите мне больше об этом.",
                    "Хорошо сказано! Что вы думаете об этом?",
                    "Понимаю. Какое ваше мнение?",
                    "Очень хорошо! Можете объяснить больше?"
                ]
            }
        };
        
        const responses = baseResponses[targetLanguage] || baseResponses['spanish'];
        
        // Add topic-specific responses based on loaded vocabulary
        const topicKey = this.currentTopic;
        
        if (this.vocabularyWords.length > 0) {
            // Create topic-specific responses using vocabulary
            const words = this.vocabularyWords.slice(0, 3);
            const targetWords = words.map(w => w.word);
            
            const topicResponses = {
                'spanish': [
                    `¡Interesante! En este tema, palabras como ${targetWords.join(', ')} son muy importantes.`,
                    `¡Es un buen tema! ¿Tienes experiencia con ${targetWords[0]}?`,
                    `¡Muy bien! Hablemos más sobre ${targetWords[1]}.`,
                    `¡Suena emocionante! ¿Qué sabes sobre ${targetWords[2]}?`
                ],
                'english': [
                    `Interesting! In this area, terms like ${targetWords.join(', ')} are very important.`,
                    `That's a good topic! Do you have experience with ${targetWords[0]}?`,
                    `Very good! Let's talk more about ${targetWords[1]}.`,
                    `That sounds exciting! What do you know about ${targetWords[2]}?`
                ],
                'russian': [
                    `Интересно! В этой области такие слова, как ${targetWords.join(', ')}, очень важны.`,
                    `Это хорошая тема! У вас есть опыт с ${targetWords[0]}?`,
                    `Очень хорошо! Давайте поговорим больше о ${targetWords[1]}.`,
                    `Звучит захватывающе! Что вы знаете о ${targetWords[2]}?`
                ]
            };
            
            responses[topicKey] = topicResponses[targetLanguage] || topicResponses['spanish'];
        }
        
        return responses;
    }
    
    // Generate praise response when user uses vocabulary correctly
    getVocabularyPraiseResponse(wordObj) {
        const targetLanguage = this.getTargetLanguage();
        
        const praiseResponses = {
            'spanish': [
                `¡Muy bien! Has usado "${wordObj.word}" correctamente.`,
                `¡Excelente! La palabra "${wordObj.word}" encaja perfectamente aquí.`,
                `¡Perfecto! Veo que entiendes "${wordObj.word}".`,
                `¡Bien hecho! "${wordObj.word}" es una palabra importante en este tema.`
            ],
            'english': [
                `Very good! You used "${wordObj.word}" correctly.`,
                `Excellent! The word "${wordObj.word}" fits perfectly here.`,
                `Perfect! I see that you understand "${wordObj.word}".`,
                `Well done! "${wordObj.word}" is an important word in this topic.`
            ],
            'russian': [
                `Очень хорошо! Вы правильно использовали "${wordObj.word}".`,
                `Отлично! Слово "${wordObj.word}" идеально подходит здесь.`,
                `Прекрасно! Я вижу, что вы понимаете "${wordObj.word}".`,
                `Хорошо сделано! "${wordObj.word}" - важное слово в этой теме.`
            ]
        };
        
        const responses = praiseResponses[targetLanguage] || praiseResponses['spanish'];
        const praise = responses[Math.floor(Math.random() * responses.length)];
        
        // Add follow-up question
        const followUps = {
            'spanish': [
                " ¿Puedes darme otro ejemplo?",
                " ¿Cuál es tu experiencia con esto?",
                " ¿Con qué frecuencia usas esto en tu vida diaria?",
                " ¿Hay términos similares que conozcas?"
            ],
            'english': [
                " Can you give me another example?",
                " What is your experience with this?",
                " How often do you use this in your daily life?",
                " Are there similar terms you know?"
            ],
            'russian': [
                " Можете привести другой пример?",
                " Какой у вас опыт с этим?",
                " Как часто вы используете это в повседневной жизни?",
                " Есть ли похожие термины, которые вы знаете?"
            ]
        };
        
        const followUpList = followUps[targetLanguage] || followUps['spanish'];
        
        return praise + followUpList[Math.floor(Math.random() * followUpList.length)];
    }
    
    addMessage(content, sender, isError = false) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message ${isError ? 'error-message' : ''}`;
        
        // Add clickable class for AI messages
        if (sender === 'ai') {
            messageDiv.classList.add('clickable-message');
            messageDiv.title = 'Klicken zum Vorlesen / Click to listen';
        }
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${content}</p>
                ${sender === 'ai' ? '<span class="tts-icon">🔊</span>' : ''}
            </div>
            <div class="message-time">${timeString}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        
        // Ensure smooth scrolling to bottom with proper scrollbar visibility
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                // Calculate the correct scroll position
                const scrollHeight = messagesContainer.scrollHeight;
                const clientHeight = messagesContainer.clientHeight;
                const maxScrollTop = scrollHeight - clientHeight;
                
                // Set scroll position to show latest messages while keeping scrollbar visible
                messagesContainer.scrollTop = Math.max(0, maxScrollTop);
                
                // Double-check after a small delay to ensure all content has rendered
                setTimeout(() => {
                    const finalMaxScrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
                    messagesContainer.scrollTop = Math.max(0, finalMaxScrollTop);
                }, 50);
            });
        }
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
        return this.formatTopicName(topicId);
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
