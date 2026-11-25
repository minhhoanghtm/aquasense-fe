import type { SensorReading } from "../types/SensorReading";

export const MAX_SENSOR_READINGS = 1500;

export interface TelemetryMetricItem {
  name: string;
  value: number;
  unit: string;
}

export interface WaterQualitySensorReading extends SensorReading {
  id: string;
  pondId: string;
  deviceId?: string;
  timestamp: string;
  recordedAt: string;
  temperature: number | null;
  ph: number | null;
  dissolvedOxygen: number | null;
  salinity: number | null;
  turbidity: number | null;
  waterLevel: number | null;
  metrics: TelemetryMetricItem[];
}

export interface WaterQualityData<
  TReading extends SensorReading = WaterQualitySensorReading,
  TThreshold = unknown,
> {
  sensorReadings: TReading[];
  thresholds: TThreshold[];
}

export interface TelemetryUpdatedDetail {
  pondId?: string;
  data?: unknown;
}

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || typeof value === "boolean") {
    return null;
  }
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeTimestamp = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim() !== "") {
    return Number.isNaN(Date.parse(value)) ? null : value;
  }
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return new Date(value).toISOString();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return null;
};

const getReadingId = (reading: SensorReading | null | undefined): string => {
  if (!reading) return "";
  const raw = reading.id ?? reading.telemetryId;
  return typeof raw === "string" ? raw.trim() : "";
};

/**
 * Converts a realtime `telemetry:new` Socket.IO payload into the normalized
 * `SensorReading` shape used by `pondApi.getSensorReadings`.
 * Returns `null` when the payload is not an object or contains no valid metrics.
 */
export const mapTelemetryPayloadToSensorReading = (
  rawData: unknown,
  pondId: string,
): WaterQualitySensorReading | null => {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
    return null;
  }

  const record = rawData as Record<string, unknown>;

  const temperature = toFiniteNumber(record.temperature) ?? toFiniteNumber(record.temp);
  const ph = toFiniteNumber(record.ph) ?? toFiniteNumber(record.pH);
  const dissolvedOxygen =
    toFiniteNumber(record.dissolvedOxygen) ?? toFiniteNumber(record.DO);
  const salinity = toFiniteNumber(record.salinity);
  const turbidity = toFiniteNumber(record.turbidity);
  const waterLevel =
    toFiniteNumber(record.waterLevel) ?? toFiniteNumber(record.water_level);

  const metricCandidates: Array<{ name: string; value: number | null; unit: string }> = [
    { name: "temperature", value: temperature, unit: "°C" },
    { name: "pH", value: ph, unit: "" },
    { name: "dissolvedOxygen", value: dissolvedOxygen, unit: "mg/L" },
    { name: "salinity", value: salinity, unit: "ppt" },
    { name: "turbidity", value: turbidity, unit: "NTU" },
    { name: "waterLevel", value: waterLevel, unit: "m" },
  ];

  const metrics: TelemetryMetricItem[] = metricCandidates.filter(
    (metric): metric is TelemetryMetricItem =>
      metric.value !== null && Number.isFinite(metric.value),
  );

  if (metrics.length === 0) {
    return null;
  }

  const rawId = record.id ?? record.telemetryId;
  const id =
    typeof rawId === "string"
      ? rawId.trim()
      : typeof rawId === "number" && Number.isFinite(rawId)
        ? String(rawId)
        : "";

  const deviceId =
    typeof record.deviceId === "string" && record.deviceId.trim() !== ""
      ? record.deviceId.trim()
      : undefined;

  const resolvedRecordedAt = normalizeTimestamp(record.recordedAt);
  const resolvedTimestamp =
    resolvedRecordedAt ??
    normalizeTimestamp(record.timestamp) ??
    normalizeTimestamp(record.measuredAt) ??
    normalizeTimestamp(record.createdAt) ??
    new Date().toISOString();
  const recordedAt = resolvedRecordedAt ?? resolvedTimestamp;

  return {
    id,
    pondId,
    deviceId,
    timestamp: resolvedTimestamp,
    recordedAt,
    temperature,
    ph,
    dissolvedOxygen,
    salinity,
    turbidity,
    waterLevel,
    metrics,
  };
};

/**
 * Incrementally appends (or updates by non-empty `id`) a realtime telemetry
 * reading onto `prev.sensorReadings`, capping the sliding window at `maxPoints`.
 * Returns `null` when state is uninitialized or the payload cannot be mapped.
 */
export const appendTelemetryReading = <
  TReading extends SensorReading = WaterQualitySensorReading,
  TThreshold = unknown,
>(
  prev: WaterQualityData<TReading, TThreshold> | null | undefined,
  pondId: string,
  rawData: unknown,
  maxPoints: number = MAX_SENSOR_READINGS,
): WaterQualityData<TReading | WaterQualitySensorReading, TThreshold> | null => {
  if (!prev || !Array.isArray(prev.sensorReadings)) {
    return null;
  }

  const nextReading = mapTelemetryPayloadToSensorReading(rawData, pondId);
  if (!nextReading) {
    return null;
  }

  const limit = Number.isFinite(maxPoints) && maxPoints > 0 ? Math.floor(maxPoints) : 0;
  let nextReadings: Array<TReading | WaterQualitySensorReading>;

  if (nextReading.id !== "") {
    const existingIndex = prev.sensorReadings.findIndex(
      (item) => getReadingId(item) === nextReading.id,
    );
    if (existingIndex >= 0) {
      nextReadings = [...prev.sensorReadings];
      nextReadings[existingIndex] = nextReading;
    } else {
      nextReadings = [...prev.sensorReadings, nextReading];
    }
  } else {
    nextReadings = [...prev.sensorReadings, nextReading];
  }

  const cappedReadings = limit === 0 ? [] : nextReadings.slice(-limit);

  return {
    ...prev,
    sensorReadings: cappedReadings,
  };
};

/**
 * Determines whether a `telemetry-updated` event must fall back to a full
 * `getCurrentWaterQuality` fetch instead of an incremental state append.
 */
export const shouldFallbackTelemetryUpdate = (
  hasLoaded: boolean,
  pondId: string,
  detail?: TelemetryUpdatedDetail | null,
): boolean => {
  if (!hasLoaded || !pondId || detail?.pondId !== pondId || !detail.data) {
    return true;
  }
  return mapTelemetryPayloadToSensorReading(detail.data, pondId) === null;
};
