import { Page, expect } from '@playwright/test'

export const REVIEWER_URL = '/dashboard?module=reviewproposal'

export async function openReviewProposalTab(page: Page) {
  await page.goto(REVIEWER_URL)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(3000)
}

export async function openReviewLaporanTab(page: Page) {
  await page.goto(REVIEWER_URL)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(3000)
  const laporanTab = page.getByRole('button', { name: 'Review Laporan' })
  await laporanTab.click()
  await page.waitForTimeout(2000)
}

export async function openReviewFormForRow(page: Page, rowText: string) {
  const row = page.getByRole('row').filter({ hasText: rowText }).first()
  await expect(row).toBeVisible({ timeout: 10_000 })

  const actionBtn = row.locator('button').filter({ has: page.locator('svg[data-icon="clipboard-list"]') }).first()
  await expect(actionBtn).toBeVisible({ timeout: 5_000 })
  await actionBtn.click()
  await page.waitForTimeout(3000)
}

export async function fillScores(page: Page, scores: number[]) {
  const inputs = page.locator('input[inputmode="numeric"]')
  const count = await inputs.count()
  expect(count).toBe(scores.length)

  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i)
    await input.click({ clickCount: 3 })
    await input.fill(String(scores[i]))
    await page.waitForTimeout(200)
  }
}

export async function fillCatatan(page: Page, text: string) {
  const textarea = page.locator('textarea').first()
  await expect(textarea).toBeVisible()
  await textarea.fill(text)
}

export async function selectKeputusan(page: Page, option: string) {
  const selectInput = page.locator('input[placeholder="Pilih keputusan reviewer"]')
  await expect(selectInput).toBeVisible()
  await selectInput.click()
  await selectInput.fill(option)
  await page.waitForTimeout(500)

  const optionEl = page.locator(`text="${option}"`).first()
  await optionEl.click()
  await page.waitForTimeout(300)
}

export async function checkFirstKesesuaianTema(page: Page) {
  const checkboxes = page.locator('input[type="checkbox"]')
  const count = await checkboxes.count()
  if (count > 0) {
    await checkboxes.first().check()
  }
}

export async function submitReview(page: Page) {
  const submitBtn = page.getByRole('button', { name: /submit review/i })
  await expect(submitBtn).toBeVisible()
  await submitBtn.click()
  await page.waitForTimeout(3000)
}

export async function fillAndSubmitReview(
  page: Page,
  scores: number[],
  catatan: string,
  keputusan: string = 'Diterima'
) {
  await fillScores(page, scores)
  await fillCatatan(page, catatan)
  await selectKeputusan(page, keputusan)
  await checkFirstKesesuaianTema(page)
  await submitReview(page)
}

export async function closeModal(page: Page) {
  const backBtn = page.getByRole('button', { name: /kembali/i })
  if (await backBtn.isVisible().catch(() => false)) {
    await backBtn.click()
    await page.waitForTimeout(1000)
  }
}
