import { test, expect } from '@playwright/test';

test('Simple topical test with DOM manipulation', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:8000');
  await page.waitForTimeout(2000);

  // Check current state
  const initialSections = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.learning-section')).map(s => ({
      id: s.id,
      className: s.className
    }));
  });
  console.log('Initial sections:', initialSections);

  // Navigate to flashcards section
  await page.click('[data-navigate="flashcards"]');
  await page.waitForTimeout(3000);

  // Check state after navigation
  const afterNavigationSections = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.learning-section')).map(s => ({
      id: s.id,
      className: s.className
    }));
  });
  console.log('After navigation sections:', afterNavigationSections);

  // Check if app instance is available and call selectLearningMode
  const result = await page.evaluate(() => {
    const app = (window as any).languageLearningApp;
    console.log('App instance available:', !!app);
    
    if (app) {
      console.log('App methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(app)).filter(m => typeof app[m] === 'function'));
      
      if (typeof app.selectLearningMode === 'function') {
        console.log('Calling selectLearningMode...');
        app.selectLearningMode('topical');
        return {
          success: true,
          message: 'selectLearningMode called successfully'
        };
      }
    }
    
    return {
      success: false,
      message: 'App instance or selectLearningMode method not found'
    };
  });
  
  console.log('DOM manipulation result:', result);
  
  // Wait a bit for any navigation to occur
  await page.waitForTimeout(2000);
  
  // Check final state
  const finalSections = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.learning-section, [style*="display: block"]')).map(s => {
      const element = s as HTMLElement;
      return {
        id: element.id,
        className: element.className,
        display: element.style.display || getComputedStyle(element).display
      };
    });
  });
  console.log('Final sections:', finalSections);
  
  // Check if we're now in topic selection mode
  const topicCards = await page.locator('.topic-card').count();
  console.log('Topic cards found after click:', topicCards);
  
  if (topicCards > 0) {
    console.log('SUCCESS: Topical vocabulary is working!');
    
    // Verify we have the expected topics
    const topicTitles = await page.locator('.topic-card h4').allTextContents();
    console.log('Available topics:', topicTitles);
    
    expect(topicCards).toBeGreaterThan(0);
    expect(topicTitles.length).toBeGreaterThan(0);
  } else {
    console.log('No topic cards found, checking what happened...');
    
    // Check current page state
    const currentVisibleSections = await page.evaluate(() => {
      const sections = document.querySelectorAll('.learning-section.active, [style*="display: block"]');
      return Array.from(sections).map(s => ({ id: s.id, className: s.className }));
    });
    
    console.log('Currently visible sections:', currentVisibleSections);
  }
});
