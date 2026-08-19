import { test as setup, expect } from '@playwright/test'

const authFile = 'tests/thesis-screenshots/.auth/ketua.json'

setup('authenticate as Ketua LPPM', async ({ page }) => {
  const baseURL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000'

  await page.goto(`${baseURL}/login`)
  await page.waitForLoadState('domcontentloaded')
  await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 })

  await page.locator('#email').fill('ketua.lppm@itbss.ac.id')
  await page.locator('#password').fill('password')
  await page.getByRole('button', { name: 'Masuk' }).click()

  await page.waitForURL('**/dashboard**', { timeout: 30_000 })
  await expect(page.locator('#navbar-menu')).toBeVisible({ timeout: 15_000 })

  await page.context().storageState({ path: authFile })
})
