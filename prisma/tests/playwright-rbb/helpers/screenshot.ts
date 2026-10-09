import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'tests/playwright-rbb/screenshots-rbb');

export function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

export async function screenshot(page: Page, testId: string, label: string) {
  ensureScreenshotDir();
  const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 80);
  const filePath = path.join(SCREENSHOT_DIR, `${testId}__${safeLabel}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
}
