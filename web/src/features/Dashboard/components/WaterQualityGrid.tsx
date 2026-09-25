
import MetricCard from "../../../components/MetricCard";

interface WaterQualityGridProps {
  waterQuality: any
}

const WaterQualityGrid = ({ waterQuality }: WaterQualityGridProps) => {
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

  const DEFAULT_THRESHOLDS: Record<string, { normalMin: number; normalMax: number; dangerMin: number; dangerMax: number; unit: string }> = {
    pH: { normalMin: 7.5, normalMax: 8.5, dangerMin: 6.5, dangerMax: 9.0, unit: "" },
    dissolvedOxygen: { normalMin: 5.0, normalMax: 8.0, dangerMin: 3.5, dangerMax: 10.0, unit: "mg/L" },
    DO: { normalMin: 5.0, normalMax: 8.0, dangerMin: 3.5, dangerMax: 10.0, unit: "mg/L" },
    temperature: { normalMin: 26, normalMax: 32, dangerMin: 22, dangerMax: 35, unit: "°C" },
    temp: { normalMin: 26, normalMax: 32, dangerMin: 22, dangerMax: 35, unit: "°C" },
    salinity: { normalMin: 10, normalMax: 25, dangerMin: 5, dangerMax: 35, unit: "ppt" },
    turbidity: { normalMin: 20, normalMax: 40, dangerMin: 10, dangerMax: 60, unit: "NTU" },
    waterLevel: { normalMin: 1.2, normalMax: 1.5, dangerMin: 0.9, dangerMax: 1.8, unit: "m" },
  };

  const currentMetrics = metrics.map((metric: any) => {
    const canonicalName = PARAM_NAME_MAP[metric.name] || metric.name;
    const defaultMeta = DEFAULT_THRESHOLDS[metric.name] || DEFAULT_THRESHOLDS[canonicalName] || {
      normalMin: 0,
      normalMax: 100,
      dangerMin: 0,
      dangerMax: 150,
      unit: metric.unit || "",
    };

    const foundThreshold = thresholds.find(
      (item: any) =>
        item.parameterId === metric.name ||
        item.metricName === metric.name ||
        item.parameterId === canonicalName ||
        item.metricName === canonicalName
    );

    const threshold = foundThreshold
      ? {
          normalMin: foundThreshold.normalMin ?? foundThreshold.minValue ?? defaultMeta.normalMin,
          normalMax: foundThreshold.normalMax ?? foundThreshold.maxValue ?? defaultMeta.normalMax,
          dangerMin: foundThreshold.dangerMin ?? defaultMeta.dangerMin,
          dangerMax: foundThreshold.dangerMax ?? defaultMeta.dangerMax,
        }
      : defaultMeta;

    return {
      ...metric,
      parameter: canonicalName,
      unit: metric.unit || defaultMeta.unit,
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
