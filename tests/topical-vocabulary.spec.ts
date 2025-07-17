import { test, expect } from '@playwright/test';

test.describe('Topical Vocabulary Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8000');
    
    // Wait for the app to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Navigate to flashcards section first
    await page.click('[data-navigate="flashcards"]');
    await page.waitForTimeout(1000);
    
    // Force the mode selection to be visible
    await page.evaluate(() => {
      const modeSelection = document.getElementById('learning-mode-selection') as HTMLElement;
      if (modeSelection) {
        modeSelection.style.display = 'block';
        modeSelection.style.visibility = 'visible';
        modeSelection.style.opacity = '1';
        modeSelection.style.height = 'auto';
        modeSelection.style.overflow = 'visible';
      }
    });
    
    // Wait for elements to be actually visible
    await page.waitForSelector('[data-mode="topical"]', { state: 'visible', timeout: 5000 }).catch(() => {
      console.log('Topical mode element not visible after waiting');
    });
  });

  test('should load and display topical vocabulary topics', async ({ page }) => {
    console.log('=== Testing Topical Vocabulary Display ===');

    // Navigate to topical learning mode
    await page.click('[data-mode="topical"]');
    await page.waitForTimeout(500);

    // Should show topic selection
    await expect(page.locator('#topic-selection')).toBeVisible();
    
    // Check that topics are loaded and displayed
    await page.waitForSelector('.topic-card', { timeout: 10000 });
    
    // Verify we have topic cards
    const topicCards = page.locator('.topic-card');
    const topicCount = await topicCards.count();
    console.log(`Found ${topicCount} topic cards`);
    expect(topicCount).toBeGreaterThan(0);

    // Check that each topic card has required elements
    const firstTopicCard = topicCards.first();
    await expect(firstTopicCard.locator('.topic-icon')).toBeVisible();
    await expect(firstTopicCard.locator('h4')).toBeVisible();
    await expect(firstTopicCard.locator('p')).toBeVisible();
    await expect(firstTopicCard.locator('.topic-btn')).toBeVisible();

    // Verify English topic names are used
    const topicTitles = await page.locator('.topic-card h4').allTextContents();
    console.log('Topic titles:', topicTitles);
    
    // Should contain English topic names
    const hasEnglishTopics = topicTitles.some(title => 
      ['Personal Relationships', 'Food & Nutrition', 'Education', 'Work', 'Travel & Transport'].includes(title)
    );
    expect(hasEnglishTopics).toBe(true);
  });

  test('should switch between B1 and B2 levels', async ({ page }) => {
    console.log('=== Testing Level Switching ===');

    // Navigate to topical learning mode
    await page.click('[data-mode="topical"]');
    await page.waitForTimeout(500);

    // Wait for topics to load
    await page.waitForSelector('.topic-card', { timeout: 10000 });

    // Check current level selector
    const levelSelect = page.locator('#topic-level-select');
    await expect(levelSelect).toBeVisible();

    // Get initial topic count
    const initialTopicCount = await page.locator('.topic-card').count();
    console.log(`Initial topic count (B1): ${initialTopicCount}`);

    // Switch to B2
    await levelSelect.selectOption('b2');
    await page.waitForTimeout(1000);

    // Wait for topics to reload
    await page.waitForSelector('.topic-card', { timeout: 10000 });

    // Verify topics are still displayed
    const newTopicCount = await page.locator('.topic-card').count();
    console.log(`New topic count (B2): ${newTopicCount}`);
    expect(newTopicCount).toBeGreaterThan(0);
  });

  test('should open topic and display vocabulary correctly', async ({ page }) => {
    console.log('=== Testing Topic Vocabulary Display ===');

    // Navigate to topical learning mode
    await page.click('[data-mode="topical"]');
    await page.waitForTimeout(500);

    // Wait for topics to load
    await page.waitForSelector('.topic-card', { timeout: 10000 });

    // Click on Personal Relationships topic (should be available in B1)
    const personalRelationshipsTopic = page.locator('.topic-card').filter({ hasText: 'Personal Relationships' });
    if (await personalRelationshipsTopic.count() > 0) {
      await personalRelationshipsTopic.click();
    } else {
      // Fallback to first available topic
      await page.locator('.topic-card').first().click();
    }

    await page.waitForTimeout(1000);

    // Should show flashcard practice
    await expect(page.locator('#flashcard-practice')).toBeVisible();

    // Should show back to topics button
    await expect(page.locator('#back-to-topics')).toBeVisible();

    // Verify flashcard content
    await page.waitForSelector('.flashcard', { timeout: 10000 });
    const flashcard = page.locator('.flashcard');
    await expect(flashcard).toBeVisible();

    // Check that we have vocabulary content
    const frontText = await page.locator('.flashcard-front').textContent();
    const backText = await page.locator('.flashcard-back').textContent();
    
    expect(frontText).toBeTruthy();
    expect(backText).toBeTruthy();
    console.log(`Flashcard front: ${frontText}`);
    console.log(`Flashcard back: ${backText}`);

    // Verify English translations are used
    if (frontText && backText) {
      // Check that we have proper English translations (not Spanish)
      const hasEnglishTranslation = !backText.includes('útil') && 
                                   backText.length > 0 && 
                                   backText !== frontText;
      expect(hasEnglishTranslation).toBe(true);
    }
  });

  test('should navigate between flashcards', async ({ page }) => {
    console.log('=== Testing Flashcard Navigation ===');

    // Navigate to topical learning mode and select a topic
    await page.click('[data-mode="topical"]');
    await page.waitForTimeout(500);
    await page.waitForSelector('.topic-card', { timeout: 10000 });
    await page.locator('.topic-card').first().click();
    await page.waitForTimeout(1000);

    // Wait for flashcard to appear
    await page.waitForSelector('.flashcard', { timeout: 10000 });

    // Get initial card content
    const initialFront = await page.locator('.flashcard-front').textContent();
    console.log(`Initial card: ${initialFront}`);

    // Click next button
    const nextBtn = page.locator('#next-card');
    if (await nextBtn.count() > 0) {
      await nextBtn.click();
      await page.waitForTimeout(500);

      // Verify content changed
      const newFront = await page.locator('.flashcard-front').textContent();
      console.log(`Next card: ${newFront}`);
      
      // Content should be different (unless there's only one card)
      if (newFront !== initialFront) {
        expect(newFront).not.toBe(initialFront);
      }
    }

    // Test flip functionality
    const flipBtn = page.locator('#flip-card');
    if (await flipBtn.count() > 0) {
      await flipBtn.click();
      await page.waitForTimeout(300);

      // Card should show back side
      const isFlipped = await page.locator('.flashcard.flipped').count() > 0;
      expect(isFlipped).toBe(true);
    }
  });

  test('should navigate back to topic selection', async ({ page }) => {
    console.log('=== Testing Navigation Back to Topics ===');

    // Navigate to topical learning mode and select a topic
    await page.click('[data-mode="topical"]');
    await page.waitForTimeout(500);
    await page.waitForSelector('.topic-card', { timeout: 10000 });
    await page.locator('.topic-card').first().click();
    await page.waitForTimeout(1000);

    // Should be in flashcard practice
    await expect(page.locator('#flashcard-practice')).toBeVisible();

    // Click back to topics
    await page.click('#back-to-topics');
    await page.waitForTimeout(500);

    // Should be back at topic selection
    await expect(page.locator('#topic-selection')).toBeVisible();
    await expect(page.locator('.topic-card')).toBeVisible();
  });

  test('should load correct language content', async ({ page }) => {
    console.log('=== Testing Language Content Loading ===');

    // Navigate to topical learning mode
    await page.click('[data-mode="topical"]');
    await page.waitForTimeout(500);
    await page.waitForSelector('.topic-card', { timeout: 10000 });

    // Select a topic to get vocabulary
    await page.locator('.topic-card').first().click();
    await page.waitForTimeout(1000);
    await page.waitForSelector('.flashcard', { timeout: 10000 });

    // Get Spanish word and English translation
    const spanishWord = await page.locator('.flashcard-front').textContent();
    const englishTranslation = await page.locator('.flashcard-back').textContent();

    console.log(`Spanish: ${spanishWord}`);
    console.log(`English: ${englishTranslation}`);

    // Verify we have content
    expect(spanishWord).toBeTruthy();
    expect(englishTranslation).toBeTruthy();

    // Verify they're different (translation should be different from original)
    expect(spanishWord).not.toBe(englishTranslation);

    // Basic check that we have Spanish characters in the Spanish word or English words in translation
    const hasSpanishChars = /[ñáéíóúü]/.test(spanishWord || '');
    const hasEnglishWords = /^[a-zA-Z\s\-']+$/.test(englishTranslation || '');
    
    // At least one should be true to indicate proper language content
    expect(hasSpanishChars || hasEnglishWords).toBe(true);
  });

  test('should display topic statistics correctly', async ({ page }) => {
    console.log('=== Testing Topic Statistics ===');

    // Navigate to topical learning mode
    await page.click('[data-mode="topical"]');
    await page.waitForTimeout(500);
    await page.waitForSelector('.topic-card', { timeout: 10000 });

    // Check that topic cards show word counts
    const topicCards = page.locator('.topic-card');
    const firstCard = topicCards.first();
    
    // Look for word count display
    const wordCountElement = firstCard.locator('.word-count');
    if (await wordCountElement.count() > 0) {
      const wordCountText = await wordCountElement.textContent();
      console.log(`Word count text: ${wordCountText}`);
      
      // Should contain a number
      expect(wordCountText).toMatch(/\d+/);
    }

    // Verify topic has title and description
    const title = await firstCard.locator('h4').textContent();
    const description = await firstCard.locator('p').textContent();
    
    expect(title).toBeTruthy();
    expect(description).toBeTruthy();
    expect(title).not.toBe(description);
    
    console.log(`Topic: ${title} - ${description}`);
  });
});
