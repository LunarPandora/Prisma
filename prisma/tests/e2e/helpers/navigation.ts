import { type Page, type Locator, expect } from '@playwright/test'

export const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000'
export const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

/**
 * Navigate to a specific dashboard module.
 */
export async function navigateToModule(page: Page, moduleKey: string) {
  await page.goto(`${FRONTEND_URL}/dashboard?module=${moduleKey}`)
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Wait for the dashboard to be fully loaded.
 * Uses the sidebar menu container (#navbar-menu) as the stable indicator.
 */
export async function waitForDashboard(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await expect(page.locator('#navbar-menu')).toBeVisible({ timeout: 15_000 })
}

/**
 * Wait for the login page to be ready.
 */
export async function waitForLogin(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 })
}

/**
 * Click a context menu trigger on a table row and return the menu.
 */
export async function openContextMenu(page: Page, rowText: string) {
  const row = page.getByRole('row').filter({ hasText: rowText })
  await row.hover()
  const menuBtn = row.getByRole('button').last()
  await menuBtn.click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible({ timeout: 5_000 })
  return menu
}

/**
 * Click a context menu item by text.
 */
export async function clickContextMenuItem(page: Page, menuItemText: string) {
  const menuItem = page.getByRole('menuitem', { name: menuItemText })
  await expect(menuItem).toBeVisible({ timeout: 5_000 })
  await menuItem.click()
}

/**
 * Assert a visible status badge text on the page.
 */
export async function expectStatusVisible(page: Page, statusText: string) {
  await expect(page.getByText(statusText).first()).toBeVisible({ timeout: 10_000 })
}

/**
 * Assert the page heading contains expected text.
 */
export async function expectHeading(page: Page, text: string) {
  await expect(page.getByRole('heading', { name: new RegExp(text, 'i') }).first()).toBeVisible({ timeout: 10_000 })
}

/**
 * Wait for a toast/success notification to appear.
 * The PRISMA toast container uses fixed positioning at bottom-right.
 */
export async function expectSuccessToast(page: Page, text?: string) {
  const toast = page.locator('.fixed.bottom-6.right-6 > div').first()
  if (text) {
    await expect(toast.getByText(text)).toBeVisible({ timeout: 10_000 })
  } else {
    await expect(toast).toBeVisible({ timeout: 10_000 })
  }
}

/**
 * Select a skema card by name and click an action button.
 */
export async function selectSkemaAction(page: Page, skemaName: string, action: 'Proposal' | 'Laporan') {
  const card = page.locator(`[data-highlight]`).filter({ hasText: skemaName })
  await expect(card).toBeVisible({ timeout: 10_000 })
  await card.getByRole('button', { name: new RegExp(action) }).click()
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Pick an option from a custom SelectInput dropdown.
 * The dropdown uses a custom <input> + <div> overlay pattern.
 * Options are <div><p>text</p></div> inside a div.absolute positioned dropdown.
 * For dataSource-based selects (async data), we wait for options to appear.
 */
export async function pickSelectOption(page: Page, placeholder: string, optionText: string) {
  const input = page.getByPlaceholder(placeholder)
  await input.click()
  await page.waitForTimeout(300)

  const filterText = optionText.slice(0, Math.min(8, optionText.length))
  await input.pressSequentially(filterText, { delay: 50 })
  await page.waitForTimeout(500)

  const dropdown = page.locator('div.absolute').first()

  const option = dropdown.locator('p').filter({ hasText: optionText }).first()
  if (await option.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await option.click()
    await page.waitForTimeout(300)
    return
  }

  await input.press('Enter')
  await page.waitForTimeout(300)
}
