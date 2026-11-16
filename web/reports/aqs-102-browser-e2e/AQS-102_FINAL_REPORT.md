# AQS-102 — Frontend Predictions Browser E2E

**Date:** 2026-11-16
**Status:** PASS for the controlled integration scope.

## Scope and safety boundary

Chromium/Playwright used the real login UI and the production-shaped frontend route `/ai-analysis`. All data lived in the disposable AQS-102 PostgreSQL fixture and loopback-only services. Background jobs and notification dispatch were disabled at runtime; no production database, operational alert, SMS, email, FCM, deployment, commit, or push was used.

Three independent runs were executed:

- `real-fastapi-503`: current FastAPI at `127.0.0.1:8001` returned its intentional `503 RISK_RULES_PENDING_APPROVAL`; Core persisted and the UI labelled a `HEURISTIC_RULE` fallback.
- `ai-mock-success`: a localhost-only test double returned schema-valid `SAFE`, `WARNING`, and `DANGER` responses. It verifies the frontend mapping path only; it is not a trained model or production evidence.
- `ai-unavailable`: Core targeted an unused loopback port. The transport failure safely returned the fallback UI rather than crashing.

## Browser results

| Test ID | Route | API | HTTP status | Actual result | Status |
|---|---|---|---|---|---|
| FE-01 | `/ai-analysis` | `GET /ponds`, dashboard/latest/history | 200 | Authenticated Admin loaded the real page. | PASS |
| FE-02 | `/ai-analysis` | `GET /ponds` | 200 | Authorized ponds were selectable; Manager view excluded the foreign pond. | PASS |
| FE-03 | `/ai-analysis` | `POST /predictions/pond/:pondId/trigger` | 201 | Full-telemetry pond sent one browser request and the UI refreshed history. | PASS |
| FE-04 | `/ai-analysis` | trigger for no-sensor fixture | 201 | Controlled fallback rendered without a 422 or crash. | PASS |
| FE-05 | `/ai-analysis` | FastAPI `/api/predict` → Core trigger | 503 → 201 | Approval-gated FastAPI result became clearly labelled `Quy tắc Heuristic (Dự phòng)`. | PASS |
| FE-06 | `/ai-analysis` | test-only AI mock → Core | 200 → 201 | `SAFE/WARNING/DANGER` became `LOW/MEDIUM/HIGH`. | PASS |
| FE-07 | `/ai-analysis` | prediction history | 200 | Scores rendered as `20%`, `55%`, `85%` exactly once. | PASS |
| FE-08 | `/ai-analysis` | `GET /predictions/pond/:pondId/history` | 200 | History rows matched Core’s normalized values and source. | PASS |
| FE-09 | `/ai-analysis` | normal authenticated reload | 200 | Reload retained the authenticated AI route with no unexpected 401. | PASS |
| FE-10 | `/ai-analysis` | normal authenticated calls | 200 | 1440px desktop and 390px mobile screenshots showed usable selector/trigger controls. | PASS |
| FE-11 | `/ai-analysis` | Core → unavailable loopback AI endpoint | transport failure → 201 | UI stayed functional and showed the explicit fallback notice. | PASS |
| FE-12 | `/ai-analysis` | foreign `GET /predictions/pond/:pondId/history` | 403 | Manager could not see Pond B and its direct foreign-history API request was denied. | PASS |

## Fixes made

1. Core prediction latest/history/trigger endpoints now reuse `PondsService` access checks, closing the reproduced Manager cross-farm history leak (`200` before fix, `403` after fix).
2. Test-safe runtime gates prevent background jobs and notification dispatch in the isolated E2E environment.
3. The frontend now says that a forecast is using a fallback rule and prompts the user to check sensor data/AI service state; it no longer presents a fallback as a successful AI calculation.

## Evidence

- Test source: [aqs-102.spec.mjs](aqs-102.spec.mjs)
- Sanitized network: [network](network)
- Chromium screenshots and console captures: [artifacts](artifacts)
- HTML Playwright reports: `playwright-report/real-fastapi-503`, `playwright-report/ai-mock-success`, and `playwright-report/ai-unavailable` (generated, Git-ignored)

Final captures recorded no browser console errors. Sanitized traces contained normal `200`/`201` UI traffic; the controlled permission assertion is recorded as `403` in the scenario result, without exposing auth data.

## AI status

- **FRONTEND_API_INTEGRATION:** PASS
- **REAL_BROWSER_E2E:** PASS
- **RESEARCH_AI_FORECAST:** NOT_TESTED in this task
- **PRODUCTION_AI:** BLOCKED — `MODEL_ACCEPTANCE` and risk-rule approval remain pending. The test-only success mock does not change that decision.
