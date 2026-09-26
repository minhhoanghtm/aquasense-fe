export interface SensorReading {
  // Backend actual fields (TelemetryData)
  telemetryId?: string;
  deviceId?: string;
  measuredAt?: string;
  dissolvedOxygen?: number | null;
  temperature?: number | null;
  ph?: number | null;
  salinity?: number | null;
  createdAt?: string;

  // Frontend aliases / backward compat
  id?: string;
  pondId?: string;
  parameterId?: string;
  value?: number;
  unit?: string;
  timestamp?: string;
  status?: string;
}
