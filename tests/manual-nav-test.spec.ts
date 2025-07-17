import { test, expect } from '@playwright/test';

test('Manual navigation test', async ({ page }) => {
  // Capture console messages and errors
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  // Navigate to the app
  await page.goto('http://127.0.0.1:8000');
  
  // Wait longer for initialization
  await page.waitForTimeout(3000);
  
  console.log('Console messages:', consoleMessages);
  console.log('Page errors:', errors);
  
  // Check if scripts are loaded
  const scriptStatus = await page.evaluate(() => {
    const appScript = document.querySelector('script[src*="app.js"]');
    const topicalScript = document.querySelector('script[src*="topical-vocabulary.js"]');
    const translationsScript = document.querySelector('script[src*="translations.js"]');
    
    return {
      appScriptExists: !!appScript,
      topicalScriptExists: !!topicalScript,
      translationsScriptExists: !!translationsScript,
      totalScripts: document.querySelectorAll('script').length
    };
  });
  
  console.log('Script status:', scriptStatus);
  
  // Check if app instance is available
  const appStatus = await page.evaluate(() => {
    const app = (window as any).languageLearningApp;
    return {
      appExists: !!app,
      appType: typeof app,
      initMethod: app ? typeof app.init : 'no app',
      windowKeys: Object.keys(window).filter(k => k.includes('language') || k.includes('Language') || k.includes('PWA'))
    };
  });
  
  console.log('App status:', appStatus);
  
  // Check if navigation was set up correctly
  const navStatus = await page.evaluate(() => {
    const featureCards = document.querySelectorAll('.feature-card');
    const results: any[] = [];
    
    featureCards.forEach((card, index) => {
      const button = card.querySelector('.feature-btn') as HTMLButtonElement;
      const section = (card as HTMLElement).dataset.navigate;
      
      results.push({
        index,
        section,
        hasButton: !!button,
        buttonDisabled: button?.disabled || false,
        cursor: (card as HTMLElement).style.cursor,
        hasClickListener: !!(card as any)._clickHandler || (card as HTMLElement).onclick !== null
      });
    });
    
    return results;
  });
  
  console.log('Navigation status:', navStatus);
  
  // Try manual navigation using JavaScript
  const manualNavResult = await page.evaluate(() => {
    const app = (window as any).languageLearningApp;
    if (app && typeof app.navigateToSection === 'function') {
      console.log('Attempting manual navigation to flashcards...');
      app.navigateToSection('flashcards');
      
      // Check if navigation worked
      const homeSection = document.querySelector('#home-section');
      const flashcardsSection = document.querySelector('#flashcards-section');
      
      return {
        success: true,
        homeActive: homeSection?.classList.contains('active'),
        flashcardsActive: flashcardsSection?.classList.contains('active')
      };
    }
    
    return {
      success: false,
      message: 'App or navigateToSection not available'
    };
  });
  
  console.log('Manual navigation result:', manualNavResult);
  
  if (manualNavResult.success && manualNavResult.flashcardsActive) {
    console.log('✅ Manual navigation to flashcards worked!');
    
    // Now check if topical mode is available
    await page.waitForTimeout(1000);
    
    const topicalResult = await page.evaluate(() => {
      const app = (window as any).languageLearningApp;
      if (app && typeof app.selectLearningMode === 'function') {
        app.selectLearningMode('topical');
        
        // Check if topic selection is visible
        const topicSelection = document.querySelector('#topic-selection') as HTMLElement;
        return {
          topicSelectionVisible: topicSelection?.style.display === 'block',
          topicSelectionExists: !!topicSelection
        };
      }
      
      return { error: 'selectLearningMode not available' };
    });
    
    console.log('Topical mode result:', topicalResult);
    
    if (topicalResult.topicSelectionVisible) {
      console.log('✅ Topical mode navigation worked!');
      
      // Check for topic cards
      const topicCards = await page.locator('.topic-card').count();
      console.log('Topic cards found:', topicCards);
      
      if (topicCards > 0) {
        const topicTitles = await page.locator('.topic-card h4').allTextContents();
        console.log('✅ SUCCESS: Topic cards loaded:', topicTitles.slice(0, 5));
      }
    }
  }
});
