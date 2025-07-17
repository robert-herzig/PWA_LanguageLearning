import { test, expect } from '@playwright/test';

test.describe('Debug Simple', () => {
  test('should load app and take screenshot', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8000');
    
    // Wait a bit for the page to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/debug-simple.png', fullPage: true });
    
    // Check if the element exists
    const topicalElement = page.locator('[data-mode="topical"]');
    console.log('Element found:', await topicalElement.count());
    
    // Get element visibility info
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
      
      console.log('CSS display:', display);
      console.log('CSS visibility:', visibility);
      console.log('CSS opacity:', opacity);
    }
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if any errors occurred
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    if (errors.length > 0) {
      console.log('Console errors:', errors);
    }
  });
});
