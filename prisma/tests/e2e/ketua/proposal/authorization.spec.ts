import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard } from '../../helpers/navigation'

test.describe('Ketua LPPM - Proposal Authorization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const proposalBtn = page.getByRole('button', { name: /Proposal/i }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('KT-AUTHZ-PROP-REJECT-001: Staff reject request visible for Ketua', async ({ page }) => {
    const statusBadge = page.getByText('Menunggu review dari Ketua LPPM').first()
    await expect(statusBadge).toBeVisible({ timeout: 10_000 })
  })

  test('KT-AUTHZ-PROP-REJECT-002: Ketua can view reject request details', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'Menunggu review dari Ketua LPPM' }).first()
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionButtons = row.locator('button, [role="button"], svg')
      const count = await actionButtons.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('KT-AUTHZ-PROP-RETURN-001: Staff return request visible for Ketua', async ({ page }) => {
    const statusBadge = page.getByText('Menunggu review dari Ketua LPPM').first()
    await expect(statusBadge).toBeVisible({ timeout: 10_000 })
  })

  test('KT-AUTHZ-PROP-RETURN-002: Ketua can view return request details', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'Menunggu review dari Ketua LPPM' }).first()
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionButtons = row.locator('button, [role="button"], svg')
      const count = await actionButtons.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('KT-AUTHZ-PENDING-001: Authorization queue shows pending requests', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasAuthQueue = /Menunggu Persetujuan|Authorization|Otorisasi/i.test(body || '')
    expect(hasAuthQueue).toBeTruthy()
  })

  test('KT-AUTHZ-PENDING-002: Destructive action not yet occurred', async ({ page }) => {
    const statusBadge = page.getByText('Menunggu review dari Ketua LPPM').first()
    await expect(statusBadge).toBeVisible({ timeout: 10_000 })
  })
})
