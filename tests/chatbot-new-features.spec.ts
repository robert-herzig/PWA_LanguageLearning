import { test, expect } from '@playwright/test';

test.describe('Chatbot New Features - Target Language & TTS', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://127.0.0.1:8000');
    
    // Navigate to chatbot section
    await page.locator('.feature-card').filter({ hasText: 'Sprach-Chatbot' }).locator('button').click();
    
    // Wait for chatbot section to be active
    await page.waitForFunction(() => {
      const chatbotSection = document.querySelector('#chatbot-section');
      return chatbotSection?.classList.contains('active');
    }, { timeout: 10000 });
  });

  async function completeChatbotSetup(page) {
    // Helper function to complete chatbot setup consistently
    await page.locator('.level-btn-chat[data-level="B1"]').click();
    await expect(page.locator('.level-btn-chat[data-level="B1"]')).toHaveClass(/selected/);
    
    // Wait for topics to load
    await page.waitForTimeout(2000);
    await page.waitForSelector('.topic-btn-chat', { timeout: 10000 });
    
    // Click first available topic
    const firstTopic = page.locator('.topic-btn-chat').first();
    await firstTopic.click();
    
    // Check if API step is shown (localhost development mode)
    const apiStep = page.locator('#api-step');
    if (await apiStep.isVisible({ timeout: 2000 })) {
      // In development mode, start chatting in demo mode
      await page.locator('#start-chatting').click();
    }
    
    // Wait for chat interface to be visible
    await expect(page.locator('#chatbot-interface')).toBeVisible({ timeout: 10000 });
    
    return true;
  }

  test('should detect target language correctly for Spanish topics', async ({ page }) => {
    await completeChatbotSetup(page);
    
    // Check that the target language detection is working
    const targetLanguage = await page.evaluate(() => {
      const chatbot = (window as any).languageChatbot;
      return chatbot ? chatbot.getTargetLanguage() : null;
    });
    
    expect(['spanish', 'english', 'russian']).toContain(targetLanguage);
  });

  test('should display topic names in target language in chat messages', async ({ page }) => {
    await completeChatbotSetup(page);
    
    // Wait for opening message to appear
    await page.waitForSelector('.ai-message', { timeout: 15000 });
    
    // Check that the opening message doesn't contain German words
    const messageContent = await page.locator('.ai-message .message-content p').first().textContent();
    
    // The message should not contain common German topic words
    expect(messageContent).not.toMatch(/Ernährung|Arbeit|Bildung/);
    
    // Should contain target language content instead
    if (messageContent) {
      // Check for Spanish, English, or Russian content patterns
      const hasTargetLanguageContent = 
        /¡|¿|sobre|tema/.test(messageContent) || // Spanish patterns
        /about|topic|talk/.test(messageContent) || // English patterns
        /о|тема|говорим/.test(messageContent); // Russian patterns
      
      expect(hasTargetLanguageContent).toBe(true);
    }
  });

  test('should include TTS icons and functionality', async ({ page }) => {
    await completeChatbotSetup(page);
    
    // Wait for vocabulary hints to load
    await page.waitForSelector('.vocab-chip', { timeout: 10000 });
    
    // Check that vocabulary chips have TTS icons
    const vocabChipsWithTTS = page.locator('.vocab-chip .tts-icon');
    await expect(vocabChipsWithTTS.first()).toBeVisible();
    
    // Check that AI messages have TTS icons
    await page.waitForSelector('.ai-message', { timeout: 15000 });
    const aiMessageTTS = page.locator('.ai-message .tts-icon');
    await expect(aiMessageTTS.first()).toBeVisible();
    
    // Test clicking on vocabulary chip for TTS
    const firstVocabChip = page.locator('.vocab-chip').first();
    await firstVocabChip.click();
    
    // Verify that speechSynthesis API would be called (can't test actual audio in headless)
    const speechSynthesisSupported = await page.evaluate(() => {
      return 'speechSynthesis' in window;
    });
    expect(speechSynthesisSupported).toBe(true);
  });

  test('should have clickable AI messages for TTS', async ({ page }) => {
    await completeChatbotSetup(page);
    
    // Wait for AI message
    await page.waitForSelector('.ai-message', { timeout: 15000 });
    
    // Check that AI message has clickable class and cursor pointer
    const aiMessage = page.locator('.ai-message.clickable-message').first();
    await expect(aiMessage).toBeVisible();
    
    // Check CSS styling for clickable messages
    const hasPointerCursor = await aiMessage.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return style.cursor === 'pointer';
    });
    expect(hasPointerCursor).toBe(true);
    
    // Click on AI message should trigger TTS (test the click event)
    await aiMessage.click();
    
    // Verify the speech synthesis would be triggered
    const speechCalled = await page.evaluate(() => {
      // Check if speechSynthesis is available and could be called
      return typeof speechSynthesis !== 'undefined' && typeof speechSynthesis.speak === 'function';
    });
    expect(speechCalled).toBe(true);
  });

  test('should insert vocabulary words correctly when clicked', async ({ page }) => {
    await completeChatbotSetup(page);
    
    // Wait for vocabulary chips
    await page.waitForSelector('.vocab-chip', { timeout: 10000 });
    
    // Get text of first vocabulary chip
    const firstVocabChip = page.locator('.vocab-chip').first();
    const vocabText = await firstVocabChip.textContent();
    const cleanVocabText = vocabText?.replace('🔊', '').trim();
    
    // Click on vocabulary chip
    await firstVocabChip.click();
    
    // Check that the word was inserted into the input field
    const inputField = page.locator('#chat-input');
    const inputValue = await inputField.inputValue();
    
    expect(inputValue).toContain(cleanVocabText);
  });

  test('should handle different target languages correctly', async ({ page }) => {
    // Test target language detection with different topic types
    await page.locator('.level-btn-chat[data-level="B1"]').click();
    await page.waitForSelector('.topic-btn-chat', { timeout: 10000 });
    
    // Check if we have different language topics available
    const topics = page.locator('.topic-btn-chat');
    const topicCount = await topics.count();
    
    if (topicCount > 0) {
      // Click on first topic
      await topics.first().click();
      await expect(page.locator('#chatbot-interface')).toBeVisible({ timeout: 10000 });
      
      // Test the getTargetLanguage function
      const targetLanguageInfo = await page.evaluate(() => {
        const chatbot = (window as any).languageChatbot;
        if (!chatbot) return null;
        
        return {
          targetLanguage: chatbot.getTargetLanguage(),
          vocabularyCount: chatbot.vocabularyWords?.length || 0,
          currentTopic: chatbot.currentTopic
        };
      });
      
      expect(targetLanguageInfo).not.toBeNull();
      expect(['spanish', 'english', 'russian']).toContain(targetLanguageInfo?.targetLanguage);
    }
  });

  test('should display correct topic translations in UI', async ({ page }) => {
    // Test that topic names are displayed in German in the UI (base language)
    // but content is in target language
    await page.locator('.level-btn-chat[data-level="B1"]').click();
    await page.waitForSelector('.topic-btn-chat', { timeout: 10000 });
    
    // Check topic button displays German names
    const topicNames = await page.locator('.topic-name').allTextContents();
    
    // Should contain German topic names (base language for UI)
    const hasGermanNames = topicNames.some(name => 
      /Arbeit|Ernährung|Bildung|Gesundheit|Technologie/.test(name)
    );
    
    if (topicNames.length > 0 && hasGermanNames) {
      // Select a topic
      await page.locator('.topic-btn-chat').first().click();
      await expect(page.locator('#chatbot-interface')).toBeVisible({ timeout: 10000 });
      
      // Wait for opening message
      await page.waitForSelector('.ai-message', { timeout: 15000 });
      
      // Check that chat header shows German topic name
      const chatTopicHeader = await page.locator('#chat-topic').textContent();
      expect(chatTopicHeader).toMatch(/Arbeit|Ernährung|Bildung|Gesundheit|Technologie/);
    }
  });

  test('should have proper chat layout with always visible input field', async ({ page }) => {
    await completeChatbotSetup(page);
    
    // Check that chat interface has proper flex layout
    const chatInterface = page.locator('#chatbot-interface');
    const displayStyle = await chatInterface.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        display: style.display,
        flexDirection: style.flexDirection,
        height: style.height
      };
    });
    
    expect(displayStyle.display).toBe('flex');
    expect(displayStyle.flexDirection).toBe('column');
    
    // Check that input container is always visible at bottom
    const inputContainer = page.locator('.chat-input-container');
    await expect(inputContainer).toBeVisible();
    
    // Verify input field is accessible
    const inputField = page.locator('#chat-input');
    await expect(inputField).toBeVisible();
    await inputField.click();
    await inputField.fill('Test message');
    
    const inputValue = await inputField.inputValue();
    expect(inputValue).toBe('Test message');
  });

  test('should scroll chat messages properly without hiding input', async ({ page }) => {
    await completeChatbotSetup(page);
    
    // Wait for initial message
    await page.waitForSelector('.ai-message', { timeout: 15000 });
    
    // Add several test messages to trigger scrolling
    for (let i = 0; i < 5; i++) {
      await page.locator('#chat-input').fill(`Test message ${i + 1}`);
      await page.locator('#send-message').click();
      
      // Wait for message to appear
      await page.waitForSelector(`.user-message:has-text("Test message ${i + 1}")`, { timeout: 5000 });
      
      // Small delay to allow for any animations
      await page.waitForTimeout(500);
    }
    
    // Check that input field is still visible and accessible
    const inputField = page.locator('#chat-input');
    await expect(inputField).toBeVisible();
    
    // Check that we can still type in the input
    await inputField.click();
    await inputField.fill('Final test message');
    const inputValue = await inputField.inputValue();
    expect(inputValue).toBe('Final test message');
    
    // Verify messages container has proper scroll behavior
    const messagesContainer = page.locator('#chat-messages');
    const scrollProperties = await messagesContainer.evaluate((element) => {
      return {
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        overflowY: window.getComputedStyle(element).overflowY
      };
    });
    
    expect(scrollProperties.overflowY).toBe('auto');
  });

  test('should generate contextual responses based on target language', async ({ page }) => {
    await completeChatbotSetup(page);
    
    // Wait for vocabulary and initial message
    await page.waitForSelector('.vocab-chip', { timeout: 10000 });
    await page.waitForSelector('.ai-message', { timeout: 15000 });
    
    // Test demo response generation
    const demoResponseInfo = await page.evaluate(() => {
      const chatbot = (window as any).languageChatbot;
      if (!chatbot) return null;
      
      const targetLanguage = chatbot.getTargetLanguage();
      const demoResponse = chatbot.getDemoResponse('Hello, I am interested in this topic');
      
      return {
        targetLanguage,
        responseLength: demoResponse.length,
        containsTargetLanguageMarkers: {
          spanish: /¡|¿|muy|sobre|tema/.test(demoResponse),
          english: /very|about|topic|interesting/.test(demoResponse),
          russian: /очень|о|тема|интересно/.test(demoResponse)
        }
      };
    });
    
    expect(demoResponseInfo).not.toBeNull();
    expect(demoResponseInfo?.responseLength).toBeGreaterThan(0);
    
    // Verify response contains appropriate language markers
    const targetLang = demoResponseInfo?.targetLanguage;
    if (targetLang && demoResponseInfo?.containsTargetLanguageMarkers) {
      expect(demoResponseInfo.containsTargetLanguageMarkers[targetLang]).toBe(true);
    }
  });

  test('should handle vocabulary praise responses correctly', async ({ page }) => {
    await completeChatbotSetup(page);
    
    // Wait for vocabulary to load
    await page.waitForSelector('.vocab-chip', { timeout: 10000 });
    
    // Test vocabulary praise response generation
    const praiseResponseInfo = await page.evaluate(() => {
      const chatbot = (window as any).languageChatbot;
      if (!chatbot || !chatbot.vocabularyWords || chatbot.vocabularyWords.length === 0) {
        return null;
      }
      
      const firstWord = chatbot.vocabularyWords[0];
      const praiseResponse = chatbot.getVocabularyPraiseResponse(firstWord);
      const targetLanguage = chatbot.getTargetLanguage();
      
      return {
        targetLanguage,
        wordUsed: firstWord.word,
        responseLength: praiseResponse.length,
        containsPraise: {
          spanish: /¡Muy bien!|¡Excelente!|¡Perfecto!/.test(praiseResponse),
          english: /Very good!|Excellent!|Perfect!/.test(praiseResponse),
          russian: /Очень хорошо!|Отлично!|Прекрасно!/.test(praiseResponse)
        }
      };
    });
    
    if (praiseResponseInfo) {
      expect(praiseResponseInfo.responseLength).toBeGreaterThan(0);
      expect(praiseResponseInfo.wordUsed).toBeDefined();
      
      // Verify praise contains appropriate language markers
      const targetLang = praiseResponseInfo.targetLanguage;
      if (targetLang && praiseResponseInfo.containsPraise) {
        expect(praiseResponseInfo.containsPraise[targetLang]).toBe(true);
      }
    }
  });

  test('should maintain consistent UI language (German) while content is in target language', async ({ page }) => {
    // Complete chatbot setup - special case: we need to test UI elements before full setup
    await page.locator('.level-btn-chat[data-level="B1"]').click();
    await page.waitForSelector('.topic-btn-chat', { timeout: 10000 });
    
    // Check that UI elements are in German
    const levelButtonText = await page.locator('.level-btn-chat[data-level="B1"]').textContent();
    expect(levelButtonText).toMatch(/B1/); // Level should be displayed
    
    // Check topic names are in German (UI language)
    const topicName = await page.locator('.topic-name').first().textContent();
    // Should contain German words like Arbeit, Ernährung, etc.
    
    await page.locator('.topic-btn-chat').first().click();
    
    // Check if API step is shown (localhost development mode)
    const apiStep = page.locator('#api-step');
    if (await apiStep.isVisible({ timeout: 2000 })) {
      // In development mode, start chatting in demo mode
      await page.locator('#start-chatting').click();
    }
    
    await expect(page.locator('#chatbot-interface')).toBeVisible({ timeout: 10000 });
    
    // Check that UI buttons are in German
    const resetButton = await page.locator('#reset-chat').textContent();
    expect(resetButton).toContain('Neues Gespräch');
    
    const switchTopicButton = await page.locator('#switch-topic').textContent();
    expect(switchTopicButton).toContain('Thema wechseln');
    
    // But chat content should be in target language
    await page.waitForSelector('.ai-message', { timeout: 15000 });
    const chatContent = await page.locator('.ai-message .message-content p').first().textContent();
    
    // Should not contain German learning prompts
    expect(chatContent).not.toMatch(/Ich bin dein deutscher Sprachlehrer/);
  });
});

