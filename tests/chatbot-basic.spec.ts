import { test, expect } from '@playwright/test';

test.describe('Chatbot Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://127.0.0.1:8000');
    
    // Wait for the app to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Navigate to chatbot section
    await page.locator('.feature-card').filter({ hasText: 'Sprach-Chatbot' }).locator('button').click();
    
    // Wait for chatbot section to be active
    await page.waitForFunction(() => {
      const chatbotSection = document.querySelector('#chatbot-section');
      return chatbotSection?.classList.contains('active');
    }, { timeout: 10000 });
  });

  test('should load chatbot interface correctly', async ({ page }) => {
    // Check basic chatbot setup
    await expect(page.locator('#chatbot-setup')).toBeVisible();
    await expect(page.locator('.level-btn-chat')).toHaveCount(3);
  });

  test('should allow basic level selection', async ({ page }) => {
    // Select B1 level
    await page.locator('.level-btn-chat[data-level="B1"]').click();
    
    // Check if level is selected
    await expect(page.locator('.level-btn-chat[data-level="B1"]')).toHaveClass(/selected/);
    
    // Check if topic step becomes visible
    await expect(page.locator('#topic-step')).toBeVisible();
  });

  test('should handle missing vocabulary gracefully', async ({ page }) => {
    // Select level
    await page.locator('.level-btn-chat[data-level="B1"]').click();
    await page.waitForTimeout(3000);
    
    // Check if topics loaded or fallback message appears
    const topicButtons = page.locator('.topic-btn-chat');
    const noTopicsMessage = page.locator('.no-topics');
    
    const topicCount = await topicButtons.count();
    const hasNoTopicsMessage = await noTopicsMessage.count() > 0;
    
    // Either topics loaded or fallback message shown
    expect(topicCount > 0 || hasNoTopicsMessage).toBe(true);
  });

  test('should display correct level buttons', async ({ page }) => {
    // Verify all level buttons are present with correct content
    await expect(page.locator('.level-btn-chat[data-level="A2"]')).toContainText('A2');
    await expect(page.locator('.level-btn-chat[data-level="B1"]')).toContainText('B1');
    await expect(page.locator('.level-btn-chat[data-level="B2"]')).toContainText('B2');
  });

  test('should maintain UI state during interactions', async ({ page }) => {
    // Test that the interface responds correctly
    const levelBtn = page.locator('.level-btn-chat[data-level="B2"]');
    
    // Click level button
    await levelBtn.click();
    
    // Verify state change
    await expect(levelBtn).toHaveClass(/selected/);
    
    // Verify other buttons don't have selected class
    await expect(page.locator('.level-btn-chat[data-level="A2"]')).not.toHaveClass(/selected/);
    await expect(page.locator('.level-btn-chat[data-level="B1"]')).not.toHaveClass(/selected/);
  });

  test('should show topic step after level selection', async ({ page }) => {
    // Initially topic step should be hidden
    await expect(page.locator('#topic-step')).not.toBeVisible();
    
    // Select level
    await page.locator('.level-btn-chat[data-level="A2"]').click();
    
    // Topic step should become visible
    await expect(page.locator('#topic-step')).toBeVisible();
  });

  test('should load chatbot JavaScript correctly', async ({ page }) => {
    // Check if chatbot class is initialized
    const chatbotExists = await page.evaluate(() => {
      return typeof (window as any).languageChatbot !== 'undefined';
    });
    
    expect(chatbotExists).toBe(true);
  });

  test('should handle console errors gracefully', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Interact with the interface
    await page.locator('.level-btn-chat[data-level="B1"]').click();
    await page.waitForTimeout(2000);
    
    // Check that no critical errors occurred
    const criticalErrors = consoleErrors.filter((error: string) => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('Failed to load resource')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
