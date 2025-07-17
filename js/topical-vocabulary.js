// Topical Vocabulary System
// Parses and organizes vocabulary by topics from word list files

class TopicalVocabulary {
  constructor() {
    this.vocabulary = {};
    this.currentTopic = null;
    this.currentTopicVocabulary = [];
  }

  // Topic categories mapping
  getTopicCategories() {
    return {
      'dimensión física': {
        title: 'Physical Dimension',
        description: 'Body parts, physical appearance, and movements',
        icon: '👤'
      },
      'dimensión perceptiva y anímica': {
        title: 'Personality & Character',
        description: 'Personality traits and character descriptions',
        icon: '🧠'
      },
      'identidad personal': {
        title: 'Personal Identity',
        description: 'Personal information and identity',
        icon: '🆔'
      },
      'relaciones personales': {
        title: 'Personal Relationships',
        description: 'Family, friends, and social relationships',
        icon: '👥'
      },
      'alimentación': {
        title: 'Food & Nutrition',
        description: 'Food, drinks, and eating habits',
        icon: '🍽️'
      },
      'educación': {
        title: 'Education',
        description: 'Learning, schools, and academic life',
        icon: '📚'
      },
      'trabajo': {
        title: 'Work & Professions',
        description: 'Jobs, careers, and workplace',
        icon: '💼'
      },
      'ocio': {
        title: 'Leisure & Entertainment',
        description: 'Hobbies, sports, and entertainment',
        icon: '🎨'
      },
      'información y medios de comunicación': {
        title: 'Media & Communication',
        description: 'News, media, and communication',
        icon: '📺'
      },
      'vivienda': {
        title: 'Housing',
        description: 'Home, furniture, and living spaces',
        icon: '🏠'
      },
      'servicios': {
        title: 'Services',
        description: 'Public and private services',
        icon: '🏢'
      },
      'compras': {
        title: 'Shopping',
        description: 'Shopping, stores, and purchases',
        icon: '🛒'
      },
      'salud e higiene': {
        title: 'Health & Hygiene',
        description: 'Health, medicine, and personal care',
        icon: '🏥'
      },
      'viajes': {
        title: 'Travel',
        description: 'Transportation, trips, and tourism',
        icon: '✈️'
      },
      'aspectos cotidianos de la economía': {
        title: 'Economy',
        description: 'Money, banking, and economic activities',
        icon: '💰'
      },
      'ciencia y tecnología': {
        title: 'Science & Technology',
        description: 'Science, technology, and innovation',
        icon: '🔬'
      },
      'política y sociedad': {
        title: 'Politics & Society',
        description: 'Government, politics, and social issues',
        icon: '🏛️'
      },
      'arte y cultura': {
        title: 'Arts & Culture',
        description: 'Art, literature, and cultural activities',
        icon: '🎭'
      },
      'religión y filosofía': {
        title: 'Religion & Philosophy',
        description: 'Religious and philosophical concepts',
        icon: '⛪'
      },
      'geografía y naturaleza': {
        title: 'Geography & Nature',
        description: 'Geography, nature, and environment',
        icon: '🌍'
      }
    };
  }

