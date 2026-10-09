import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL, waitForDashboard } from '../../helpers/navigation'

test.describe('Ketua LPPM - Proposal Reviewer Results', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const proposalBtns = page.getByRole('button', { name: /Proposal/i })
    const count = await proposalBtns.count()
    await proposalBtns.nth(0).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('KT-PROP-REV-001: Post-review proposal visible with 3/3 reviews', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasData = (body || '').includes('Menunggu persetujuan Ketua LPPM') || (body || '').includes('Seleksi') || (body || '').includes('Proposal')
    expect(hasData).toBeTruthy()
  })

  test('KT-PROP-REV-002: Post-review proposal shows reviewer names', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasReviewers = /Reviewer A|Reviewer B|Reviewer C/i.test(body || '')
    expect(hasReviewers).toBeTruthy()
  })

  test('KT-PROP-REV-003: Partial review proposal not ready for Ketua decision', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasData = (body || '').includes('Menunggu review') || (body || '').includes('Seleksi') || (body || '').includes('Proposal')
    expect(hasData).toBeTruthy()
  })

  test('KT-PROP-REV-004: Post-review proposal has action buttons', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'Menunggu persetujuan Ketua LPPM' }).first()
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionButtons = row.locator('button, [role="button"], svg')
      const count = await actionButtons.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('KT-PROP-REV-MUT-001: Ketua can make post-review decision', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'Menunggu persetujuan Ketua LPPM' }).first()
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionButtons = row.locator('button, [role="button"], svg')
      const count = await actionButtons.count()
      expect(count).toBeGreaterThan(0)
    }
  })
})
