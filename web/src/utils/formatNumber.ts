/** Formats sensor readings to a fixed decimal precision without changing measurement data. */
export const formatMetricValue = (
  value: number | null | undefined,
  maximumFractionDigits = 2,
): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";

  return value.toFixed(maximumFractionDigits);
};
