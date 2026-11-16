import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const reportDirectory = path.dirname(fileURLToPath(import.meta.url));
const scenario = process.env.AQS102_SCENARIO ?? 'real-fastapi-503';
const webBaseUrl = process.env.AQS102_WEB_BASE_URL ?? 'http://127.0.0.1:5174';
const apiBaseUrl = process.env.AQS102_API_BASE_URL ?? 'http://127.0.0.1:3100';
const aiBaseUrl = process.env.AQS102_AI_BASE_URL ?? 'http://127.0.0.1:8001';
const artifactDirectory = path.join(reportDirectory, 'artifacts', scenario);
const networkDirectory = path.join(reportDirectory, 'network');

const testAccounts = {
  admin: { phone: '0910000101', password: 'Aqs102!TestPass' },
  managerA: { phone: '0910000102', password: 'Aqs102!TestPass' },
};

const ponds = {
  telemetryReady: '256eda4d-0f29-4556-a16d-bdb38b718524',
  missingSensors: '759f3256-d26d-4d66-ab29-91cbd9ae1778',
};

const evidence = {
  scenario,
  startedAt: new Date().toISOString(),
  network: [],
  consoleErrors: [],
  scenarios: [],
};

function redact(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [
      key,
      /token|password|secret|authorization|cookie|phone|email/i.test(key) ? '[REDACTED]' : redact(child),
    ]));
  }
  if (typeof value === 'string') {
    return /bearer\s+|eyJ[A-Za-z0-9_-]+\./i.test(value) ? '[REDACTED]' : value;
  }
  return value;
}

function browserApiPath(url) {
  try {
    const parsed = new URL(url);
    return parsed.origin === apiBaseUrl ? `${parsed.pathname}${parsed.search}` : null;
  } catch {
    return null;
  }
}

function installEvidenceCapture(page) {
  page.on('console', (message) => {
    if (message.type() === 'error') evidence.consoleErrors.push(message.text());
  });

  page.on('request', (request) => {
    const requestPath = browserApiPath(request.url());
    if (!requestPath) return;
    const tracked = requestPath.startsWith('/predictions/') || requestPath.startsWith('/ponds') || requestPath.startsWith('/alerts');
    if (!tracked) return;
    let payload;
    try {
      payload = request.postDataJSON();
    } catch {
      payload = undefined;
    }
    evidence.network.push({ type: 'request', method: request.method(), path: requestPath, payload: redact(payload) });
  });

  page.on('response', async (response) => {
    const responsePath = browserApiPath(response.url());
    if (!responsePath) return;
    const tracked = responsePath.startsWith('/predictions/') || responsePath.startsWith('/ponds') || responsePath.startsWith('/alerts');
    if (!tracked) return;
    let body;
    try {
      const contentType = response.headers()['content-type'] ?? '';
      body = contentType.includes('application/json') ? redact(await response.json()) : undefined;
    } catch {
      body = '[UNAVAILABLE]';
    }
    evidence.network.push({ type: 'response', status: response.status(), path: responsePath, body });
  });
}

async function login(page, account) {
  await page.goto(`${webBaseUrl}/login`, { waitUntil: 'networkidle' });
  await page.locator('input[autocomplete="username"]').fill(account.phone);
  await page.locator('input[autocomplete="current-password"]').fill(account.password);
  await Promise.all([
    page.waitForURL('**/dashboard'),
    page.getByRole('button', { name: 'Đăng nhập', exact: true }).click(),
  ]);
}

async function openAiAnalysis(page) {
  await page.goto(`${webBaseUrl}/ai-analysis`, { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: /AQS-102 Pond A/ })).toBeVisible();
}

async function selectPond(page, name) {
  await page.getByRole('button', { name: /AQS-102 Pond/ }).click();
  await page.getByText(name, { exact: true }).last().click();
  await expect(page.getByRole('button', { name, exact: false })).toBeVisible();
}

async function settlePage(page) {
  // The page refetches pond data after a prediction. Let those requests finish
  // before closing Chromium so an intentional test teardown is not recorded as
  // an aborted browser fetch.
  await page.waitForTimeout(800);
}

async function triggerPrediction(page, pondId, expectsFallback = false) {
  const trigger = page.getByRole('button', { name: 'Dự báo vuông này', exact: true });
  await expect(trigger).toBeEnabled();
  let releaseRequest;
  const requestDelay = new Promise((resolve) => { releaseRequest = resolve; });
  const triggerUrl = `**/predictions/pond/${pondId}/trigger`;
  await page.route(triggerUrl, async (route) => {
    await requestDelay;
    await route.continue();
  });
  const responsePromise = page.waitForResponse((response) => (
    response.url().includes(`/predictions/pond/${pondId}/trigger`) && response.request().method() === 'POST'
  ));
  await trigger.click();
  const loadingTrigger = page.getByRole('button', { name: 'Đang chạy...', exact: true });
  await expect(loadingTrigger).toBeDisabled();
  releaseRequest();
  const response = await responsePromise;
  await page.unroute(triggerUrl);
  await expect(page.getByText(
    expectsFallback
      ? 'Dự báo đang dùng quy tắc dự phòng; kiểm tra dữ liệu cảm biến và trạng thái dịch vụ AI.'
      : 'Đã kích hoạt tính toán AI cho ao thành công!',
  )).toBeVisible();
  return response.status();
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  await fs.mkdir(artifactDirectory, { recursive: true });
  await fs.mkdir(networkDirectory, { recursive: true });
});
test.afterAll(async () => {
  evidence.finishedAt = new Date().toISOString();
  await fs.writeFile(
    path.join(networkDirectory, `${scenario}.json`),
    JSON.stringify(redact(evidence), null, 2),
  );
  await fs.writeFile(
    path.join(artifactDirectory, 'console-errors.json'),
    JSON.stringify(redact(evidence.consoleErrors), null, 2),
  );
});

