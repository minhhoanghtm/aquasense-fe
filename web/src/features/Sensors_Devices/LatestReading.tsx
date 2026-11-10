import React from "react";
import { LatestReadingCard, type ReadingMetric } from "../../components/LatestReadingCard";

interface LatestReadingProps {
  deviceCode?: string;
  deviceName?: string;
  metrics?: ReadingMetric[];
  timestamp?: string;
  className?: string;
}

export const LatestReading: React.FC<LatestReadingProps> = ({
  deviceCode,
  deviceName,
  metrics,
  timestamp,
  className = "",
}) => {
  return (
    <LatestReadingCard
      deviceCode={deviceCode}
      title={deviceName}
      metrics={metrics}
      timestamp={timestamp}
      className={className}
    />
  );
};

export default LatestReading;
