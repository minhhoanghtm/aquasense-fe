import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.AQS101_E2E_PORT ?? 4175);
const baseURL = `http://127.0.0.1:${port}`;
const reuseExistingServer = process.env.AQS101_E2E_REUSE_SERVER === 'true';

export default defineConfig({
  testDir: testDirectory,
  testMatch: 'aqs101-ui.spec.mjs',
  timeout: 30_000,
  workers: 1,
  reporter: 'line',
  use: {
    channel: 'msedge',
    baseURL,
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer,
    timeout: 30_000,
  },
});
