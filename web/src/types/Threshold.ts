export interface ThresholdConfig {
  configId?: string;
  id?: string;
  pondId: string;
  metricName: string;
  minValue: number;
  maxValue: number;
  isActive: boolean;
  normalMin?: number;
  normalMax?: number;
  dangerMin?: number;
  dangerMax?: number;
  parameterId?: string;
}

export type Threshold = ThresholdConfig;