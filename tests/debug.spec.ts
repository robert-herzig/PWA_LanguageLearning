import { test, expect } from '@playwright/test';

test.describe('PWA Debug Tests', () => {
  test('debug navigation flow', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://127.0.0.1:8000');
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'test-results/debug-01-initial.png' });
    
    // Check what's visible on the page
    console.log('Home section visible:', await page.locator('#home-section').isVisible());
    console.log('Flashcards section visible:', await page.locator('#flashcards-section').isVisible());
    
    // Click on the flashcards button
    await page.locator('.feature-card').filter({ hasText: 'Lernkarten' }).locator('button').click();
    
    // Wait a moment for any animations or transitions
    await page.waitForTimeout(1000);
    
    // Take a screenshot after click
    await page.screenshot({ path: 'test-results/debug-02-after-click.png' });
    
    // Check what's visible now
    console.log('After click - Home section visible:', await page.locator('#home-section').isVisible());
    console.log('After click - Flashcards section visible:', await page.locator('#flashcards-section').isVisible());
    
    // Check if learning mode selection is visible
    console.log('Learning mode selection visible:', await page.locator('#learning-mode-selection').isVisible());
    
    // List all visible sections
    const sections = await page.locator('section').all();
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const id = await section.getAttribute('id');
      const isVisible = await section.isVisible();
      console.log(`Section ${id}: visible = ${isVisible}`);
    }
    
    // Check for any mode cards
    const modeCards = await page.locator('.mode-card').count();
    console.log('Mode cards found:', modeCards);
    
    if (modeCards > 0) {
      const firstModeCard = page.locator('.mode-card').first();
      const text = await firstModeCard.textContent();
      console.log('First mode card text:', text);
    }
  });
});
