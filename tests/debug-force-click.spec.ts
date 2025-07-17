import { test, expect } from '@playwright/test';

test.describe('Debug Force Click', () => {
  test('should use force click on topical mode', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8000');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Navigate to flashcards section first
    await page.click('[data-navigate="flashcards"]');
    await page.waitForTimeout(2000);
    
    // Try force clicking the topical element
    const topicalElement = page.locator('[data-mode="topical"]');
    
    console.log('Attempting force click...');
    
    try {
      // Force click to bypass visibility checks
      await topicalElement.click({ force: true });
      console.log('Force click successful!');
      
      await page.waitForTimeout(1000);
      
      // Check if we're now in topic selection
      const topicCards = page.locator('.topic-card');
      const topicCardCount = await topicCards.count();
      console.log('Topic cards found:', topicCardCount);
      
      if (topicCardCount > 0) {
        console.log('Successfully navigated to topic selection!');
        
        // Try clicking the first topic
        const firstTopic = topicCards.first();
        const topicName = await firstTopic.textContent();
        console.log('First topic:', topicName);
        
        await firstTopic.click({ force: true });
        await page.waitForTimeout(1000);
        
        // Check if we have flashcards now
        const flashcard = page.locator('.flashcard');
        const flashcardCount = await flashcard.count();
        console.log('Flashcards found:', flashcardCount);
        
        if (flashcardCount > 0) {
          console.log('SUCCESS: Topical vocabulary is working!');
        }
      }
      
    } catch (error) {
      console.log('Force click failed:', error.message);
      
      // Try alternative approach - direct button click
      const topicalButton = page.locator('[data-mode="topical"] .mode-btn');
      try {
        await topicalButton.click({ force: true });
        console.log('Button force click successful!');
      } catch (btnError) {
        console.log('Button force click failed:', btnError.message);
      }
    }
  });
});
