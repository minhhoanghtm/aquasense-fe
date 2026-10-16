
import MetricCard from "../../../components/MetricCard";

interface WaterQualityGridProps {
  waterQuality: any;
  loading?: boolean;
  error?: string | null;
}

const WaterQualityGrid = ({ waterQuality, loading = false, error }: WaterQualityGridProps) => {
  if (loading) return <div className="w-full my-3 p-4 rounded-xl border border-cyan-900/40 bg-[#04151c]/60 text-center text-xs text-gray-400">Đang tải dữ liệu cảm biến...</div>;
  if (error) return <div className="w-full my-3 p-4 rounded-xl border border-red-900/40 bg-[#04151c]/60 text-center text-xs text-[var(--critical)]">Không thể tải dữ liệu cảm biến: {error}</div>;
  if (!waterQuality) return null;

  const sensorReadings = Array.isArray(waterQuality.sensorReadings) ? waterQuality.sensorReadings : [];
  if (sensorReadings.length === 0) {
    return (
      <div className="w-full my-3 p-4 rounded-xl border border-cyan-900/40 bg-[#04151c]/60 text-center text-xs text-gray-400">
        Chưa có dữ liệu cảm biến đo thời gian thực cho ao này.
      </div>
    );
  }

  const lastestReading = sensorReadings[sensorReadings.length - 1];
  const metrics = Array.isArray(lastestReading?.metrics) ? lastestReading.metrics : [];
  const thresholds = Array.isArray(waterQuality.thresholds) ? waterQuality.thresholds : [];

  const PARAM_NAME_MAP: Record<string, string> = {
    DO: "dissolvedOxygen",
    temp: "temperature",
  };

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

    return {
      ...metric,
      parameter: canonicalName,
      unit: metric.unit || "",
      threshold,
    };
  });

  // console.log("Current metrics: ", currentMetrics);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full my-3">
      {
        currentMetrics && (
          currentMetrics.map((metric: any, index: number) => (
            <MetricCard
              key={index}
              title={metric.name}
              parameter={metric.parameter || metric.name}
              value={metric.value}
              unit={metric.unit}
              threshold={metric.threshold}
            />
          ))
        )
      }
    </div>
  )
}

export default WaterQualityGrid
