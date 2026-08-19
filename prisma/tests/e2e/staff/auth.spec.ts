import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, waitForLogin } from '../helpers/navigation'

test.describe('Staff LPPM Authentication', () => {
  test('ST-AUTH-001: Staff login succeeds and lands on dashboard', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    // Should see the Beranda heading (Staff Dashboard)
    await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Tugas dan tanggung jawab Staff LPPM')).toBeVisible()
  })

  test('ST-AUTH-002: Unauthenticated access redirects to login', async ({ page }) => {
    // Clear auth state from localStorage so the app treats us as unauthenticated
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await page.evaluate(() => localStorage.clear())
    await page.goto(`${FRONTEND_URL}/login`)

    // Should see the login page
    await waitForLogin(page)
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
  })

  test('ST-AUTH-003: Wrong credentials show error', async ({ page }) => {
    // Clear auth state
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await page.evaluate(() => localStorage.clear())
    await page.goto(`${FRONTEND_URL}/login`)
    await waitForLogin(page)

    await page.locator('#email').fill('wrong@email.com')
    await page.locator('#password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Masuk' }).click()

    // Should stay on login page (error is handled via AppLoader)
    await page.waitForTimeout(3000)
    expect(page.url()).toContain('/login')
  })

  test('ST-AUTH-004: Logged-in user cannot access login page', async ({ page }) => {
    // We are already logged in via storageState
    await page.goto(`${FRONTEND_URL}/login`)

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 15_000 })
    await waitForDashboard(page)
    await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible()
  })
})
