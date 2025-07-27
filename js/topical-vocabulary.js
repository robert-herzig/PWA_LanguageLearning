// Topical Vocabulary System
// Parses and organizes vocabulary by topics from word list files

class TopicalVocabulary {
  constructor() {
    this.vocabulary = {};
    this.currentTopic = null;
    this.currentTopicVocabulary = [];
  }

  // Spanish to English topic key mapping
  getSpanishToEnglishTopicMapping() {
    return {
      'dimensión_física': 'physical_dimension',
      'dimensión_perceptiva_y_anímica': 'perception_and_emotions',
      '3._identidad_personal': 'personal_identity',
      '4._relaciones_personales': 'personal_relationships',
      '5._alimentación': 'food_and_nutrition',
      '6._educación': 'education',
      '7._trabajo': 'work',
      '8._ocio': 'leisure',
      'información_y_medios': 'information_and_media',
      'vivienda': 'housing',
      'servicios': 'services',
      'compras_y_tiendas': 'shopping_and_stores',
      'salud_e_higiene': 'health_and_hygiene',
      'viajes_y_transporte': 'travel_and_transport',
      'economía_e_industria': 'economy_and_industry',
      'ciencia_y_tecnología': 'science_and_technology',
      'gobierno_y_sociedad': 'government_and_society',
      'artes_y_cultura': 'arts_and_culture',
      'religión_y_filosofía': 'religion_and_philosophy',
      'geografía_y_naturaleza': 'geography_and_nature'
    };
  }

  // Topic categories mapping with English names
  getTopicCategories() {
    return {
      'physical_dimension': {
        title: 'Physical Dimension',
        description: 'Body parts, physical appearance, and movements',
        icon: '👤'
      },
      'perception_and_emotions': {
        title: 'Perception & Emotions',
        description: 'Feelings, emotions, and personality traits',
        icon: '🧠'
      },
      'personal_identity': {
        title: 'Personal Identity',
        description: 'Personal information and identity documents',
        icon: '🆔'
      },
      'personal_relationships': {
        title: 'Personal Relationships',
        description: 'Family, friends, and social relationships',
        icon: '👨‍👩‍👧‍👦'
      },
      'food_and_nutrition': {
        title: 'Food & Nutrition',
        description: 'Food, cooking, restaurants, and nutrition',
        icon: '🍽️'
      },
      'education': {
        title: 'Education',
        description: 'School, university, learning, and studying',
        icon: '🎓'
      },
      'work': {
        title: 'Work',
        description: 'Jobs, professions, and workplace',
        icon: '💼'
      },
      'leisure': {
        title: 'Leisure',
        description: 'Entertainment, sports, and hobbies',
        icon: '🎯'
      },
      'information_and_media': {
        title: 'Information & Media',
        description: 'Communication, media, and technology',
        icon: '📱'
      },
      'housing': {
        title: 'Housing',
        description: 'Home, furniture, and living spaces',
        icon: '🏠'
      },
      'services': {
        title: 'Services',
        description: 'Banking, postal, and public services',
        icon: '🏛️'
      },
      'shopping_and_stores': {
        title: 'Shopping & Stores',
        description: 'Shopping, markets, and retail',
        icon: '🛒'
      },
      'health_and_hygiene': {
        title: 'Health & Hygiene',
        description: 'Medical, wellness, and personal care',
        icon: '🏥'
      },
      'travel_and_transport': {
        title: 'Travel & Transport',
        description: 'Tourism, vehicles, and transportation',
        icon: '✈️'
      },
      'economy_and_industry': {
        title: 'Economy & Industry',
        description: 'Business, finance, and manufacturing',
        icon: '🏭'
      },
      'science_and_technology': {
        title: 'Science & Technology',
        description: 'Research, computing, and innovation',
        icon: '🔬'
      },
      'government_and_society': {
        title: 'Government & Society',
        description: 'Politics, law, and social issues',
        icon: '🏛️'
      },
      'arts_and_culture': {
        title: 'Arts & Culture',
        description: 'Music, literature, and traditions',
        icon: '🎨'
      },
      'religion_and_philosophy': {
        title: 'Religion & Philosophy',
        description: 'Beliefs, ethics, and spirituality',
        icon: '🕊️'
      },
      'geography_and_nature': {
        title: 'Geography & Nature',
        description: 'Environment, weather, and landscapes',
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
    console.log(`Loading topical JSON vocabulary for ${language} ${level}...`);
    const base = `data/word_lists/${language}/${level}`;
    // fetch topic index
    const indexRes = await fetch(`${base}/index.json`);
    if (!indexRes.ok) throw new Error(`Failed to load ${base}/index.json`);
    const topics = await indexRes.json();
    const vocab = {};
    for (const key of topics) {
      const res = await fetch(`${base}/${key}.json`);
      if (!res.ok) throw new Error(`Failed to load ${key}.json`);
      const data = await res.json();
      vocab[key] = data;
    }
    this.vocabulary[`${language}_${level}`] = vocab;
    console.log(`✅ Loaded ${Object.keys(vocab).length} topics for ${language} ${level}`);
    return vocab;
  }

  // Get vocabulary for a specific topic
  getTopicVocabulary(language, level, topic) {
    const key = `${language}_${level}`;
    if (!this.vocabulary[key] || !this.vocabulary[key][topic]) {
      return [];
    }
    
    // Get the vocabulary data and add topic info to each word
    const vocabData = this.vocabulary[key][topic];
    const spanishToEnglish = this.getSpanishToEnglishTopicMapping();
    const englishKey = spanishToEnglish[topic] || topic;
    const topicCategories = this.getTopicCategories();
    const topicInfo = topicCategories[englishKey];
    const topicName = topicInfo ? topicInfo.title : (vocabData.topic || topic);
    
    // Handle both old format (with words array) and new format (direct array)
    const words = vocabData.words || vocabData;
    
    return words.map(word => ({
      ...word,
      topic: topicName, // Add German topic name to each word
      target: word.word || word.target // Ensure target is set from word field
    }));
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
    const spanishToEnglish = this.getSpanishToEnglishTopicMapping();
    
    const result = topics.map(topic => {
      // Map Spanish topic key to English key
      const englishKey = spanishToEnglish[topic] || topic;
      
      return {
        key: topic, // Keep original key for data access
        englishKey: englishKey, // Add English key for reference
        ...topicCategories[englishKey] || {
          title: topic.charAt(0).toUpperCase() + topic.slice(1).replace(/_/g, ' '),
          description: 'Vocabulary topic',
          icon: '📝'
        },
        wordCount: this.vocabulary[key][topic].words ? this.vocabulary[key][topic].words.length : (Array.isArray(this.vocabulary[key][topic]) ? this.vocabulary[key][topic].length : 0)
      };
    });
    
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
