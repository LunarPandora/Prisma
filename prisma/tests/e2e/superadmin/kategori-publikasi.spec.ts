import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

async function apiGetWithCsrf(page: import('@playwright/test').Page, path: string) {
  return page.evaluate(async ({ backend, path }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
      credentials: 'include',
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path })
}

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

async function apiDeleteWithCsrf(page: import('@playwright/test').Page, path: string) {
  return page.evaluate(async ({ backend, path }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
      credentials: 'include',
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path })
}

test.describe('Superadmin - Kategori Publikasi', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
  })

  test('SA-KATPUB-001: Superadmin can fetch publication categories via API', async ({ page }) => {
    const response = await apiGetWithCsrf(page, '/publication-category/fetch')
    expect(response.status).toBe(200)
    expect(response.body.data).toBeDefined()
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  test('SA-KATPUB-MUT-001: Create a publication category via API', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/publication-category/add', {
      nama: 'E2E Kategori API Create',
      peringkat: JSON.stringify(['Q1', 'Q2']),
    })
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('success')
  })

  test('SA-KATPUB-MUT-002: Update a publication category via API', async ({ page }) => {
    const fetchResponse = await apiGetWithCsrf(page, '/publication-category/fetch')
    const target = fetchResponse.body.data?.find((c: { nama: string }) => c.nama === 'E2E Kategori API Create')

    if (target) {
      const response = await apiPostWithCsrf(page, '/publication-category/update', {
        pub_category_id: target.pub_category_id,
        nama: 'E2E Kategori API Updated',
        peringkat: JSON.stringify(['Q1', 'Q2', 'Q3']),
      })
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
    }
  })

  test('SA-KATPUB-MUT-003: Delete an unused publication category via API', async ({ page }) => {
    const fetchResponse = await apiGetWithCsrf(page, '/publication-category/fetch')
    const target = fetchResponse.body.data?.find((c: { nama: string }) => c.nama === 'E2E Kategori UNUSED')

    if (target) {
      const response = await apiDeleteWithCsrf(page, `/publication-category/delete/${target.pub_category_id}`)
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
    }
  })

  test('SA-KATPUB-VAL-001: Category name is required for creation', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/publication-category/add', {
      peringkat: JSON.stringify(['Q1']),
    })
    expect(response.status).toBe(422)
    expect(response.body.errors).toBeDefined()
  })

  test('SA-KATPUB-TAG-001: Multiple peringkat tags persist correctly', async ({ page }) => {
    const createResponse = await apiPostWithCsrf(page, '/publication-category/add', {
      nama: 'E2E Multi Tag Test',
      peringkat: JSON.stringify(['Tag A', 'Tag B', 'Tag C']),
    })
    expect(createResponse.status).toBe(200)

    const fetchResponse = await apiGetWithCsrf(page, '/publication-category/fetch')
    const target = fetchResponse.body.data?.find((c: { nama: string }) => c.nama === 'E2E Multi Tag Test')

    if (target) {
      expect(target.peringkat).toContain('Tag A')
      expect(target.peringkat).toContain('Tag B')
      expect(target.peringkat).toContain('Tag C')

      const updateResponse = await apiPostWithCsrf(page, '/publication-category/update', {
        pub_category_id: target.pub_category_id,
        nama: 'E2E Multi Tag Test',
        peringkat: JSON.stringify(['Tag A', 'Tag C']),
      })
      expect(updateResponse.status).toBe(200)

      const verifyResponse = await apiGetWithCsrf(page, '/publication-category/fetch')
      const verifyTarget = verifyResponse.body.data?.find((c: { nama: string }) => c.nama === 'E2E Multi Tag Test')

      if (verifyTarget) {
        expect(verifyTarget.peringkat).toContain('Tag A')
        expect(verifyTarget.peringkat).toContain('Tag C')
        expect(verifyTarget.peringkat).not.toContain('Tag B')
      }

      await apiDeleteWithCsrf(page, `/publication-category/delete/${target.pub_category_id}`)
    }
  })
})
