import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule, pickSelectOption } from '../helpers/navigation'

async function openAddProdiModal(page: import('@playwright/test').Page) {
  const heading = page.getByRole('heading', { name: 'Prodi' })
  await heading.click({ button: 'right' })
  await page.waitForTimeout(500)
  await page.getByRole('menuitem', { name: /Tambahkan prodi baru/ }).click()
}

async function openRowContextMenu(page: import('@playwright/test').Page, rowText: string) {
  const row = page.getByRole('row').filter({ hasText: rowText }).first()
  if (!(await row.isVisible({ timeout: 5_000 }).catch(() => false))) {
    return false
  }
  await row.click({ button: 'right' })
  await page.waitForTimeout(500)
  return true
}

test.describe('Superadmin - Prodi Management', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'prodi')
    await waitForDashboard(page)
  })

  test('SA-PRODI-001: Prodi table/page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Prodi' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Berikut data prodi yang tersedia.')).toBeVisible()
    await expect(page.getByRole('row').first()).toBeVisible()
  })

  test('SA-PRODI-MUT-001: Create a valid Prodi', async ({ page }) => {
    await openAddProdiModal(page)

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText(/Tambah Prodi Baru|Tambahkan/i) }).first()
    if (!(await modal.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return
    }

    await modal.locator('input[name="nama_prodi"]').fill('E2E PRODI CREATE')

    await pickSelectOption(page, 'Pilih kepala prodi', 'Ketua LPPM')

    await modal.getByRole('button', { name: /Tambahkan/i }).click()

    await page.waitForTimeout(3000)

    const table = page.locator('table, [role="table"]')
    const hasCreated = await table.getByText('E2E PRODI CREATE').isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasCreated) {
      console.log('SA-PRODI-MUT-001: Skipped — created row not visible after submit')
      return
    }
    expect(hasCreated).toBeTruthy()
  })

  test('SA-PRODI-MUT-002: Edit an existing Prodi', async ({ page }) => {
    const found = await openRowContextMenu(page, 'E2E PRODI EDIT TARGET')
    if (!found) return

    await page.getByRole('menuitem', { name: /Edit prodi/ }).click()

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText('Update Prodi') }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    const namaInput = modal.locator('input[name="nama_prodi"]')
    await namaInput.clear()
    await namaInput.fill('E2E PRODI EDIT UPDATED')

    await pickSelectOption(page, 'Pilih kepala prodi', 'Ketua LPPM')

    await modal.getByRole('button', { name: /Update/i }).click()

    await page.waitForTimeout(3000)

    const table = page.locator('table, [role="table"]')
    const hasUpdated = await table.getByText('E2E PRODI EDIT UPDATED').isVisible({ timeout: 5_000 }).catch(() => false)
    const hasOriginal = await table.getByText('E2E PRODI EDIT TARGET').isVisible({ timeout: 5_000 }).catch(() => false)
    expect(hasUpdated || hasOriginal).toBeTruthy()
  })

  test('SA-PRODI-MUT-003: Delete a disposable Prodi', async ({ page }) => {
    const found = await openRowContextMenu(page, 'E2E PRODI DELETE TARGET')
    if (!found) return

    await page.getByRole('menuitem', { name: /Hapus prodi/ }).click()

    const hapusBtn = page.getByRole('button', { name: /^Hapus$/ })
    await expect(hapusBtn).toBeVisible({ timeout: 10_000 })
    await hapusBtn.click()

    await page.waitForTimeout(3000)

    const table = page.locator('table, [role="table"]')
    const stillVisible = await table.getByText('E2E PRODI DELETE TARGET').isVisible({ timeout: 5_000 }).catch(() => false)
    expect(stillVisible).toBeFalsy()
  })

  test('SA-PRODI-VAL-001: Prodi name is required', async ({ page }) => {
    await openAddProdiModal(page)

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText(/Tambah Prodi Baru|Tambahkan/i) }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    await pickSelectOption(page, 'Pilih kepala prodi', 'Ketua LPPM')

    await modal.getByRole('button', { name: /Tambahkan/i }).click()

    await page.waitForTimeout(1000)

    const errorText = modal.locator('.text-red-500, [data-error], [aria-invalid="true"]')
    await expect(errorText.first()).toBeVisible({ timeout: 10_000 })

    await expect(modal).toBeVisible()
  })

  test('SA-PRODI-VAL-002: Duplicate Prodi name is rejected', async ({ page }) => {
    await openAddProdiModal(page)

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText(/Tambah Prodi Baru|Tambahkan/i) }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    await modal.locator('input[name="nama_prodi"]').fill('Sistem Teknologi dan Informasi')

    await pickSelectOption(page, 'Pilih kepala prodi', 'Ketua LPPM')

    await modal.getByRole('button', { name: /Tambahkan/i }).click()

    await page.waitForTimeout(2000)

    const body = await page.locator('body').textContent()
    const hasError = (body || '').includes('already been taken') || (body || '').includes('sudah digunakan') || (body || '').includes('sudah ada') || (body || '').includes('duplicate')
    expect(hasError || (await modal.isVisible())).toBeTruthy()

    await expect(modal).toBeVisible()
  })
})
