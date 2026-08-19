import { defineConfig, devices } from '@playwright/test'

const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8000'
const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000'

/**
 * Playwright config for thesis screenshot capture.
 * SEPARATE from the regression test suite — does not modify regression baseline.
 *
 * Usage:
 *   npx playwright test --config=playwright.thesis.config.ts
 *
 * To run a specific group:
 *   npx playwright test --config=playwright.thesis.config.ts --grep "Auth"
 */
export default defineConfig({
  testDir: './tests/thesis-screenshots',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    baseURL: FRONTEND_URL,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    screenshot: 'off',
    trace: 'off',
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
  },
  projects: [
    // Auth setup projects — reuse existing E2E auth patterns
    {
      name: 'auth-staff',
      testMatch: /auth-staff\.setup\.ts$/,
    },
    {
      name: 'auth-dosen',
      testMatch: /auth-dosen\.setup\.ts$/,
    },
    {
      name: 'auth-ketua',
      testMatch: /auth-ketua\.setup\.ts$/,
    },
    {
      name: 'auth-reviewer',
      testMatch: /auth-reviewer\.setup\.ts$/,
    },
    {
      name: 'auth-superadmin',
      testMatch: /auth-superadmin\.setup\.ts$/,
    },
    // Screenshot groups — depend on auth setup
    {
      name: 'thesis-screenshots',
      testMatch: /thesis-screenshots\.spec\.ts$/,
      dependencies: ['auth-staff', 'auth-dosen', 'auth-ketua', 'auth-reviewer', 'auth-superadmin'],
    },
  ],
  webServer: [
    {
      command: 'cd ../prisma-server && APP_ENV=testing php artisan serve --port=8000',
      url: `${BACKEND_URL}/sanctum/csrf-cookie`,
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npm run dev',
      url: FRONTEND_URL,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
  outputDir: '../test-results/thesis-artifacts',
})
