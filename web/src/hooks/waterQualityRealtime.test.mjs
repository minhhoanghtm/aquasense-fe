import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.join(__dirname, "waterQualityRealtime.ts");

let tempDir;
let realtimeModule;

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

  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aqs301-water-quality-"));
  const compiledPath = path.join(tempDir, "waterQualityRealtime.mjs");
  fs.writeFileSync(compiledPath, transpiled.outputText, "utf8");
  realtimeModule = await import(pathToFileURL(compiledPath).href);
});

after(() => {
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("waterQualityRealtime (AQS-301)", () => {
  it("exposes MAX_SENSOR_READINGS = 1500", () => {
    assert.equal(realtimeModule.MAX_SENSOR_READINGS, 1500);
  });

  it("incrementally appends a normalized SensorReading with metrics without triggering fallback", () => {
    const pondId = "pond-uuid-1";
    const payload = {
      telemetryId: "tel-101",
      deviceId: "dev-1",
      recordedAt: "2026-11-25T08:00:00.000Z",
      temperature: 28.4,
      ph: 7.9,
      dissolvedOxygen: 6.2,
      salinity: 15.5,
      turbidity: 22,
      waterLevel: 1.4,
    };

    assert.equal(
      realtimeModule.shouldFallbackTelemetryUpdate(true, pondId, { pondId, data: payload }),
      false,
    );

    const thresholds = [{ configId: "th-1", metricName: "temperature", minValue: 25, maxValue: 32 }];
    const prev = {
      sensorReadings: [
        {
          id: "tel-100",
          pondId,
          deviceId: "dev-1",
          timestamp: "2026-11-25T07:59:00.000Z",
          recordedAt: "2026-11-25T07:59:00.000Z",
          metrics: [{ name: "temperature", value: 28.1, unit: "°C" }],
        },
      ],
      thresholds,
    };

    const next = realtimeModule.appendTelemetryReading(prev, pondId, payload);
    assert.ok(next);
    assert.equal(next.thresholds, thresholds);
    assert.equal(next.sensorReadings.length, 2);
    assert.deepEqual(next.sensorReadings[1], {
      id: "tel-101",
      pondId,
      deviceId: "dev-1",
      timestamp: "2026-11-25T08:00:00.000Z",
      recordedAt: "2026-11-25T08:00:00.000Z",
      temperature: 28.4,
      ph: 7.9,
      dissolvedOxygen: 6.2,
      salinity: 15.5,
      turbidity: 22,
      waterLevel: 1.4,
      metrics: [
        { name: "temperature", value: 28.4, unit: "°C" },
        { name: "pH", value: 7.9, unit: "" },
        { name: "dissolvedOxygen", value: 6.2, unit: "mg/L" },
        { name: "salinity", value: 15.5, unit: "ppt" },
        { name: "turbidity", value: 22, unit: "NTU" },
        { name: "waterLevel", value: 1.4, unit: "m" },
      ],
    });
  });

  it("filters metrics to finite non-null numbers and keeps valid zero values", () => {
    const mapped = realtimeModule.mapTelemetryPayloadToSensorReading(
      {
        id: "tel-zero",
        timestamp: "2026-11-25T08:05:00.000Z",
        temperature: "29.1",
        ph: null,
        dissolvedOxygen: Number.NaN,
        salinity: 0,
        turbidity: Number.POSITIVE_INFINITY,
        waterLevel: "",
      },
      "pond-1",
    );

    assert.ok(mapped);
    assert.equal(mapped.temperature, 29.1);
    assert.equal(mapped.salinity, 0);
    assert.equal(mapped.ph, null);
    assert.equal(mapped.dissolvedOxygen, null);
    assert.equal(mapped.turbidity, null);
    assert.equal(mapped.waterLevel, null);
    assert.deepEqual(mapped.metrics, [
      { name: "temperature", value: 29.1, unit: "°C" },
      { name: "salinity", value: 0, unit: "ppt" },
    ]);
  });

  it("enforces a sliding window of at most 1500 sensor readings", () => {
    const pondId = "pond-window";
    const initialReadings = Array.from({ length: 1500 }, (_, index) => ({
      id: `reading-${index + 1}`,
      pondId,
      timestamp: `2026-11-25T00:00:00.000Z`,
      metrics: [{ name: "temperature", value: 28, unit: "°C" }],
    }));

    const prev = { sensorReadings: initialReadings, thresholds: [] };
    const next = realtimeModule.appendTelemetryReading(prev, pondId, {
      id: "reading-1501",
      recordedAt: "2026-11-25T08:10:00.000Z",
      temperature: 30.2,
    });

    assert.ok(next);
    assert.equal(next.sensorReadings.length, 1500);
    assert.equal(next.sensorReadings[0].id, "reading-2");
    assert.equal(next.sensorReadings[1499].id, "reading-1501");
  });

  it("triggers fallback when prev is uninitialized or detail.data is missing/invalid", () => {
    const pondId = "pond-fallback";
    const validPayload = { id: "r-1", temperature: 28.5 };

    // Uninitialized prev or missing sensorReadings array
    assert.equal(realtimeModule.appendTelemetryReading(null, pondId, validPayload), null);
    assert.equal(realtimeModule.appendTelemetryReading(undefined, pondId, validPayload), null);
    assert.equal(
      realtimeModule.appendTelemetryReading({ thresholds: [] }, pondId, validPayload),
      null,
    );

    // Not yet loaded -> shouldFallback = true
    assert.equal(
      realtimeModule.shouldFallbackTelemetryUpdate(false, pondId, { pondId, data: validPayload }),
      true,
    );

    // Missing detail.data -> shouldFallback = true
    assert.equal(
      realtimeModule.shouldFallbackTelemetryUpdate(true, pondId, { pondId }),
      true,
    );
    assert.equal(
      realtimeModule.shouldFallbackTelemetryUpdate(true, pondId, { pondId, data: null }),
      true,
    );

    // Non-object or zero valid metrics -> map returns null, shouldFallback = true
    assert.equal(realtimeModule.mapTelemetryPayloadToSensorReading("invalid", pondId), null);
    assert.equal(realtimeModule.mapTelemetryPayloadToSensorReading([], pondId), null);
    assert.equal(
      realtimeModule.mapTelemetryPayloadToSensorReading({ temperature: null, ph: "NaN" }, pondId),
      null,
    );
    assert.equal(
      realtimeModule.shouldFallbackTelemetryUpdate(true, pondId, {
        pondId,
        data: { temperature: null },
      }),
      true,
    );
    assert.equal(
      realtimeModule.appendTelemetryReading({ sensorReadings: [], thresholds: [] }, pondId, {
        temperature: undefined,
      }),
      null,
    );
  });

  it("deduplicates and updates readings sharing a non-empty id without duplicating", () => {
    const pondId = "pond-dedupe";
    const prev = {
      sensorReadings: [
        {
          id: "tel-1",
          pondId,
          timestamp: "2026-11-25T08:00:00.000Z",
          temperature: 27.5,
          metrics: [{ name: "temperature", value: 27.5, unit: "°C" }],
        },
        {
          id: "tel-2",
          pondId,
          timestamp: "2026-11-25T08:01:00.000Z",
          temperature: 27.8,
          metrics: [{ name: "temperature", value: 27.8, unit: "°C" }],
        },
      ],
      thresholds: [],
    };

    const updated = realtimeModule.appendTelemetryReading(prev, pondId, {
      telemetryId: "tel-1",
      recordedAt: "2026-11-25T08:00:05.000Z",
      temperature: 28.9,
      ph: 8.1,
    });

    assert.ok(updated);
    assert.equal(updated.sensorReadings.length, 2);
    assert.equal(updated.sensorReadings[0].id, "tel-1");
    assert.equal(updated.sensorReadings[0].temperature, 28.9);
    assert.equal(updated.sensorReadings[0].ph, 8.1);
    assert.deepEqual(updated.sensorReadings[0].metrics, [
      { name: "temperature", value: 28.9, unit: "°C" },
      { name: "pH", value: 8.1, unit: "" },
    ]);
    assert.equal(updated.sensorReadings[1].id, "tel-2");

    // Empty IDs should still append rather than overwriting each other
    const emptyIdFirst = realtimeModule.appendTelemetryReading(
      { sensorReadings: [], thresholds: [] },
      pondId,
      { temperature: 26.0 },
    );
    const emptyIdSecond = realtimeModule.appendTelemetryReading(emptyIdFirst, pondId, {
      temperature: 26.5,
    });
    assert.ok(emptyIdSecond);
    assert.equal(emptyIdSecond.sensorReadings.length, 2);
  });
});
