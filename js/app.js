// Language Learning PWA JavaScript

class LanguageLearningPWA {
  constructor() {
    this.deferredPrompt = null;
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    this.registerServiceWorker();
    this.setupEventListeners();
    this.updateOnlineStatus();
    this.checkInstallPrompt();
    this.initializeApp();
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
    // Here you would implement your routing logic
    // For now, we'll just log the navigation
    
    switch(section) {
      case 'home':
        this.showHomeSection();
        break;
      case 'lessons':
        this.showLessonsSection();
        break;
      case 'progress':
        this.showProgressSection();
        break;
      case 'settings':
        this.showSettingsSection();
        break;
      default:
        this.showHomeSection();
    }
  }

  // Section Display Methods
  showHomeSection() {
    // Implementation for home section
    console.log('Showing home section');
  }

  showLessonsSection() {
    // Implementation for lessons section
    console.log('Showing lessons section');
  }

  showProgressSection() {
    // Implementation for progress section
    console.log('Showing progress section');
  }

  showSettingsSection() {
    // Implementation for settings section
    console.log('Showing settings section');
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
    console.log('Language Learning PWA initialized');
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
}

// Vocabulary Management Class
class VocabularyManager {
  constructor() {
    this.vocabulary = this.loadVocabulary();
  }

  loadVocabulary() {
    try {
      const stored = localStorage.getItem('vocabulary');
      return stored ? JSON.parse(stored) : this.getDefaultVocabulary();
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      return this.getDefaultVocabulary();
    }
  }

  getDefaultVocabulary() {
    return [
      { id: 1, word: 'Hello', translation: 'Hola', language: 'Spanish', learned: false },
      { id: 2, word: 'Thank you', translation: 'Gracias', language: 'Spanish', learned: false },
      { id: 3, word: 'Goodbye', translation: 'Adiós', language: 'Spanish', learned: false },
      { id: 4, word: 'Please', translation: 'Por favor', language: 'Spanish', learned: false },
      { id: 5, word: 'Water', translation: 'Agua', language: 'Spanish', learned: false }
    ];
  }

  saveVocabulary() {
    try {
      localStorage.setItem('vocabulary', JSON.stringify(this.vocabulary));
    } catch (error) {
      console.error('Error saving vocabulary:', error);
    }
  }

  markAsLearned(wordId) {
    const word = this.vocabulary.find(w => w.id === wordId);
    if (word) {
      word.learned = true;
      this.saveVocabulary();
    }
  }

  getRandomWord() {
    const unlearnedWords = this.vocabulary.filter(w => !w.learned);
    if (unlearnedWords.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * unlearnedWords.length);
    return unlearnedWords[randomIndex];
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.languageLearningApp = new LanguageLearningPWA();
  window.vocabularyManager = new VocabularyManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LanguageLearningPWA, VocabularyManager };
}
