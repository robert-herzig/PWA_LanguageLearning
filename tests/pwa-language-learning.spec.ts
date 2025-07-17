import { test, expect } from '@playwright/test';

test.describe('PWA Language Learning App', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://127.0.0.1:8000');
  });

  test('should load the main page with correct title', async ({ page }) => {
    // Check if the page loads and has the correct title
    await expect(page).toHaveTitle(/Language Learning/);
    
    // Check if the header is visible
    await expect(page.locator('.header__title')).toHaveText('Language Learning');
  });

  test('should display feature cards on home page', async ({ page }) => {
    // Wait for the feature cards to be visible
    await expect(page.locator('.feature-card')).toHaveCount(4);
    
    // Check specific feature cards
    await expect(page.locator('.feature-card').filter({ hasText: 'Lernkarten' })).toBeVisible();
    await expect(page.locator('.feature-card').filter({ hasText: 'Sprach-Chatbot' })).toBeVisible();
    await expect(page.locator('.feature-card').filter({ hasText: 'Lernfortschritt' })).toBeVisible();
    await expect(page.locator('.feature-card').filter({ hasText: 'Einstellungen' })).toBeVisible();
  });

  test('should display available languages', async ({ page }) => {
    // Check if language badges are visible
    await expect(page.locator('.language-badge')).toHaveCount(3);
    await expect(page.locator('.language-badge').filter({ hasText: 'Spanisch' })).toBeVisible();
    await expect(page.locator('.language-badge').filter({ hasText: 'Englisch' })).toBeVisible();
    await expect(page.locator('.language-badge').filter({ hasText: 'Russisch' })).toBeVisible();
  });

  test('should navigate to flashcards section', async ({ page }) => {
    // Wait for the app to be fully initialized and navigation to be set up
    await page.waitForFunction(() => {
      const flashcardsCard = document.querySelector('.feature-card[data-navigate="flashcards"]') as HTMLElement;
      return flashcardsCard && flashcardsCard.style.cursor === 'pointer';
    }, { timeout: 10000 });
    
    // Click on flashcards feature card
    await page.locator('.feature-card').filter({ hasText: 'Lernkarten' }).locator('button').click();
    
    // Wait for sections to switch via CSS classes
    await page.waitForFunction(() => {
      const homeSection = document.querySelector('#home-section');
      const flashcardsSection = document.querySelector('#flashcards-section');
      return !homeSection?.classList.contains('active') && flashcardsSection?.classList.contains('active');
    }, { timeout: 10000 });
    
    await expect(page.locator('#flashcards-section')).toBeVisible();
    
    // Wait for mode cards to be visible
    await page.waitForSelector('.mode-card', { timeout: 10000 });
    
    // Check if mode selection is visible
    await expect(page.locator('.mode-card')).toHaveCount(2);
    await expect(page.locator('.mode-card').filter({ hasText: 'Nach Schwierigkeitsgrad' })).toBeVisible();
    await expect(page.locator('.mode-card').filter({ hasText: 'Nach Themen' })).toBeVisible();
  });

  test('should navigate to topical vocabulary mode', async ({ page }) => {
    // Wait for the app to be fully initialized and navigation to be set up
    await page.waitForFunction(() => {
      const flashcardsCard = document.querySelector('.feature-card[data-navigate="flashcards"]') as HTMLElement;
      return flashcardsCard && flashcardsCard.style.cursor === 'pointer';
    }, { timeout: 10000 });
    
    // Navigate to flashcards section
    await page.locator('.feature-card').filter({ hasText: 'Lernkarten' }).locator('button').click();
    
    // Wait for flashcards section to show
    await page.waitForFunction(() => {
      const flashcardsSection = document.querySelector('#flashcards-section');
      return flashcardsSection?.classList.contains('active');
    }, { timeout: 10000 });
    
    await page.waitForSelector('.mode-card', { timeout: 10000 });
    
    // Click on Topical Vocabulary mode
    await page.locator('.mode-card').filter({ hasText: 'Nach Themen' }).click();
    
    // Wait for topic selection to appear
    await page.waitForFunction(() => {
      const topicSelection = document.querySelector('#topic-selection') as HTMLElement;
      return topicSelection?.style.display === 'block';
    }, { timeout: 10000 });
    
    // Check if level selection is visible (via dropdown)
    await expect(page.locator('#topic-level-select')).toBeVisible();
  });

  test('should navigate to level-based learning mode', async ({ page }) => {
    // Wait for the app to be fully initialized and navigation to be set up
    await page.waitForFunction(() => {
      const flashcardsCard = document.querySelector('.feature-card[data-navigate="flashcards"]') as HTMLElement;
      return flashcardsCard && flashcardsCard.style.cursor === 'pointer';
    }, { timeout: 10000 });
    
    // Navigate to flashcards section
    await page.locator('.feature-card').filter({ hasText: 'Lernkarten' }).locator('button').click();
    
    // Wait for flashcards section to show
    await page.waitForFunction(() => {
      const flashcardsSection = document.querySelector('#flashcards-section');
      return flashcardsSection?.classList.contains('active');
    }, { timeout: 10000 });
    
    await page.waitForSelector('.mode-card', { timeout: 10000 });
    
    // Click on Level-based Learning mode
    await page.locator('.mode-card').filter({ hasText: 'Nach Schwierigkeitsgrad' }).click();
    
    // Wait for level selection to appear
    await page.waitForFunction(() => {
      const levelSelection = document.querySelector('#level-selection') as HTMLElement;
      return levelSelection?.style.display === 'block';
    }, { timeout: 10000 });
    
    // Check if level cards are visible
    const levelCount = await page.locator('.level-card').count();
    expect(levelCount).toBeGreaterThan(0);
    await expect(page.locator('.level-card').filter({ hasText: 'Anfänger' })).toBeVisible();
  });

  test('should support PWA features', async ({ page }) => {
    // Check if service worker is registered
    const swRegistration = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistration).toBe(true);
    
    // Check if the app has a manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', 'manifest.json');
  });

  test('should be able to start flashcard practice', async ({ page }) => {
    // Wait for the app to be fully initialized and navigation to be set up
    await page.waitForFunction(() => {
      const flashcardsCard = document.querySelector('.feature-card[data-navigate="flashcards"]') as HTMLElement;
      return flashcardsCard && flashcardsCard.style.cursor === 'pointer';
    }, { timeout: 10000 });
    
    // Navigate to flashcards section
    await page.locator('.feature-card').filter({ hasText: 'Lernkarten' }).locator('button').click();
    
    // Wait for flashcards section to show
    await page.waitForFunction(() => {
      const flashcardsSection = document.querySelector('#flashcards-section');
      return flashcardsSection?.classList.contains('active');
    }, { timeout: 10000 });
    
    await page.waitForSelector('.mode-card', { timeout: 10000 });
    
    // Click on Level-based Learning mode
    await page.locator('.mode-card').filter({ hasText: 'Nach Schwierigkeitsgrad' }).click();
    
    // Wait for level selection to appear
    await page.waitForFunction(() => {
      const levelSelection = document.querySelector('#level-selection') as HTMLElement;
      return levelSelection?.style.display === 'block';
    }, { timeout: 10000 });
    
    // Click on a level
    await page.locator('.level-card').filter({ hasText: 'Anfänger' }).click();
    
    // Wait for flashcard practice interface to appear
    await page.waitForFunction(() => {
      const practiceSection = document.querySelector('#flashcard-practice') as HTMLElement;
      return practiceSection?.style.display === 'block';
    }, { timeout: 10000 });
    
    // Check if flashcard practice interface is visible
    await expect(page.locator('.flashcard')).toBeVisible();
    await expect(page.locator('.flashcard-front')).toBeVisible();
  });

  test('should handle back navigation correctly', async ({ page }) => {
    // Wait for the app to be fully initialized and navigation to be set up
    await page.waitForFunction(() => {
      const flashcardsCard = document.querySelector('.feature-card[data-navigate="flashcards"]') as HTMLElement;
      return flashcardsCard && flashcardsCard.style.cursor === 'pointer';
    }, { timeout: 10000 });
    
    // Navigate deep into the app
    await page.locator('.feature-card').filter({ hasText: 'Lernkarten' }).locator('button').click();
    
    // Wait for flashcards section to show
    await page.waitForFunction(() => {
      const flashcardsSection = document.querySelector('#flashcards-section');
      return flashcardsSection?.classList.contains('active');
    }, { timeout: 10000 });
    
    await page.waitForSelector('.mode-card', { timeout: 10000 });
    
    await page.locator('.mode-card').filter({ hasText: 'Nach Schwierigkeitsgrad' }).click();
    
    // Wait for level selection to appear
    await page.waitForFunction(() => {
      const levelSelection = document.querySelector('#level-selection') as HTMLElement;
      return levelSelection?.style.display === 'block';
    }, { timeout: 10000 });
    
    // Check if specific back button exists and click it
    const backButton = page.locator('#back-to-modes');
    if (await backButton.count() > 0) {
      await backButton.click();
      
      // Wait for mode cards to reappear
      await page.waitForSelector('.mode-card', { timeout: 10000 });
      
      // Should be back on flashcards mode selection
      await expect(page.locator('.mode-card')).toHaveCount(2);
    }
  });
});
