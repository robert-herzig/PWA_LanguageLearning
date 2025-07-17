import { test, expect } from '@playwright/test';

test.describe('Debug DOM', () => {
  test('should analyze DOM structure and fix visibility', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8000');
    await page.waitForTimeout(2000);
    
    // Navigate to flashcards
    await page.click('[data-navigate="flashcards"]');
    await page.waitForTimeout(2000);
    
    // Get the full DOM structure for debugging
    const flashcardsSection = await page.locator('#flashcards-section').innerHTML();
    console.log('Flashcards section HTML structure:');
    console.log(flashcardsSection.substring(0, 1000) + '...');
    
    // Check if the mode selection is actually visible
    const modeSelection = page.locator('#learning-mode-selection');
    const modeSelectionVisible = await modeSelection.isVisible();
    const modeSelectionDisplay = await modeSelection.evaluate(el => getComputedStyle(el).display);
    console.log('Mode selection visible:', modeSelectionVisible);
    console.log('Mode selection display:', modeSelectionDisplay);
    
    // Get the mode grid visibility
    const modeGrid = page.locator('.mode-grid');
    const modeGridVisible = await modeGrid.isVisible();
    const modeGridDisplay = await modeGrid.evaluate(el => getComputedStyle(el).display);
    console.log('Mode grid visible:', modeGridVisible);
    console.log('Mode grid display:', modeGridDisplay);
    
    // Get all mode cards
    const modeCards = page.locator('.mode-card');
    const cardCount = await modeCards.count();
    console.log('Mode cards found:', cardCount);
    
    for (let i = 0; i < cardCount; i++) {
      const card = modeCards.nth(i);
      const dataMode = await card.getAttribute('data-mode');
      const visible = await card.isVisible();
      const boundingBox = await card.boundingBox();
      const styles = await card.evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          position: computed.position,
          transform: computed.transform,
          zIndex: computed.zIndex,
          overflow: computed.overflow,
          height: computed.height,
          width: computed.width
        };
      });
      
      console.log(`Card ${i} (${dataMode}):`, {
        visible,
        boundingBox,
        styles
      });
    }
    
    // Try to force the element to be visible by directly setting styles
    await page.evaluate(() => {
      const topicalCard = document.querySelector('[data-mode="topical"]') as HTMLElement;
      if (topicalCard) {
        topicalCard.style.position = 'relative';
        topicalCard.style.display = 'block';
        topicalCard.style.visibility = 'visible';
        topicalCard.style.opacity = '1';
        topicalCard.style.zIndex = '9999';
        topicalCard.style.pointerEvents = 'auto';
        topicalCard.style.transform = 'none';
        topicalCard.style.overflow = 'visible';
        
        // Also check parent containers
        let parent = topicalCard.parentElement as HTMLElement;
        while (parent && parent !== document.body) {
          parent.style.overflow = 'visible';
          parent.style.height = 'auto';
          parent.style.maxHeight = 'none';
          parent = parent.parentElement as HTMLElement;
        }
        
        console.log('Applied visibility fixes to topical card');
      }
    });
    
    await page.waitForTimeout(500);
    
    // Now try clicking again
    const topicalElement = page.locator('[data-mode="topical"]');
    const isNowVisible = await topicalElement.isVisible();
    console.log('Topical element visible after fixes:', isNowVisible);
    
    if (isNowVisible) {
      await topicalElement.click();
      console.log('Click successful after fixes!');
    } else {
      console.log('Still not visible, trying force click...');
      try {
        await topicalElement.click({ force: true });
        console.log('Force click successful!');
      } catch (e) {
        console.log('Force click failed:', e.message);
      }
    }
  });
});
