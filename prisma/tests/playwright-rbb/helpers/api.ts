import { type APIRequestContext, expect } from '@playwright/test';

export const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8000';

export async function apiGet(
  request: APIRequestContext,
  path: string,
  params?: Record<string, string>
): Promise<any> {
  const url = new URL(`${BACKEND_URL}/api${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await request.get(url.toString());
  expect(res.ok()).toBeTruthy();
  return res.json();
}

export async function apiPost(
  request: APIRequestContext,
  path: string,
  data: Record<string, unknown>
): Promise<any> {
  const res = await request.post(`${BACKEND_URL}/api${path}`, {
    data,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  });
  return res;
}

export async function apiPostAuthed(
  page: any,
  path: string,
  data: Record<string, unknown>
): Promise<any> {
  return page.evaluate(async ({ path, data }) => {
    const xsrf = document.cookie.split('; ').find((c: string) => c.startsWith('XSRF-TOKEN='));
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : '';
    const backend = (window as any).__E2E_BACKEND_URL__ || 'http://localhost:8000';
    const res = await fetch(`${backend}/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': token,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  }, { path, data });
}

export async function apiGetAuthed(page: any, path: string): Promise<any> {
  return page.evaluate(async ({ path }) => {
    const xsrf = document.cookie.split('; ').find((c: string) => c.startsWith('XSRF-TOKEN='));
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : '';
    const backend = (window as any).__E2E_BACKEND_URL__ || 'http://localhost:8000';
    const res = await fetch(`${backend}/api${path}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-XSRF-TOKEN': token,
      },
      credentials: 'include',
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  }, { path });
}

export async function apiDeleteAuthed(
  page: any,
  path: string
): Promise<any> {
  return page.evaluate(async ({ path }) => {
    const xsrf = document.cookie.split('; ').find((c: string) => c.startsWith('XSRF-TOKEN='));
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : '';
    const backend = (window as any).__E2E_BACKEND_URL__ || 'http://localhost:8000';
    const res = await fetch(`${backend}/api${path}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-XSRF-TOKEN': token,
      },
      credentials: 'include',
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  }, { path });
}
