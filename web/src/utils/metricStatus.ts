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

  const normalMin = threshold.normalMin ?? (threshold as any).minValue ?? 0;
  const normalMax = threshold.normalMax ?? (threshold as any).maxValue ?? 100;
  const dangerMin = threshold.dangerMin ?? (normalMin > 0 ? normalMin * 0.8 : 0);
  const dangerMax = threshold.dangerMax ?? (normalMax * 1.2);

  if (value < dangerMin || value > dangerMax) {
    return "danger";
  }
  if (value < normalMin || value > normalMax) {
    return "warning";
  }
  return "normal";
};
