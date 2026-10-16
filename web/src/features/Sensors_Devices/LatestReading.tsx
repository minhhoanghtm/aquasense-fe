import React from "react";
import { LatestReadingCard, type ReadingMetric } from "../../components/LatestReadingCard";

interface LatestReadingProps {
  deviceCode?: string;
  deviceName?: string;
  metrics?: ReadingMetric[];
  className?: string;
}

export const LatestReading: React.FC<LatestReadingProps> = ({
  deviceCode,
  deviceName,
  metrics,
  className = "",
}) => {
  return (
    <LatestReadingCard
      deviceCode={deviceCode}
      title={deviceName}
      metrics={metrics}
      className={className}
    />
  );
};

export default LatestReading;
