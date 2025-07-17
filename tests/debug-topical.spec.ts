import { test, expect } from '@playwright/test';

test.describe('Debug Topical Mode', () => {
  test('should make topical mode visible after navigation', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8000');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take a screenshot of home page
    await page.screenshot({ path: 'test-results/debug-home.png', fullPage: true });
    
    // Navigate to flashcards section first
    await page.click('[data-navigate="flashcards"]');
    await page.waitForTimeout(1000);
    
    // Take a screenshot after navigation
    await page.screenshot({ path: 'test-results/debug-after-navigation.png', fullPage: true });
    
    // Check if the topical element is now visible
    const topicalElement = page.locator('[data-mode="topical"]');
    console.log('Element found:', await topicalElement.count());
    
    if (await topicalElement.count() > 0) {
      const isVisible = await topicalElement.isVisible();
      const isEnabled = await topicalElement.isEnabled();
      const boundingBox = await topicalElement.boundingBox();
      
      console.log('Element visible:', isVisible);
      console.log('Element enabled:', isEnabled);
      console.log('Element bounding box:', boundingBox);
      
      // Get computed styles
      const display = await topicalElement.evaluate(el => getComputedStyle(el).display);
      const visibility = await topicalElement.evaluate(el => getComputedStyle(el).visibility);
      const opacity = await topicalElement.evaluate(el => getComputedStyle(el).opacity);
      const pointerEvents = await topicalElement.evaluate(el => getComputedStyle(el).pointerEvents);
      
      console.log('CSS display:', display);
      console.log('CSS visibility:', visibility);
      console.log('CSS opacity:', opacity);
      console.log('CSS pointer-events:', pointerEvents);
      
      // Try to click if visible
      if (isVisible) {
        console.log('Trying to click topical mode...');
        await topicalElement.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/debug-after-click.png', fullPage: true });
      }
    }
    
    // Check console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    if (errors.length > 0) {
      console.log('Console errors:', errors);
    }
  });
});
