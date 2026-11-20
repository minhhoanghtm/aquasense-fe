import { test, expect } from '@playwright/test';

const apiOrigin = 'http://localhost:3000';
const pondA = { pondId: '11111111-1111-4111-8111-111111111111', pondName: 'AQS-101 Pond A', status: 'ACTIVE' };
const pondB = { pondId: '22222222-2222-4222-8222-222222222222', pondName: 'AQS-101 Pond B', status: 'ACTIVE' };
const invalidSeedPond = { pondId: '22222222-2222-2222-2222-222222222203', pondName: 'Ao seed lỗi UUID', status: 'ACTIVE' };

const prediction = ({ source = 'HEURISTIC_RULE', fallback = source === 'HEURISTIC_RULE' } = {}) => ({
  predictionId: 'prediction-1',
  pondId: pondA.pondId,
  predictedTime: '2026-11-20T00:00:00.000Z',
  predictedDO: 4.8,
  predictedPH: 7.6,
  riskScore: 0.1,
  riskLevel: 'LOW',
  isFallback: fallback,
  predictionSource: source,
});

const errorEnvelope = (status, message) => ({
  success: false,
  statusCode: status,
  message,
  errorCode: `TEST_HTTP_${status}`,
  timestamp: '2026-11-20T00:00:00.000Z',
  path: `/predictions/pond/${pondA.pondId}/history`,
});

async function installSession(page) {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'aqs101-test-token');
    localStorage.setItem('refreshToken', 'aqs101-test-refresh-token');
    localStorage.setItem('aquasense_user', JSON.stringify({
      id: 'aqs101-test-admin', userId: 'aqs101-test-admin', fullName: 'AQS-101 Test Admin',
      phoneNumber: '0000000000', role: 'ADMIN', isActive: true,
      mustChangePassword: false, tokenVersion: 1,
    }));
  });
}

async function installMockCore(page, options = {}) {
  await page.route(`${apiOrigin}/**`, async (route) => {
    const requestUrl = new URL(route.request().url());
    const { pathname } = requestUrl;
    const fulfill = (body, status = 200) => route.fulfill({
      status, contentType: 'application/json', body: JSON.stringify(body),
    });

    if (pathname === '/auth/refresh') return fulfill(errorEnvelope(401, 'Phiên kiểm thử đã hết hạn'), 401);
    if (pathname === '/ponds') {
      const ponds = options.ponds ?? [pondA, pondB];
      return fulfill({ data: ponds, total: ponds.length, page: 1, limit: 100, totalPages: 1 });
    }
    if (pathname === '/alerts') return fulfill({ data: [] });
    if (pathname === '/devices') {
      const pondId = requestUrl.searchParams.get('pondId');
      options.onDeviceRequest?.(pondId);
      const response = options.devicesByPond?.[pondId] ?? {};
      if (response.wait) await response.wait;
      return fulfill({ data: response.items ?? [], total: response.items?.length ?? 0, page: 1, limit: 100, totalPages: 1 });
    }
    if (pathname === `/ponds/${pondA.pondId}`) return fulfill(pondA);
    if (pathname === `/ponds/${pondB.pondId}`) return fulfill(pondB);
    if (pathname.endsWith('/latest') && pathname.startsWith('/predictions/pond/')) return fulfill(options.latest ?? prediction());
    if (pathname.endsWith('/history') && pathname.startsWith('/predictions/pond/')) {
      const pondId = pathname.split('/')[3];
      if (options.historyStatus) return fulfill(errorEnvelope(options.historyStatus, `Lỗi mock HTTP ${options.historyStatus}`), options.historyStatus);
      if (options.malformedHistory) return fulfill({ unexpected: true });
      if (options.historyByPond?.[pondId]?.wait) await options.historyByPond[pondId].wait;
      return fulfill(options.historyByPond?.[pondId]?.items ?? options.history ?? []);
    }
    if (pathname.startsWith('/predictions/')) return fulfill({ message: 'mocked' });
    return fulfill({ data: [] });
  });
}

async function openAiAnalysis(page, options = {}) {
  await installSession(page);
  await installMockCore(page, options);
  await page.goto('/ai-analysis');
  await expect(page.getByText('Lịch sử dự báo AI gần nhất')).toBeVisible();
}

test('AQS101-FE-01: shows HEURISTIC_RULE as a non-approved fallback', async ({ page }) => {
  await openAiAnalysis(page, { history: [prediction()] });
  await expect(page.getByRole('cell', { name: 'Quy tắc Heuristic (Dự phòng)' })).toBeVisible();
  await expect(page.getByText('10%', { exact: true })).toBeVisible();
});

test('AQS101-FE-02: distinguishes AI_MICROSERVICE and an unknown source', async ({ page }) => {
  await openAiAnalysis(page, {
    history: [
      prediction({ source: 'AI_MICROSERVICE', fallback: false }),
      { ...prediction({ source: 'UNKNOWN', fallback: false }), predictionId: 'prediction-2' },
    ],
  });
  await expect(page.getByText('AI Microservice')).toBeVisible();
  await expect(page.getByText('Chưa xác định nguồn dự báo')).toBeVisible();
});

test('AQS101-FE-03: renders a genuine empty history distinctly', async ({ page }) => {
  await openAiAnalysis(page, { history: [] });
  await expect(page.getByText('Chưa có bản ghi dự báo nào cho vuông nuôi này.')).toBeVisible();
});

