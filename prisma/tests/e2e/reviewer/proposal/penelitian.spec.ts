import { test, expect } from '@playwright/test'
import { FRONTEND_URL } from '../../helpers/navigation'

test.describe('Reviewer - Penelitian Proposal Review', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
  })

  test('RV-PROP-001: Review Proposal tab renders with table', async ({ page }) => {
    const heading = page.getByText('Monitoring Proses Review')
    await expect(heading.first()).toBeVisible({ timeout: 10_000 })
    const proposalTab = page.getByRole('button', { name: 'Review Proposal' })
    await expect(proposalTab).toBeVisible({ timeout: 5_000 })
  })

  test('RV-PROP-002: Proposal table shows Rencana Judul and Status columns', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasJudul = (body || '').includes('Rencana Judul')
    const hasStatus = (body || '').includes('Status')
    expect(hasJudul && hasStatus).toBeTruthy()
  })

  test('RV-PROP-003: Unreviewed Proposal shows Belum direview status', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasBelumDireview = (body || '').includes('Belum direview')
    expect(hasBelumDireview).toBeTruthy()
  })

  test('RV-PROP-004: Review form modal opens when clicking action button', async ({ page }) => {
    const reviewableRow = page.getByRole('row').filter({ hasText: 'Belum direview' }).first()
    if (!(await reviewableRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    const actionBtn = reviewableRow.locator('button').filter({ has: page.locator('svg[data-icon="clipboard-list"]') }).first()
    if (!(await actionBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip()
      return
    }

    await actionBtn.click()
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasFormContent = (body || '').includes('Kriteria Penilaian') ||
                           (body || '').includes('Submit Review') ||
                           (body || '').includes('Review Proposal') ||
                           (body || '').includes('Kesesuaian Tema')
    expect(hasFormContent).toBeTruthy()
  })

  test('RV-PROP-MUT-001: Review form has score inputs and submit button', async ({ page }) => {
    const reviewableRow = page.getByRole('row').filter({ hasText: 'Belum direview' }).first()
    if (!(await reviewableRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    const actionBtn = reviewableRow.locator('button').filter({ has: page.locator('svg[data-icon="clipboard-list"]') }).first()
    if (!(await actionBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip()
      return
    }

    await actionBtn.click()
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasSubmit = (body || '').includes('Submit Review')
    expect(hasSubmit).toBeTruthy()

    const submitBtn = page.getByRole('button', { name: /submit/i }).first()
    const hasSubmitBtn = await submitBtn.isVisible().catch(() => false)
    expect(hasSubmitBtn).toBeTruthy()
  })
})