  // Parse vocabulary from word list text
  parseVocabularyFromText(text, language, level) {
    const lines = text.split('\n');
    const vocabulary = {};
    let currentTopic = null;
    let currentSubtopic = null;
    let wordCounter = 0;

    for (let line of lines) {
      line = line.trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Main topic (starts with ##)
      if (line.startsWith('##')) {
        const topicMatch = line.match(/##\s*\d*\.?\s*(.+)/);
        if (topicMatch) {
          let fullTopic = topicMatch[1].toLowerCase().trim();
          
          // Extract the key part of the topic (after colon if present)
          if (fullTopic.includes(':')) {
            currentTopic = fullTopic.split(':')[1].trim();
          } else {
            currentTopic = fullTopic;
          }
          
          console.log(`Found topic: "${currentTopic}" from line: "${line}"`);
          
          vocabulary[currentTopic] = vocabulary[currentTopic] || {
            words: [],
            subtopics: {}
          };
          currentSubtopic = null;
        }
        continue;
      }
      
      // Skip other markdown headers and comments (single # only)
      if (line.startsWith('#')) continue;
      
      // This is a vocabulary word
      if (currentTopic && line.length > 0) {
        wordCounter++;
        const word = {
          id: `${language}_${level}_topic_${wordCounter}`,
          target: line,
          german: '', // Will be filled later with translations
          topic: currentTopic,
          subtopic: currentSubtopic
        };
        
        vocabulary[currentTopic].words.push(word);
        if (wordCounter <= 5) {
          console.log(`Added word "${line}" to topic "${currentTopic}"`);
        }
      }
    }

    console.log(`Total vocabulary parsed:`, {
      totalTopics: Object.keys(vocabulary).length,
      topicNames: Object.keys(vocabulary),
      totalWords: Object.values(vocabulary).reduce((sum, topic) => sum + topic.words.length, 0)
    });
    return vocabulary;
  }

  // Load vocabulary for a specific language and level
  async loadTopicalVocabulary(language, level) {
    console.log(`Loading topical vocabulary for ${language} ${level}...`);
    try {
      const url = `data/word_lists/${language}_${level}_words.txt`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load vocabulary file: ${url} (Status: ${response.status})`);
      }
      
      const text = await response.text();
      const vocabulary = this.parseVocabularyFromText(text, language, level);
      
      this.vocabulary[`${language}_${level}`] = vocabulary;
      console.log(`Successfully loaded topical vocabulary for ${language} ${level} with ${Object.keys(vocabulary).length} topics`);
      
      return vocabulary;
    } catch (error) {
      console.error('Error loading topical vocabulary:', error);
      throw error;
    }
  }

  // Get vocabulary for a specific topic
  getTopicVocabulary(language, level, topic) {
    const key = `${language}_${level}`;
    if (!this.vocabulary[key] || !this.vocabulary[key][topic]) {
      return [];
    }
    return this.vocabulary[key][topic].words;
  }

  // Get all available topics for a language/level
  getAvailableTopics(language, level) {
    const key = `${language}_${level}`;
    if (!this.vocabulary[key]) {
      console.log(`No vocabulary found for ${language} ${level}`);
      return [];
    }
    
    const topics = Object.keys(this.vocabulary[key]);
    const topicCategories = this.getTopicCategories();
    
    const result = topics.map(topic => ({
      key: topic,
      ...topicCategories[topic] || {
        title: topic.charAt(0).toUpperCase() + topic.slice(1),
        description: 'Vocabulary topic',
        icon: '📝'
      },
      wordCount: this.vocabulary[key][topic].words.length
    }));
    
    console.log(`Found ${result.length} topics for ${language} ${level}`);
    return result;
  }

  // Convert topic vocabulary to flashcard format
  convertToFlashcards(words, language) {
    return words.map(word => ({
      id: word.id,
      german: this.getGermanTranslation(word.target, language, word.topic),
      target: word.target,
      germanExample: this.getGermanExample(word.target, language, word.topic),
      targetExample: this.getTargetExample(word.target, language),
      topic: word.topic,
      subtopic: word.subtopic
    }));
  }

  // Enhanced translation lookup using the translations data
  getGermanTranslation(word, language, topic) {
    // Try to get translation from the comprehensive translation data
    if (typeof window !== 'undefined' && window.SPANISH_GERMAN_TRANSLATIONS) {
      const topicTranslations = window.SPANISH_GERMAN_TRANSLATIONS[topic];
      if (topicTranslations && topicTranslations[word]) {
        return topicTranslations[word].german;
      }
      
      // If not found in specific topic, search all topics
      for (const topicKey in window.SPANISH_GERMAN_TRANSLATIONS) {
        const translations = window.SPANISH_GERMAN_TRANSLATIONS[topicKey];
        if (translations[word]) {
          return translations[word].german;
        }
      }
    }

    // Fallback to basic translations
    return this.getBasicGermanTranslation(word, language);
  }

  // Get German example from translation data
  getGermanExample(word, language, topic) {
    if (typeof window !== 'undefined' && window.SPANISH_GERMAN_TRANSLATIONS) {
      const topicTranslations = window.SPANISH_GERMAN_TRANSLATIONS[topic];
      if (topicTranslations && topicTranslations[word]) {
        return `"${topicTranslations[word].example}"`;
      }
      
      // Search all topics for the word
      for (const topicKey in window.SPANISH_GERMAN_TRANSLATIONS) {
        const translations = window.SPANISH_GERMAN_TRANSLATIONS[topicKey];
        if (translations[word]) {
          return `"${translations[word].example}"`;
        }
      }
    }

    // Fallback to generated example
    return this.generateGermanExample(word);
  }

  // Get target language example
  getTargetExample(word, language) {
    if (typeof window !== 'undefined' && window.SPANISH_EXAMPLES && window.SPANISH_EXAMPLES[word]) {
      return `"${window.SPANISH_EXAMPLES[word]}"`;
    }

    // Fallback to generated example
    return this.generateTargetExample(word, language);
  }

  // Basic translation lookup (simplified - in a real app you'd use a translation API)
  getBasicGermanTranslation(word, language) {
    // This is a simplified translation system
    // In a real application, you would use a proper translation API
    const basicTranslations = {
      spanish: {
        // Physical dimension
        'músculo': 'Muskel',
        'hueso': 'Knochen',
        'piel': 'Haut',
        'corazón': 'Herz',
        'pulmón': 'Lunge',
        'cuello': 'Hals',
        'hombros': 'Schultern',
        'pecho': 'Brust',
        'cintura': 'Taille',
        'barriga': 'Bauch',
        'rodilla': 'Knie',
        'tobillo': 'Knöchel',
        'codo': 'Ellbogen',
        'muñeca': 'Handgelenk',
        'postura': 'Haltung',
        'mirada': 'Blick',
        'parecerse': 'ähneln',
        'caminar': 'gehen',
        'saltar': 'springen',
        'respirar': 'atmen',
        'llorar': 'weinen',
        'tener la piel clara': 'helle Haut haben',
        'tener la piel oscura': 'dunkle Haut haben',
        'estar moreno': 'braun sein',
        'ser blanco': 'weiß sein',
        'tener buen tipo': 'eine gute Figur haben',
        'estar sentado': 'sitzen',
        'estar de pie': 'stehen',
        
        // Character and personality
        'carácter': 'Charakter',
        'personalidad': 'Persönlichkeit',
        'simpático': 'sympathisch',
        'antipático': 'unsympathisch',
        'amable': 'freundlich',
        'agradable': 'angenehm',
        'inteligente': 'intelligent',
        'tonto': 'dumm',
        'listo': 'klug',
        'valiente': 'mutig',
        'cobarde': 'feige',
        'generoso': 'großzügig',
        'tacaño': 'geizig',
        'honesto': 'ehrlich',
        'mentiroso': 'lügnerisch',
        'trabajador': 'fleißig',
        'perezoso': 'faul',
        
        // Common words
        'casa': 'Haus',
        'comida': 'Essen',
        'agua': 'Wasser',
        'tiempo': 'Zeit',
        'dinero': 'Geld',
        'trabajo': 'Arbeit',
        'escuela': 'Schule',
        'libro': 'Buch',
        'coche': 'Auto',
        'mesa': 'Tisch',
        'silla': 'Stuhl',
        'ventana': 'Fenster',
        'puerta': 'Tür',
        'teléfono': 'Telefon',
        'ordenador': 'Computer',
        'ropa': 'Kleidung',
        'zapatos': 'Schuhe',
        'familia': 'Familie',
        'amigo': 'Freund',
        'ciudad': 'Stadt'
      }
    };

    return basicTranslations[language]?.[word] || this.generateBasicTranslation(word);
  }

  // Generate a basic translation when not found in dictionary
  generateBasicTranslation(word) {
    // Return the word with a note that it needs translation
    return `${word}`;
  }

  // Generate example sentences
  generateGermanExample(word) {
    const germanTranslation = this.getGermanTranslation(word, 'spanish');
    
    // Basic sentence templates
    const templates = [
      `"Das ${germanTranslation} ist wichtig."`,
      `"Ich kenne das Wort ${germanTranslation}."`,
      `"${germanTranslation} ist ein spanisches Wort."`,
      `"Heute lerne ich ${germanTranslation}."`,
      `"Das deutsche Wort für '${word}' ist ${germanTranslation}."`
    ];

    // Return a random template
    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateTargetExample(word, language) {
    if (language === 'spanish') {
      // Basic Spanish sentence templates
      const templates = [
        `"La palabra es ${word}."`,
        `"Hoy aprendo ${word}."`,
        `"${word} es una palabra importante."`,
        `"Me gusta la palabra ${word}."`,
        `"En español se dice ${word}."`
      ];
      
      return templates[Math.floor(Math.random() * templates.length)];
    }
    return `"Example with ${word}"`;
  }
}

// Export for use in main app
window.TopicalVocabulary = TopicalVocabulary;
