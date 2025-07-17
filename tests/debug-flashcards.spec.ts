import { test, expect } from '@playwright/test';

test.describe('Flashcards Debug Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console logs and errors
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    // Start development server manually before running tests
    await page.goto('http://127.0.0.1:8000');
  });

  test('debug flashcards navigation in detail', async ({ page }) => {
    console.log('Starting flashcards navigation debug test');
    
    // Check initial state
    const homeInitiallyActive = await page.evaluate(() => {
      const homeSection = document.querySelector('#home-section');
      const flashcardsSection = document.querySelector('#flashcards-section');
      return {
        homeActive: homeSection?.classList.contains('active'),
        flashcardsActive: flashcardsSection?.classList.contains('active'),
        homeClasses: homeSection?.className,
        flashcardsClasses: flashcardsSection?.className
      };
    });
    console.log('Initial state:', homeInitiallyActive);
    
    // Click on flashcards feature card
    console.log('About to click flashcards feature card');
    await page.locator('.feature-card').filter({ hasText: 'Lernkarten' }).locator('button').click();
    
    // Wait a bit and check state
    await page.waitForTimeout(2000);
    
    const stateAfterClick = await page.evaluate(() => {
      const homeSection = document.querySelector('#home-section');
      const flashcardsSection = document.querySelector('#flashcards-section');
      return {
        homeActive: homeSection?.classList.contains('active'),
        flashcardsActive: flashcardsSection?.classList.contains('active'),
        homeClasses: homeSection?.className,
        flashcardsClasses: flashcardsSection?.className,
        homeVisible: homeSection ? window.getComputedStyle(homeSection).display !== 'none' : false,
        flashcardsVisible: flashcardsSection ? window.getComputedStyle(flashcardsSection).display !== 'none' : false
      };
    });
    console.log('State after click:', stateAfterClick);
    
    // Check if mode cards are present
    const modeCardsCount = await page.locator('.mode-card').count();
    console.log('Mode cards count:', modeCardsCount);
    
    if (modeCardsCount > 0) {
      const modeCardText = await page.locator('.mode-card').first().textContent();
      console.log('First mode card text:', modeCardText);
    }
    
    // Try to trigger navigation manually via JavaScript
    console.log('Triggering navigation manually...');
    await page.evaluate(() => {
      // Manually trigger showSection method if available
      const win = window as any;
      if (win.app && win.app.showSection) {
        win.app.showSection('flashcards');
      }
    });
    
    await page.waitForTimeout(1000);
    
    const stateAfterManualTrigger = await page.evaluate(() => {
      const homeSection = document.querySelector('#home-section');
      const flashcardsSection = document.querySelector('#flashcards-section');
      return {
        homeActive: homeSection?.classList.contains('active'),
        flashcardsActive: flashcardsSection?.classList.contains('active'),
        homeClasses: homeSection?.className,
        flashcardsClasses: flashcardsSection?.className
      };
    });
    console.log('State after manual trigger:', stateAfterManualTrigger);
  });
});
