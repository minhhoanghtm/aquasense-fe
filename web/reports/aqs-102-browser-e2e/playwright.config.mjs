import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const reportDirectory = path.dirname(fileURLToPath(import.meta.url));
const scenario = process.env.AQS102_SCENARIO ?? 'real-fastapi-503';

export default defineConfig({
  testDir: reportDirectory,
  testMatch: 'aqs-102.spec.mjs',
  timeout: 45_000,
  workers: 1,
  outputDir: path.join(reportDirectory, 'test-results', scenario),
  reporter: [
    ['line'],
    ['html', {
      open: 'never',
      outputFolder: path.join(reportDirectory, 'playwright-report', scenario),
    }],
  ],
  use: {
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
  },
});
