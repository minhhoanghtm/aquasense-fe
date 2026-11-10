import MetricCard from "../../../components/MetricCard";

interface WaterQualityGridProps {
  waterQuality: any;
  loading?: boolean;
  error?: string | null;
}

const PARAM_NAME_MAP: Record<string, string> = {
  DO: "dissolvedOxygen",
  temp: "temperature",
};

const PARAM_DISPLAY_TITLES: Record<string, string> = {
  temperature: "Nhiệt độ",
  temp: "Nhiệt độ",
  pH: "Độ pH",
  dissolvedOxygen: "Oxy hòa tan (DO)",
  DO: "Oxy hòa tan (DO)",
  salinity: "Độ mặn",
  turbidity: "Độ đục",
  waterLevel: "Mực nước",
};

const WaterQualityGrid = ({ waterQuality, loading = false, error }: WaterQualityGridProps) => {
  if (loading) {
    return (
      <div className="w-full my-2 p-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-center text-xs text-[var(--text-muted)]">
        Đang tải dữ liệu cảm biến đo chất lượng nước...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full my-2 p-5 rounded-2xl border border-rose-500/30 bg-rose-950/40 text-center text-xs text-[var(--critical)]">
        Không thể tải dữ liệu cảm biến: {error}
      </div>
    );
  }

  if (!waterQuality) return null;

  const sensorReadings = Array.isArray(waterQuality.sensorReadings) ? waterQuality.sensorReadings : [];
  if (sensorReadings.length === 0) {
    return (
      <div className="w-full my-2 p-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-center text-xs text-[var(--text-muted)]">
        Chưa có dữ liệu cảm biến đo thời gian thực cho vuông nuôi này.
      </div>
    );
  }

  const lastestReading = sensorReadings[sensorReadings.length - 1];
  const metrics = Array.isArray(lastestReading?.metrics) ? lastestReading.metrics : [];
  const thresholds = Array.isArray(waterQuality.thresholds) ? waterQuality.thresholds : [];

  const currentMetrics = metrics.map((metric: any) => {
    const canonicalName = PARAM_NAME_MAP[metric.name] || metric.name;
    const foundThreshold = thresholds.find(
      (item: any) =>
        item.parameterId === metric.name ||
        item.metricName === metric.name ||
        item.parameterId === canonicalName ||
        item.metricName === canonicalName
    );

    const threshold = foundThreshold
      ? {
          normalMin: foundThreshold.normalMin ?? foundThreshold.minValue,
          normalMax: foundThreshold.normalMax ?? foundThreshold.maxValue,
          dangerMin: foundThreshold.dangerMin,
          dangerMax: foundThreshold.dangerMax,
        }
      : undefined;

    const displayTitle = PARAM_DISPLAY_TITLES[metric.name] || PARAM_DISPLAY_TITLES[canonicalName] || metric.name;

    return {
      ...metric,
      displayTitle,
      parameter: canonicalName,
      unit: metric.unit || "",
      threshold,
    };
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 w-full">
      {currentMetrics.map((metric: any, index: number) => (
        <MetricCard
          key={index}
          title={metric.displayTitle}
          parameter={metric.parameter || metric.name}
          value={metric.value}
          unit={metric.unit}
          threshold={metric.threshold}
        />
      ))}
    </div>
  );
};

export default WaterQualityGrid;
