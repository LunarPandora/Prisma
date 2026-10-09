import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8000';
const CONFIG_DIR = __dirname;

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: FRONTEND_URL,
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    extraHTTPHeaders: { 'Accept-Language': 'id-ID,id;q=0.9' },
  },
  projects: [
    {
      name: 'auth-setup-superadmin',
      testMatch: /auth\.superadmin\.setup\.ts$/,
    },
    {
      name: 'auth-setup-staff',
      testMatch: /auth\.staff\.setup\.ts$/,
    },
    {
      name: 'auth-setup-ketua',
      testMatch: /auth\.ketua\.setup\.ts$/,
    },
    {
      name: 'auth-setup-dosen',
      testMatch: /auth\.dosen\.setup\.ts$/,
    },
    {
      name: 'auth-setup-reviewer',
      testMatch: /auth\.reviewer\.setup\.ts$/,
    },
    {
      name: 'rbb-um',
      testMatch: /um\.spec\.ts$/,
    },
    {
      name: 'rbb-sa',
      testMatch: /superadmin\/.*\.spec\.ts$/,
      dependencies: ['auth-setup-superadmin'],
      use: { storageState: path.resolve(CONFIG_DIR, '.auth/superadmin.json') },
    },
    {
      name: 'rbb-st',
      testMatch: /staff\/.*\.spec\.ts$/,
      dependencies: ['auth-setup-staff'],
      use: { storageState: path.resolve(CONFIG_DIR, '.auth/staff.json') },
    },
    {
      name: 'rbb-kt',
      testMatch: /ketua\/.*\.spec\.ts$/,
      dependencies: ['auth-setup-ketua'],
      use: { storageState: path.resolve(CONFIG_DIR, '.auth/ketua.json') },
    },
    {
      name: 'rbb-ds',
      testMatch: /dosen\/.*\.spec\.ts$/,
      dependencies: ['auth-setup-dosen'],
      use: { storageState: path.resolve(CONFIG_DIR, '.auth/dosen.json') },
    },
    {
      name: 'rbb-rv',
      testMatch: /reviewer\/.*\.spec\.ts$/,
      dependencies: ['auth-setup-reviewer'],
      use: { storageState: path.resolve(CONFIG_DIR, '.auth/reviewer.json') },
    },
  ],
  webServer: [
    {
      command: `cd ../prisma-server && APP_ENV=testing php artisan serve --port=8000`,
      port: 8000,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: `cd .. && npm run dev`,
      port: 3000,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  outputDir: '../test-results/artifacts-rbb',
});
