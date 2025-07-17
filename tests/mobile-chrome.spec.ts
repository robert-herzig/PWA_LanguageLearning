import { test, expect } from '@playwright/test';

test.describe('PWA Mobile Chrome Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
  });

  test('should work on mobile Chrome viewport', async ({ page }) => {
    console.log('=== Testing Mobile Chrome Compatibility ===');

    // Verify the app loads properly on mobile
    await expect(page.locator('h1')).toContainText('Language Learning');
    
    // Test touch interactions work
    const flashcardsCard = page.locator('.feature-card').filter({ hasText: 'Lernkarten' });
    await expect(flashcardsCard).toBeVisible();
    
    // Test mobile navigation
    await flashcardsCard.click();
    await page.waitForTimeout(1000);
    
    // Verify flashcards section opens
    await expect(page.locator('#flashcards-section')).toBeVisible();
    
    // Test topical vocabulary on mobile
    const topicalCard = page.locator('.mode-card[data-mode="topical"]');
    if (await topicalCard.isVisible()) {
      await topicalCard.click();
      await page.waitForTimeout(1000);
      
      // Verify topics load on mobile
      const topicCards = page.locator('.topic-card');
      const topicCount = await topicCards.count();
      expect(topicCount).toBeGreaterThan(0);
      console.log(`✅ ${topicCount} topics loaded on mobile`);
    }
  });

  test('should handle touch gestures for flashcards', async ({ page }) => {
    console.log('=== Testing Touch Gesture Support ===');

    // Navigate to flashcards
    await page.click('.feature-card[data-navigate="flashcards"]');
    await page.waitForTimeout(500);
    
    // Select topical vocabulary
    const topicalCard = page.locator('.mode-card[data-mode="topical"]');
    if (await topicalCard.isVisible()) {
      await topicalCard.click();
      await page.waitForTimeout(1000);
      
      // Select first topic
      const firstTopic = page.locator('.topic-card').first();
      if (await firstTopic.isVisible()) {
        await firstTopic.click();
        await page.waitForTimeout(1000);
        
        // Test flashcard tap to flip
        const flashcard = page.locator('.flashcard');
        await expect(flashcard).toBeVisible();
        
        // Tap to flip card
        await flashcard.click();
        await page.waitForTimeout(500);
        
        // Verify card flipped (should show Spanish side)
        const spanishSide = page.locator('.flashcard-back');
        await expect(spanishSide).toBeVisible();
        
        console.log('✅ Touch gestures working on mobile');
      }
    }
  });

  test('should display correctly in portrait orientation', async ({ page }) => {
    console.log('=== Testing Portrait Orientation ===');

    // Verify main elements are visible and properly sized
    const header = page.locator('h1');
    const featureCards = page.locator('.feature-card');
    
    await expect(header).toBeVisible();
    const cardCount = await featureCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check that feature cards stack properly on mobile
    const firstCard = featureCards.first();
    const cardBox = await firstCard.boundingBox();
    
    if (cardBox) {
      // On mobile, cards should be narrower than desktop
      expect(cardBox.width).toBeLessThan(600); // Mobile width constraint
      console.log(`✅ Mobile layout: card width ${cardBox.width}px`);
    }
  });
});