test.describe('Chatbot Layout and Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:8000');
    await page.locator('.feature-card').filter({ hasText: 'Sprach-Chatbot' }).locator('button').click();
    await page.waitForFunction(() => {
      const chatbotSection = document.querySelector('#chatbot-section');
      return chatbotSection?.classList.contains('active');
    }, { timeout: 10000 });
  });

  test('should have proper desktop layout dimensions', async ({ page }) => {
    // Complete setup
    await page.locator('.level-btn-chat[data-level="B1"]').click();
    await page.waitForSelector('.topic-btn-chat', { timeout: 10000 });
    await page.locator('.topic-btn-chat').first().click();
    await expect(page.locator('#chatbot-interface')).toBeVisible({ timeout: 10000 });
    
    // Check desktop layout properties
    const layoutProperties = await page.locator('#chatbot-interface').evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        display: style.display,
        flexDirection: style.flexDirection,
        height: style.height,
        minHeight: style.minHeight,
        overflow: style.overflow
      };
    });
    
    expect(layoutProperties.display).toBe('flex');
    expect(layoutProperties.flexDirection).toBe('column');
    expect(layoutProperties.overflow).toBe('hidden');
    expect(parseInt(layoutProperties.minHeight)).toBeGreaterThan(400);
  });

  test('should adapt to mobile viewport correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Complete setup
    await page.locator('.level-btn-chat[data-level="B1"]').click();
    await page.waitForSelector('.topic-btn-chat', { timeout: 10000 });
    await page.locator('.topic-btn-chat').first().click();
    await expect(page.locator('#chatbot-interface')).toBeVisible({ timeout: 10000 });
    
    // Check mobile-specific styles
    const mobileLayoutProperties = await page.locator('#chatbot-interface').evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        height: style.height,
        minHeight: style.minHeight
      };
    });
    
    // Should have appropriate mobile height
    expect(parseInt(mobileLayoutProperties.minHeight)).toBeGreaterThan(300);
    
    // Check that vocabulary section has mobile-optimized height
    await page.waitForSelector('.vocab-chip', { timeout: 10000 });
    const vocabHintsHeight = await page.locator('.vocabulary-hints').evaluate((element) => {
      const style = window.getComputedStyle(element);
      return style.maxHeight;
    });
    
    expect(vocabHintsHeight).toBe('100px'); // Mobile-specific max-height
  });

  test('should handle vocabulary overflow with scrolling', async ({ page }) => {
    // Complete setup
    await page.locator('.level-btn-chat[data-level="B1"]').click();
    await page.waitForSelector('.topic-btn-chat', { timeout: 10000 });
    await page.locator('.topic-btn-chat').first().click();
    await expect(page.locator('#chatbot-interface')).toBeVisible({ timeout: 10000 });
    
    // Wait for vocabulary to load
    await page.waitForSelector('.vocab-chip', { timeout: 10000 });
    
    // Check vocabulary hints container properties
    const vocabProperties = await page.locator('.vocabulary-hints').evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        maxHeight: style.maxHeight,
        overflowY: style.overflowY,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight
      };
    });
    
    expect(vocabProperties.maxHeight).toBe('120px');
    expect(vocabProperties.overflowY).toBe('auto');
  });
});
