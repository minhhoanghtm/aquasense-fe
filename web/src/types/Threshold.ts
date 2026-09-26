export interface Threshold {
  // Backend actual fields (ThresholdConfig)
  thresholdId?: string;
  pondId?: string;
  metricName?: string;
  minCritical?: number;
  minWarning?: number;
  maxWarning?: number;
  maxCritical?: number;

  // Frontend aliases / backward compat
  id?: string;
  parameterId?: string;
  parameterName?: string;
  min?: number;
  max?: number;
  optimalMin?: number;
  optimalMax?: number;
}
