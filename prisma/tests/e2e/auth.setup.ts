import { test as setup, expect } from '@playwright/test'

const authFile = 'tests/e2e/.auth/staff.json'

setup('authenticate as Staff LPPM', async ({ page }) => {
  const baseURL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000'

  await page.goto(`${baseURL}/login`)
  await page.waitForLoadState('domcontentloaded')

  // Wait for the login form to be ready
  await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 })

  await page.locator('#email').fill('staff.lppm1@itbss.ac.id')
  await page.locator('#password').fill('password')

  // Submit — the frontend's handleLogin() calls initAuth() (CSRF cookie) then POST /login
  await page.getByRole('button', { name: 'Masuk' }).click()

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 30_000 })

  // Wait for the sidebar menu to appear (proves app shell loaded)
  await expect(page.locator('#navbar-menu')).toBeVisible({ timeout: 15_000 })

  // Save auth state (cookies + localStorage)
  await page.context().storageState({ path: authFile })
})
