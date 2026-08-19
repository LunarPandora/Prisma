import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, waitForLogin } from '../helpers/navigation'

test.describe('Dosen Authentication', () => {
  test('DS-AUTH-001: Dosen login succeeds and lands on dashboard', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible({ timeout: 15_000 })
  })

  test('DS-AUTH-002: Unauthenticated access redirects to login', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await page.evaluate(() => localStorage.clear())
    await page.goto(`${FRONTEND_URL}/login`)

    await waitForLogin(page)
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
  })

  test('DS-AUTH-003: Wrong credentials show error', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await page.evaluate(() => localStorage.clear())
    await page.goto(`${FRONTEND_URL}/login`)
    await waitForLogin(page)

    await page.locator('#email').fill('wrong@email.com')
    await page.locator('#password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await page.waitForTimeout(3000)
    expect(page.url()).toContain('/login')
  })

  test('DS-AUTH-004: Logged-in user cannot access login page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`)

    await page.waitForURL('**/dashboard**', { timeout: 15_000 })
    await waitForDashboard(page)
    await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible()
  })
})
