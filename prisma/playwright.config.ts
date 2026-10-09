import { defineConfig, devices } from '@playwright/test'

const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8000'
const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: FRONTEND_URL,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'auth-dosen-setup',
      testMatch: /auth\.dosen\.setup\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'auth-ketua-setup',
      testMatch: /auth\.ketua\.setup\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'auth-reviewer-setup',
      testMatch: /auth\.reviewer\.setup\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'auth-superadmin-setup',
      testMatch: /auth\.superadmin\.setup\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'staff-lppm',
      testMatch: /staff\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/staff.json',
      },
      dependencies: ['auth-setup'],
    },
    {
      name: 'dosen',
      testMatch: /dosen\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/dosen.json',
      },
      dependencies: ['auth-dosen-setup'],
    },
    {
      name: 'ketua',
      testMatch: /ketua\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/ketua.json',
      },
      dependencies: ['auth-ketua-setup'],
    },
    {
      name: 'reviewer',
      testMatch: /reviewer\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/reviewer.json',
      },
      dependencies: ['auth-reviewer-setup'],
    },
    {
      name: 'superadmin',
      testMatch: /superadmin\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/superadmin.json',
      },
      dependencies: ['auth-superadmin-setup'],
    },
    {
      name: 'shared-guest',
      testMatch: /shared\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'screenshots',
      testMatch: /screenshots\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
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
  outputDir: '../test-results/artifacts',
})
