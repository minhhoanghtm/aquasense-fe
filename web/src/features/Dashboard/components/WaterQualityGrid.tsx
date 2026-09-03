
import MetricCard from "../../../components/MetricCard";

interface WaterQualityGridProps {
  waterQuality: any
}

const WaterQualityGrid = ({ waterQuality }: WaterQualityGridProps) => {
  if (!waterQuality) return null;

  const lastestReading = waterQuality.sensorReadings[waterQuality.sensorReadings.length - 1];
  // console.log("Lastest reading: ", lastestReading);
  const metrics = lastestReading.metrics;
  // console.log("Metrics: ", metrics);
  const thresholds = waterQuality.thresholds;
  // console.log("Theresholds: ", thresholds);

  const currentMetrics = metrics.map((metric: any) => {
    const threshold = thresholds.find(
      (item: any) => item.parameterId === metric.name
    );
    // console.log("Threshold: ", threshold);
    return {
      ...metric,
      threshold,
    };
  })

  // console.log("Current metrics: ", currentMetrics);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full my-3">
      {
        currentMetrics && (
          currentMetrics.map((metric: any, index: number) => (
            <MetricCard
              key={index}
              title={metric.name}
              parameter={metric.name}
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
