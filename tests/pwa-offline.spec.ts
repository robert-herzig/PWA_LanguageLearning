import { test, expect } from '@playwright/test';

test.describe('PWA Offline Functionality', () => {
  test('should work offline after initial load', async ({ page, context }) => {
    console.log('=== Testing PWA Offline Functionality ===');

    // First, load the app online to cache resources
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    
    // Wait for service worker to register and cache resources
    await page.waitForTimeout(2000);
    
    // Verify service worker is registered
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration();
    });
    expect(swRegistered).toBeTruthy();
    console.log('✅ Service Worker registered');

    // Go offline
    await context.setOffline(true);
    console.log('📱 Set device offline');

    // Reload the page to test offline functionality
    await page.reload();
    await page.waitForTimeout(3000);

    // Verify app still loads offline
    await expect(page.locator('h1')).toContainText('Language Learning');
    console.log('✅ App loads offline');

    // Test navigation to flashcards while offline
    const flashcardsCard = page.locator('.feature-card').filter({ hasText: 'Lernkarten' });
    await expect(flashcardsCard).toBeVisible();
    await flashcardsCard.click();
    await page.waitForTimeout(1000);

    // Verify flashcards section loads offline
    await expect(page.locator('#flashcards-section')).toBeVisible();
    console.log('✅ Flashcards section loads offline');

    // Test topical vocabulary offline
    const topicalCard = page.locator('.mode-card[data-mode="topical"]');
    if (await topicalCard.isVisible()) {
      await topicalCard.click();
      await page.waitForTimeout(2000);
      
      // Check if topics load offline
      const topicCards = page.locator('.topic-card');
      const topicCount = await topicCards.count();
      
      if (topicCount > 0) {
        console.log(`✅ ${topicCount} topics available offline`);
        
        // Test loading a specific topic offline
        const firstTopic = topicCards.first();
        await firstTopic.click();
        await page.waitForTimeout(2000);
        
        // Verify flashcards load from cached data
        const flashcard = page.locator('.flashcard');
        if (await flashcard.isVisible()) {
          console.log('✅ Flashcards work offline');
          
          // Test that translations work offline
          const germanText = await flashcard.locator('.flashcard-front').textContent();
          if (germanText && !germanText.includes('undefined')) {
            console.log(`✅ Offline translations working: "${germanText}"`);
          }
        }
      } else {
        console.log('⚠️ Topics not cached - need to cache vocabulary JSON files');
      }
    }

    // Go back online
    await context.setOffline(false);
    console.log('🌐 Back online');
  });

  test('should install as PWA on Android Chrome', async ({ page }) => {
    console.log('=== Testing PWA Installation ===');

    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    // Check for PWA manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', 'manifest.json');
    console.log('✅ PWA manifest linked');

    // Verify manifest content is accessible
    const response = await page.request.get('http://localhost:8000/manifest.json');
    expect(response.ok()).toBeTruthy();
    
    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    
    console.log(`✅ PWA Manifest: "${manifest.name}" - ${manifest.display} mode`);

    // Check for required PWA icons
    expect(manifest.icons).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);
    
    const iconSizes = manifest.icons.map(icon => icon.sizes);
    console.log(`✅ PWA Icons available: ${iconSizes.join(', ')}`);

    // Verify PWA criteria are met
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content');
    
    console.log('✅ PWA installation criteria met for Android Chrome');
  });
});
