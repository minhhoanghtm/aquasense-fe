import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.join(__dirname, "telemetryResponse.ts");

let tempDir;
let telemetryModule;

before(async () => {
  const source = fs.readFileSync(SOURCE_PATH, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
      verbatimModuleSyntax: true,
    },
    fileName: SOURCE_PATH,
  });

  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aqs303-telemetry-response-"));
  const compiledPath = path.join(tempDir, "telemetryResponse.mjs");
  fs.writeFileSync(compiledPath, transpiled.outputText, "utf8");
  telemetryModule = await import(pathToFileURL(compiledPath).href);
});

after(() => {
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("unwrapLatestTelemetryResponse (AQS-303)", () => {
  const sampleLatest = {
    telemetryId: "tel-001",
    deviceId: "dev-001",
    ph: 7.8,
    dissolvedOxygen: 6.4,
    temperature: 28.7,
    salinity: 18.2,
    recordedAt: "2026-11-25T08:50:00.000Z",
  };

  it("returns single-enveloped latest telemetry directly (post-AQS-303)", () => {
    const result = telemetryModule.unwrapLatestTelemetryResponse(sampleLatest);
    assert.deepEqual(result, sampleLatest);
  });

  it("unwraps legacy double-enveloped { success: true, data: latest } (pre-AQS-303)", () => {
    const result = telemetryModule.unwrapLatestTelemetryResponse({
      success: true,
      data: sampleLatest,
    });
    assert.deepEqual(result, sampleLatest);
  });

  it("is idempotent when applied both in getLatestTelemetry and DeviceDetailDrawer", () => {
    const apiLevel = telemetryModule.unwrapLatestTelemetryResponse(sampleLatest);
    const drawerLevel = telemetryModule.unwrapLatestTelemetryResponse(apiLevel);
    assert.deepEqual(drawerLevel, sampleLatest);
  });

  it("returns null for empty or non-object payloads", () => {
    assert.equal(telemetryModule.unwrapLatestTelemetryResponse(null), null);
    assert.equal(telemetryModule.unwrapLatestTelemetryResponse(undefined), null);
    assert.equal(
      telemetryModule.unwrapLatestTelemetryResponse({ success: true, data: null }),
      null,
    );
    assert.equal(
      telemetryModule.unwrapLatestTelemetryResponse({ success: true, data: undefined }),
      null,
    );
    assert.equal(telemetryModule.unwrapLatestTelemetryResponse([]), null);
    assert.equal(telemetryModule.unwrapLatestTelemetryResponse("invalid"), null);
  });
});
