export interface SensorReading {
  id: string;
  pondId: string;
  parameterId: string;
  value: number;
  unit: string;
  recordedAt: string;
}