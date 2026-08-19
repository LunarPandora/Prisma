import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule, pickSelectOption } from '../helpers/navigation'

async function openAddUserModal(page: import('@playwright/test').Page) {
  const heading = page.getByRole('heading', { name: 'Daftar Pengguna' })
  await heading.click({ button: 'right' })
  await page.waitForTimeout(500)
  await page.getByRole('menuitem', { name: /Tambahkan user baru/ }).click()
}

test.describe('Superadmin - User Validation (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'users')
    await waitForDashboard(page)
  })

  test('SA-USER-VAL-001: Duplicate email is rejected with inline error', async ({ page }) => {
    await openAddUserModal(page)

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText('Tambah Pengguna Baru') }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    await modal.locator('input[name="nama"]').fill('Duplicate Email User')
    await modal.locator('input[name="email"]').fill('existing.user@itbss.ac.id')
    await modal.locator('input[name="password"]').fill('password123')

    await pickSelectOption(page, 'Pilih role pengguna', 'Staff LPPM')
    await pickSelectOption(page, 'Pilih status pengguna', 'Aktif')

    await modal.getByRole('button', { name: /Tambahkan/i }).click()

    await page.waitForTimeout(2000)

    const errorText = modal.locator('.text-red-500, [data-error], [aria-invalid="true"]')
    await expect(errorText.first()).toBeVisible({ timeout: 10_000 })
  })

  test('SA-VALIDATION-UX-001: Inline validation UX — error appears and form remains open', async ({ page }) => {
    await openAddUserModal(page)

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText('Tambah Pengguna Baru') }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    await modal.locator('input[name="nama"]').fill('UX Test User')
    await modal.locator('input[name="email"]').fill('existing.user@itbss.ac.id')
    await modal.locator('input[name="password"]').fill('password123')

    await pickSelectOption(page, 'Pilih role pengguna', 'Staff LPPM')
    await pickSelectOption(page, 'Pilih status pengguna', 'Aktif')

    await modal.getByRole('button', { name: /Tambahkan/i }).click()

    await page.waitForTimeout(2000)

    const errorText = modal.locator('.text-red-500, [data-error], [aria-invalid="true"]')
    await expect(errorText.first()).toBeVisible({ timeout: 10_000 })

    await expect(modal.locator('input[name="nama"]')).toHaveValue('UX Test User')
    await expect(modal.locator('input[name="email"]')).toHaveValue('existing.user@itbss.ac.id')

    await expect(modal).toBeVisible()
  })
})
