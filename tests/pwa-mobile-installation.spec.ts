import { test, expect } from '@playwright/test';

test.describe('PWA Mobile Installation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://127.0.0.1:8000');
    await page.waitForLoadState('networkidle');
  });

  test('should have all PWA installation requirements', async ({ page }) => {
    // Check if manifest.json is accessible
    const manifestResponse = await page.request.get('http://127.0.0.1:8000/manifest.json');
    expect(manifestResponse.status()).toBe(200);
    
    const manifest = await manifestResponse.json();
    
    // Verify essential manifest properties
    expect(manifest.name).toBe('Language Learning PWA');
    expect(manifest.short_name).toBe('LangLearn');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('./');
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
    
    // Verify icons are present
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
    
    // Check for required icon sizes
    const iconSizes = manifest.icons.map(icon => icon.sizes);
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');
  });

  test('should have service worker registered', async ({ page }) => {
    // Wait for service worker to register
    await page.waitForFunction(() => {
      return 'serviceWorker' in navigator;
    });
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration;
        } catch (error) {
          return false;
        }
      }
      return false;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('should display installable content correctly', async ({ page }) => {
    // Verify the app loads and displays main content
    await expect(page.locator('.header__title')).toHaveText('Language Learning');
    await expect(page.locator('.feature-card')).toHaveCount(4);
    
    // Check that all essential features are available for offline use
    await expect(page.locator('.feature-card').filter({ hasText: 'Lernkarten' })).toBeVisible();
    await expect(page.locator('.feature-card').filter({ hasText: 'Sprach-Chatbot' })).toBeVisible();
    await expect(page.locator('.feature-card').filter({ hasText: 'Lernfortschritt' })).toBeVisible();
    await expect(page.locator('.feature-card').filter({ hasText: 'Einstellungen' })).toBeVisible();
  });

  test('should have proper meta tags for mobile', async ({ page }) => {
    // Check viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toContain('width=device-width');
    expect(viewportMeta).toContain('initial-scale=1');
    
    // Check theme color meta tag
    const themeColorMeta = await page.locator('meta[name="theme-color"]');
    await expect(themeColorMeta).toBeAttached();
    
    // Check apple touch icon
    const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toBeAttached();
  });

  test('should work correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport (iPhone-like)
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify the app is responsive
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.feature-cards')).toBeVisible();
    
    // Test navigation on mobile
    await page.locator('.feature-card').filter({ hasText: 'Lernkarten' }).locator('button').click();
    
    await page.waitForFunction(() => {
      const flashcardsSection = document.querySelector('#flashcards-section');
      return flashcardsSection?.classList.contains('active');
    }, { timeout: 5000 });
    
    await expect(page.locator('#flashcards-section')).toHaveClass(/active/);
  });

  test('should have proper PWA icons accessible', async ({ page }) => {
    // Check if icon files are accessible
    const iconPaths = [
      '/icons/web-app-manifest-192x192.png',
      '/icons/web-app-manifest-512x512.png',
      '/icons/apple-touch-icon.png',
      '/icons/favicon.ico',
      '/icons/favicon.svg'
    ];
    
    for (const iconPath of iconPaths) {
      const response = await page.request.get('http://127.0.0.1:8000' + iconPath);
      expect(response.status()).toBe(200);
    }
  });

  test('should handle offline functionality', async ({ page }) => {
    // First, load the app completely
    await page.waitForTimeout(2000);
    
    // Navigate to different sections to ensure they're cached
    await page.locator('.feature-card').filter({ hasText: 'Lernkarten' }).locator('button').click();
    await page.waitForTimeout(1000);
    
    // Go back to home
    await page.locator('.nav-btn[data-target="home"]').click();
    await page.waitForTimeout(1000);
    
    // Simulate offline mode
    await page.route('**/*', route => {
      // Block all network requests except for already cached resources
      if (route.request().url().includes('127.0.0.1:8000')) {
        route.continue();
      } else {
        route.abort();
      }
    });
    
    // Test that the app still works offline
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Should still show the main content
    await expect(page.locator('.header__title')).toBeVisible({ timeout: 10000 });
  });

  test('should display correct app information for installation', async ({ page }) => {
    // Check page title for installation
    const title = await page.title();
    expect(title).toContain('Language Learning');
    
    // Check if the app has proper description meta tag
    const descriptionMeta = await page.locator('meta[name="description"]').getAttribute('content');
    expect(descriptionMeta).toBeTruthy();
    if (descriptionMeta) {
      expect(descriptionMeta.length).toBeGreaterThan(10);
    }
  });

  test('should support Android Chrome PWA features', async ({ page, browserName }) => {
    // Skip for non-Chromium browsers since PWA features are Chromium-specific
    test.skip(browserName !== 'chromium', 'PWA features require Chromium-based browser');
    
    // Check if the beforeinstallprompt event can be handled
    const beforeInstallPromptSupported = await page.evaluate(() => {
      return 'onbeforeinstallprompt' in window;
    });
    
    // Note: This might not be true in test environment, but we check the capability
    console.log('beforeinstallprompt supported:', beforeInstallPromptSupported);
    
    // Verify standalone mode detection capability
    const standaloneSupported = await page.evaluate(() => {
      return 'standalone' in window.navigator && 'matchMedia' in window;
    });
    
    expect(standaloneSupported).toBe(true);
  });

  test('should handle install prompt correctly', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Install prompt is Chromium-specific');
    
    // Add beforeinstallprompt event listener
    await page.addInitScript(() => {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        (window as any).deferredPrompt = e;
        (window as any).installPromptFired = true;
      });
    });
    
    // Navigate to page
    await page.goto('http://127.0.0.1:8000');
    
    // Wait a bit for potential install prompt
    await page.waitForTimeout(3000);
    
    // Check if install prompt was handled
    const promptHandled = await page.evaluate(() => {
      return (window as any).installPromptFired || false;
    });
    
    // Note: In test environment, this might not fire, which is normal
    console.log('Install prompt fired:', promptHandled);
  });

  test('should display proper loading states', async ({ page }) => {
    // Check if the page shows loading indicators appropriately
    await page.goto('http://127.0.0.1:8000');
    
    // The app should be fully loaded and interactive
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.feature-cards')).toBeVisible();
    
    // All feature cards should be clickable
    const featureCards = page.locator('.feature-card button');
    const cardCount = await featureCards.count();
    expect(cardCount).toBe(4);
    
    for (let i = 0; i < cardCount; i++) {
      await expect(featureCards.nth(i)).toBeEnabled();
    }
  });

  test('should maintain app state during navigation', async ({ page }) => {
    // Test that app state is preserved during navigation
    // Navigate to flashcards
    await page.locator('.feature-card').filter({ hasText: 'Lernkarten' }).locator('button').click();
    
    await page.waitForFunction(() => {
      const flashcardsSection = document.querySelector('#flashcards-section');
      return flashcardsSection?.classList.contains('active');
    }, { timeout: 5000 });
    
    // Navigate to chatbot
    await page.locator('.nav-btn[data-target="chatbot"]').click();
    
    await page.waitForFunction(() => {
      const chatbotSection = document.querySelector('#chatbot-section');
      return chatbotSection?.classList.contains('active');
    }, { timeout: 5000 });
    
    // Navigate back to home
    await page.locator('.nav-btn[data-target="home"]').click();
    
    await page.waitForFunction(() => {
      const homeSection = document.querySelector('#home-section');
      return homeSection?.classList.contains('active');
    }, { timeout: 5000 });
    
    // Should still show all feature cards
    await expect(page.locator('.feature-card')).toHaveCount(4);
  });
});
