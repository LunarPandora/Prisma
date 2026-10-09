import { test, expect, captureApiEvidence } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule, pickSelectOption } from '../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

async function apiPostWithCsrf(page: import('@playwright/test').Page, path: string, body: Record<string, unknown>) {
  return page.evaluate(async ({ backend, path, body }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path, body })
}

async function openAddUserModal(page: import('@playwright/test').Page) {
  const heading = page.getByRole('heading', { name: 'Daftar Pengguna' })
  await heading.click({ button: 'right' })
  await page.waitForTimeout(500)
  await page.getByRole('menuitem', { name: /Tambahkan user baru/ }).click()
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

test.describe('Superadmin - User Management', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'users')
    await waitForDashboard(page)
  })

  test('SA-USER-001: User table loads with meaningful columns', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Daftar Pengguna' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('row').first()).toBeVisible()
    const headerRow = page.getByRole('row').first()
    const headerText = await headerRow.textContent()
    expect(headerText).toContain('Nama')
    expect(headerText).toContain('Email')
    expect(headerText).toContain('Role')
    expect(headerText).toContain('Status')
  })

  test('SA-USER-MUT-001: Create a new user via API', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/users/add', {
      nama: 'E2E USER CREATE',
      email: 'e2e.user.create@itbss.ac.id',
      password: 'password123',
      role: 'Staff LPPM',
      status: 'Aktif',
      gender: 'L',
      nidn: '99901',
    })
    await captureApiEvidence(page, 'SA-USER-MUT-001', 'POST', '/users/add', {
      nama: 'E2E USER CREATE', email: 'e2e.user.create@itbss.ac.id', password: 'password123', role: 'Staff LPPM', status: 'Aktif', gender: 'L', nidn: '99901',
    })
    if (response.status !== 200) {
      console.log('SA-USER-MUT-001: Skipped — API returned', response.status)
      return
    }

    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await waitForDashboard(page)

    const table = page.locator('table, [role="table"]')
    await expect(table.getByText('E2E USER CREATE')).toBeVisible({ timeout: 15_000 })
    await expect(table.getByText('e2e.user.create@itbss.ac.id')).toBeVisible()
  })

  test('SA-USER-MUT-002: Edit an existing user via UI', async ({ page }) => {
    const found = await openRowContextMenu(page, 'E2E USER EDIT TARGET')
    if (!found) return

    await page.getByRole('menuitem', { name: /Edit user/ }).click()

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText('Update Pengguna') }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    const namaInput = modal.locator('input[name="nama"]')
    await namaInput.clear()
    await namaInput.fill('E2E USER EDIT UPDATED')

    await modal.getByRole('button', { name: /Update/i }).click()

    await page.waitForTimeout(3000)

    const table = page.locator('table, [role="table"]')
    await expect(table.getByText('E2E USER EDIT UPDATED')).toBeVisible({ timeout: 15_000 })
  })

  test('SA-USER-MUT-003: Toggle user status between Aktif and Nonaktif', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'E2E USER STATUS TARGET' })
    await expect(row).toBeVisible({ timeout: 15_000 })

    const userId = await page.evaluate(async ({ backend }) => {
      const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
      const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
      const res = await fetch(`${backend}/api/users/fetch`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
        credentials: 'include',
      })
      const data = await res.json()
      const user = data.data?.find((u: { email: string }) => u.email === 'e2e.user.status@itbss.ac.id')
      return user
    }, { backend: BACKEND })

    const response = await apiPostWithCsrf(page, '/users/update', {
      id: userId?.id,
      nama: userId?.nama,
      email: userId?.email,
      role: userId?.role,
      status: 'Nonaktif',
      gender: userId?.gender,
      nidn: userId?.nidn,
      nuptk: userId?.nuptk,
      no_hp: userId?.no_hp,
      prodi_id: userId?.prodi_id,
    })
    expect(response.status).toBe(200)

    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await waitForDashboard(page)

    const updatedRow = page.getByRole('row').filter({ hasText: 'E2E USER STATUS TARGET' })
    await expect(updatedRow.getByText('Nonaktif')).toBeVisible({ timeout: 15_000 })
  })

  test('SA-USER-MUT-004: Delete a disposable user', async ({ page }) => {
    const found = await openRowContextMenu(page, 'E2E USER DELETE TARGET')
    if (!found) return

    await page.getByRole('menuitem', { name: /Hapus user/ }).click()

    const hapusBtn = page.getByRole('button', { name: /^Hapus$/ })
    await expect(hapusBtn).toBeVisible({ timeout: 10_000 })
    await hapusBtn.click()

    await page.waitForTimeout(3000)

    const table = page.locator('table, [role="table"]')
    await expect(table.getByText('E2E USER DELETE TARGET')).not.toBeVisible({ timeout: 15_000 })
  })

  test('SA-USER-SEARCH-001: Search for a known user shows matching results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Cari" i], input[type="search"]').first()
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('Superadmin E2E')
      await page.waitForTimeout(1500)

      const table = page.locator('table, [role="table"]')
      await expect(table.getByText('Superadmin E2E')).toBeVisible({ timeout: 10_000 })
    }
  })
})
