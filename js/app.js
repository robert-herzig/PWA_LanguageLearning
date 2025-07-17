// Language Learning PWA JavaScript

class LanguageLearningPWA {
  constructor() {
    this.deferredPrompt = null;
    this.isOnline = navigator.onLine;
    this.currentLanguage = 'spanish';
    this.currentLevel = 'beginner'; // Add level support
    this.currentCardIndex = 0;
    this.currentSection = 'home'; // Start with home section
    this.currentTopic = null; // For topical vocabulary
    this.currentTopicLevel = 'b1'; // Default topic level
    this.isTopicalMode = false; // Track if we're in topical vocabulary mode
    this.currentLearningMode = null; // Track current learning mode ('levels' or 'topical')
    this.topicalVocabulary = new TopicalVocabulary(); // Initialize topical vocabulary system
    console.log('TopicalVocabulary system initialized');
    this.settings = {
      englishVariant: 'us', // 'us' or 'gb'
      speechRate: 0.9,
      autoSpeak: true,
      speakExample: true // Speak example sentences too
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
      this.setupLevelSelection();
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

  // Level Selection Setup
  setupLevelSelection() {
    console.log('=== SETTING UP LEVEL SELECTION ===');
    
    // Learning mode selection
    this.setupLearningModeSelection();
    
    // Level selection buttons
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const level = card.dataset.level;
        this.selectLevel(level);
      });
      
      const levelBtn = card.querySelector('.level-btn');
      if (levelBtn) {
        levelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const level = card.dataset.level;
          this.selectLevel(level);
        });
      }
    });
    
    // Back navigation buttons
    this.setupBackNavigation();
    
    // Setup topic navigation buttons
    this.setupTopicNavigation();
    
    console.log('=== LEVEL SELECTION SETUP COMPLETE ===');
  }

  // Setup learning mode selection
  setupLearningModeSelection() {
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const mode = card.dataset.mode;
        this.selectLearningMode(mode);
      });
      
      const modeBtn = card.querySelector('.mode-btn');
      if (modeBtn) {
        modeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const mode = card.dataset.mode;
          this.selectLearningMode(mode);
        });
      }
    });
  }

  // Setup back navigation
  setupBackNavigation() {
    // Back to modes from levels
    const backToModesBtn = document.getElementById('back-to-modes');
    if (backToModesBtn) {
      backToModesBtn.addEventListener('click', () => {
        this.showLearningModeSelection();
      });
    }

    // Back to modes from topics
    const backToModesFromTopicsBtn = document.getElementById('back-to-modes-from-topics');
    if (backToModesFromTopicsBtn) {
      backToModesFromTopicsBtn.addEventListener('click', () => {
        this.showLearningModeSelection();
      });
    }

    // Back to modes from practice
    const backToModesFromPracticeBtn = document.getElementById('back-to-modes-from-practice');
    if (backToModesFromPracticeBtn) {
      backToModesFromPracticeBtn.addEventListener('click', () => {
        this.showLearningModeSelection();
      });
    }

    // Legacy back buttons (still used in some flows)
    const backButtons = document.querySelectorAll('#back-to-levels, #back-to-level');
    backButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentLearningMode === 'levels') {
          this.showLevelSelection();
        } else {
          this.showLearningModeSelection();
        }
      });
    });
  }

  // Select learning mode
  selectLearningMode(mode) {
    console.log(`=== LEARNING MODE SELECTED: ${mode} ===`);
    this.currentLearningMode = mode;
    
    const languageContent = this.getLanguageContent(this.currentLanguage);
    
    if (mode === 'levels') {
      this.isTopicalMode = false;
      this.showLevelSelection();
    } else if (mode === 'topical') {
      if (languageContent.topicalAvailable) {
        this.isTopicalMode = true;
        this.showTopicSelection();
      } else {
        alert(`Thematisches Vokabular ist für ${languageContent.title} noch nicht verfügbar.`);
      }
    }
  }

  // Show learning mode selection
  showLearningModeSelection() {
    const modeSelection = document.getElementById('learning-mode-selection');
    const levelSelection = document.getElementById('level-selection');
    const topicSelection = document.getElementById('topic-selection');
    const flashcardPractice = document.getElementById('flashcard-practice');
    
    if (modeSelection) modeSelection.style.display = 'block';
    if (levelSelection) levelSelection.style.display = 'none';
    if (topicSelection) topicSelection.style.display = 'none';
    if (flashcardPractice) flashcardPractice.style.display = 'none';

    // Update language content
    this.updateLanguageContent();
    
    // Update mode availability based on current language
    this.updateModeAvailability();
  }

  // Update mode availability based on language
  updateModeAvailability() {
    const languageContent = this.getLanguageContent(this.currentLanguage);
    const topicalModeCard = document.querySelector('.mode-card[data-mode="topical"]');
    
    if (topicalModeCard) {
      const modeBtn = topicalModeCard.querySelector('.mode-btn');
      if (languageContent.topicalAvailable) {
        topicalModeCard.style.opacity = '1';
        topicalModeCard.style.pointerEvents = 'auto';
        if (modeBtn) {
          modeBtn.disabled = false;
          modeBtn.textContent = 'Themen wählen';
        }
      } else {
        topicalModeCard.style.opacity = '0.6';
        topicalModeCard.style.pointerEvents = 'none';
        if (modeBtn) {
          modeBtn.disabled = true;
          modeBtn.textContent = 'Bald verfügbar';
        }
      }
    }
  }

  selectLevel(level) {
    console.log(`=== LEVEL SELECTED: ${level} ===`);
    
    // Handle regular level selection
    this.isTopicalMode = false;
    this.currentLevel = level;
    
    // Save level selection
    localStorage.setItem('currentLevel', level);
    
    // Show flashcard practice
    this.showFlashcardPractice();
    
    // Initialize flashcards for this level
    this.initializeFlashcards();
  }

  showLevelSelection() {
    const modeSelection = document.getElementById('learning-mode-selection');
    const levelSelection = document.getElementById('level-selection');
    const topicSelection = document.getElementById('topic-selection');
    const flashcardPractice = document.getElementById('flashcard-practice');
    
    if (modeSelection) modeSelection.style.display = 'none';
    if (levelSelection) levelSelection.style.display = 'block';
    if (topicSelection) topicSelection.style.display = 'none';
    if (flashcardPractice) flashcardPractice.style.display = 'none';
  }

  showFlashcardPractice() {
    const modeSelection = document.getElementById('learning-mode-selection');
    const levelSelection = document.getElementById('level-selection');
    const topicSelection = document.getElementById('topic-selection');
    const flashcardPractice = document.getElementById('flashcard-practice');
    const levelTitle = document.getElementById('current-level-title');
    
    if (modeSelection) modeSelection.style.display = 'none';
    if (levelSelection) levelSelection.style.display = 'none';
    if (topicSelection) topicSelection.style.display = 'none';
    if (flashcardPractice) flashcardPractice.style.display = 'block';
    
    // Update title and navigation based on mode
    if (levelTitle) {
      if (this.isTopicalMode && this.currentTopic) {
        const topicCategories = this.topicalVocabulary.getTopicCategories();
        const topicInfo = topicCategories[this.currentTopic];
        levelTitle.textContent = `🏷️ ${topicInfo?.title || this.currentTopic} (${this.currentTopicLevel.toUpperCase()})`;
        
        // Show topic info and appropriate navigation
        this.showTopicInfo();
        this.showTopicNavigation();
      } else {
        const languageContent = this.getLanguageContent(this.currentLanguage);
        const levelNames = {
          'beginner': 'Anfänger',
          'b1': 'B1 Grundstufe',
          'b2': 'B2 Mittelstufe',
          'c1': 'C1 Fortgeschritten'
        };
        const levelName = levelNames[this.currentLevel] || 'Lernkarten';
        levelTitle.textContent = `📚 ${levelName} - ${languageContent.title.replace(/🇪🇸|🇺🇸|🇷🇺/, '').trim()}`;
        
        // Hide topic info and show level navigation
        this.hideTopicInfo();
        this.showLevelNavigation();
      }
    }
  }

  // Show/hide appropriate navigation buttons
  showTopicNavigation() {
    const backToTopicsBtn = document.getElementById('back-to-topics');
    const backToLevelsBtn = document.getElementById('back-to-levels');
    const backToModesBtn = document.getElementById('back-to-modes-from-practice');
    
    if (backToTopicsBtn) backToTopicsBtn.style.display = 'inline-block';
    if (backToLevelsBtn) backToLevelsBtn.style.display = 'none';
    if (backToModesBtn) backToModesBtn.style.display = 'none';
  }

  showLevelNavigation() {
    const backToTopicsBtn = document.getElementById('back-to-topics');
    const backToLevelsBtn = document.getElementById('back-to-levels');
    const backToModesBtn = document.getElementById('back-to-modes-from-practice');
    
    if (backToTopicsBtn) backToTopicsBtn.style.display = 'none';
    if (backToLevelsBtn) backToLevelsBtn.style.display = 'inline-block';
    if (backToModesBtn) backToModesBtn.style.display = 'none';
  }

  // Topical Vocabulary Methods
  async showTopicSelection() {
    console.log('=== SHOWING TOPIC SELECTION ===');
    
    const modeSelection = document.getElementById('learning-mode-selection');
    const levelSelection = document.getElementById('level-selection');
    const topicSelection = document.getElementById('topic-selection');
    const flashcardPractice = document.getElementById('flashcard-practice');
    
    if (topicSelection) {
      if (modeSelection) modeSelection.style.display = 'none';
      if (levelSelection) levelSelection.style.display = 'none';
      topicSelection.style.display = 'block';
      if (flashcardPractice) flashcardPractice.style.display = 'none';
      
      // Setup topic level selector
      this.setupTopicLevelSelector();
      
      // Setup back button
      this.setupTopicNavigation();
      
      // Load and display topics
      await this.loadAndDisplayTopics();
    }
  }

  setupTopicLevelSelector() {
    const topicLevelSelect = document.getElementById('topic-level-select');
    if (topicLevelSelect) {
      topicLevelSelect.value = this.currentTopicLevel;
      topicLevelSelect.addEventListener('change', async (e) => {
        this.currentTopicLevel = e.target.value;
        await this.loadAndDisplayTopics();
      });
    }
  }

  setupTopicNavigation() {
    // Back to levels from topics
    const backToLevelsBtn = document.getElementById('back-to-levels-from-topics');
    if (backToLevelsBtn) {
      backToLevelsBtn.addEventListener('click', () => {
        this.isTopicalMode = false;
        this.showLevelSelection();
      });
    }

    // Back to topics from flashcards
    const backToTopicsBtn = document.getElementById('back-to-topics');
    if (backToTopicsBtn) {
      backToTopicsBtn.addEventListener('click', () => {
        this.showTopicSelection();
      });
    }
  }

  async loadAndDisplayTopics() {
    console.log(`Loading topics for ${this.currentLanguage} ${this.currentTopicLevel}`);
    
    try {
      // Load vocabulary data
      const vocabulary = await this.topicalVocabulary.loadTopicalVocabulary(this.currentLanguage, this.currentTopicLevel);
      
      // Get available topics
      const topics = this.topicalVocabulary.getAvailableTopics(this.currentLanguage, this.currentTopicLevel);
      
      console.log(`Found ${topics.length} topics`);
      
      // Display topics
      this.displayTopics(topics);
      
    } catch (error) {
      console.error('Error loading topics:', error);
      this.showError('Fehler beim Laden der Themen. Bitte versuchen Sie es erneut.');
    }
  }

  displayTopics(topics) {
    const topicsGrid = document.getElementById('topics-grid');
    if (!topicsGrid) return;

    topicsGrid.innerHTML = '';

    topics.forEach(topic => {
      const topicCard = document.createElement('div');
      topicCard.className = 'topic-card';
      topicCard.dataset.topic = topic.key;
      
      topicCard.innerHTML = `
        <div class="topic-icon">${topic.icon}</div>
        <h4>${topic.title}</h4>
        <p>${topic.description}</p>
        <div class="topic-stats">
          <span class="word-count">${topic.wordCount} Wörter</span>
        </div>
        <button class="topic-btn">Lernen</button>
      `;

      // Add click handler
      topicCard.addEventListener('click', () => {
        this.selectTopic(topic.key);
      });

      topicsGrid.appendChild(topicCard);
    });
  }

  async selectTopic(topicKey) {
    console.log(`=== TOPIC SELECTED: ${topicKey} ===`);
    this.currentTopic = topicKey;
    
    // Load vocabulary for this topic
    const vocabulary = this.topicalVocabulary.getTopicVocabulary(this.currentLanguage, this.currentTopicLevel, topicKey);
    
    if (vocabulary.length === 0) {
      this.showError('Keine Vokabeln für dieses Thema gefunden.');
      return;
    }

    // Convert to flashcard format
    this.currentDueCards = this.topicalVocabulary.convertToFlashcards(vocabulary, this.currentLanguage);
    this.currentCardIndex = 0;

    // Show flashcard practice
    this.showFlashcardPractice();
    
    // Load first card
    this.loadCurrentCard();
    this.updateCardCounter();
  }

  showTopicInfo() {
    const topicInfo = document.getElementById('current-topic-info');
    const backToTopicsBtn = document.getElementById('back-to-topics');
    const backToLevelsBtn = document.getElementById('back-to-levels');
    
    if (topicInfo) {
      topicInfo.style.display = 'block';
      
      const topicTitle = document.getElementById('current-topic-title');
      const topicProgress = document.getElementById('current-topic-progress');
      
      if (topicTitle && this.currentTopic) {
        const topicCategories = this.topicalVocabulary.getTopicCategories();
        const topicData = topicCategories[this.currentTopic];
        topicTitle.textContent = `${topicData?.icon || '🏷️'} ${topicData?.title || this.currentTopic}`;
      }
      
      if (topicProgress && this.currentDueCards) {
        topicProgress.textContent = `${this.currentDueCards.length} Wörter`;
      }
    }

    // Show/hide appropriate back buttons
    if (backToTopicsBtn) backToTopicsBtn.style.display = 'inline-block';
    if (backToLevelsBtn) backToLevelsBtn.style.display = 'none';
  }

  hideTopicInfo() {
    const topicInfo = document.getElementById('current-topic-info');
    const backToTopicsBtn = document.getElementById('back-to-topics');
    const backToLevelsBtn = document.getElementById('back-to-levels');
    
    if (topicInfo) topicInfo.style.display = 'none';
    if (backToTopicsBtn) backToTopicsBtn.style.display = 'none';
    if (backToLevelsBtn) backToLevelsBtn.style.display = 'inline-block';
  }

  showError(message) {
    // Simple error display - you can enhance this with a proper modal/toast
    alert(message);
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
    
    // Show learning mode selection
    this.showLearningModeSelection();
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
    
    // Save the new language selection
    localStorage.setItem('currentLanguage', this.currentLanguage);
    
    // Update language-specific content
    this.updateLanguageContent();
    
    // Reset card index and mode
    this.currentCardIndex = 0;
    this.currentLearningMode = null;
    this.isTopicalMode = false;
    
    // If we're in flashcards section, show the learning mode selection
    if (this.currentSection === 'flashcards') {
      this.showLearningModeSelection();
    }
    
    console.log(`✅ Language changed to ${this.currentLanguage} and interface updated`);
  }

  // Update language-specific content
  updateLanguageContent() {
    const languageContent = this.getLanguageContent(this.currentLanguage);
    
    // Update language title and subtitle
    const languageTitle = document.getElementById('language-title');
    const languageSubtitle = document.getElementById('language-subtitle');
    
    if (languageTitle) {
      languageTitle.textContent = languageContent.title;
    }
    
    if (languageSubtitle) {
      languageSubtitle.textContent = languageContent.subtitle;
    }
  }

  // Get language-specific content
  getLanguageContent(language) {
    const content = {
      spanish: {
        title: '🇪🇸 Spanisch Lernen',
        subtitle: 'Wähle deinen Lernmodus',
        flag: '🇪🇸',
        levels: {
          beginner: { available: true, title: 'Anfänger', description: 'Grundwortschatz und einfache Phrasen' },
          b1: { available: true, title: 'B1 Grundstufe', description: 'Erweiterte Grundkenntnisse für alltägliche Situationen' },
          b2: { available: true, title: 'B2 Mittelstufe', description: 'Erweiterte Vokabeln für selbstständige Sprachverwendung' },
          c1: { available: true, title: 'C1 Fortgeschritten', description: 'Komplexe Vokabeln für fachkundige Sprachverwendung' }
        },
        topicalAvailable: true,
        topicalLevels: ['b1', 'b2']
      },
      english: {
        title: '🇺🇸 Englisch Lernen',
        subtitle: 'Wähle deinen Lernmodus',
        flag: '🇺🇸',
        levels: {
          beginner: { available: true, title: 'Anfänger', description: 'Grundwortschatz und einfache Phrasen' },
          b1: { available: false, title: 'B1 Grundstufe', description: 'Bald verfügbar' },
          b2: { available: true, title: 'B2 Mittelstufe', description: 'Erweiterte Vokabeln für selbstständige Sprachverwendung' },
          c1: { available: true, title: 'C1 Fortgeschritten', description: 'Komplexe Vokabeln für fachkundige Sprachverwendung' }
        },
        topicalAvailable: true,
        topicalLevels: ['b1', 'b2']
      },
      russian: {
        title: '🇷🇺 Russisch Lernen',
        subtitle: 'Wähle deinen Lernmodus',
        flag: '🇷🇺',
        levels: {
          beginner: { available: true, title: 'Anfänger', description: 'Grundwortschatz und einfache Phrasen' },
          b1: { available: false, title: 'B1 Grundstufe', description: 'Bald verfügbar' },
          b2: { available: false, title: 'B2 Mittelstufe', description: 'Bald verfügbar' },
          c1: { available: false, title: 'C1 Fortgeschritten', description: 'Bald verfügbar' }
        },
        topicalAvailable: true,
        topicalLevels: ['b1', 'b2']
      }
    };

    return content[language] || content.spanish;
  }

  // Flashcard System
  initializeFlashcards() {
    console.log(`=== INITIALIZING FLASHCARDS FOR LANGUAGE: ${this.currentLanguage} ===`);
    
    // Get cards due for review
    const dueCards = this.getDueCards();
    this.currentDueCards = dueCards;
    this.currentCardIndex = 0;
    
    console.log(`Found ${dueCards.length} due cards for ${this.currentLanguage}`);
    
    if (dueCards.length === 0) {
      this.showNoCardsMessage();
    } else {
      this.loadCurrentCard();
      this.updateCardCounter();
    }
    
    console.log(`=== FLASHCARDS INITIALIZED FOR ${this.currentLanguage} ===`);
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
    // Base vocabulary data organized by language and level
    const baseVocabulary = {
      spanish: {
        beginner: [
          {
            id: 'es_beg_1',
            german: 'Hallo',
            target: 'Hola',
            germanExample: '"Hallo, wie geht es dir?"',
            targetExample: '"Hola, ¿cómo estás?"'
          },
          {
            id: 'es_beg_2',
            german: 'Danke',
            target: 'Gracias',
            germanExample: '"Danke für deine Hilfe!"',
            targetExample: '"¡Gracias por tu ayuda!"'
          },
          {
            id: 'es_beg_3',
            german: 'Auf Wiedersehen',
            target: 'Adiós',
            germanExample: '"Auf Wiedersehen, bis morgen!"',
            targetExample: '"¡Adiós, hasta mañana!"'
          },
          {
            id: 'es_beg_4',
            german: 'Bitte',
            target: 'Por favor',
            germanExample: '"Kannst du mir bitte helfen?"',
            targetExample: '"¿Puedes ayudarme por favor?"'
          },
          {
            id: 'es_beg_5',
            german: 'Entschuldigung',
            target: 'Disculpe',
            germanExample: '"Entschuldigung, wo ist der Bahnhof?"',
            targetExample: '"Disculpe, ¿dónde está la estación?"'
          }
        ],
        b1: [
          {
            id: 'es_b1_1',
            german: 'Abenteuer',
            target: 'aventura',
            germanExample: '"Das war ein großes Abenteuer."',
            targetExample: '"Esa fue una gran aventura."'
          },
          {
            id: 'es_b1_2',
            german: 'Flughafen',
            target: 'aeropuerto',
            germanExample: '"Der Flughafen ist sehr groß."',
            targetExample: '"El aeropuerto es muy grande."'
          },
          {
            id: 'es_b1_3',
            german: 'Landwirtschaft',
            target: 'agricultura',
            germanExample: '"Die Landwirtschaft ist wichtig für das Land."',
            targetExample: '"La agricultura es importante para el país."'
          },
          {
            id: 'es_b1_4',
            german: 'jetzt',
            target: 'ahora',
            germanExample: '"Ich muss jetzt gehen."',
            targetExample: '"Tengo que irme ahora."'
          },
          {
            id: 'es_b1_5',
            german: 'sparen',
            target: 'ahorrar',
            germanExample: '"Ich spare Geld für den Urlaub."',
            targetExample: '"Ahorro dinero para las vacaciones."'
          }
        ]
      },
      english: {
        beginner: [
          {
            id: 'en_beg_1',
            german: 'Hallo',
            target: 'Hello',
            germanExample: '"Hallo, wie geht es dir?"',
            targetExample: '"Hello, how are you?"'
          },
          {
            id: 'en_beg_2',
            german: 'Danke',
            target: 'Thank you',
            germanExample: '"Danke für deine Hilfe!"',
            targetExample: '"Thank you for your help!"'
          },
          {
            id: 'en_beg_3',
            german: 'Farbe',
            target: this.settings.englishVariant === 'gb' ? 'Colour' : 'Color',
            germanExample: '"Welche Farbe magst du?"',
            targetExample: this.settings.englishVariant === 'gb' ? '"What colour do you like?"' : '"What color do you like?"'
          },
          {
            id: 'en_beg_4',
            german: 'Bitte',
            target: 'Please',
            germanExample: '"Kannst du mir bitte helfen?"',
            targetExample: '"Can you please help me?"'
          },
          {
            id: 'en_beg_5',
            german: 'Entschuldigung',
            target: 'Excuse me',
            germanExample: '"Entschuldigung, wo ist der Bahnhof?"',
            targetExample: '"Excuse me, where is the station?"'
          }
        ],
        b2: [
          {
            id: 'en_b2_1',
            german: 'verlassen',
            target: 'abandon',
            germanExample: '"Er musste sein Zuhause verlassen."',
            targetExample: '"He had to abandon his home."'
          },
          {
            id: 'en_b2_2',
            german: 'absolut',
            target: 'absolute',
            germanExample: '"Das ist die absolute Wahrheit."',
            targetExample: '"That is the absolute truth."'
          },
          {
            id: 'en_b2_3',
            german: 'absorbieren',
            target: 'absorb',
            germanExample: '"Der Schwamm kann viel Wasser absorbieren."',
            targetExample: '"The sponge can absorb a lot of water."'
          },
          {
            id: 'en_b2_4',
            german: 'abstrakt',
            target: 'abstract',
            germanExample: '"Das ist ein sehr abstrakter Begriff."',
            targetExample: '"That is a very abstract concept."'
          },
          {
            id: 'en_b2_5',
            german: 'akademisch',
            target: 'academic',
            germanExample: '"Seine akademische Laufbahn war sehr erfolgreich."',
            targetExample: '"His academic career was very successful."'
          }
        ],
        c1: [
          {
            id: 'en_c1_1',
            german: 'abschaffen',
            target: 'abolish',
            germanExample: '"Die Regierung will die Todesstrafe abschaffen."',
            targetExample: '"The government wants to abolish the death penalty."'
          },
          {
            id: 'en_c1_2',
            german: 'Abtreibung',
            target: 'abortion',
            germanExample: '"Das Thema Abtreibung ist kontrovers."',
            targetExample: '"The topic of abortion is controversial."'
          },
          {
            id: 'en_c1_3',
            german: 'Abwesenheit',
            target: 'absence',
            germanExample: '"Seine Abwesenheit fiel auf."',
            targetExample: '"His absence was noticeable."'
          },
          {
            id: 'en_c1_4',
            german: 'abwesend',
            target: 'absent',
            germanExample: '"Er war gestern von der Schule abwesend."',
            targetExample: '"He was absent from school yesterday."'
          },
          {
            id: 'en_c1_5',
            german: 'absurd',
            target: 'absurd',
            germanExample: '"Das ist eine absurde Idee."',
            targetExample: '"That is an absurd idea."'
          }
        ]
      },
      russian: {
        beginner: [
          {
            id: 'ru_beg_1',
            german: 'Hallo',
            target: 'Привет',
            germanExample: '"Hallo, wie geht es dir?"',
            targetExample: '"Привет, как дела?"'
          },
          {
            id: 'ru_beg_2',
            german: 'Danke',
            target: 'Спасибо',
            germanExample: '"Danke für deine Hilfe!"',
            targetExample: '"Спасибо за помощь!"'
          },
          {
            id: 'ru_beg_3',
            german: 'Auf Wiedersehen',
            target: 'До свидания',
            germanExample: '"Auf Wiedersehen, bis morgen!"',
            targetExample: '"До свидания, до завтра!"'
          },
          {
            id: 'ru_beg_4',
            german: 'Bitte',
            target: 'Пожалуйста',
            germanExample: '"Kannst du mir bitte helfen?"',
            targetExample: '"Можешь мне помочь, пожалуйста?"'
          },
          {
            id: 'ru_beg_5',
            german: 'Entschuldigung',
            target: 'Извините',
            germanExample: '"Entschuldigung, wo ist der Bahnhof?"',
            targetExample: '"Извините, где вокзал?"'
          }
        ]
      }
    };

    // Get spaced repetition data from localStorage
    const spacedRepetitionData = this.getSpacedRepetitionData();
    
    // Get vocabulary for current language and level
    const languageData = baseVocabulary[this.currentLanguage];
    if (!languageData) {
      console.warn(`No vocabulary data for language: ${this.currentLanguage}`);
      return baseVocabulary.spanish.beginner.map(card => {
        const srData = spacedRepetitionData[card.id] || this.getDefaultSpacedRepetitionData();
        return { ...card, ...srData };
      });
    }
    
    const levelData = languageData[this.currentLevel];
    if (!levelData) {
      console.warn(`No vocabulary data for level: ${this.currentLevel} in language: ${this.currentLanguage}`);
      // Fallback to beginner level
      const fallbackData = languageData.beginner || languageData[Object.keys(languageData)[0]];
      return fallbackData.map(card => {
        const srData = spacedRepetitionData[card.id] || this.getDefaultSpacedRepetitionData();
        return { ...card, ...srData };
      });
    }
    
    // Merge base data with spaced repetition data
    return levelData.map(card => {
      const srData = spacedRepetitionData[card.id] || this.getDefaultSpacedRepetitionData();
      return { ...card, ...srData };
    });
  }

  getCurrentCard() {
    // Use due cards if available, otherwise fall back to vocabulary data
    const cards = this.currentDueCards || this.getVocabularyData();
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
    const cards = this.currentDueCards || this.getVocabularyData();
    
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.loadCurrentCard();
      this.updateCardCounter();
      this.updateNavigationButtons();
    }
  }

  nextCard() {
    const cards = this.currentDueCards || this.getVocabularyData();
    
    if (this.currentCardIndex < cards.length - 1) {
      this.currentCardIndex++;
      this.loadCurrentCard();
      this.updateCardCounter();
      this.updateNavigationButtons();
    }
  }

  updateCardCounter() {
    const cards = this.currentDueCards || this.getVocabularyData();
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
    const cards = this.currentDueCards || this.getVocabularyData();
    const prevBtn = document.getElementById('prev-card');
    const nextBtn = document.getElementById('next-card');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentCardIndex === 0;
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.currentCardIndex === cards.length - 1;
    }
  }

  // Text-to-Speech with proper language support and example sentences
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
    
    // Get text to speak (word and optionally example)
    const wordToSpeak = card.target;
    const exampleToSpeak = card.targetExample;
    
    console.log(`📢 Word to speak: "${wordToSpeak}"`);
    console.log(`📢 Example to speak: "${exampleToSpeak}"`);
    
    // Cancel any ongoing speech without error messages
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Visual feedback
    const speakBtn = document.getElementById('speak-btn');
    if (speakBtn) {
      speakBtn.textContent = '🔊 Spricht...';
      speakBtn.disabled = true;
    }
    
    // Speak the word first, then the example
    this.speakTextSequence([wordToSpeak, exampleToSpeak], () => {
      // Reset button when done
      if (speakBtn) {
        speakBtn.textContent = '🔊 Anhören';
        speakBtn.disabled = false;
      }
    });
  }

  speakTextSequence(texts, onComplete) {
    let currentIndex = 0;
    
    const speakNext = () => {
      if (currentIndex >= texts.length) {
        onComplete();
        return;
      }
      
      const textToSpeak = texts[currentIndex];
      if (!textToSpeak || textToSpeak.trim() === '') {
        currentIndex++;
        speakNext();
        return;
      }
      
      // Clean the text (remove quotes)
      const cleanText = textToSpeak.replace(/["""]/g, '');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = this.settings.speechRate || 0.9;
      utterance.volume = 1;
      
      // Get appropriate voice
      const voices = speechSynthesis.getVoices();
      const currentLang = this.currentLanguage;
      let preferredVoice = null;
      
      // Find voice for current language
      if (currentLang === 'english') {
        const variant = this.settings.englishVariant;
        if (variant === 'gb') {
          preferredVoice = voices.find(v => v.lang === 'en-GB') ||
                         voices.find(v => v.lang.startsWith('en-GB')) ||
                         voices.find(v => v.name.toLowerCase().includes('british')) ||
                         voices.find(v => v.name.toLowerCase().includes('uk'));
        } else {
          preferredVoice = voices.find(v => v.lang === 'en-US') ||
                         voices.find(v => v.lang.startsWith('en-US')) ||
                         voices.find(v => v.name.toLowerCase().includes('united states')) ||
                         voices.find(v => v.name.toLowerCase().includes('american'));
        }
        // Fallback to any English voice
        if (!preferredVoice) {
          preferredVoice = voices.find(v => v.lang.startsWith('en')) || voices.find(v => v.lang === 'en');
        }
      } else if (currentLang === 'spanish') {
        preferredVoice = voices.find(v => v.lang.startsWith('es')) || voices.find(v => v.lang === 'es');
      } else if (currentLang === 'russian') {
        preferredVoice = voices.find(v => v.lang.startsWith('ru')) || voices.find(v => v.lang === 'ru');
      }
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
        console.log(`🎤 Using voice: ${preferredVoice.name} (${preferredVoice.lang}) for "${cleanText}"`);
      } else {
        console.log(`⚠️ No preferred voice found for ${currentLang}, using default for "${cleanText}"`);
      }
      
      utterance.onstart = () => {
        console.log(`✅ Speech started: "${cleanText}"`);
      };
      
      utterance.onend = () => {
        console.log(`✅ Speech finished: "${cleanText}"`);
        currentIndex++;
        
        // Add pause between word and example
        if (currentIndex < texts.length) {
          setTimeout(() => {
            speakNext();
          }, 500); // 500ms pause
        } else {
          speakNext();
        }
      };
      
      utterance.onerror = (event) => {
        // Only show errors that aren't caused by cancellation
        if (event.error !== 'interrupted' && event.error !== 'cancelled') {
          console.error(`❌ Speech error:`, event.error);
          console.error('Error details:', event);
          alert(`Speech-Fehler: ${event.error}`);
        } else {
          console.log(`ℹ️ Speech was interrupted (normal when switching cards or clicking other buttons)`);
        }
        currentIndex++;
        speakNext();
      };
      
      try {
        speechSynthesis.speak(utterance);
        console.log(`✅ speechSynthesis.speak() called for "${cleanText}"`);
      } catch (error) {
        console.error(`❌ Error calling speechSynthesis.speak() for "${cleanText}":`, error);
        currentIndex++;
        speakNext();
      }
    };
    
    speakNext();
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
    const cards = vocabulary || [];
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
    
    console.log(`Found ${dueCards.length} due cards out of ${cards.length} total cards for ${this.currentLanguage} - ${this.currentLevel}`);
    
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