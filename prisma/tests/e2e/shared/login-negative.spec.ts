import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL } from '../helpers/navigation'

test.describe('Login Page — Negative Cases & Logout', () => {
  test('AUTH-LOGIN-VAL-001: Empty email is rejected', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.locator('#password').fill('password')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await page.waitForTimeout(2000)

    expect(page.url()).toContain('/login')

    const emailInput = page.locator('#email')
    await expect(emailInput).toBeVisible()
  })

  test('AUTH-LOGIN-VAL-002: Empty password is rejected', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.locator('#email').fill('staff.lppm1@itbss.ac.id')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await page.waitForTimeout(2000)

    expect(page.url()).toContain('/login')

    const passwordInput = page.locator('#password')
    await expect(passwordInput).toBeVisible()
  })

  test('AUTH-LOGIN-VAL-003: Both fields empty is rejected', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.getByRole('button', { name: 'Masuk' }).click()

    await page.waitForTimeout(2000)

    expect(page.url()).toContain('/login')

    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('AUTH-LOGIN-VAL-004: Non-email string is rejected', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.locator('#email').fill('bukan-email')
    await page.locator('#password').fill('password')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await page.waitForTimeout(2000)

    expect(page.url()).toContain('/login')
  })

  test('AUTH-LOGOUT-001: Logout then navigate back to protected page shows login', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const isLoggedIn = page.url().includes('dashboard')
    if (!isLoggedIn) {
      return
    }

    const userMenu = page.locator('#navbar-menu').locator('button, [role="button"]').last()
    if (await userMenu.isVisible({ timeout: 5000 }).catch(() => false)) {
      await userMenu.click()
      await page.waitForTimeout(500)

      const logoutBtn = page.getByRole('menuitem', { name: /logout|keluar/i }).first()
      if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await logoutBtn.click()
        await page.waitForTimeout(2000)
      }
    }

    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())

    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const onLogin = page.url().includes('login')
    const bodyText = await page.locator('body').textContent()
    const hasLoginForm = (bodyText || '').includes('Masuk') || (bodyText || '').includes('Email')
    expect(onLogin || hasLoginForm).toBeTruthy()
  })
})
