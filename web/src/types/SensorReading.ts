export interface TelemetryData {
  time: string;
  temperature: number;
  ph: number;
  salinity: number;
  dissolvedOxygen: number;
  turbidity: number;
  waterLevel: number;
  isBuffered?: boolean;
}

export interface MetricItem {
  name: string;
  value: number;
  unit: string;
}

export interface SensorReading {
  id?: string;
  pondId: string;
  time?: string;
  recordedAt?: string;
  metrics?: MetricItem[];
  telemetry?: TelemetryData;
  temperature?: number;
  ph?: number;
  salinity?: number;
  dissolvedOxygen?: number;
  turbidity?: number;
  waterLevel?: number;
  isBuffered?: boolean;
  parameterId?: string;
  value?: number;
  unit?: string;
}