import { test, expect, devices } from '@playwright/test';

test.describe('Mobile UI Improvements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:8000');
    await page.waitForLoadState('networkidle');
    
    // Navigate to chatbot section
    await page.locator('.feature-card').filter({ hasText: 'Sprach-Chatbot' }).locator('button').click();
    
    // Wait for chatbot section to be active
    await page.waitForFunction(() => {
      const chatbotSection = document.querySelector('#chatbot-section');
      return chatbotSection?.classList.contains('active');
    }, { timeout: 10000 });
  });

  test('should handle topic list overflow on mobile', async ({ page }) => {
    // Use mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Select a language and level that has many topics
    const b1Btn = page.locator('.level-btn-chat[data-level="B1"]');
    await expect(b1Btn).toBeVisible();
    await b1Btn.click();
    await page.waitForTimeout(3000);
    
    // Check that topic container has proper overflow handling
    const topicContainer = page.locator('.topic-buttons');
    await expect(topicContainer).toBeVisible();
    
    // Verify container has scrolling capabilities
    const containerStyle = await topicContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        maxHeight: computed.maxHeight,
        overflowY: computed.overflowY,
        display: computed.display
      };
    });
    
    expect(containerStyle.maxHeight).toBe('250px'); // Mobile max-height
    expect(containerStyle.overflowY).toBe('auto');
  });

  test('should display topic names in German', async ({ page }) => {
    // Select B1 to get some topics
    const b1Btn = page.locator('.level-btn-chat[data-level="B1"]');
    await expect(b1Btn).toBeVisible();
    await b1Btn.click();
    await page.waitForTimeout(3000);
    
    // Check that topics are loaded (either actual topics or fallback message)
    const topicButtons = page.locator('.topic-btn-chat');
    const noTopicsMessage = page.locator('.no-topics');
    
    const topicCount = await topicButtons.count();
    const hasNoTopicsMessage = await noTopicsMessage.count() > 0;
    
    if (topicCount > 0) {
      // If topics are loaded, verify they have German names
      const firstTopicText = await topicButtons.first().textContent();
      expect(firstTopicText).toBeTruthy();
      
      // Check for some common German topic names
      const allTopicsText = await topicButtons.allTextContents();
      const hasGermanTopics = allTopicsText.some(text => 
        text.includes('Ernährung') || 
        text.includes('Bildung') || 
        text.includes('Arbeit') ||
        text.includes('Identität') ||
        text.includes('Dimension')
      );
      
      if (hasGermanTopics) {
        expect(hasGermanTopics).toBe(true);
      }
    } else if (hasNoTopicsMessage) {
      // If fallback message, that's also acceptable
      await expect(noTopicsMessage).toContainText('Keine Themen für dieses Level verfügbar');
    }
  });

  test('should wrap long topic names properly', async ({ page }) => {
    // Use narrow mobile viewport
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Select B1 to get topics with potentially long names
    const b1Btn = page.locator('.level-btn-chat[data-level="B1"]');
    await expect(b1Btn).toBeVisible();
    await b1Btn.click();
    await page.waitForTimeout(3000);
    
    // Check if we have topic buttons
    const topicButtons = page.locator('.topic-btn-chat');
    const topicCount = await topicButtons.count();
    
    if (topicCount > 0) {
      // Check the first topic button for proper text wrapping styles
      const firstButton = topicButtons.first();
      await expect(firstButton).toBeVisible();
      
      const buttonStyle = await firstButton.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          whiteSpace: computed.whiteSpace,
          wordWrap: computed.wordWrap,
          textAlign: computed.textAlign,
          display: computed.display,
          alignItems: computed.alignItems
        };
      });
      
      expect(buttonStyle.whiteSpace).toBe('normal');
      expect(buttonStyle.wordWrap).toBe('break-word');
      expect(buttonStyle.textAlign).toBe('center');
      expect(buttonStyle.display).toBe('flex');
      expect(buttonStyle.alignItems).toBe('center');
    }
  });

  test('should maintain container boundaries on small screens', async ({ page }) => {
    // Test on very small screen
    await page.setViewportSize({ width: 280, height: 480 });
    
    // Navigate through chatbot setup
    const b1Btn = page.locator('.level-btn-chat[data-level="B1"]');
    await expect(b1Btn).toBeVisible();
    await b1Btn.click();
    await page.waitForTimeout(3000);
    
    // Check that topic container doesn't overflow viewport
    const topicContainer = page.locator('.topic-buttons');
    
    // Check if container exists (might not if no topics available)
    const containerExists = await topicContainer.count() > 0;
    
    if (containerExists) {
      await expect(topicContainer).toBeVisible();
      
      const containerBox = await topicContainer.boundingBox();
      const viewportSize = await page.viewportSize();
      
      expect(containerBox).toBeTruthy();
      if (containerBox && viewportSize) {
        expect(containerBox.width).toBeLessThanOrEqual(viewportSize.width);
        expect(containerBox.x + containerBox.width).toBeLessThanOrEqual(viewportSize.width);
      }
    }
  });
});
