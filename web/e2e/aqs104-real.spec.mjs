import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

if (!process.env.AQS104_FE_FIXTURE_PATH) throw new Error('Missing AQS104_FE_FIXTURE_PATH');
if (!process.env.AQS104_FE_PASSWORD) throw new Error('Missing AQS104_FE_PASSWORD');
if (!process.env.AQS104_FE_BACKEND_URL) throw new Error('Missing AQS104_FE_BACKEND_URL');

const fixture = JSON.parse(readFileSync(process.env.AQS104_FE_FIXTURE_PATH, 'utf8'));
const password = process.env.AQS104_FE_PASSWORD;
const backend = process.env.AQS104_FE_BACKEND_URL;

async function login(page, phone) {
  const consoleErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/login');
  await page.getByPlaceholder('0912 345 678').fill(phone);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  // Let the dashboard's initial requests settle before route navigation so
  // React does not report deliberately aborted fetches as console errors.
  await page.waitForTimeout(1_000);
  consoleErrors.length = 0;
  return consoleErrors;
}

test('admin sees live AI risk alerts and logout revokes its access token through Redis', async ({ page }) => {
  const errors = await login(page, fixture.adminPhone);
  await page.goto('/alerts');
  await expect(page.getByRole('heading', { name: 'Cảnh báo & Lịch sử' })).toBeVisible();
  await expect(page.getByText('AQS104 TEST_ONLY Pond A').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /AI predicted dissolved_oxygen.*Rủi ro dự báo bởi AI/ }).first()).toBeVisible();
  await expect(page.getByText('2.80').first()).toBeVisible();
  await expect(page.getByText('Chưa xử lý').first()).toBeVisible();
  await expect(page.getByText('Nguy hiểm').first()).toBeVisible();
  expect(errors).toEqual([]);

  const sessionResult = await page.evaluate(async ({ backendUrl }) => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!accessToken || !refreshToken) return { hasSession: false };

    const logout = await fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    const revoked = await fetch(`${backendUrl}/alerts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { hasSession: true, logoutStatus: logout.status, revokedStatus: revoked.status };
  }, { backendUrl: backend });
  expect(sessionResult.hasSession).toBe(true);
  expect(sessionResult.logoutStatus).toBeGreaterThanOrEqual(200);
  expect(sessionResult.logoutStatus).toBeLessThan(300);
  expect(sessionResult.revokedStatus).toBe(401);
});

test('manager cannot retrieve another farm alert even with a modified request', async ({ page }) => {
  await login(page, fixture.managerAPhone);
  await page.goto('/alerts');
  await expect(page.getByText('AQS104 TEST_ONLY Pond A').first()).toBeVisible();
  await expect(page.getByText('AQS104 TEST_ONLY Pond B')).toHaveCount(0);
  const scoped = await page.evaluate(async ({ backend, pondId }) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${backend}/alerts?pondId=${pondId}`, { headers: { Authorization: `Bearer ${token}` } });
    return { status: response.status, body: await response.json() };
  }, { backend, pondId: fixture.pondB });
  expect(scoped.status).toBe(200);
  expect(scoped.body.data.data).toEqual([]);
  await page.goto('/ai-analysis');
  await expect(page.getByRole('button', { name: /Dự báo vuông này/i })).toBeVisible();
});

test('farmer sees only assigned pond alerts and no AI trigger controls', async ({ page }) => {
  await login(page, fixture.farmerAPhone);
  await page.goto('/alerts');
  await expect(page.getByText('AQS104 TEST_ONLY Pond A').first()).toBeVisible();
  await expect(page.getByText('AQS104 TEST_ONLY Pond B')).toHaveCount(0);
  await page.goto('/ai-analysis');
  await expect(page.getByRole('button', { name: /Dự báo vuông này/i })).toHaveCount(0);
});

test('inactive user is rejected by the real login form', async ({ page }) => {
  await page.goto('/login');
  const loginResponse = page.waitForResponse((response) =>
    response.url() === `${backend}/auth/login` && response.request().method() === 'POST',
  );
  await page.getByPlaceholder('0912 345 678').fill(fixture.inactivePhone);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /đăng nhập/i }).click();
  expect((await loginResponse).status()).toBe(401);
  await expect(page).toHaveURL(/\/login/);
});
