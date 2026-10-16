export type MertricsStatus = "normal" | "warning" | "danger";

export interface MetricThreshold {
  normalMin: number;
  normalMax: number;
  dangerMin: number;
  dangerMax: number;
}
export const getMetricStatus = (
  value: number,
  threshold?: Partial<MetricThreshold> | null,
): MertricsStatus => {
  if (!threshold) {
    return "normal";
  }

  const normalMin = threshold.normalMin ?? (threshold as any).minValue;
  const normalMax = threshold.normalMax ?? (threshold as any).maxValue;
  if (typeof normalMin !== "number" || typeof normalMax !== "number") {
    return "normal";
  }
  const dangerMin = threshold.dangerMin ?? normalMin;
  const dangerMax = threshold.dangerMax ?? normalMax;

  if (value < dangerMin || value > dangerMax) {
    return "danger";
  }
  if (value < normalMin || value > normalMax) {
    return "warning";
  }
  return "normal";
};
