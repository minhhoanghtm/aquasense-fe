export type MertricsStatus = "normal" | "warning" | "danger";

export interface MetricThreshold {
  normalMin: number;
  normalMax: number;
  dangerMin: number;
  dangerMax: number;
}
export const getMetricStatus = (
  value: number,
  threshold: MetricThreshold,
): MertricsStatus => {
  const { normalMin, normalMax, dangerMin, dangerMax } = threshold;

  if (value < dangerMin || value > dangerMax) {
    return "danger";
  }
  if (value < normalMin || value > normalMax) {
    return "warning";
  }
  return "normal";
};
