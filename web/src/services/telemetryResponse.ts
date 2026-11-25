export interface LatestTelemetryRecord {
  telemetryId?: string;
  id?: string;
  deviceId?: string;
  pondId?: string;
  ph?: number | null;
  dissolvedOxygen?: number | null;
  temperature?: number | null;
  salinity?: number | null;
  turbidity?: number | null;
  waterLevel?: number | null;
  recordedAt?: string;
  measuredAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

/**
 * Normalizes `GET /telemetry/device/:deviceId/latest` payloads after `api()`
 * unwraps the outer `TransformInterceptor` envelope, supporting both:
 * - Post-AQS-303 single-enveloped responses (`latest` record or `null`)
 * - Legacy double-enveloped responses (`{ success: true, data: latest | null }`)
 */
export const unwrapLatestTelemetryResponse = (
  res: unknown,
): LatestTelemetryRecord | null => {
  if (!res || typeof res !== "object" || Array.isArray(res)) {
    return null;
  }

  const record = res as Record<string, unknown>;
  if ("data" in record) {
    const inner = record.data;
    if (inner === null || inner === undefined) {
      return null;
    }
    if (typeof inner === "object" && !Array.isArray(inner)) {
      return inner as LatestTelemetryRecord;
    }
    return null;
  }

  return record as LatestTelemetryRecord;
};
