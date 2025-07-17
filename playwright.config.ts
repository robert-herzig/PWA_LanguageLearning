import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for target browsers and devices */
  projects: [
    // Primary target: Desktop Chrome (main development)
    {
      name: 'chrome-desktop',
      use: { 
        ...devices['Desktop Chrome'], 
        channel: 'chrome' // Use actual Chrome browser
      },
    },

    // Primary target: Mobile Chrome Android (main mobile platform)
    {
      name: 'chrome-mobile',
      use: { 
        ...devices['Pixel 5'],
        // Android Chrome settings for PWA testing
      },
    },

    // Secondary: Mobile Chrome Android landscape (tablet-like usage)
    {
      name: 'chrome-mobile-landscape',
      use: { 
        ...devices['Pixel 5 landscape'],
      },
    },

    // PWA testing: Chrome with offline capabilities
    {
      name: 'chrome-pwa',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Enable PWA features
        permissions: ['notifications'],
        serviceWorkers: 'allow',
      },
    },

    // Optional: Firefox for compatibility check (reduced priority)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