for (const status of [403, 404, 503]) {
  test(`AQS101-FE-${status}: preserves HTTP ${status} as a history error`, async ({ page }) => {
    await openAiAnalysis(page, { historyStatus: status });
    await expect(page.getByRole('alert')).toContainText(`Lỗi mock HTTP ${status}`);
  });
}

test('AQS101-FE-401: clears the mock session and redirects rather than rendering stale history', async ({ page }) => {
  await openAiAnalysis(page, { historyStatus: 401 });
  await expect(page).toHaveURL(/\/login/);
});

test('AQS101-FE-04: rejects malformed history instead of treating it as empty', async ({ page }) => {
  await openAiAnalysis(page, { malformedHistory: true });
  await expect(page.getByRole('alert')).toContainText('Dữ liệu lịch sử dự báo không hợp lệ.');
});

test('AQS101-FE-05: keeps the loading state visible while history is pending', async ({ page }) => {
  let release;
  const wait = new Promise((resolve) => { release = resolve; });
  await openAiAnalysis(page, { historyByPond: { [pondA.pondId]: { wait, items: [] } } });
  await expect(page.getByText('Đang tải lịch sử dự báo...')).toBeVisible();
  release();
  await expect(page.getByText('Chưa có bản ghi dự báo nào cho vuông nuôi này.')).toBeVisible();
});

test('AQS101-FE-06: ignores a late response from the previously selected pond', async ({ page }) => {
  let releaseA;
  const waitA = new Promise((resolve) => { releaseA = resolve; });
  await openAiAnalysis(page, {
    historyByPond: {
      [pondA.pondId]: { wait: waitA, items: [{ ...prediction(), predictedDO: 1.11 }] },
      [pondB.pondId]: { items: [{ ...prediction(), predictionId: 'pond-b-prediction', pondId: pondB.pondId, predictedDO: 6.22 }] },
    },
  });

  await expect(page.getByText('Đang tải lịch sử dự báo...')).toBeVisible();
  await page.getByRole('button', { name: 'AQS-101 Pond A', exact: true }).click();
  await page.getByRole('button', { name: 'AQS-101 Pond B', exact: true }).click();
  await expect(page.getByText('6.22')).toBeVisible();

  releaseA();
  await page.waitForTimeout(100);
  await expect(page.getByText('1.11')).toHaveCount(0);
});

test('AQS101-FE-07: dashboard remains on Core and labels heuristic output', async ({ page }) => {
  await installSession(page);
  await installMockCore(page, { latest: prediction() });
  await page.goto('/dashboard');
  await expect(page.getByText('Kết quả ước tính theo HEURISTIC_RULE — không phải AI model đã được phê duyệt.')).toBeVisible();
});

test('AQS101-FE-08: validates the malformed seed pond ID locally without requesting /devices', async ({ page }) => {
  const deviceRequests = [];
  await installSession(page);
  await installMockCore(page, {
    ponds: [invalidSeedPond],
    onDeviceRequest: (pondId) => deviceRequests.push(pondId),
  });

  await page.goto('/monitoring');
  await expect(page.getByRole('alert')).toContainText(`Mã ao không hợp lệ (${invalidSeedPond.pondId})`);
  await expect.poll(() => deviceRequests.length).toBe(0);
});

test('AQS101-FE-09: sends /devices only for a backend-valid pond UUID', async ({ page }) => {
  const deviceRequests = [];
  await installSession(page);
  await installMockCore(page, {
    onDeviceRequest: (pondId) => deviceRequests.push(pondId),
  });
  await page.goto('/monitoring');

  await expect.poll(() => deviceRequests).toContain(pondA.pondId);
  expect(deviceRequests).not.toContain(invalidSeedPond.pondId);
});

test('AQS101-FE-10: clears device state and ignores a late response from the prior pond', async ({ page }) => {
  let releaseA;
  const waitA = new Promise((resolve) => { releaseA = resolve; });
  await installSession(page);
  await installMockCore(page, {
    devicesByPond: {
      [pondA.pondId]: { wait: waitA, items: [{ deviceId: 'device-a', deviceName: 'Thiết bị ao A', status: 'ONLINE' }] },
      [pondB.pondId]: { items: [{ deviceId: 'device-b', deviceName: 'Thiết bị ao B', status: 'ONLINE' }] },
    },
  });

  await page.goto('/monitoring');
  await page.getByRole('button', { name: /AQS-101 Pond B/ }).click();
  await expect(page.getByText('Thiết bị ao B')).toBeVisible();

  releaseA();
  await page.waitForTimeout(100);
  await expect(page.getByText('Thiết bị ao A')).toHaveCount(0);
});

test('AQS101-FE-11: shows the verified pond name, two-hour horizon and explicit fallback source', async ({ page }) => {
  await openAiAnalysis(page, { latest: prediction() });
  await expect(page.getByRole('heading', { name: 'AQS-101 Pond A' })).toBeVisible();
  await expect(page.getByText('Dự báo ngắn hạn · 2 giờ tới')).toBeVisible();
  await expect(page.getByText('Nguồn: Quy tắc heuristic (dự phòng), không phải AI production đã được phê duyệt.')).toBeVisible();
  await expect(page.getByText('24–72 giờ tới')).toHaveCount(0);
});