test('FE-01..FE-10: admin uses the actual prediction UI', async ({ browser }) => {
  test.skip(scenario === 'ai-mock-success', 'The mock run has a dedicated three-level mapping scenario.');
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  installEvidenceCapture(page);

  await login(page, testAccounts.admin);
  await openAiAnalysis(page);
  await page.screenshot({ path: path.join(artifactDirectory, '01-ai-analysis-desktop-before.png'), fullPage: true });

  if (scenario !== 'ai-unavailable') {
    const directFastApiResponse = await page.request.post(`${aiBaseUrl}/api/predict`, {
      data: {
        pondId: ponds.telemetryReady,
        currentDO: 5.2,
        currentPH: 7.7,
        currentTemp: 28.5,
        salinity: 15,
        turbidity: 20,
        timestamp: new Date().toISOString(),
      },
    });
    let body;
    try {
      body = redact(await directFastApiResponse.json());
    } catch {
      body = '[UNAVAILABLE]';
    }
    evidence.scenarios.push({ id: 'FE-05', fastApiStatus: directFastApiResponse.status(), fastApiBody: body });
    if (scenario === 'real-fastapi-503') expect(directFastApiResponse.status()).toBe(503);
  }

  const firstTriggerStatus = await triggerPrediction(page, ponds.telemetryReady, true);
  await expect(firstTriggerStatus).toBe(201);
  await expect(page.getByText('Quy tắc Heuristic (Dự phòng)').first()).toBeVisible();
  await expect(page.getByText('10%', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('LOW', { exact: true }).first()).toBeVisible();

  await selectPond(page, 'AQS-102 Pond B');
  const missingSensorStatus = await triggerPrediction(page, ponds.missingSensors, true);
  await expect(missingSensorStatus).toBe(201);
  await expect(page.getByText('Quy tắc Heuristic (Dự phòng)').first()).toBeVisible();
  evidence.scenarios.push({
    id: 'FE-01,FE-02,FE-03,FE-04,FE-05,FE-07,FE-08,FE-09',
    triggerStatus: firstTriggerStatus,
    missingSensorStatus,
    result: 'UI loaded; authorized ponds selectable; complete and absent telemetry both return an explicit heuristic fallback.',
  });

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/ai-analysis$/);
  await expect(page.getByText('Phân tích AI', { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: path.join(artifactDirectory, '02-ai-analysis-desktop-after.png'), fullPage: true });

  await settlePage(page);
  await context.close();
});
test('FE-06/FE-07: test-only AI response maps three risk levels and percentages once', async ({ browser }) => {
  test.skip(scenario !== 'ai-mock-success', 'Only runs against the local test-only AI contract double.');
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  installEvidenceCapture(page);
  await login(page, testAccounts.admin);
  await openAiAnalysis(page);

  for (let index = 0; index < 3; index += 1) {
    await expect(await triggerPrediction(page, ponds.telemetryReady)).toBe(201);
  }

  await expect(page.getByText('AI_MICROSERVICE', { exact: true }).first()).toBeVisible();
  for (const level of ['LOW', 'MEDIUM', 'HIGH']) {
    await expect(page.getByText(level, { exact: true }).first()).toBeVisible();
  }
  for (const score of ['20%', '55%', '85%']) {
    await expect(page.getByText(score, { exact: true }).first()).toBeVisible();
  }
  evidence.scenarios.push({ id: 'FE-06,FE-07', result: 'SAFE/WARNING/DANGER test responses mapped to LOW/MEDIUM/HIGH and 20%/55%/85% exactly once.' });
  await page.screenshot({ path: path.join(artifactDirectory, '03-ai-mock-risk-mapping.png'), fullPage: true });
  await settlePage(page);
  await context.close();
});
test('FE-10: mobile viewport remains usable', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage();
  installEvidenceCapture(page);
  await login(page, testAccounts.admin);
  await openAiAnalysis(page);
  await expect(page.getByRole('button', { name: 'Dự báo vuông này', exact: true })).toBeVisible();
  await page.screenshot({ path: path.join(artifactDirectory, '04-ai-analysis-mobile.png'), fullPage: true });
  evidence.scenarios.push({ id: 'FE-10', result: '390px mobile viewport rendered the selector and trigger control without a visible layout failure.' });
  await settlePage(page);
  await context.close();
});
test('FE-11/FE-12: unavailable AI falls back and manager cannot read a foreign pond', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  installEvidenceCapture(page);
  await login(page, testAccounts.managerA);
  await openAiAnalysis(page);
  await expect(page.getByText('AQS-102 Pond B', { exact: true })).toHaveCount(0);

  const accessToken = await page.evaluate(() => window.localStorage.getItem('accessToken'));
  const foreignPondResponse = await page.request.get(
    `${apiBaseUrl}/predictions/pond/${ponds.missingSensors}/history?limit=10`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const foreignPondStatus = foreignPondResponse.status();
  expect(foreignPondStatus).toBe(403);

  if (scenario === 'ai-unavailable') {
    await expect(await triggerPrediction(page, ponds.telemetryReady, true)).toBe(201);
    await expect(page.getByText('Quy tắc Heuristic (Dự phòng)').first()).toBeVisible();
  }
  evidence.scenarios.push({
    id: 'FE-11,FE-12',
    foreignPondStatus,
    result: scenario === 'ai-unavailable'
      ? 'Connection failure to the isolated AI URL returned a safe heuristic fallback; foreign pond history was denied.'
      : 'Foreign pond history was denied; unavailable-AI fallback is exercised in the dedicated run.',
  });
  await settlePage(page);
  await context.close();
});
// End of AQS-102 E2E scenarios.
