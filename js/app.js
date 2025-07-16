// Language Learning PWA JavaScript

class LanguageLearningPWA {
  constructor() {
    this.deferredPrompt = null;
    this.isOnline = navigator.onLine;
    this.currentLanguage = 'spanish';
    this.currentCardIndex = 0;
    this.currentSection = 'home'; // Start with home section
    this.settings = {
      englishVariant: 'us', // 'us' or 'gb'
      speechRate: 0.9,
      autoSpeak: true
    };
    this.init();
  }

  async init() {
    this.registerServiceWorker();
    this.setupEventListeners();
    this.updateOnlineStatus();
    this.checkInstallPrompt();
    this.initializeApp();
    this.initializeFlashcards();
    
    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.checkInstallPrompt();
    });
    
    // Setup home navigation after DOM is ready
    setTimeout(() => {
      console.log('=== INITIALIZING HOME NAVIGATION ===');
      this.setupHomeNavigation();
    }, 100);
  }

  initializeApp() {
    console.log('Initializing app...');
    
    // Load saved settings
    this.loadSettings();
    
    // Set initial language if saved
    const savedLanguage = localStorage.getItem('currentLanguage');
    if (savedLanguage && ['spanish', 'english', 'russian'].includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
      
      // Update language dropdown
      const languageSelect = document.getElementById('language-select');
      if (languageSelect) {
        languageSelect.value = savedLanguage;
      }
    }
    
    console.log('App initialized with language:', this.currentLanguage);
  }

  // Service Worker Registration
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable();
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  updateOnlineStatus() {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('offline', !isOnline);
    
    // Show/hide offline indicator
    const offlineIndicator = document.querySelector('.offline-indicator');
    if (offlineIndicator) {
      offlineIndicator.style.display = isOnline ? 'none' : 'block';
    }
    
    console.log('Online status:', isOnline ? 'Online' : 'Offline');
  }

  checkInstallPrompt() {
    // This will be called by beforeinstallprompt event listener
    if (this.deferredPrompt) {
      const installButton = document.querySelector('.install-app-button');
      if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', () => {
          this.deferredPrompt.prompt();
          this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the PWA install prompt');
            } else {
              console.log('User dismissed the PWA install prompt');
            }
            this.deferredPrompt = null;
          });
        });
      }
    }
  }

  installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
        } else {
          console.log('User dismissed the PWA install prompt');
        }
        this.deferredPrompt = null;
        this.hideInstallPrompt();
      });
    }
  }

  hideInstallPrompt() {
    const installPrompt = document.querySelector('.install-prompt');
    if (installPrompt) {
      installPrompt.style.display = 'none';
    }
  }

  // Event Listeners Setup
  setupEventListeners() {
    // Online/Offline status
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());

    // Navigation
    this.setupNavigation();

    // Language selector
    this.setupLanguageSelector();

    // Flashcard controls
    this.setupFlashcardControls();

    // Settings controls
    this.setupSettingsControls();

    // Install prompt buttons
    const installBtn = document.getElementById('install-btn');
    const dismissBtn = document.getElementById('dismiss-btn');
    
    if (installBtn) {
      installBtn.addEventListener('click', () => this.installApp());
    }
    
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => this.hideInstallPrompt());
    }
  }

  // Navigation Setup
  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.target.dataset.section;
        this.navigateToSection(section);
        
        // Update active state
        navButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  }

  // Home Navigation Setup
  setupHomeNavigation() {
    console.log('=== SETTING UP HOME NAVIGATION ===');
    
    // Feature card navigation
    const featureCards = document.querySelectorAll('.feature-card');
    console.log(`Found ${featureCards.length} feature cards`);
    
    featureCards.forEach((card, index) => {
      const button = card.querySelector('.feature-btn');
      const section = card.dataset.navigate;
      
      console.log(`Feature card ${index}: section="${section}", button=${!!button}, disabled=${button?.disabled}`);
      
      if (section && !button?.disabled) {
        const clickHandler = (e) => {
          console.log(`=== FEATURE CARD CLICKED: ${section} ===`);
          console.log('Click target:', e.target);
          console.log('Current target:', e.currentTarget);
          
          e.preventDefault();
          e.stopPropagation();
          
          // Navigate to section
          this.navigateToSection(section);
          
          // Update nav buttons
          const navButtons = document.querySelectorAll('.nav-btn');
          navButtons.forEach(b => b.classList.remove('active'));
          const targetNavBtn = document.querySelector(`[data-section="${section}"]`);
          if (targetNavBtn) {
            targetNavBtn.classList.add('active');
          }
        };
        
        // Add click handlers to both the card and the button
        card.addEventListener('click', clickHandler);
        if (button) {
          button.addEventListener('click', clickHandler);
        }
        
        // Make it visually clear that it's clickable
        card.style.cursor = 'pointer';
        card.style.userSelect = 'none'; // Prevent text selection on click
        
        console.log(`✅ Event listeners added to card ${index} for section "${section}"`);
        
        // Test the card immediately
        console.log(`🔍 Testing card ${index}:`, {
          hasDataNavigate: !!card.dataset.navigate,
          dataNavigate: card.dataset.navigate,
          hasClickListener: card.onclick !== null,
          isEnabled: !button?.disabled
        });
        
      } else {
        console.log(`❌ Skipping card ${index}: section="${section}", button=${!!button}, disabled=${button?.disabled}`);
      }
    });
    
    console.log('=== HOME NAVIGATION SETUP COMPLETE ===');
    
    // Add a test to verify cards are clickable
    setTimeout(() => {
      console.log('🧪 Testing feature card accessibility...');
      const testCard = document.querySelector('.feature-card[data-navigate="flashcards"]');
      if (testCard) {
        console.log('✅ Flashcard feature card found and should be clickable');
        console.log('Card dataset:', testCard.dataset);
        console.log('Card computed style cursor:', window.getComputedStyle(testCard).cursor);
      } else {
        console.log('❌ Flashcard feature card not found!');
      }
    }, 500);
  }

  // Navigation Handler
  navigateToSection(section) {
    console.log(`=== NAVIGATING TO: ${section} ===`);
    console.log(`Current section before: ${this.currentSection}`);
    this.currentSection = section;
    
    // Hide all sections
    const sections = document.querySelectorAll('.learning-section');
    console.log(`Found ${sections.length} sections to hide`);
    sections.forEach(s => {
      console.log(`Hiding section: ${s.id}`);
      s.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${section}-section`);
    console.log(`Target section: ${section}-section`, targetSection);
    if (targetSection) {
      targetSection.classList.add('active');
      console.log(`✅ Activated section: ${targetSection.id}`);
      console.log(`Section classes: ${targetSection.className}`);
      console.log(`Section display: ${window.getComputedStyle(targetSection).display}`);
    } else {
      console.error(`❌ Section not found: ${section}-section`);
    }
    
    // Try calling section methods but wrap in try-catch to prevent errors
    try {
      switch(section) {
        case 'home':
          this.showHomeSection();
          break;
        case 'flashcards':
          console.log('About to call showFlashcardsSection...');
          this.showFlashcardsSection();
          break;
        case 'chatbot':
          this.showChatbotSection();
          break;
        case 'progress':
          this.showProgressSection();
          break;
        case 'settings':
          this.showSettingsSection();
          break;
        default:
          console.log(`Unknown section: ${section}, showing home`);
          this.showHomeSection();
      }
    } catch (error) {
      console.error(`Error in section method for ${section}:`, error);
    }
    
    console.log(`=== NAVIGATION TO ${section} COMPLETE ===`);
  }

  // Section Display Methods
  showHomeSection() {
    console.log('Showing home section');
  }

  showFlashcardsSection() {
    console.log('Showing flashcards section');
    this.loadCurrentCard();
  }

  showChatbotSection() {
    console.log('Showing chatbot section - placeholder for now');
  }

  showProgressSection() {
    console.log('Showing progress section - to be implemented');
  }

  showSettingsSection() {
    console.log('Showing settings section');
    this.loadSettings();
  }

  loadSettings() {
    console.log('Loading settings...');
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('languageLearningSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
    
    // Update UI elements with current settings
    const speechRateSlider = document.getElementById('speech-rate');
    const rateValue = document.getElementById('rate-value');
    const autoSpeakCheckbox = document.getElementById('auto-speak');
    
    if (speechRateSlider && rateValue) {
      speechRateSlider.value = this.settings.speechRate || 0.9;
      rateValue.textContent = `${speechRateSlider.value}x`;
    }
    
    if (autoSpeakCheckbox) {
      autoSpeakCheckbox.checked = this.settings.autoSpeak !== false;
    }
    
    console.log('Settings loaded:', this.settings);
  }

  saveSettings() {
    localStorage.setItem('languageLearningSettings', JSON.stringify(this.settings));
    console.log('Settings saved:', this.settings);
  }

  // Language Selector Setup
  setupLanguageSelector() {
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.currentLanguage = e.target.value;
        this.onLanguageChange();
      });
    }
  }

  onLanguageChange() {
    console.log(`Language changed to: ${this.currentLanguage}`);
    this.currentCardIndex = 0; // Reset to first card
    this.loadCurrentCard();
    this.updateCardCounter();
  }

  // Flashcard System
  initializeFlashcards() {
    // Get cards due for review
    const dueCards = this.getDueCards();
    this.currentDueCards = dueCards;
    this.currentCardIndex = 0;
    
    if (dueCards.length === 0) {
      this.showNoCardsMessage();
    } else {
      this.loadCurrentCard();
      this.updateCardCounter();
    }
  }

  setupFlashcardControls() {
    // Card navigation
    const prevBtn = document.getElementById('prev-card');
    const nextBtn = document.getElementById('next-card');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousCard());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextCard());
    }

    // Flip card
    const flipBtns = document.querySelectorAll('.flip-btn');
    flipBtns.forEach(btn => {
      btn.addEventListener('click', () => this.flipCard());
    });

    // Speak button
    const speakBtn = document.getElementById('speak-btn');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => this.speakCurrentWord());
    }

    // Action buttons
    const difficultBtn = document.getElementById('difficult-btn');
    const easyBtn = document.getElementById('easy-btn');
    const knownBtn = document.getElementById('known-btn');
    
    if (difficultBtn) {
      difficultBtn.addEventListener('click', () => this.markAsDifficult());
    }
    
    if (easyBtn) {
      easyBtn.addEventListener('click', () => this.markAsEasy());
    }
    
    if (knownBtn) {
      knownBtn.addEventListener('click', () => this.markAsKnown());
    }

    // Auto-flip on click
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
      flashcard.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          this.flipCard();
        }
      });
    }
  }

  setupSettingsControls() {
    // Test buttons for speech
    const testSpanish = document.getElementById('test-spanish');
    const testEnglishUS = document.getElementById('test-english-us');
    const testEnglishGB = document.getElementById('test-english-gb');
    const testRussian = document.getElementById('test-russian');
    
    if (testSpanish) {
      testSpanish.addEventListener('click', () => this.testSpeech('spanish', 'Hola mundo', 'es'));
    }
    
    if (testEnglishUS) {
      testEnglishUS.addEventListener('click', () => this.testSpeech('english-us', 'Hello world, how are you doing?', 'en-US'));
    }
    
    if (testEnglishGB) {
      testEnglishGB.addEventListener('click', () => this.testSpeech('english-gb', 'Hello world, how are you doing?', 'en-GB'));
    }
    
    if (testRussian) {
      testRussian.addEventListener('click', () => this.testSpeech('russian', 'Привет мир', 'ru'));
    }

    // Speech rate slider
    const speechRateSlider = document.getElementById('speech-rate');
    const rateValue = document.getElementById('rate-value');
    
    if (speechRateSlider && rateValue) {
      speechRateSlider.addEventListener('input', (e) => {
        this.settings.speechRate = parseFloat(e.target.value);
        rateValue.textContent = `${e.target.value}x`;
        this.saveSettings();
      });
    }

    // Auto-speak checkbox
    const autoSpeakCheckbox = document.getElementById('auto-speak');
    if (autoSpeakCheckbox) {
      autoSpeakCheckbox.addEventListener('change', (e) => {
        this.settings.autoSpeak = e.target.checked;
        this.saveSettings();
      });
    }
  }

  testSpeech(language, text, langCode) {
    console.log(`=== TESTING SPEECH: ${language} - "${text}" - Lang: ${langCode} ===`);
    
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech wird von diesem Browser nicht unterstützt.');
      return;
    }

    // Cancel any ongoing speech without triggering error handlers
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      // Wait a bit for cancellation to complete
      setTimeout(() => this.executeSpeechTest(language, text, langCode), 100);
      return;
    }
    
    this.executeSpeechTest(language, text, langCode);
  }

  executeSpeechTest(language, text, langCode) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.settings.speechRate || 0.9;
    utterance.volume = 1;
    utterance.lang = langCode; // Set the specific language code
    
    // Get available voices
    const voices = speechSynthesis.getVoices();
    console.log(`Available voices for test: ${voices.length}`);
    console.log(`Looking for voices with language: ${langCode}`);
    
    // Find appropriate voice based on the specific language code
    let preferredVoice = null;
    let alternativeVoices = [];
    
    if (language === 'spanish') {
      preferredVoice = voices.find(v => v.lang.startsWith('es')) || 
                     voices.find(v => v.name.toLowerCase().includes('spanish'));
      alternativeVoices = voices.filter(v => v.lang.startsWith('es'));
    } else if (language === 'english-us') {
      // Look specifically for US English voices
      preferredVoice = voices.find(v => v.lang === 'en-US') ||
                     voices.find(v => v.lang.startsWith('en-US')) ||
                     voices.find(v => v.name.toLowerCase().includes('united states')) ||
                     voices.find(v => v.name.toLowerCase().includes('us ')) ||
                     voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('american'));
      alternativeVoices = voices.filter(v => v.lang.startsWith('en'));
    } else if (language === 'english-gb') {
      // Look specifically for British English voices
      preferredVoice = voices.find(v => v.lang === 'en-GB') ||
                     voices.find(v => v.lang.startsWith('en-GB')) ||
                     voices.find(v => v.name.toLowerCase().includes('united kingdom')) ||
                     voices.find(v => v.name.toLowerCase().includes('british')) ||
                     voices.find(v => v.name.toLowerCase().includes('uk '));
      alternativeVoices = voices.filter(v => v.lang.startsWith('en'));
    } else if (language === 'russian') {
      preferredVoice = voices.find(v => v.lang.startsWith('ru')) ||
                     voices.find(v => v.name.toLowerCase().includes('russian'));
      alternativeVoices = voices.filter(v => v.lang.startsWith('ru'));
    }
    
    // Fallback to any voice with the language code
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang === langCode) ||
                     voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang; // Use the voice's specific language
      console.log(`✅ Using voice: ${preferredVoice.name} (${preferredVoice.lang}) - Local: ${preferredVoice.localService}`);
    } else {
      console.log(`⚠️ No specific voice found for ${language} (${langCode}), using system default`);
    }
    
    // Show available voices for this language family
    if (alternativeVoices.length > 0) {
      console.log(`📋 Available ${language.split('-')[0]} voices:`, 
        alternativeVoices.map(v => `${v.name} (${v.lang}) - Local: ${v.localService}`));
    } else {
      console.log(`❌ No voices found for language family: ${langCode.split('-')[0]}`);
      console.log('All available voices:', voices.map(v => `${v.name} (${v.lang})`));
    }
    
    // Track if this utterance was manually cancelled
    let wasCancelled = false;
    
    utterance.onstart = () => {
      console.log(`✅ Test speech started: "${text}" using ${preferredVoice?.name || 'default voice'}`);
    };
    
    utterance.onend = () => {
      if (!wasCancelled) {
        console.log(`✅ Test speech finished: "${text}"`);
      }
    };
    
    utterance.onerror = (event) => {
      // Only show errors that aren't caused by cancellation
      if (event.error !== 'interrupted' && event.error !== 'cancelled') {
        console.error(`❌ Test speech error:`, event.error);
        alert(`Speech-Test-Fehler: ${event.error}`);
      } else {
        console.log(`ℹ️ Speech was interrupted (this is normal when switching tests)`);
      }
    };
    
    // Store reference for potential cancellation
    this.currentTestUtterance = utterance;
    utterance.onstart = () => {
      console.log(`✅ Test speech started: "${text}" using ${preferredVoice?.name || 'default voice'}`);
      if (preferredVoice) {
        console.log(`🎤 Voice details: ${preferredVoice.name} (${preferredVoice.lang}) - ${preferredVoice.localService ? 'Local' : 'Remote'}`);
      }
    };
    
    try {
      speechSynthesis.speak(utterance);
      console.log('✅ Test speech synthesis called');
    } catch (error) {
      console.error('❌ Error in test speech:', error);
      alert(`Fehler beim Test: ${error.message}`);
    }
  }

  getVocabularyData() {
    // Base vocabulary data - this would be expanded with more words
    const baseVocabulary = {
      spanish: [
        {
          id: 'es_1',
          german: 'Hallo',
          target: 'Hola',
          germanExample: '"Hallo, wie geht es dir?"',
          targetExample: '"Hola, ¿cómo estás?"'
        },
        {
          id: 'es_2',
          german: 'Danke',
          target: 'Gracias',
          germanExample: '"Danke für deine Hilfe!"',
          targetExample: '"¡Gracias por tu ayuda!"'
        },
        {
          id: 'es_3',
          german: 'Auf Wiedersehen',
          target: 'Adiós',
          germanExample: '"Auf Wiedersehen, bis morgen!"',
          targetExample: '"¡Adiós, hasta mañana!"'
        }
      ],
      english: [
        {
          id: 'en_1',
          german: 'Hallo',
          target: this.settings.englishVariant === 'gb' ? 'Hello' : 'Hello',
          germanExample: '"Hallo, wie geht es dir?"',
          targetExample: this.settings.englishVariant === 'gb' ? '"Hello, how are you?"' : '"Hello, how are you?"'
        },
        {
          id: 'en_2',
          german: 'Danke',
          target: this.settings.englishVariant === 'gb' ? 'Thank you' : 'Thank you',
          germanExample: '"Danke für deine Hilfe!"',
          targetExample: this.settings.englishVariant === 'gb' ? '"Thank you for your help!"' : '"Thank you for your help!"'
        },
        {
          id: 'en_3',
          german: 'Farbe',
          target: this.settings.englishVariant === 'gb' ? 'Colour' : 'Color',
          germanExample: '"Welche Farbe magst du?"',
          targetExample: this.settings.englishVariant === 'gb' ? '"What colour do you like?"' : '"What color do you like?"'
        }
      ],
      russian: [
        {
          id: 'ru_1',
          german: 'Hallo',
          target: 'Привет',
          germanExample: '"Hallo, wie geht es dir?"',
          targetExample: '"Привет, как дела?"'
        },
        {
          id: 'ru_2',
          german: 'Danke',
          target: 'Спасибо',
          germanExample: '"Danke für deine Hilfe!"',
          targetExample: '"Спасибо за помощь!"'
        },
        {
          id: 'ru_3',
          german: 'Auf Wiedersehen',
          target: 'До свидания',
          germanExample: '"Auf Wiedersehen, bis morgen!"',
          targetExample: '"До свидания, до завтра!"'
        }
      ]
    };

    // Get spaced repetition data from localStorage
    const spacedRepetitionData = this.getSpacedRepetitionData();
    
    // Merge base data with spaced repetition data
    const vocabulary = {};
    Object.keys(baseVocabulary).forEach(lang => {
      vocabulary[lang] = baseVocabulary[lang].map(card => {
        const srData = spacedRepetitionData[card.id] || this.getDefaultSpacedRepetitionData();
        return { ...card, ...srData };
      });
    });

    return vocabulary;
  }

  getCurrentCard() {
    // Use due cards if available, otherwise fall back to all cards
    const cards = this.currentDueCards || this.getVocabularyData()[this.currentLanguage] || this.getVocabularyData().spanish;
    return cards[this.currentCardIndex] || cards[0];
  }

  loadCurrentCard() {
    const card = this.getCurrentCard();
    
    // Update front of card
    const wordGerman = document.querySelector('.word-german');
    const exampleGerman = document.querySelector('.example-sentence');
    
    if (wordGerman) wordGerman.textContent = card.german;
    if (exampleGerman) exampleGerman.textContent = card.germanExample;
    
    // Update back of card
    const wordTarget = document.querySelector('.word-target');
    const exampleTarget = document.querySelector('.example-sentence-target');
    
    if (wordTarget) wordTarget.textContent = card.target;
    if (exampleTarget) exampleTarget.textContent = card.targetExample;
    
    // Add spaced repetition indicator
    this.updateSpacedRepetitionIndicator(card);
    
    // Reset card to front (German side)
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
      flashcard.classList.remove('flipped');
    }
    
    // Cancel any ongoing speech when loading new card
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  updateSpacedRepetitionIndicator(card) {
    // Add or update the spaced repetition indicator
    let indicator = document.querySelector('.sr-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'sr-indicator';
      document.querySelector('.flashcard-front').appendChild(indicator);
    }
    
    const level = card.level || 0;
    const reviewCount = card.reviewCount || 0;
    const nextReview = card.nextReview;
    
    let statusText = '';
    let statusClass = '';
    
    switch(level) {
      case 0:
        statusText = '🆕 Neu';
        statusClass = 'sr-new';
        break;
      case 1:
        statusText = `🔴 Schwierig (${reviewCount}x)`;
        statusClass = 'sr-difficult';
        break;
      case 2:
        statusText = `🟡 Einfach (${reviewCount}x)`;
        statusClass = 'sr-easy';
        break;
      case 3:
        statusText = `🟢 Bekannt (${reviewCount}x)`;
        statusClass = 'sr-known';
        break;
    }
    
    if (nextReview && level > 0) {
      const nextDate = new Date(nextReview);
      const now = new Date();
      
      if (level <= 2 && nextReview.includes('T')) {
        // Time-based intervals (minutes/hours)
        const minutesUntil = Math.ceil((nextDate - now) / (1000 * 60));
        
        if (minutesUntil <= 0) {
          statusText += ` - Jetzt fällig`;
        } else if (minutesUntil < 60) {
          statusText += ` - ${minutesUntil}min`;
        } else {
          const hoursUntil = Math.ceil(minutesUntil / 60);
          statusText += ` - ${hoursUntil}h`;
        }
      } else {
        // Date-based intervals (days)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 0) {
          statusText += ` - Heute fällig`;
        } else if (daysUntil === 1) {
          statusText += ` - Morgen`;
        } else {
          statusText += ` - ${daysUntil}d`;
        }
      }
    }
    
    indicator.textContent = statusText;
    indicator.className = `sr-indicator ${statusClass}`;
  }

  flipCard() {
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
      flashcard.classList.toggle('flipped');
      
      // Only speak when flipping TO the target language (back side)
      if (flashcard.classList.contains('flipped')) {
        // Wait for flip animation to complete, then speak (if auto-speak is enabled)
        if (this.settings.autoSpeak) {
          setTimeout(() => {
            this.speakCurrentWord();
          }, 300);
        }
      } else {
        // Stop any ongoing speech when flipping back to German side
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
      }
    }
  }

  previousCard() {
    const vocabulary = this.getVocabularyData();
    const cards = vocabulary[this.currentLanguage] || vocabulary.spanish;
    
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.loadCurrentCard();
      this.updateCardCounter();
      this.updateNavigationButtons();
    }
  }

  nextCard() {
    const vocabulary = this.getVocabularyData();
    const cards = vocabulary[this.currentLanguage] || vocabulary.spanish;
    
    if (this.currentCardIndex < cards.length - 1) {
      this.currentCardIndex++;
      this.loadCurrentCard();
      this.updateCardCounter();
      this.updateNavigationButtons();
    }
  }

  updateCardCounter() {
    const cards = this.currentDueCards || this.getVocabularyData()[this.currentLanguage] || this.getVocabularyData().spanish;
    const counter = document.getElementById('card-counter');
    
    if (counter) {
      const totalDue = this.getDueCards().length;
      const remaining = cards.length;
      counter.textContent = `${this.currentCardIndex + 1} / ${cards.length}`;
      
      // Add due cards info
      if (totalDue > 0 && totalDue !== cards.length) {
        counter.textContent += ` (${totalDue} fällig heute)`;
      }
    }
    
    this.updateNavigationButtons();
  }

  updateNavigationButtons() {
    const vocabulary = this.getVocabularyData();
    const cards = vocabulary[this.currentLanguage] || vocabulary.spanish;
    const prevBtn = document.getElementById('prev-card');
    const nextBtn = document.getElementById('next-card');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentCardIndex === 0;
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.currentCardIndex === cards.length - 1;
    }
  }

  // Text-to-Speech with proper language support
  speakCurrentWord() {
    console.log('=== SPEAK CURRENT WORD CALLED ===');
    
    // Only speak if we're currently showing the target language (card is flipped)
    const flashcard = document.getElementById('flashcard');
    if (!flashcard || !flashcard.classList.contains('flipped')) {
      console.log('❌ Not speaking - card is showing German side or flashcard not found');
      console.log('Flashcard element:', flashcard);
      console.log('Flashcard classes:', flashcard?.className);
      return;
    }

    if (!('speechSynthesis' in window)) {
      console.log('❌ Text-to-speech not supported in this browser');
      alert('Text-to-speech wird von diesem Browser nicht unterstützt.');
      return;
    }

    console.log('✅ Speech synthesis is available');

    const card = this.getCurrentCard();
    if (!card) {
      console.log('❌ No current card to speak');
      return;
    }
    
    const textToSpeak = card.target;
    console.log(`📢 Text to speak: "${textToSpeak}"`);
    
    // Cancel any ongoing speech without error messages
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Simple test first - try without any voice settings
    const testUtterance = new SpeechSynthesisUtterance(textToSpeak);
    testUtterance.rate = 0.8;
    testUtterance.volume = 1;
    
    // Get available voices
    const voices = speechSynthesis.getVoices();
    console.log(`📋 Available voices (${voices.length}):`, voices.map(v => `${v.name} (${v.lang}) - Local: ${v.localService}`));
    
    // Visual feedback
    const speakBtn = document.getElementById('speak-btn');
    if (speakBtn) {
      speakBtn.textContent = '🔊 Spricht...';
      speakBtn.disabled = true;
    }
    
    testUtterance.onstart = () => {
      console.log(`✅ Speech started: "${textToSpeak}"`);
    };
    
    testUtterance.onend = () => {
      console.log(`✅ Speech finished: "${textToSpeak}"`);
      if (speakBtn) {
        speakBtn.textContent = '🔊 Anhören';
        speakBtn.disabled = false;
      }
    };
    
    testUtterance.onerror = (event) => {
      // Only show errors that aren't caused by cancellation
      if (event.error !== 'interrupted' && event.error !== 'cancelled') {
        console.error(`❌ Speech error:`, event.error);
        console.error('Error details:', event);
        if (speakBtn) {
          speakBtn.textContent = '🔊 Fehler';
          speakBtn.disabled = false;
        }
        alert(`Speech-Fehler: ${event.error}`);
      } else {
        console.log(`ℹ️ Speech was interrupted (normal when switching cards or clicking other buttons)`);
        if (speakBtn) {
          speakBtn.textContent = '🔊 Anhören';
          speakBtn.disabled = false;
        }
      }
    };
    
    // Try to use a suitable voice if available
    if (voices.length > 0) {
      const currentLang = this.currentLanguage;
      let preferredVoice = null;
      
      // Find voice for current language
      if (currentLang === 'english') {
        preferredVoice = voices.find(v => v.lang.startsWith('en-')) || voices.find(v => v.lang === 'en');
      } else if (currentLang === 'spanish') {
        preferredVoice = voices.find(v => v.lang.startsWith('es-')) || voices.find(v => v.lang === 'es');
      } else if (currentLang === 'russian') {
        preferredVoice = voices.find(v => v.lang.startsWith('ru-')) || voices.find(v => v.lang === 'ru');
      }
      
      if (preferredVoice) {
        testUtterance.voice = preferredVoice;
        testUtterance.lang = preferredVoice.lang;
        console.log(`🎤 Using voice: ${preferredVoice.name} (${preferredVoice.lang})`);
      } else {
        console.log(`⚠️ No preferred voice found for ${currentLang}, using default`);
      }
    } else {
      console.log('⚠️ No voices available, using system default');
    }
    
    console.log(`🎯 About to speak with settings:`, {
      text: textToSpeak,
      lang: testUtterance.lang,
      voice: testUtterance.voice?.name || 'default',
      rate: testUtterance.rate,
      volume: testUtterance.volume
    });
    
    try {
      speechSynthesis.speak(testUtterance);
      console.log('✅ speechSynthesis.speak() called successfully');
    } catch (error) {
      console.error('❌ Error calling speechSynthesis.speak():', error);
      alert(`Fehler beim Starten der Sprachausgabe: ${error.message}`);
    }
  }

  // Learning Progress
  markAsKnown() {
    const card = this.getCurrentCard();
    card.known = true;
    console.log(`Marked "${card.german}" as known`);
    
    // Update spaced repetition data
    this.updateSpacedRepetition(card.id, 'known');
    
    // Move to next card automatically
    setTimeout(() => {
      this.nextCard();
    }, 500);
  }

  markAsDifficult() {
    const card = this.getCurrentCard();
    if (card && card.id) {
      this.updateSpacedRepetition(card.id, 'difficult');
      this.showFeedback('🔴 Als schwierig markiert - bleibt in der heutigen Session', 'difficult');
      this.moveToNextCard();
    }
  }

  markAsEasy() {
    const card = this.getCurrentCard();
    if (card && card.id) {
      this.updateSpacedRepetition(card.id, 'easy');
      const streak = (card.streak || 0) + 1;
      let timeInfo = '';
      if (streak === 1) timeInfo = '10min';
      else if (streak === 2) timeInfo = '30min';  
      else if (streak === 3) timeInfo = '1h';
      else if (streak === 4) timeInfo = '3h';
      else timeInfo = '6h';
      
      this.showFeedback(`🟡 Als einfach markiert - nächste Wiederholung in ${timeInfo}`, 'easy');
      this.moveToNextCard();
    }
  }

  markAsKnown() {
    const card = this.getCurrentCard();
    if (card && card.id) {
      this.updateSpacedRepetition(card.id, 'known');
      const streak = (card.streak || 0) + 1;
      let dayInfo = '';
      if (streak === 1) dayInfo = '1 Tag';
      else if (streak === 2) dayInfo = '2 Tage';
      else if (streak === 3) dayInfo = '5 Tage';
      else if (streak === 4) dayInfo = '10 Tage';
      else dayInfo = '20+ Tage';
      
      this.showFeedback(`🟢 Als bekannt markiert - nächste Wiederholung in ${dayInfo}`, 'known');
      this.moveToNextCard();
    }
  }

  showFeedback(message, type) {
    // Create feedback element
    let feedback = document.querySelector('.feedback-message');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'feedback-message';
      document.querySelector('.flashcard-container').appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.className = `feedback-message feedback-${type}`;
    
    // Remove after 2 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 2000);
  }

  moveToNextCard() {
    setTimeout(() => {
      // Remove current card from due cards array
      if (this.currentDueCards && this.currentDueCards.length > 1) {
        this.currentDueCards.splice(this.currentCardIndex, 1);
        
        // Adjust index if we're at the end
        if (this.currentCardIndex >= this.currentDueCards.length) {
          this.currentCardIndex = 0;
        }
        
        this.loadCurrentCard();
        this.updateCardCounter();
      } else {
        // No more cards due today
        this.showNoCardsMessage();
      }
    }, 500);
  }

  // Spaced Repetition System
  getDefaultSpacedRepetitionData() {
    return {
      level: 0, // 0 = new, 1 = difficult, 2 = easy, 3 = known
      interval: 1, // days until next review
      lastReviewed: null,
      nextReview: new Date().toDateString(), // today
      reviewCount: 0,
      streak: 0 // consecutive correct answers
    };
  }

  getSpacedRepetitionData() {
    try {
      const data = localStorage.getItem('spaced-repetition-data');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading spaced repetition data:', error);
      return {};
    }
  }

  saveSpacedRepetitionData(data) {
    try {
      localStorage.setItem('spaced-repetition-data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving spaced repetition data:', error);
    }
  }

  updateSpacedRepetition(cardId, difficulty) {
    const srData = this.getSpacedRepetitionData();
    const cardData = srData[cardId] || this.getDefaultSpacedRepetitionData();
    
    const today = new Date();
    cardData.lastReviewed = today.toDateString();
    cardData.reviewCount++;
    
    // Update level and calculate new interval based on difficulty
    switch(difficulty) {
      case 'difficult':
        cardData.level = Math.max(1, cardData.level); // At least level 1
        cardData.streak = 0;
        cardData.interval = 0; // Review again in the same session (minutes)
        cardData.nextReview = today.toDateString(); // Today
        break;
        
      case 'easy':
        cardData.level = Math.max(2, cardData.level); // At least level 2
        cardData.streak++;
        
        // Progressive intervals within the same day, then next day
        if (cardData.streak === 1) {
          cardData.interval = 10; // 10 minutes
        } else if (cardData.streak === 2) {
          cardData.interval = 30; // 30 minutes  
        } else if (cardData.streak === 3) {
          cardData.interval = 60; // 1 hour
        } else if (cardData.streak === 4) {
          cardData.interval = 180; // 3 hours
        } else {
          cardData.interval = 360; // 6 hours, but still same day
        }
        
        // Calculate next review time (in minutes from now)
        const nextReview = new Date(today);
        nextReview.setMinutes(nextReview.getMinutes() + cardData.interval);
        cardData.nextReview = nextReview.toISOString();
        break;
        
      case 'known':
        cardData.level = 3;
        cardData.streak++;
        
        // Days-based intervals for known cards
        if (cardData.streak === 1) {
          cardData.interval = 1; // 1 day
        } else if (cardData.streak === 2) {
          cardData.interval = 2; // 2 days
        } else if (cardData.streak === 3) {
          cardData.interval = 5; // 5 days
        } else if (cardData.streak === 4) {
          cardData.interval = 10; // 10 days
        } else if (cardData.streak === 5) {
          cardData.interval = 20; // 20 days
        } else {
          cardData.interval = Math.min(cardData.interval * 2, 90); // Max 3 months
        }
        
        // Calculate next review date (in days)
        const nextReviewKnown = new Date(today);
        nextReviewKnown.setDate(nextReviewKnown.getDate() + cardData.interval);
        cardData.nextReview = nextReviewKnown.toDateString();
        break;
    }
    
    // Save updated data
    srData[cardId] = cardData;
    this.saveSpacedRepetitionData(srData);
    
    console.log(`Card ${cardId} updated:`, {
      difficulty,
      level: cardData.level,
      interval: cardData.interval,
      nextReview: cardData.nextReview,
      streak: cardData.streak
    });
  }

  getDueCards() {
    const vocabulary = this.getVocabularyData();
    const cards = vocabulary[this.currentLanguage] || vocabulary.spanish;
    const now = new Date();
    
    // Filter cards that are due for review
    const dueCards = cards.filter(card => {
      if (!card.nextReview) return true; // New cards are always due
      
      // Handle different date formats (ISO string for time-based, date string for day-based)
      const nextReviewDate = new Date(card.nextReview);
      
      // Check if the review date is invalid
      if (isNaN(nextReviewDate.getTime())) {
        console.warn(`Invalid nextReview date for card: ${card.german}`, card.nextReview);
        return true; // Include cards with invalid dates
      }
      
      // For cards with levels 1-5 (Difficult and Easy) that should stay in session
      if (card.level >= 1 && card.level <= 5 && card.nextReview.includes('T')) {
        // Time-based review (ISO string) - these stay in session until level 6
        const isDue = nextReviewDate <= now;
        console.log(`Time-based card "${card.german}" (level ${card.level}): due=${isDue}, nextReview=${card.nextReview}`);
        return isDue;
      } else if (card.level >= 6) {
        // Date-based review (level 6+) - day-based scheduling
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextReviewDate.setHours(0, 0, 0, 0);
        const isDue = nextReviewDate <= today;
        console.log(`Date-based card "${card.german}" (level ${card.level}): due=${isDue}, nextReview=${card.nextReview}`);
        return isDue;
      } else {
        // Fallback for other cases
        return nextReviewDate <= now;
      }
    });
    
    console.log(`Found ${dueCards.length} due cards out of ${cards.length} total cards`);
    
    // Sort by priority: difficult cards first, then new cards, then by review date
    dueCards.sort((a, b) => {
      // Difficult cards (level 1) first
      if (a.level === 1 && b.level !== 1) return -1;
      if (b.level === 1 && a.level !== 1) return 1;
      
      // New cards (level 0) next
      if (!a.lastReviewed && b.lastReviewed) return -1;
      if (a.lastReviewed && !b.lastReviewed) return 1;
      
      // Sort by next review date/time
      const dateA = new Date(a.nextReview || now);
      const dateB = new Date(b.nextReview || now);
      return dateA - dateB;
    });
    
    return dueCards;
  }

  showNoCardsMessage() {
    const vocabulary = this.getVocabularyData();
    const allCards = vocabulary[this.currentLanguage] || vocabulary.spanish;
    const now = new Date();
    
    // Check if there are any session-based cards still pending
    const sessionCards = allCards.filter(card => {
      return card.level >= 1 && card.level <= 5 && card.nextReview && card.nextReview.includes('T');
    });
    
    const pendingSessionCards = sessionCards.filter(card => {
      const nextReviewDate = new Date(card.nextReview);
      return nextReviewDate > now;
    });
    
    const flashcardContainer = document.querySelector('.flashcard-container');
    if (flashcardContainer) {
      let message, subtitle;
      
      if (pendingSessionCards.length > 0) {
        // There are still session cards pending
        const nextReview = Math.min(...pendingSessionCards.map(card => new Date(card.nextReview).getTime()));
        const minutesUntilNext = Math.round((nextReview - now.getTime()) / (1000 * 60));
        
        message = "Session-Pause";
        subtitle = `${pendingSessionCards.length} Karten warten noch in dieser Session. Nächste Karte in ${minutesUntilNext} Minuten.`;
      } else {
        // All session cards are done, only daily cards remain
        message = "Alle Karten für heute erledigt!";
        subtitle = "Komm morgen wieder für neue Wiederholungen.";
      }
      
      flashcardContainer.innerHTML = `
        <div class="no-cards-message">
          <div class="no-cards-icon">🎉</div>
          <h3>${message}</h3>
          <p>${subtitle}</p>
          <button class="btn btn--primary" onclick="window.languageLearningApp.showAllCards()">
            Alle Karten anzeigen
          </button>
        </div>
      `;
    }
    
    // Hide navigation and action buttons
    const cardControls = document.querySelector('.section-controls');
    const cardActions = document.querySelector('.flashcard-actions');
    if (cardControls) cardControls.style.display = 'none';
    if (cardActions) cardActions.style.display = 'none';
  }

  showAllCards() {
    // Reset to show all cards regardless of review schedule
    const vocabulary = this.getVocabularyData();
    this.currentDueCards = vocabulary[this.currentLanguage] || vocabulary.spanish;
    this.currentCardIndex = 0;
    
    // Restore normal flashcard display
    const flashcardContainer = document.querySelector('.flashcard-container');
    if (flashcardContainer) {
      flashcardContainer.innerHTML = `
        <div id="flashcard" class="flashcard">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="word-german">Hallo</div>
              <div class="example-sentence">"Hallo, wie geht es dir?"</div>
              <button class="flip-btn">Übersetzen</button>
            </div>
            <div class="flashcard-back">
              <div class="word-target">Hello</div>
              <div class="example-sentence-target">"Hello, how are you?"</div>
              <button class="speak-btn" id="speak-btn">🔊 Anhören</button>
              <button class="flip-btn">Zurück</button>
            </div>
          </div>
        </div>
      `;
    }
    
    // Restore controls
    const cardControls = document.querySelector('.section-controls');
    const cardActions = document.querySelector('.flashcard-actions');
    if (cardControls) cardControls.style.display = 'flex';
    if (cardActions) cardActions.style.display = 'flex';
    
    // Re-setup flashcard controls
    this.setupFlashcardControls();
    this.loadCurrentCard();
    this.updateCardCounter();
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Initializing Language Learning PWA');
  window.languageLearningApp = new LanguageLearningPWA();
});

// Fallback for browsers that don't support DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (!window.languageLearningApp) {
      console.log('Fallback initialization - Creating Language Learning PWA');
      window.languageLearningApp = new LanguageLearningPWA();
    }
  });
} else {
  // DOM is already loaded
  console.log('DOM already loaded - Initializing Language Learning PWA immediately');
  window.languageLearningApp = new LanguageLearningPWA();
}