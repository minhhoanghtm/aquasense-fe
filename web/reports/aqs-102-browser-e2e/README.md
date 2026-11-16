# AQS-102 browser E2E evidence

This folder contains the reproducible Chromium test and its generated evidence.

The test uses only the isolated AQS-102 database, Redis instance, and localhost services. It authenticates through the normal password-login UI with test fixtures; no production database, alert, email, SMS, or FCM transport is used.

Run one scenario from `web`:

```powershell
$env:AQS102_SCENARIO = 'real-fastapi-503'
npx playwright test --config reports/aqs-102-browser-e2e/playwright.config.mjs
```

Supported scenarios are `real-fastapi-503`, `ai-mock-success`, and `ai-unavailable`. Generated screenshots, sanitized network records, test results, and HTML reports are ignored by Git. The checked-in test code and this explanation remain reviewable.
