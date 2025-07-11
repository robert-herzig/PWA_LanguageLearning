// Language Learning PWA JavaScript

class LanguageLearningPWA {
  constructor() {
    this.deferredPrompt = null;
    this.isOnline = navigator.onLine;
    this.currentLanguage = 'spanish';
    this.currentCardIndex = 0;
    this.currentSection = 'flashcards';
    this.init();
  }

  async init() {
    this.registerServiceWorker();
    this.setupEventListeners();
    this.updateOnlineStatus();
    this.checkInstallPrompt();
    this.initializeApp();
    this.initializeFlashcards();
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

  // Event Listeners Setup
  setupEventListeners() {
    // Online/Offline status
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));

    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallPrompt();
    });

    // Navigation
    this.setupNavigation();

    // Language selector
    this.setupLanguageSelector();

    // Flashcard controls
    this.setupFlashcardControls();

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

  // Navigation Handler
  navigateToSection(section) {
    console.log(`Navigating to: ${section}`);
    this.currentSection = section;
    
    // Hide all sections
    const sections = document.querySelectorAll('.learning-section');
    sections.forEach(s => s.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
      targetSection.classList.add('active');
    }
    
    switch(section) {
      case 'flashcards':
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
        this.showFlashcardsSection();
    }
  }

  // Section Display Methods
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
    console.log('Showing settings section - to be implemented');
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
    this.currentCardIndex = 0;
    this.loadCurrentCard();
    this.updateCardCounter();
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
    const knowBtn = document.getElementById('know-it');
    const studyBtn = document.getElementById('study-more');
    
    if (knowBtn) {
      knowBtn.addEventListener('click', () => this.markAsKnown());
    }
    
    if (studyBtn) {
      studyBtn.addEventListener('click', () => this.markForStudy());
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

  getVocabularyData() {
    return {
      spanish: [
        {
          german: 'Hallo',
          target: 'Hola',
          germanExample: '"Hallo, wie geht es dir?"',
          targetExample: '"Hola, ¿cómo estás?"',
          known: false
        },
        {
          german: 'Danke',
          target: 'Gracias',
          germanExample: '"Danke für deine Hilfe!"',
          targetExample: '"¡Gracias por tu ayuda!"',
          known: false
        },
        {
          german: 'Auf Wiedersehen',
          target: 'Adiós',
          germanExample: '"Auf Wiedersehen, bis morgen!"',
          targetExample: '"¡Adiós, hasta mañana!"',
          known: false
        }
      ],
      english: [
        {
          german: 'Hallo',
          target: 'Hello',
          germanExample: '"Hallo, wie geht es dir?"',
          targetExample: '"Hello, how are you?"',
          known: false
        },
        {
          german: 'Danke',
          target: 'Thank you',
          germanExample: '"Danke für deine Hilfe!"',
          targetExample: '"Thank you for your help!"',
          known: false
        },
        {
          german: 'Auf Wiedersehen',
          target: 'Goodbye',
          germanExample: '"Auf Wiedersehen, bis morgen!"',
          targetExample: '"Goodbye, see you tomorrow!"',
          known: false
        }
      ],
      russian: [
        {
          german: 'Hallo',
          target: 'Привет',
          germanExample: '"Hallo, wie geht es dir?"',
          targetExample: '"Привет, как дела?"',
          known: false
        },
        {
          german: 'Danke',
          target: 'Спасибо',
          germanExample: '"Danke für deine Hilfe!"',
          targetExample: '"Спасибо за помощь!"',
          known: false
        },
        {
          german: 'Auf Wiedersehen',
          target: 'До свидания',
          germanExample: '"Auf Wiedersehen, bis morgen!"',
          targetExample: '"До свидания, до завтра!"',
          known: false
        }
      ]
    };
  }

  getCurrentCard() {
    const vocabulary = this.getVocabularyData();
    const cards = vocabulary[this.currentLanguage] || vocabulary.spanish;
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

  flipCard() {
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
      flashcard.classList.toggle('flipped');
      
      // Only speak when flipping TO the target language (back side)
      if (flashcard.classList.contains('flipped')) {
        // Wait for flip animation to complete, then speak
        setTimeout(() => {
          this.speakCurrentWord();
        }, 300);
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
    const vocabulary = this.getVocabularyData();
    const cards = vocabulary[this.currentLanguage] || vocabulary.spanish;
    const counter = document.getElementById('card-counter');
    
    if (counter) {
      counter.textContent = `${this.currentCardIndex + 1} / ${cards.length}`;
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
    // Only speak if we're currently showing the target language (card is flipped)
    const flashcard = document.getElementById('flashcard');
    if (!flashcard || !flashcard.classList.contains('flipped')) {
      console.log('Not speaking - card is showing German side');
      return;
    }

    if (!('speechSynthesis' in window)) {
      console.log('Text-to-speech not supported');
      return;
    }

    const card = this.getCurrentCard();
    const textToSpeak = card.target;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set language-specific settings for proper pronunciation
    const languageSettings = {
      spanish: {
        lang: 'es-ES',
        langCodes: ['es-ES', 'es-MX', 'es-AR', 'es-US', 'es'], // Multiple Spanish variants
        rate: 0.9,
        pitch: 1.0
      },
      english: {
        lang: 'en-US',
        langCodes: ['en-US', 'en-GB', 'en-AU', 'en'], // Multiple English variants
        rate: 0.9,
        pitch: 1.0
      },
      russian: {
        lang: 'ru-RU',
        langCodes: ['ru-RU', 'ru'], // Russian variants
        rate: 0.9, // Slower for Cyrillic pronunciation
        pitch: 1.0
      }
    };
    
    const settings = languageSettings[this.currentLanguage] || languageSettings.english;
    
    // Set the primary language
    utterance.lang = settings.lang;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = 1;
    
    // Find the best voice for the language
    const voices = speechSynthesis.getVoices();
    console.log('All available voices:', voices.map(v => `${v.name} (${v.lang})`));
    
    // Try to find the best voice in order of preference
    let selectedVoice = null;
    
    // 1. Try to find exact language match with local service
    for (const langCode of settings.langCodes) {
      selectedVoice = voices.find(voice => 
        voice.lang === langCode && voice.localService
      );
      if (selectedVoice) break;
    }
    
    // 2. Try to find exact language match (any service)
    if (!selectedVoice) {
      for (const langCode of settings.langCodes) {
        selectedVoice = voices.find(voice => voice.lang === langCode);
        if (selectedVoice) break;
      }
    }
    
    // 3. Try to find language prefix match with local service
    if (!selectedVoice) {
      for (const langCode of settings.langCodes) {
        const prefix = langCode.substring(0, 2);
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith(prefix) && voice.localService
        );
        if (selectedVoice) break;
      }
    }
    
    // 4. Try to find any language prefix match
    if (!selectedVoice) {
      for (const langCode of settings.langCodes) {
        const prefix = langCode.substring(0, 2);
        selectedVoice = voices.find(voice => voice.lang.startsWith(prefix));
        if (selectedVoice) break;
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`✅ Using voice: ${selectedVoice.name} (${selectedVoice.lang}) - Local: ${selectedVoice.localService}`);
    } else {
      console.warn(`❌ No suitable voice found for ${this.currentLanguage}. Available voices:`, 
        voices.filter(v => v.lang.startsWith(settings.lang.substring(0, 2))).map(v => `${v.name} (${v.lang})`));
    }
    
    // Visual feedback
    const speakBtn = document.getElementById('speak-btn');
    if (speakBtn) {
      speakBtn.textContent = '🔊 Spricht...';
      speakBtn.disabled = true;
    }
    
    utterance.onstart = () => {
      console.log(`🔊 Started speaking: "${textToSpeak}" in ${settings.lang}`);
      if (selectedVoice) {
        console.log(`🎤 Voice being used: ${selectedVoice.name} (${selectedVoice.lang})`);
      }
    };
    
    utterance.onend = () => {
      if (speakBtn) {
        speakBtn.textContent = '🔊 Anhören';
        speakBtn.disabled = false;
      }
      console.log(`✅ Finished speaking: "${textToSpeak}" in ${settings.lang}`);
    };
    
    utterance.onerror = (event) => {
      if (speakBtn) {
        speakBtn.textContent = '🔊 Fehler';
        speakBtn.disabled = false;
      }
      console.error('❌ Speech synthesis error:', event.error);
      console.error('Error details:', event);
    };
    
    // Extra verification before speaking
    console.log(`🎯 About to speak "${textToSpeak}" with:`, {
      language: utterance.lang,
      voice: selectedVoice ? selectedVoice.name : 'default',
      rate: utterance.rate,
      currentLanguage: this.currentLanguage
    });
    
    speechSynthesis.speak(utterance);
  }

  // Learning Progress
  markAsKnown() {
    const card = this.getCurrentCard();
    card.known = true;
    console.log(`Marked "${card.german}" as known`);
    
    // Move to next card automatically
    setTimeout(() => {
      this.nextCard();
    }, 500);
  }

  markForStudy() {
    const card = this.getCurrentCard();
    card.known = false;
    console.log(`Marked "${card.german}" for more study`);
    
    // Move to next card automatically
    setTimeout(() => {
      this.nextCard();
    }, 500);
  }

  // Online Status Management
  updateOnlineStatus(isOnline = navigator.onLine) {
    this.isOnline = isOnline;
    const statusIndicator = document.getElementById('online-status');
    
    if (statusIndicator) {
      statusIndicator.textContent = isOnline ? 'Online' : 'Offline';
      statusIndicator.classList.toggle('offline', !isOnline);
    }

    // Show/hide offline indicator
    this.toggleOfflineIndicator(!isOnline);
  }

  toggleOfflineIndicator(show) {
    let offlineIndicator = document.querySelector('.offline-indicator');
    
    if (show && !offlineIndicator) {
      offlineIndicator = document.createElement('div');
      offlineIndicator.className = 'offline-indicator';
      offlineIndicator.textContent = 'You are currently offline. Some features may be limited.';
      document.body.insertBefore(offlineIndicator, document.body.firstChild);
    } else if (!show && offlineIndicator) {
      offlineIndicator.remove();
    }
  }

  // Install Prompt Management
  checkInstallPrompt() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      console.log('App is running in standalone mode');
      return;
    }

    // Check if install prompt was previously dismissed
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now - dismissedDate) / (1000 * 60 * 60 * 24);
      
      // Show prompt again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }
  }

  showInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    if (installPrompt) {
      installPrompt.classList.remove('hidden');
    }
  }

  hideInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    if (installPrompt) {
      installPrompt.classList.add('hidden');
      localStorage.setItem('install-prompt-dismissed', new Date().toISOString());
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log('Install prompt not available');
      return;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
      this.hideInstallPrompt();
    } catch (error) {
      console.error('Error during installation:', error);
    }
  }

  // App Initialization
  initializeApp() {
    this.loadUserData();
    this.setupPushNotifications();
    this.initializeTextToSpeech();
    console.log('Language Learning PWA initialized');
  }

  // Initialize Text-to-Speech and load voices
  initializeTextToSpeech() {
    if ('speechSynthesis' in window) {
      // Force cancel any ongoing speech
      speechSynthesis.cancel();
      
      // Wait for voices to be loaded
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log('📢 Available voices loaded:', voices.length);
          this.logAvailableVoices();
        } else {
          // Try again after a short delay
          setTimeout(loadVoices, 100);
        }
      };
      
      // Load voices immediately
      loadVoices();
      
      // Also set up the event listener for when voices change
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Force a voices reload after a delay (some browsers need this)
      setTimeout(() => {
        if (speechSynthesis.getVoices().length === 0) {
          console.log('🔄 Forcing voices reload...');
          speechSynthesis.getVoices();
          loadVoices();
        }
      }, 1000);
    }
  }

  // Log available voices for debugging
  logAvailableVoices() {
    const voices = speechSynthesis.getVoices();
    const languageVoices = {
      spanish: voices.filter(v => v.lang.startsWith('es')),
      english: voices.filter(v => v.lang.startsWith('en')),
      russian: voices.filter(v => v.lang.startsWith('ru')),
      german: voices.filter(v => v.lang.startsWith('de'))
    };
    
    console.log('🗣️ Available voices by language:');
    Object.entries(languageVoices).forEach(([lang, voiceList]) => {
      console.log(`${lang}:`, voiceList.map(v => `${v.name} (${v.lang}) ${v.localService ? '[LOCAL]' : '[REMOTE]'}`));
    });
    
    // Show total count
    console.log(`Total voices available: ${voices.length}`);
  }

  // User Data Management
  loadUserData() {
    try {
      const userData = localStorage.getItem('user-data');
      if (userData) {
        const data = JSON.parse(userData);
        console.log('User data loaded:', data);
        // Apply user preferences, progress, etc.
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  saveUserData(data) {
    try {
      localStorage.setItem('user-data', JSON.stringify(data));
      console.log('User data saved');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  // Push Notifications
  async setupPushNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
        // You can now send notifications
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  // Update Available Notification
  showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
      <p>A new version is available!</p>
      <button onclick="window.location.reload()">Update Now</button>
      <button onclick="this.parentElement.remove()">Later</button>
    `;
    document.body.insertBefore(updateBanner, document.body.firstChild);
  }

  // Utility Methods
  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });
    }
  }

  // Analytics (if needed)
  trackEvent(eventName, eventData = {}) {
    console.log('Event tracked:', eventName, eventData);
    // Implement your analytics tracking here
  }

  // Test method for debugging TTS language issues
  testSpeechLanguages() {
    console.log('🧪 Testing speech synthesis for all languages...');
    
    const testPhrases = {
      spanish: 'Hola',
      english: 'Hello', 
      russian: 'Привет'
    };
    
    Object.entries(testPhrases).forEach(([lang, phrase]) => {
      console.log(`\n--- Testing ${lang} ---`);
      const originalLang = this.currentLanguage;
      this.currentLanguage = lang;
      
      // Get card data for this language
      const card = this.getCurrentCard();
      console.log(`Target word: ${card.target}`);
      
      // Test voice selection without actually speaking
      this.analyzeVoiceSelection(card.target);
      
      // Restore original language
      this.currentLanguage = originalLang;
    });
  }
  
  // Analyze voice selection without speaking
  analyzeVoiceSelection(text) {
    const languageSettings = {
      spanish: {
        lang: 'es-ES',
        langCodes: ['es-ES', 'es-MX', 'es-AR', 'es-US', 'es']
      },
      english: {
        lang: 'en-US',
        langCodes: ['en-US', 'en-GB', 'en-AU', 'en']
      },
      russian: {
        lang: 'ru-RU',
        langCodes: ['ru-RU', 'ru']
      }
    };
    
    const settings = languageSettings[this.currentLanguage];
    const voices = speechSynthesis.getVoices();
    
    console.log(`Target language: ${this.currentLanguage} (${settings.lang})`);
    console.log(`Available voices for this language:`, 
      voices.filter(v => v.lang.startsWith(settings.lang.substring(0, 2)))
        .map(v => `${v.name} (${v.lang}) ${v.localService ? '[LOCAL]' : '[REMOTE]'}`)
    );
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.languageLearningApp = new LanguageLearningPWA();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LanguageLearningPWA };
}
