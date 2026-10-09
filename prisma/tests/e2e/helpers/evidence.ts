import { test as base, type Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const EVIDENCE_DIR = path.resolve(__dirname, '../../../evidence')

export const test = base.extend<{ _evidenceCapture: void }>({
  _evidenceCapture: [async ({ page }, use, testInfo) => {
    await use()

    const id = (testInfo.title.match(/^([A-Z]{2,}-[A-Z0-9-]+)/) || [])[1]
    if (!id) return

    fs.mkdirSync(EVIDENCE_DIR, { recursive: true })

    try {
      await page.screenshot({ path: path.join(EVIDENCE_DIR, `${id}.png`), fullPage: true })
    } catch {
      /* API-only tests have no page — skip */
    }
  }, { auto: true }],
})

export { expect } from '@playwright/test'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

export async function captureApiEvidence(
  page: Page,
  testId: string,
  method: string,
  apiPath: string,
  payload?: Record<string, unknown>,
) {
  const result = await page.evaluate(
    async ({ backend, method, apiPath, payload }) => {
      const xsrf = document.cookie
        .split('; ')
        .find((c) => c.startsWith('XSRF-TOKEN='))
      const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
      const opts: RequestInit = {
        method,
        headers: {
          Accept: 'application/json',
          'X-XSRF-TOKEN': token,
          ...(payload ? { 'Content-Type': 'application/json' } : {}),
        },
        credentials: 'include',
        ...(payload ? { body: JSON.stringify(payload) } : {}),
      }
      const res = await fetch(`${backend}/api${apiPath}`, opts)
      const body = await res.json().catch(() => ({}))
      return { status: res.status, body }
    },
    { backend: BACKEND, method, apiPath, payload },
  )

  const lines = [
    `${method} /api${apiPath}`,
    payload ? `payload : ${JSON.stringify(payload)}` : null,
    `status  : ${result.status}`,
    `response: ${JSON.stringify(result.body)}`,
  ].filter(Boolean)

  fs.mkdirSync(EVIDENCE_DIR, { recursive: true })
  fs.writeFileSync(
    path.join(EVIDENCE_DIR, `${testId}.txt`),
    lines.join('\n') + '\n',
  )

  return result
}
