import { defineConfig } from '@playwright/test';

const port = Number(process.env.AQS104_FE_WEB_PORT ?? 4301);
const backend = process.env.AQS104_FE_BACKEND_URL ?? 'http://127.0.0.1:4300';

export default defineConfig({
  // This config resides in e2e/, so use its own directory rather than e2e/e2e.
  testDir: '.',
  testMatch: 'aqs104-real.spec.mjs',
  timeout: 45_000,
  workers: 1,
  reporter: 'line',
  use: { baseURL: `http://127.0.0.1:${port}`, browserName: 'chromium', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    reuseExistingServer: true,
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    timeout: 30_000,
    env: { ...process.env, VITE_API_BASE_URL: backend },
  },
});
